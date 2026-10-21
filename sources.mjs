const CHUNK_SIZE = 1_500;

/** @param {string} text */
export function toExcerpts(text) {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];

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
