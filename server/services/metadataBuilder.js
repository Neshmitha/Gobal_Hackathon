/**
 * Builds the complete Layer 2 RAG Chunk metadata object adhering strictly to schema constraints.
 */
function buildChunkObject({
  row,
  paperId,
  paperTitle,
  domain = "General",
  year = 2020,
  authors = [],
  text,
  section = "Unknown",
  subsection = null,
  pageStart = 1,
  pageEnd = 1,
  pageConfidence = "exact",
  chunkIndex = 0,
  totalChunks = 1,
  source = "upload",
  sourceUrl = ""
}) {
  const safePaperId = String(paperId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const chunkId = `${safePaperId}-${chunkIndex}`;
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return {
    row,
    chunkId,
    paperId,
    text,
    metadata: {
      paperId,
      paperTitle: paperTitle || "Untitled Research Paper",
      domain: domain || "General",
      year: Number(year) || 2020,
      authors: Array.isArray(authors) ? authors : [String(authors)],
      section: section || "Unknown",
      subsection: subsection || null,
      pageStart: Number(pageStart) || 1,
      pageEnd: Number(pageEnd) || 1,
      pageConfidence: pageConfidence === "exact" ? "exact" : "approximate",
      chunkIndex: Number(chunkIndex),
      totalChunks: Number(totalChunks),
      characterCount: charCount,
      wordCount: wordCount,
      source: source || "upload",
      sourceUrl: sourceUrl || "",
      createdAt: new Date().toISOString()
    }
  };
}

module.exports = { buildChunkObject };
