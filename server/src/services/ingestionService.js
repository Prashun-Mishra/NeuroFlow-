import path from "node:path";
import { createEmbedding } from "./ollamaService.js";
import { createChunks, summarizeText } from "./chunkingService.js";
import { cleanText, extractDocumentText } from "./documentExtractionService.js";

export async function processDocument(repository, document) {
  await repository.updateById("documents", document.id, { status: "processing", processingError: "" });
  await repository.deleteWhere("document_chunks", { documentId: document.id });
  try {
    const { text: rawText, pageCount } = await extractDocumentText(path.resolve(document.storagePath), document.fileType);
    const text = cleanText(rawText);
    if (text.length < 20) throw new Error("Could not extract enough readable text from this file");
    const chunks = createChunks(text);
    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.text);
      await repository.create("document_chunks", { userId: document.userId, workspaceId: document.workspaceId, documentId: document.id, ...chunk, embedding: embedding || undefined, metadata: {} });
    }
    return repository.updateById("documents", document.id, { status: "ready", extractedText: text, summary: summarizeText(text), pageCount, processingError: "", metadata: { chunkCount: chunks.length } });
  } catch (error) {
    await repository.deleteWhere("document_chunks", { documentId: document.id });
    return repository.updateById("documents", document.id, { status: "failed", processingError: error.message || "Document processing failed" });
  }
}
