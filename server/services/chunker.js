const { detectSectionForText } = require("./sectionDetector");
const { cleanText } = require("./textCleaner");

/**
 * Natural boundary-preserving text chunker for RAG.
 * Configurable via RAG_CHUNK_SIZE and RAG_CHUNK_OVERLAP environment variables.
 */
function chunkPages(pages, options = {}) {
  const chunkSize = options.chunkSize || Number(process.env.RAG_CHUNK_SIZE) || 1000;
  const overlap = options.overlap || Number(process.env.RAG_CHUNK_OVERLAP) || 150;
  const pageConfidence = options.pageConfidence || "exact";

  const rawChunks = [];
  let globalIndex = 0;
  let currentSec = "Unknown";
  let currentSub = null;

  pages.forEach((pageRawText, pageIdx) => {
    const pageNum = pageIdx + 1;
    const cleanedPageText = cleanText(pageRawText);
    if (!cleanedPageText) return;

    // Detect section updates for this page
    const secInfo = detectSectionForText(cleanedPageText, currentSec, currentSub);
    currentSec = secInfo.section;
    currentSub = secInfo.subsection;

    // Split page text using paragraph / sentence natural boundaries
    const paragraphs = cleanedPageText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

    let currentChunkText = "";
    let chunkPageStart = pageNum;
    let chunkPageEnd = pageNum;

    const flushChunk = () => {
      const trimmed = currentChunkText.trim();
      if (trimmed.length > 0) {
        // Detect specific section for this chunk text
        const chunkSecInfo = detectSectionForText(trimmed, currentSec, currentSub);
        rawChunks.push({
          chunkIndex: globalIndex,
          text: trimmed,
          section: chunkSecInfo.section,
          subsection: chunkSecInfo.subsection,
          pageStart: chunkPageStart,
          pageEnd: chunkPageEnd,
          pageConfidence: pageConfidence
        });
        globalIndex += 1;
      }
    };

    paragraphs.forEach((p) => {
      if ((currentChunkText + "\n\n" + p).length <= chunkSize) {
        currentChunkText = currentChunkText ? currentChunkText + "\n\n" + p : p;
      } else {
        // If current paragraph alone is larger than chunkSize, split by sentences
        if (currentChunkText) {
          flushChunk();
          // Keep overlap from end of previous chunk
          const overlapText = currentChunkText.slice(-overlap);
          currentChunkText = overlapText ? overlapText + "\n\n" + p : p;
        } else {
          currentChunkText = p;
        }

        // Handle single huge paragraph
        while (currentChunkText.length > chunkSize) {
          const splitPoint = currentChunkText.lastIndexOf('. ', chunkSize);
          const cutAt = (splitPoint > chunkSize * 0.4) ? splitPoint + 1 : chunkSize;
          const head = currentChunkText.slice(0, cutAt);
          currentChunkText = currentChunkText.slice(cutAt - overlap);
          
          const chunkSecInfo = detectSectionForText(head, currentSec, currentSub);
          rawChunks.push({
            chunkIndex: globalIndex,
            text: head.trim(),
            section: chunkSecInfo.section,
            subsection: chunkSecInfo.subsection,
            pageStart: chunkPageStart,
            pageEnd: chunkPageEnd,
            pageConfidence: pageConfidence
          });
          globalIndex += 1;
        }
      }
    });

    if (currentChunkText.trim().length > 0) {
      flushChunk();
    }
  });

  return rawChunks;
}

module.exports = { chunkPages };
