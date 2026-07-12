import { runAgentPipeline } from "../agents/workflowAgents.js";

const titles = { ask: "Ask workspace", summarize: "Workspace summary", compare: "Document comparison", meeting_action_items: "Meeting action items", research_brief: "Research brief" };

export async function executeWorkflow(repository, { userId, workspaceId, type, input, title }) {
  const run = await repository.create("workflow_runs", { userId, workspaceId, type, title: title || titles[type] || "Workflow run", status: "queued", input, output: {}, citations: [], evaluation: {}, trace: [] });
  await repository.updateById("workflow_runs", run.id, { status: "running" });
  try {
    const result = await runAgentPipeline(repository, { userId, workspaceId, type, input });
    return repository.updateById("workflow_runs", run.id, { status: "completed", ...result });
  } catch (error) {
    return repository.updateById("workflow_runs", run.id, { status: "failed", evaluation: { confidence: "low", note: error.message || "Workflow failed" }, trace: [{ stage: "Pipeline", status: "failed", at: new Date().toISOString() }] });
  }
}
