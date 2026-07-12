import { executeWorkflow } from "../services/workflowService.js";
import { getWorkspaceForUser } from "../services/workspaceService.js";
import { httpError } from "../utils/httpError.js";

export function chatController(repository) {
  const ownedThread = async (id, workspaceId, userId) => { const thread = await repository.getOne("chat_threads", { id, workspaceId, userId }); if (!thread) throw httpError(404, "Chat thread not found"); return thread; };
  return {
    list: async (req, res) => { await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id); res.json({ threads: await repository.getAll("chat_threads", { userId: req.user.id, workspaceId: req.params.workspaceId }, { updated_at: -1 }) }); },
    messages: async (req, res) => { await ownedThread(req.params.threadId, req.params.workspaceId, req.user.id); res.json({ messages: await repository.getAll("chat_messages", { userId: req.user.id, workspaceId: req.params.workspaceId, threadId: req.params.threadId }, { created_at: 1 }) }); },
    ask: async (req, res) => {
      await getWorkspaceForUser(repository, req.params.workspaceId, req.user.id);
      const question = req.body?.question?.trim();
      if (!question) throw httpError(400, "A question is required");
      const thread = req.body.threadId ? await ownedThread(req.body.threadId, req.params.workspaceId, req.user.id) : await repository.create("chat_threads", { userId: req.user.id, workspaceId: req.params.workspaceId, title: question.slice(0, 80) });
      await repository.create("chat_messages", { userId: req.user.id, workspaceId: req.params.workspaceId, threadId: thread.id, role: "user", content: question, citations: [] });
      const run = await executeWorkflow(repository, { userId: req.user.id, workspaceId: req.params.workspaceId, type: "ask", input: { question, threadId: thread.id }, title: question.slice(0, 80) });
      const message = await repository.create("chat_messages", { userId: req.user.id, workspaceId: req.params.workspaceId, threadId: thread.id, role: "assistant", content: run.output?.answer || "Unable to generate an answer.", citations: run.citations || [] });
      await repository.updateById("chat_threads", thread.id, { updated_at: new Date() });
      res.status(201).json({ thread, message, run });
    },
  };
}
