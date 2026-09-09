const { parsePdf } = require("./pdfParser.js");
const { cleanText } = require("./textCleaner.js");
const { detectSectionForText } = require("./sectionDetector.js");
const { chunkPages } = require("./chunker.js");
const { buildChunkObject } = require("./metadataBuilder.js");
const { embedTexts, embedQuery } = require("./embeddingService.js");
const { buildAndSaveIndex, search, isIndexed, loadIndex } = require("./faissService.js");
const { emitStep } = require("./progressEmitter.js");
const Paper = require("../models/Paper.js");
const RagDocument = require("../models/RagDocument.js");
const RagChunk = require("../models/RagChunk.js");
const OpenAI = require("openai");

const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-4o-mini";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('sk-xxxx')) {
    return null;
  }
  try {
    return new OpenAI({ apiKey });
  } catch (err) {
    return null;
  }
}

async function runIngestPipeline({ domain, paperId, filePath, title, authors, year, source, sourceUrl }, emitter) {
  try {
    const chunkSize = Number(process.env.RAG_CHUNK_SIZE) || 1000;
    const chunkOverlap = Number(process.env.RAG_CHUNK_OVERLAP) || 150;

    // Stage 1: Paper Selected
    emitStep(emitter, "PAPER_SELECTED", "done", { paperId, domain, filePath });

    // Fetch existing Layer 1 metadata from Paper model if available
    let existingPaper = null;
    try {
      existingPaper = await Paper.findOne({ $or: [{ _id: paperId }, { title }] });
    } catch (e) {
      existingPaper = null;
    }

    const paperTitle = title || (existingPaper ? existingPaper.title : "The Role of UAV-IoT Networks in Future Wildfire Detection");
    const paperAuthors = authors || (existingPaper ? existingPaper.authors : ["Osama M. Bushnaq", "Anas Chaaban", "Tareq Y. Al-Naffouri"]);
    const paperYear = year || (existingPaper ? existingPaper.year : 2020);
    const paperDomain = domain || (existingPaper ? existingPaper.domain : "Wireless Communication and IoT");

    // Check Re-indexing condition
    if (isIndexed(paperDomain, paperId, chunkSize, chunkOverlap)) {
      console.log(`Paper ${paperId} is already indexed. Reusing existing vector index.`);
      const existingData = await loadIndex(paperDomain, paperId);
      
      emitStep(emitter, "PARSING_PDF", "done", { numPages: existingData.manifest?.totalPages || 1, reindexed: false });
      emitStep(emitter, "TEXT_CLEANED", "done");
      emitStep(emitter, "SECTIONS_DETECTED", "done");
      emitStep(emitter, "TEXT_CHUNKED", "done", { chunkCount: existingData.manifest?.totalChunks || existingData.meta.length });
      emitStep(emitter, "METADATA_CREATED", "done", { metadataRecords: existingData.meta.length });
      emitStep(emitter, "EMBEDDINGS_GENERATED", "done", { vectors: existingData.meta.length, dim: existingData.manifest?.embeddingDimension || 1536 });
      emitStep(emitter, "FAISS_INDEX_BUILT", "done", { indexType: "IndexFlatL2" });
      emitStep(emitter, "METADATA_SAVED", "done", { file: "chunks.jsonl" });
      emitStep(emitter, "READY", "done", { paperId, domain: paperDomain, reused: true });
      return;
    }

    // Stage 2: PDF Parsed
    emitStep(emitter, "PARSING_PDF", "running");
    const { pages, fullText } = await parsePdf(filePath);
    const totalPages = pages.length;
    const totalWords = fullText.split(/\s+/).filter(Boolean).length;
    emitStep(emitter, "PARSING_PDF", "done", { totalPages, totalWords });

    // Stage 3: Text Cleaned
    emitStep(emitter, "TEXT_CLEANED", "running");
    const cleanedText = cleanText(fullText);
    emitStep(emitter, "TEXT_CLEANED", "done", { cleanedLength: cleanedText.length });

    // Stage 4: Sections Detected
    emitStep(emitter, "SECTIONS_DETECTED", "running");
    const initialSecInfo = detectSectionForText(cleanedText);
    emitStep(emitter, "SECTIONS_DETECTED", "done", { primarySection: initialSecInfo.section });

    // Stage 5: Text Chunked
    emitStep(emitter, "TEXT_CHUNKED", "running");
    const rawChunks = chunkPages(pages, { chunkSize, overlap: chunkOverlap });
    emitStep(emitter, "TEXT_CHUNKED", "done", { chunkCount: rawChunks.length, chunkSize, chunkOverlap });

    // Stage 6: Chunk Metadata Created
    emitStep(emitter, "METADATA_CREATED", "running");
    const chunkObjects = rawChunks.map((c, i) => {
      return buildChunkObject({
        row: i,
        paperId,
        paperTitle,
        domain: paperDomain,
        year: paperYear,
        authors: paperAuthors,
        text: c.text,
        section: c.section,
        subsection: c.subsection,
        pageStart: c.pageStart,
        pageEnd: c.pageEnd,
        pageConfidence: c.pageConfidence,
        chunkIndex: i,
        totalChunks: rawChunks.length,
        source: source || "upload",
        sourceUrl: sourceUrl || ""
      });
    });
    emitStep(emitter, "METADATA_CREATED", "done", { metadataRecords: chunkObjects.length });

    // Stage 7: Embeddings Generated
    emitStep(emitter, "EMBEDDINGS_GENERATED", "running");
    const vectors = await embedTexts(chunkObjects.map(c => c.text));
    const dim = vectors[0].length;
    emitStep(emitter, "EMBEDDINGS_GENERATED", "done", { vectors: vectors.length, dim, model: process.env.EMBEDDING_MODEL || "text-embedding-3-small" });

    // Stage 8: FAISS Index Built
    emitStep(emitter, "FAISS_INDEX_BUILT", "running");
    const built = await buildAndSaveIndex(paperDomain, paperId, chunkObjects, vectors, {
      title: paperTitle,
      totalPages,
      chunkSize,
      chunkOverlap
    });
    emitStep(emitter, "FAISS_INDEX_BUILT", "done", { indexType: "IndexFlatL2", dim });

    // Stage 9: Metadata Saved
    emitStep(emitter, "METADATA_SAVED", "running");
    // Save to database asynchronously
    try {
      await RagDocument.findOneAndUpdate(
        { paperId },
        {
          paperId,
          title: paperTitle,
          domain: paperDomain,
          authors: paperAuthors,
          year: paperYear,
          totalPages,
          totalChunks: chunkObjects.length,
          totalWords,
          embeddingDimension: dim,
          indexPath: built.indexFile,
          metadataPath: built.metaFile,
          manifestPath: built.manifestFile,
          status: 'ready',
          chunkSize,
          chunkOverlap
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn("RagDocument DB save warning:", dbErr.message);
    }
    emitStep(emitter, "METADATA_SAVED", "done", { file: "chunks.jsonl", manifest: "manifest.json" });

    // Stage 10: RAG Ready
    emitStep(emitter, "READY", "done", { paperId, domain: paperDomain, totalChunks: chunkObjects.length });
  } catch (err) {
    console.error("Ingest Pipeline Error:", err.message);
    emitStep(emitter, "PIPELINE", "error", { message: err.message });
  }
}

async function answerQuery({ domain, paperId, question, topK = 5 }) {
  const qVector = await embedQuery(question);
  const matches = await search(domain, paperId, qVector, topK);

  if (!matches || matches.length === 0) {
    return {
      answer: "I couldn't find enough information in the selected paper to answer this confidently.",
      sources: []
    };
  }

  const context = matches
    .map((m, i) => {
      const pageInfo = m.metadata?.pageStart ? `Page ${m.metadata.pageStart}` : `Page ${m.page || 1}`;
      const secInfo = m.metadata?.section ? `${m.metadata.section}${m.metadata.subsection ? ' - ' + m.metadata.subsection : ''}` : 'General';
      return `[${i + 1}] (${secInfo}, ${pageInfo})\n${m.text}`;
    })
    .join("\n\n");

  const client = getOpenAIClient();
  let answer = "";

  if (client) {
    try {
      const completion = await client.chat.completions.create({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic research assistant. Answer the user's question strictly using the provided context blocks. Cite sources like [1], [2] matching the context blocks. If the context does not contain enough information to answer confidently, reply exactly: 'I couldn't find enough information in the selected paper to answer this confidently.' Do not hallucinate or invent outside facts.",
          },
          { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
        ],
      });
      answer = completion.choices[0].message.content;
    } catch (err) {
      console.warn("OpenAI Chat Completion error, using grounded context synthesis:", err.message);
    }
  }

  if (!answer) {
    answer = `Based on the retrieved research paper passages:\n\n` +
      matches.slice(0, 3).map((m, i) => {
        const sec = m.metadata?.section || 'Section';
        const page = m.metadata?.pageStart || m.page || 1;
        return `[${i + 1}] (${sec}, Page ${page}): "${m.text.slice(0, 260)}..."`;
      }).join("\n\n") +
      `\n\n(Retrieved grounded context from ${domain} paper ${paperId}.)`;
  }

  const sources = matches.map((m, i) => {
    const meta = m.metadata || {};
    return {
      ref: i + 1,
      chunkId: m.chunkId || `${paperId}-${m.chunkIndex || i}`,
      score: Number((1 / (1 + (m.score || 0))).toFixed(2)),
      pageStart: meta.pageStart || m.page || 1,
      pageEnd: meta.pageEnd || m.page || 1,
      section: meta.section || "Unknown",
      subsection: meta.subsection || null,
      paperTitle: meta.paperTitle || "Selected Paper",
      preview: m.text ? m.text.slice(0, 200) + "..." : ""
    };
  });

  return {
    answer,
    sources
  };
}

module.exports = {
  runIngestPipeline,
  answerQuery
};
