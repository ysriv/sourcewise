# Sourcewise improvement plan

## Completed: make the first session clearer and safer

- Make adding, clearing, and restoring a source obvious, including when the source is empty.
- Improve reading comfort and keyboard/screen-reader feedback on the research and chat panels.
- Stop live retrieval from sending a question to the model when none of the source passages match it.
- Make the demo decline unrelated questions instead of returning a generic answer.
- Add repeatable tests for text chunking, retrieval, and grounded demo answers.
- Explain when live questions send excerpts to OpenAI and that the key stays server-side.
- Keep each demo answer's citations aligned with all claims it makes.
- Ignore late answers if the user changes the active source while a request is running.
- Show PDF extraction progress, cap question length, and keep the demo's visible text aligned with its answer passages.
- Link the GitHub button to the actual Sourcewise repository.

## Next: prepare for public hosting

- Add browser-level checks for paste, PDF upload, citations, and mobile layout.
- Check the server routes with a mocked OpenAI response and verify error handling without a real key.
- Add a deployment guide and configure a public host with the OpenAI key stored as a server secret.
- Run a final production build and smoke check before sharing the hosted URL.

## Later ideas

- Add multiple source documents and let users remove or rename each one.
- Add optional conversation export and clearer privacy controls.
- Consider OCR for scanned PDFs and additional AI providers.
