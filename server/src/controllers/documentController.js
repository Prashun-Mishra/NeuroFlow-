import { unlink } from "node:fs/promises";
import { detectFileType } from "../services/documentExtractionService.js";
import { processDocument } from "../services/ingestionService.js";
import { getWorkspaceForUser } from "../services/workspaceService.js";
import { httpError } from "../utils/httpError.js";

export function documentController(repository) {
  const getOwnedDocument = async (id, userId) => { const document = await repository.getOne("documents", { id, userId }); if (!document) throw httpError(404, "Document not found"); return document; };
  return {
    list: async (req, res) => { await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id); res.json({ documents: await repository.getAll("documents", { userId: req.user.id, workspaceId: req.params.workspaceId }, { created_at: -1 }) }); },
    get: async (req, res) => res.json({ document: await getOwnedDocument(req.params.id, req.user.id) }),
    upload: async (req, res) => {
      await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id);
      if (!req.file) throw httpError(400, "A supported file is required");
      const document = await repository.create("documents", { userId: req.user.id, workspaceId: req.params.workspaceId, originalName: req.file.originalname, storedName: req.file.filename, storagePath: req.file.path, mimeType: req.file.mimetype, size: req.file.size, fileType: detectFileType(req.file.originalname), status: "uploaded", metadata: {} });
      const processed = await processDocument(repository, document);
      res.status(201).json({ document: processed });
    },
    reprocess: async (req, res) => { const document = await getOwnedDocument(req.params.id, req.user.id); res.json({ document: await processDocument(repository, document) }); },
    remove: async (req, res) => {
      const document = await getOwnedDocument(req.params.id, req.user.id);
      await repository.deleteWhere("document_chunks", { documentId: document.id });
      await repository.deleteById("documents", document.id);
      if (document.storagePath) await unlink(document.storagePath).catch(() => {});
      res.status(204).send();
    },
  };
}
