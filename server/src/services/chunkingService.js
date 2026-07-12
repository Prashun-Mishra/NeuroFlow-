export function createChunks(text, targetSize = 1200, overlap = 200) {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  const emit = () => {
    const value = current.trim();
    if (value) chunks.push(value);
    current = value.slice(Math.max(0, value.length - overlap));
  };
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > targetSize) emit();
    if (paragraph.length > targetSize && !current) {
      for (let start = 0; start < paragraph.length; start += targetSize - overlap) chunks.push(paragraph.slice(start, start + targetSize));
      current = "";
    } else current = `${current}${current ? "\n\n" : ""}${paragraph}`;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.map((chunk, chunkIndex) => ({ chunkIndex, text: chunk, tokenCountApprox: Math.ceil(chunk.length / 4) }));
}

export function summarizeText(text) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 25) || [];
  return sentences.slice(0, 3).join(" ").slice(0, 700) || text.slice(0, 700);
}
