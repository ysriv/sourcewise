import type { ResearchAnswer, SourceExcerpt } from "./types";
import { getDemoAnswer as answerDemoQuestion } from "./demo-answers.mjs";
import { DEMO_DOCUMENT, DEMO_EXCERPTS } from "./demo-data.mjs";

export { DEMO_DOCUMENT, DEMO_EXCERPTS };

export function getDemoAnswer(question: string): ResearchAnswer {
  return answerDemoQuestion(question, DEMO_EXCERPTS);
}
