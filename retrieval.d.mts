import type { SourceExcerpt } from "./types";

export function terms(value: string): string[];
export function rankExcerpts(question: string, excerpts: SourceExcerpt[]): SourceExcerpt[];
export function normalizedQuote(value: string): string;
