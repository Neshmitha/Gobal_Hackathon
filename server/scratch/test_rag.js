const { parsePdf } = require("../services/pdfParser");
const { chunkPages } = require("../services/chunker");
const { embedTexts, embedQuery } = require("../services/embeddingService");
const { buildAndSaveIndex, search } = require("../services/faissService");
const { createJob, emitStep } = require("../services/progressEmitter");
const { runIngestPipeline, answerQuery } = require("../services/ragPipeline");
const fs = require("fs");
const path = require("path");

async function runTest() {
  console.log("=== Testing RAG Assistant Pipeline ===");
  const testFile = path.join(__dirname, "..", "data", "uploads", "test_sample.pdf");
  const testDir = path.dirname(testFile);
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  // Create a minimal PDF test buffer if needed or text test file
  const sampleText = "Artificial Intelligence (AI) and Machine Learning (ML) are transforming scientific research.\n\f" +
                     "Deep learning models such as Transformers allow for advanced natural language processing and computer vision applications.\n\f" +
                     "FAISS vector indexes enable high-speed similarity search across high-dimensional embeddings for grounded retrieval.";

  // Test chunking directly
  const pages = sampleText.split("\f");
  const chunks = chunkPages(pages, { chunkSize: 100, overlap: 20 });
  console.log(`✅ Chunked into ${chunks.length} chunks`);

  // Test embeddings
  const vectors = await embedTexts(chunks.map(c => c.text));
  console.log(`✅ Generated ${vectors.length} vectors of dimension ${vectors[0].length}`);

  // Test vector indexing
  const built = await buildAndSaveIndex("AI_ML", "paper_test_101", chunks, vectors);
  console.log(`✅ Built and saved vector index to ${built.indexFile}`);

  // Test vector search
  const qVec = await embedQuery("What is FAISS vector index used for?");
  const matches = await search("AI_ML", "paper_test_101", qVec, 3);
  console.log(`✅ Vector Search found ${matches.length} matches. Top match on page ${matches[0].page}: "${matches[0].text}"`);

  // Test answer query grounding
  const result = await answerQuery({ domain: "AI_ML", paperId: "paper_test_101", question: "What do transformers allow for?", topK: 3 });
  console.log(`✅ Grounded Answer:\n${result.answer}`);

  console.log("=== RAG Pipeline Test Completed Successfully ===");
}

runTest().catch(console.error);
