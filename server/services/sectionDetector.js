const ACADEMIC_SECTIONS = [
  { name: 'Abstract', keywords: ['abstract'] },
  { name: 'Introduction', keywords: ['introduction', '1. introduction', '1 introduction'] },
  { name: 'Related Work', keywords: ['related work', 'literature review', 'background', '2. related work', '2 related work'] },
  { name: 'System Model', keywords: ['system model', 'problem statement', '3.1 system model'] },
  { name: 'Methodology', keywords: ['methodology', 'methods', 'proposed method', 'proposed approach', 'architecture', '3. methodology', '3 methodology'] },
  { name: 'Markov Chain Analysis', keywords: ['markov chain', 'markov chain analysis', 'stochastic model'] },
  { name: 'Experimental Setup', keywords: ['experimental setup', 'experiments', 'evaluation', '4. experiments'] },
  { name: 'Results', keywords: ['results', 'findings', 'performance evaluation', '4. results', '4 results'] },
  { name: 'Discussion', keywords: ['discussion', 'analysis'] },
  { name: 'Conclusion', keywords: ['conclusion', 'conclusions', 'future work', '5. conclusion', '5 conclusion'] },
  { name: 'References', keywords: ['references', 'bibliography'] }
];

/**
 * Detects section and subsection for a block of text based on heading patterns.
 */
function detectSectionForText(text, currentSection = "Unknown", currentSubsection = null) {
  if (!text || typeof text !== 'string') {
    return { section: currentSection, subsection: currentSubsection };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && l.length < 120);

  let detectedSec = currentSection;
  let detectedSub = currentSubsection;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for explicit numbered sub-headings like "3.1 System Model", "3.2 Markov Chain Analysis"
    const subMatch = line.match(/^(\d+\.\d+)\s+([A-Za-z0-9\s-]+)$/);
    if (subMatch) {
      detectedSub = subMatch[2].trim();
      continue;
    }

    // Check for main section keywords
    for (const secDef of ACADEMIC_SECTIONS) {
      if (secDef.keywords.some(k => lowerLine === k || lowerLine.startsWith(k + ' ') || lowerLine.startsWith(k + ':'))) {
        detectedSec = secDef.name;
        detectedSub = null; // Reset subsection on new main section
        break;
      }
    }
  }

  return {
    section: detectedSec || "Unknown",
    subsection: detectedSub || null
  };
}

module.exports = {
  detectSectionForText
};
