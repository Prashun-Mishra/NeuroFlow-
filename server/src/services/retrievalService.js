import { createEmbedding } from "./ollamaService.js";

const terms = (text = "") => new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
const cosine = (a, b) => { const length = Math.min(a.length, b.length); let dot = 0, aSize = 0, bSize = 0; for (let i = 0; i < length; i += 1) { dot += a[i] * b[i]; aSize += a[i] ** 2; bSize += b[i] ** 2; } return aSize && bSize ? dot / (Math.sqrt(aSize) * Math.sqrt(bSize)) : 0; };

export async function retrieveChunks(repository, { userId, workspaceId, query = "", documentIds = [], limit = 5 }) {
  const documents = await repository.getAll("documents", { userId, workspaceId, status: "ready" });
  const allowed = new Set((documentIds.length ? documentIds : documents.map((document) => document.id)));
  const names = new Map(documents.map((document) => [document.id, document.originalName]));
  const chunks = (await repository.getAll("document_chunks", { userId, workspaceId })).filter((chunk) => allowed.has(chunk.documentId));
  const queryEmbedding = await createEmbedding(query);
  const queryTerms = terms(query);
  return chunks.map((chunk) => {
    const overlap = [...queryTerms].filter((term) => terms(chunk.text).has(term)).length;
    const score = queryEmbedding && Array.isArray(chunk.embedding) ? cosine(queryEmbedding, chunk.embedding) : overlap / Math.max(queryTerms.size, 1);
    return { ...chunk, documentName: names.get(chunk.documentId) || "Document", snippet: chunk.text.slice(0, 400), score };
  }).sort((a, b) => b.score - a.score || a.chunkIndex - b.chunkIndex).slice(0, limit);
}
