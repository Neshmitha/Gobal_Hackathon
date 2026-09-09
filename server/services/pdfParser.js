const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

/**
 * Parses a PDF file into plain text plus per-page text (for citations).
 */
async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);

  if (!result.text || result.text.trim().length < 20) {
    throw new Error("PDF_PARSE_EMPTY: No extractable text found in PDF");
  }

  // pdf-parse inserts form-feed char (\f) between pages when available
  const pages = result.text.split("\f").map((t) => t.trim()).filter(Boolean);

  return {
    fullText: result.text,
    pages: pages.length ? pages : [result.text],
    numPages: result.numpages || pages.length || 1,
  };
}

module.exports = { parsePdf };
