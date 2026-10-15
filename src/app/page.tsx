"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, BookOpen, Check, ChevronDown, CircleHelp, FileText,
  FileUp, FlaskConical, LoaderCircle, MessageSquareText, RotateCcw, Send,
  Sparkles, X,
} from "lucide-react";
import { DEMO_DOCUMENT, DEMO_EXCERPTS, getDemoAnswer } from "@/lib/demo";
import type { ChatMessage, ResearchAnswer, SourceExcerpt } from "@/lib/types";

const MAX_PDF_PAGES = 40;
const CHUNK_SIZE = 1_500;

function toExcerpts(text: string): SourceExcerpt[] {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks: SourceExcerpt[] = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    for (let offset = 0; offset < paragraph.length; offset += CHUNK_SIZE) {
      const textPart = paragraph.slice(offset, offset + CHUNK_SIZE).trim();
      if (!textPart) continue;
      chunks.push({
        id: `text-${paragraphIndex + 1}-${offset}`,
        location: `Section ${paragraphIndex + 1}`,
        text: textPart,
      });
    }
  });
  return chunks;
}

function CitationButton({ citation, onOpen }: { citation: ChatMessage["citations"][number]; onOpen: (sourceId: string) => void }) {
  return (
    <button className="citation-chip" onClick={() => onOpen(citation.sourceId)} type="button">
      <BookOpen size={13} strokeWidth={2} /> {citation.location} <ArrowUpRight size={12} />
    </button>
  );
}

