/** @type {Array<{match: RegExp, answer: string, citations: Array<{excerptId: string, quote: string}>}>} */
const answers = [
  {
    match: /review|study habit|spacing|notes|session/i,
    answer: "The paper recommends spaced review: a brief review before sleep and another the next morning. Students using this pattern performed better than those who studied in one long session.",
    citations: [{ excerptId: "demo-p2-b", quote: "reviewed their notes briefly before sleep and again the next morning" }],
  },
  {
    match: /sleep|hours|duration|schedule|finding|result|conclusion|outcome|effect|recall|remember|vocabulary/i,
    answer: "Students with a consistent sleep schedule remembered more material, and those who slept at least seven hours recalled 12% more vocabulary on average than those who slept less. The study found an association; it did not establish that sleep duration alone caused the difference.",
    citations: [
      { excerptId: "demo-p1-a", quote: "Students who kept a consistent sleep schedule remembered more material" },
      { excerptId: "demo-p2-a", quote: "recalled 12% more vocabulary on average" },
    ],
  },
  {
    match: /limit|limitation|caveat|sample|weakness/i,
    answer: "The study was limited to 72 students at one university, relied on self-reported sleep, and measured vocabulary recall. The authors caution against assuming the findings apply to every student or subject.",
    citations: [{ excerptId: "demo-p3-a", quote: "the sample came from one university" }],
  },
  {
    match: /participant|student|who took part|who participated/i,
    answer: "The researchers followed 72 university students for two weeks. They compared sleep patterns with how well students recalled learning material.",
    citations: [{ excerptId: "demo-p1-a", quote: "followed 72 university students during a two-week learning study" }],
  },
];

/** @param {string} question @param {Array<{id: string, location: string, text: string}>} excerpts */
export function getDemoAnswer(question, excerpts) {
  const found = answers.find(({ match }) => match.test(question));
  if (!found) {
    return {
      answer: "I couldn’t find that in the demo source. Try asking about sleep, review habits, participants, or study limitations.",
      notFound: true,
      citations: [],
    };
  }

  const citations = found.citations.flatMap(({ excerptId, quote }) => {
    const excerpt = excerpts.find((item) => item.id === excerptId);
    return excerpt ? [{ sourceId: excerpt.id, location: excerpt.location, quote }] : [];
  });
  return {
    answer: found.answer,
    notFound: false,
    citations,
  };
}
