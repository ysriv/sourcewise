# Sourcewise

**Research, with receipts.** Sourcewise is an AI research helper for students. Add your notes or a paper, ask a question in plain language, and get an answer linked to the passages that support it. It is designed to make checking an AI answer against the original material quick and easy.

## What Sourcewise does

- Accepts pasted notes and text-based PDF files.
- Finds relevant excerpts and uses them to ground answers; citations jump back to the source location.
- Says when it cannot find an answer in the provided material instead of filling gaps with a guess.
- Includes a ready-to-try demo that needs no account, API key, or network-backed AI call.
- Offers optional live answers through the OpenAI API. The API key stays on the server, and source excerpts are sent to OpenAI only when you submit a question in live mode.

Sourcewise is a single-source research helper, not a general-purpose chatbot or a substitute for checking the original paper. It currently supports text-extractable PDFs; scanned PDFs need OCR and are not supported.

## Try the demo

The app opens with a sample study about sleep and learning. No account or API key is needed. Ask about the study's findings, recommended review habits, participants, or limitations. Questions outside the sample are answered with a clear “couldn’t find it” message.

## Run locally

You'll need Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the focused unit tests with:

```bash
npm test
```

The custom cases cover pasted-text chunking, stable source locations, retrieval ranking and no-match behavior, citation quote normalization, and grounded or unsupported demo answers.

To use your own sources with live answers, create a local `.env` file from the safe template:

```bash
cp .env.example .env
```

Run that copy command only when `.env` does not already exist; otherwise edit the existing file so you do not overwrite local settings. Set `OPENAI_API_KEY` to your key. Keep the real key only in `.env`; `.gitignore` excludes `.env` and other local environment files from Git, while `.env.example` is the blank template that is safe to commit. Never put a real key in `.env.example` or prefix it with `NEXT_PUBLIC_`. Restart the development server after changing environment values. The key is read only by the server, and the sample demo remains available without a key.

## Use your own research

- Paste text into the research panel, or upload a text-based PDF.
- PDFs are parsed in your browser and split into page-linked excerpts. Scanned image PDFs are not supported.
- Select one of the suggested questions or type your own. Press Enter to submit; use Shift+Enter for a new line.
- Select a citation to jump to its source excerpt.

PDF uploads are limited to 15 MB and 40 pages. Sources are sent to the configured OpenAI API only when you ask a question in live mode. Source text is not stored by Sourcewise; API requests use `store: false`.

## How it works

Sourcewise extracts text into short passages, ranks passages by word overlap with the question, and sends the strongest matches to the server-side answer route. The route asks the OpenAI Responses API for a grounded answer and citations, then checks that citations refer to passages in the submitted source. The API key never reaches the browser.

## Stack

- Next.js App Router and React
- TypeScript
- PDF.js for in-browser PDF text extraction
- OpenAI Responses API for optional live answers

## Project structure

```text
src/
  app/
    api/answer/   # Server-side grounded answer endpoint
    api/status/   # Reports whether live mode is configured
    globals.css   # Responsive Sourcewise interface
    page.tsx      # Research workspace and demo experience
  lib/
    demo.ts       # Typed exports for the sample research
    demo-data.mjs # Sample research document and passages
    demo-answers.mjs # Testable demo-answer rules
    retrieval.mjs # Passage ranking and citation quote normalization
    sources.mjs   # Pasted-text excerpting
    types.ts      # Shared source and answer types
tests/
  sourcewise.test.mjs # Focused source, retrieval, and demo tests
```

See [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) for the remaining work before public hosting.

## License

MIT. See [LICENSE](LICENSE).
