import type { ResearchAnswer, SourceExcerpt } from "./types";

export const DEMO_EXCERPTS: SourceExcerpt[] = [
  {
    id: "demo-p1-a",
    location: "Page 1",
    text: "Researchers followed 72 university students during a two-week learning study. Students who kept a consistent sleep schedule remembered more material than students with irregular sleep. The strongest relationship was between sleep regularity and recall the following morning.",
  },
  {
    id: "demo-p2-a",
    location: "Page 2",
    text: "Participants who slept at least seven hours before a test recalled 12% more vocabulary on average than those who slept less than seven hours. The study found an association; it did not establish that sleep duration alone caused the difference.",
  },
  {
    id: "demo-p2-b",
    location: "Page 2",
    text: "Students who reviewed their notes briefly before sleep and again the next morning performed better than students who used one long review session. The authors call this spaced review and recommend short, repeated sessions.",
  },
  {
    id: "demo-p3-a",
    location: "Page 3",
    text: "The authors note several limits: the sample came from one university, participants reported their own sleep, and the study measured vocabulary recall rather than every kind of learning. The results should not be treated as proof that the same effect applies to all students or subjects.",
  },
];

export const DEMO_DOCUMENT = `Sleep, memory, and study habits\n\nResearchers followed 72 university students during a two-week learning study. Students who kept a consistent sleep schedule remembered more material than students with irregular sleep. The strongest relationship was between sleep regularity and recall the following morning.\n\nParticipants who slept at least seven hours before a test recalled 12% more vocabulary on average than those who slept less than seven hours. The study found an association; it did not establish that sleep duration alone caused the difference.\n\nStudents who reviewed their notes briefly before sleep and again the next morning performed better than students who used one long review session. The authors call this spaced review and recommend short, repeated sessions.\n\nThe authors note several limits: the sample came from one university, participants reported their own sleep, and the study measured vocabulary recall rather than every kind of learning. The results should not be treated as proof that the same effect applies to all students or subjects.`;

const answers: Array<{
  match: RegExp;
  answer: string;
  excerptId: string;
  quote: string;
}> = [
  {
    match: /sleep|hours|duration|schedule/i,
    answer:
      "In this study, students with a consistent sleep schedule remembered more material. Those who slept at least seven hours recalled 12% more vocabulary on average than those who slept less. The authors describe this as an association, not proof that sleep duration alone caused the difference.",
    excerptId: "demo-p2-a",
    quote: "recalled 12% more vocabulary on average",
  },
  {
    match: /review|study habit|spacing|notes|session/i,
    answer:
      "The paper recommends spaced review: a brief review before sleep and another the next morning. Students using this pattern performed better than those who studied in one long session.",
    excerptId: "demo-p2-b",
    quote: "reviewed their notes briefly before sleep and again the next morning",
  },
  {
    match: /limit|limitation|caveat|sample|weakness/i,
    answer:
      "The study was limited to 72 students at one university, relied on self-reported sleep, and measured vocabulary recall. The authors caution against assuming the findings apply to every student or subject.",
    excerptId: "demo-p3-a",
    quote: "the sample came from one university",
  },
  {
    match: /who|participant|student|study/i,
    answer:
      "The researchers followed 72 university students for two weeks. They compared sleep patterns with how well students recalled learning material.",
    excerptId: "demo-p1-a",
    quote: "followed 72 university students during a two-week learning study",
  },
];

export function getDemoAnswer(question: string): ResearchAnswer {
  const found = answers.find(({ match }) => match.test(question));
  if (!found) {
    return {
      answer: "I couldn’t find that in the demo source. Try asking about sleep, review habits, participants, or study limitations.",
      notFound: true,
      citations: [],
    };
  }

  const excerpt = DEMO_EXCERPTS.find((item) => item.id === found.excerptId);
  return {
    answer: found.answer,
    notFound: false,
    citations: excerpt
      ? [{ sourceId: excerpt.id, location: excerpt.location, quote: found.quote }]
      : [],
  };
}
