export type SourceExcerpt = {
  id: string;
  location: string;
  text: string;
};

export type Citation = {
  sourceId: string;
  location: string;
  quote: string;
};

export type ResearchAnswer = {
  answer: string;
  notFound: boolean;
  citations: Citation[];
};

export type ChatMessage = ResearchAnswer & {
  id: string;
  question: string;
};
