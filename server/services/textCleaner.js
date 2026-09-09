/**
 * Cleans extracted PDF raw text to improve chunk quality and embedding fidelity.
 */
function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Remove NULL and control characters except newlines and tabs
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Fix hyphenated words split across line breaks (e.g., "wild-\nfire" -> "wildfire")
  text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2');

  // 3. Replace multiple horizontal whitespace chars with a single space
  text = text.replace(/[ \t]+/g, ' ');

  // 4. Normalize excessive newlines (keep max 2 newlines for paragraph breaks)
  text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');

  // 5. Trim leading/trailing whitespace
  return text.trim();
}

module.exports = { cleanText };
