import { executeWorkflow } from "../services/workflowService.js";
import { getWorkspaceForUser } from "../services/workspaceService.js";
import { httpError } from "../utils/httpError.js";

export function workflowController(repository) {
  const ownedRun = async (id, userId) => { const run = await repository.getOne("workflow_runs", { id, userId }); if (!run) throw httpError(404, "Workflow run not found"); return run; };
  const start = (type) => async (req, res) => {
    await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id);
    const input = req.body || {};
    if (type === "compare" && (!Array.isArray(input.documentIds) || input.documentIds.length < 2)) throw httpError(400, "Compare requires at least two document IDs");
    if (Array.isArray(input.documentIds)) {
      const documents = await repository.getAll("documents", { userId: req.user.id, workspaceId: req.params.workspaceId });
      const knownIds = new Set(documents.map((document) => document.id));
      if (input.documentIds.some((id) => !knownIds.has(id))) throw httpError(400, "One or more selected documents are unavailable");
    }
    const run = await executeWorkflow(repository, { userId: req.user.id, workspaceId: req.params.workspaceId, type, input });
    res.status(201).json({ run });
  };
  return {
    list: async (req, res) => { await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id); res.json({ runs: await repository.getAll("workflow_runs", { userId: req.user.id, workspaceId: req.params.workspaceId }, { created_at: -1 }) }); },
    get: async (req, res) => res.json({ run: await ownedRun(req.params.id, req.user.id) }),
    summarize: start("summarize"), compare: start("compare"), meetingActionItems: start("meeting_action_items"), researchBrief: start("research_brief"),
  };
}
