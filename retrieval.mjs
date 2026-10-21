const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "because", "been", "before", "being", "between", "could", "does", "did", "from", "have", "into", "just", "more", "most", "only", "other", "over", "same", "should", "some", "such", "than", "that", "their", "them", "then", "there", "these", "they", "this", "those", "through", "under", "very", "what", "when", "where", "which", "while", "with", "would", "your", "the", "who", "why", "how", "study", "studies", "research", "researchers", "paper", "source", "sources", "tell", "find", "found", "finding", "findings", "key", "main", "evidence",
]);

/** @param {string} value */
export function terms(value) {
  const commonForms = new Map([
    ["found", "find"], ["finding", "finding"], ["findings", "finding"],
    ["limit", "limit"], ["limits", "limit"], ["limitation", "limit"], ["limitations", "limit"],
  ]);
  return value.toLowerCase().match(/[a-z0-9]{3,}/g)
    ?.map((word) => commonForms.get(word) ?? (word.endsWith("s") && word.length > 3 ? word.slice(0, -1) : word))
    .filter((word) => !STOP_WORDS.has(word)) ?? [];
}

/** @param {string} question @param {Array<{id: string, location: string, text: string}>} excerpts */
export function rankExcerpts(question, excerpts) {
  const queryTerms = [...new Set(terms(question))];
  // Broad prompts such as “what are the key findings?” have no topic words;
  // return the document so the grounded model can summarize it.
  if (queryTerms.length === 0) return excerpts.slice(0, 8);

  return excerpts
    .map((excerpt, index) => {
      const bodyTerms = new Set(terms(excerpt.text));
      const score = queryTerms.reduce((sum, term) => sum + (bodyTerms.has(term) ? 1 : 0), 0);
      return { excerpt, score, index };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 8)
    .map(({ excerpt }) => excerpt);
}

/** @param {string} value */
export function normalizedQuote(value) {
  return value.toLowerCase().replace(/\s+/g, " ").replace(/[“”‘’"'.,;:!?()[\]{}]/g, "").trim();
}
