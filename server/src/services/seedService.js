import bcrypt from "bcryptjs";

export async function seedDemoData(repository) {
  const email = "demo@neuroflow.ai";
  if (await repository.getOne("users", { email })) return;
  const user = await repository.create("users", { name: "NeuroFlow Demo", email, password: await bcrypt.hash("Password@123", 10) });
  if (process.env.SEED_SAMPLE_DATA !== "true") return;
  const workspace = await repository.create("workspaces", { userId: user.id, name: "Welcome to NeuroFlow", description: "A demo workspace for your document intelligence projects.", color: "#6366f1" });
  const text = "NeuroFlow is a workspace-based document intelligence system. It turns uploaded source material into searchable chunks, produces grounded answers with citations, and records every workflow execution trace.";
  const document = await repository.create("documents", { userId: user.id, workspaceId: workspace.id, originalName: "neuroflow-overview.txt", storedName: "demo-neuroflow-overview.txt", mimeType: "text/plain", size: text.length, fileType: "txt", status: "ready", extractedText: text, summary: text, pageCount: 0, metadata: { chunkCount: 1 } });
  const chunk = await repository.create("document_chunks", { userId: user.id, workspaceId: workspace.id, documentId: document.id, chunkIndex: 0, text, tokenCountApprox: Math.ceil(text.length / 4), metadata: {} });
  await repository.create("workflow_runs", { userId: user.id, workspaceId: workspace.id, type: "summarize", status: "completed", title: "Welcome workspace summary", input: {}, output: { summary: text, keyPoints: ["Documents become searchable chunks.", "Workflow outputs are grounded with citations."] }, citations: [{ documentId: document.id, documentName: document.originalName, chunkIndex: chunk.chunkIndex, snippet: text.slice(0, 400), score: 1 }], evaluation: { confidence: "high", note: "Seeded demo workflow." }, trace: [{ stage: "Planner", status: "completed" }, { stage: "Retriever", status: "completed" }, { stage: "Task", status: "completed" }, { stage: "Writer", status: "completed" }, { stage: "Evaluator", status: "completed" }] });
}
