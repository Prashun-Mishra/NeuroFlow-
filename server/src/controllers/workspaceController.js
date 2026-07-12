import { httpError } from "../utils/httpError.js";

export function workspaceController(repository) {
  const owned = async (id, userId) => {
    const workspace = await repository.getOne("workspaces", { id, userId });
    if (!workspace) throw httpError(404, "Workspace not found");
    return workspace;
  };
  return {
    list: async (req, res) => res.json({ workspaces: await repository.getAll("workspaces", { userId: req.user.id }, { created_at: -1 }) }),
    get: async (req, res) => res.json({ workspace: await owned(req.params.id, req.user.id) }),
    create: async (req, res) => {
      const { name, description = "", color = "#6366f1" } = req.body;
      if (!name?.trim()) throw httpError(400, "Workspace name is required");
      const workspace = await repository.create("workspaces", { userId: req.user.id, name: name.trim(), description, color });
      res.status(201).json({ workspace });
    },
    update: async (req, res) => {
      await owned(req.params.id, req.user.id);
      const allowed = Object.fromEntries(Object.entries(req.body).filter(([key]) => ["name", "description", "color"].includes(key)));
      if (allowed.name !== undefined && !allowed.name.trim()) throw httpError(400, "Workspace name is required");
      res.json({ workspace: await repository.updateById("workspaces", req.params.id, allowed) });
    },
    remove: async (req, res) => {
      await owned(req.params.id, req.user.id);
      await repository.deleteWhere("document_chunks", { workspaceId: req.params.id });
      await repository.deleteWhere("documents", { workspaceId: req.params.id });
      await repository.deleteWhere("chat_threads", { workspaceId: req.params.id });
      await repository.deleteWhere("chat_messages", { workspaceId: req.params.id });
      await repository.deleteWhere("workflow_runs", { workspaceId: req.params.id });
      await repository.deleteById("workspaces", req.params.id);
      res.status(204).send();
    },
  };
}