export default function Home() {
  const [documentText, setDocumentText] = useState(DEMO_DOCUMENT);
  const [documentName, setDocumentName] = useState("Sleep, memory, and study habits");
  const [excerpts, setExcerpts] = useState<SourceExcerpt[]>(DEMO_EXCERPTS);
  const [isDemo, setIsDemo] = useState(true);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sourceNotice, setSourceNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const questionInput = useRef<HTMLTextAreaElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const wordCount = useMemo(() => documentText.trim().split(/\s+/).filter(Boolean).length, [documentText]);
  const sourceTooLarge = excerpts.length > 40 || excerpts.reduce((sum, item) => sum + item.text.length, 0) > 50_000;

  useEffect(() => {
    fetch("/api/status").then((response) => response.json()).then((data) => setLiveAvailable(Boolean(data.liveAvailable))).catch(() => undefined);
  }, []);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  function resetChat() {
    setMessages([]);
    setError("");
    setQuestion("");
  }

  function updateText(value: string) {
    setDocumentText(value);
    setExcerpts(toExcerpts(value));
    setDocumentName("Pasted research notes");
    setIsDemo(false);
    setSourceNotice("");
    resetChat();
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setSourceNotice("");
    try {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error("Please choose a PDF file.");
      }
      if (file.size > 15 * 1024 * 1024) throw new Error("This PDF is over 15 MB. Choose a smaller file.");

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      if (pdf.numPages > MAX_PDF_PAGES) throw new Error(`This PDF has ${pdf.numPages} pages. The limit is ${MAX_PDF_PAGES} pages.`);

      const pageExcerpts: SourceExcerpt[] = [];
      const pageTexts: string[] = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (!pageText) continue;
        pageTexts.push(pageText);
        for (let offset = 0; offset < pageText.length; offset += CHUNK_SIZE) {
          pageExcerpts.push({
            id: `pdf-p${pageNumber}-${offset}`,
            location: `Page ${pageNumber}`,
            text: pageText.slice(offset, offset + CHUNK_SIZE).trim(),
          });
        }
      }
      if (!pageExcerpts.length) throw new Error("No selectable text was found. This PDF may be a scanned image.");
      if (pageExcerpts.length > 40 || pageExcerpts.reduce((sum, item) => sum + item.text.length, 0) > 50_000) {
        throw new Error("This PDF has too much text for one research session. Try a shorter document.");
      }
      setDocumentText(pageTexts.join("\n\n"));
      setDocumentName(file.name.replace(/\.pdf$/i, ""));
      setExcerpts(pageExcerpts);
      setIsDemo(false);
      setSourceNotice(`${pageExcerpts.length} source sections extracted from ${pdf.numPages} pages.`);
      resetChat();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read this PDF.");
    } finally {
      event.target.value = "";
    }
  }

  function switchToDemo() {
    setDocumentText(DEMO_DOCUMENT);
    setDocumentName("Sleep, memory, and study habits");
    setExcerpts(DEMO_EXCERPTS);
    setIsDemo(true);
    setSourceNotice("Sample research is ready. Ask a question to explore it.");
    resetChat();
  }

  function openCitation(sourceId: string) {
    const element = document.getElementById(`source-${sourceId}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.classList.add("source-highlight");
    window.setTimeout(() => element?.classList.remove("source-highlight"), 1_800);
  }

  async function submitQuestion(event?: FormEvent) {
    event?.preventDefault();
    const currentQuestion = question.trim();
    if (!currentQuestion || busy) return;
    setError("");
    setBusy(true);
    try {
      let result: ResearchAnswer;
      if (isDemo) {
        await new Promise((resolve) => window.setTimeout(resolve, 480));
        result = getDemoAnswer(currentQuestion);
      } else {
        if (sourceTooLarge) throw new Error("This source is too large for one research session. Try a shorter document or PDF.");
        if (!liveAvailable) throw new Error("Add OPENAI_API_KEY to .env.local to ask questions about your own sources. The sample research is always available in demo mode.");
        const response = await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: currentQuestion, sources: excerpts }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not get an answer.");
        result = payload as ResearchAnswer;
      }
      setMessages((previous) => [...previous, { ...result, id: crypto.randomUUID(), question: currentQuestion }]);
      setQuestion("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function onQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion();
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Sourcewise home">
          <span className="brand-mark"><FlaskConical size={18} strokeWidth={2.5} /></span>
          <span>sourcewise<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <div className="trust-note"><span className="trust-dot" /> Your sources stay yours</div>
          <button className="icon-button help-button" type="button" aria-label="About Sourcewise" title="Answers are grounded in the research you add.">
            <CircleHelp size={18} />
          </button>
          <a className="github-link" href="https://github.com" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
        </div>
      </header>

      <section className="intro" id="top">
        <div className="eyebrow"><span className="eyebrow-line" /> RESEARCH, WITH RECEIPTS</div>
        <h1>Think deeper.<br /><span>Find it in the source.</span></h1>
        <p>Bring your research. Ask better questions. Every answer points back to where it came from.</p>
      </section>

      <section className="workspace" aria-label="Research workspace">
        <aside className="source-panel panel">
          <div className="panel-heading">
            <div className="panel-title-group">
              <span className="step-number">01</span>
              <div><h2>Your research</h2><p>Give your questions some context.</p></div>
            </div>
            <button className="more-button" type="button" onClick={switchToDemo} title="Load sample research"><RotateCcw size={15} /></button>
          </div>

          <div className="source-tabs">
            <span className="source-tab active"><FileText size={14} /> Source</span>
            <button className="source-tab upload-tab" type="button" onClick={() => fileInput.current?.click()}><FileUp size={14} /> Upload PDF</button>
            <input ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={handleFile} hidden />
          </div>

          <div className="document-card">
            <div className="document-meta">
              <span className="document-icon"><FileText size={16} /></span>
              <span className="document-name" title={documentName}>{documentName}</span>
              {isDemo && <span className="demo-tag">SAMPLE</span>}
            </div>
            <label className="sr-only" htmlFor="research-text">Paste research text</label>
            <textarea
              id="research-text"
              className="research-textarea"
              value={documentText}
              onChange={(event) => updateText(event.target.value)}
              placeholder="Paste an article, paper, or class notes here…"
              spellCheck={false}
            />
            <div className="document-footer"><span>{wordCount.toLocaleString()} words</span><span>{isDemo ? "Demo source" : "Your source"}</span></div>
          </div>

          <div className="source-actions">
            <button className="text-action" type="button" onClick={() => fileInput.current?.click()}><FileUp size={15} /> Choose a PDF</button>
            <span className="source-limit">Text-based PDFs · up to 40 pages</span>
          </div>
          {sourceNotice && <div className="notice success-notice"><Check size={14} /> {sourceNotice}</div>}
          {error && <div className="notice error-notice"><X size={14} /> {error}</div>}
          {sourceTooLarge && <div className="notice error-notice"><X size={14} /> This source is too large for one session. Use up to 50,000 characters across 40 sections.</div>}
          {!liveAvailable && <div className="api-note"><Sparkles size={15} /><span>Demo mode is ready. Add an API key to ask about your own sources.</span></div>}

          <div className="source-outline">
            <div className="outline-heading"><span>IN THIS SOURCE</span><ChevronDown size={13} /></div>
            <div className="outline-list">
              {excerpts.slice(0, 4).map((excerpt, index) => (
                <button className="outline-row" key={excerpt.id} onClick={() => openCitation(excerpt.id)} type="button">
                  <span className="outline-dot" />
                  <span className="outline-location">{excerpt.location}</span>
                  <span className="outline-preview">{excerpt.text.slice(0, 48)}{excerpt.text.length > 48 ? "…" : ""}</span>
                  <ArrowUpRight size={12} />
                </button>
              ))}
              {excerpts.length > 4 && <span className="outline-more">+ {excerpts.length - 4} more sections</span>}
            </div>
          </div>
        </aside>

        <section className="chat-panel panel" aria-label="Ask questions">
          <div className="panel-heading chat-heading">
            <div className="panel-title-group">
              <span className="step-number">02</span>
              <div><h2>Ask anything</h2><p>Stay curious. Stay grounded.</p></div>
            </div>
            <div className="mode-pill"><span className="mode-dot" /> {isDemo ? "DEMO MODE" : liveAvailable ? "AI MODE" : "ADD API KEY"}</div>
          </div>

          <div className="chat-content">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-orbit orbit-one" /><div className="empty-orbit orbit-two" />
                <div className="empty-icon"><MessageSquareText size={23} /></div>
                <span className="empty-kicker">A GOOD PLACE TO START</span>
                <h3>What are you curious about?</h3>
                <p>Ask a question. Sourcewise will look through your material and show its work.</p>
                <div className="suggestion-list">
                  {(isDemo ? ["What did the study find about sleep?", "What study habits did researchers recommend?", "What are the limitations?"] : ["What are the key findings?", "What evidence supports the main argument?", "What limitations should I keep in mind?"]).map((suggestion) => (
                    <button className="suggestion" type="button" key={suggestion} onClick={() => setQuestion(suggestion)}>
                      <span>{suggestion}</span><ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message) => (
                  <article className="message-pair" key={message.id}>
                    <div className="user-question"><span className="avatar user-avatar">Y</span><p>{message.question}</p></div>
                    <div className="assistant-answer">
                      <span className="avatar assistant-avatar"><Sparkles size={14} /></span>
                      <div className="answer-body">
                        <p>{message.answer}</p>
                        {message.citations.length > 0 && <div className="citations"><span className="cited-label">SOURCE</span>{message.citations.map((citation, index) => <CitationButton key={`${message.id}-${index}`} citation={citation} onOpen={openCitation} />)}</div>}
                        {message.citations.map((citation, index) => <blockquote className="quote-card" key={`${message.id}-quote-${index}`}><span>“</span>{citation.quote}</blockquote>)}
                        {message.notFound && <span className="not-found-tag">No supporting passage found</span>}
                      </div>
                    </div>
                  </article>
                ))}
                {busy && <div className="thinking-row"><span className="avatar assistant-avatar"><Sparkles size={14} /></span><div className="thinking"><span /><span /><span /></div><span>Looking through your source…</span></div>}
                <div ref={latestMessageRef} />
              </div>
            )}
          </div>

          <div className="composer-area">
            {error && <div className="composer-error"><X size={14} /> {error}</div>}
            <form className="composer" onSubmit={submitQuestion}>
              <label className="sr-only" htmlFor="question-input">Ask a question about the source</label>
              <textarea
                ref={questionInput}
                id="question-input"
                rows={1}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={onQuestionKeyDown}
                placeholder="Ask a question about your source…"
              />
              <button className="send-button" type="submit" disabled={!question.trim() || busy} aria-label="Send question">
                {busy ? <LoaderCircle className="spin" size={17} /> : <Send size={16} />}
              </button>
            </form>
            <div className="composer-hint"><span><kbd>↵</kbd> to ask</span><span>Answers grounded in your sources</span></div>
          </div>
        </section>
      </section>

      <section className="source-reader" aria-label="Source excerpts">
        <div className="reader-heading"><div><span className="eyebrow reader-eyebrow">YOUR SOURCE, IN CONTEXT</span><h2>Research excerpts</h2></div><span className="reader-count">{excerpts.length} sections</span></div>
        <div className="reader-grid">
          {excerpts.map((excerpt) => (
            <article className="reader-card" id={`source-${excerpt.id}`} key={excerpt.id}>
              <div className="reader-card-top"><span className="reader-page"><BookOpen size={13} /> {excerpt.location}</span><span className="reader-card-index">{excerpt.id.startsWith("demo") ? "DEMO SOURCE" : "EXCERPT"}</span></div>
              <p>{excerpt.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><FlaskConical size={15} strokeWidth={2.5} /></span><span>sourcewise<span className="brand-period">.</span></span></a><span>Good questions deserve good sources.</span><a href="#top" className="back-top">Back to top ↑</a></footer>
    </main>
  );
}
