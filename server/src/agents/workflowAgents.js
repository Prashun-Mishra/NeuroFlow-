import { chatWithOllama } from "../services/ollamaService.js";
import { retrieveChunks } from "../services/retrievalService.js";
import { summarizeText } from "../services/chunkingService.js";

const titles = { ask: "Ask workspace", summarize: "Workspace summary", compare: "Document comparison", meeting_action_items: "Meeting action items", research_brief: "Research brief" };
const parseJson = (value) => { try { return JSON.parse(value.replace(/^```json\s*|\s*```$/g, "").trim()); } catch { return null; } };
const sourceText = (chunks) => chunks.map((chunk) => `[${chunk.documentName} #${chunk.chunkIndex + 1}] ${chunk.text}`).join("\n\n");
const sentences = (text) => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((value) => value.trim()).filter(Boolean) || [];
const citationsFor = (chunks) => chunks.map(({ documentId, documentName, chunkIndex, snippet, score }) => ({ documentId, documentName, chunkIndex, snippet, score }));

async function stageJson(stage, instruction, fallback) {
  const response = await chatWithOllama([{ role: "system", content: "You are one stage in a grounded document workflow. Return valid JSON only." }, { role: "user", content: instruction }]);
  return { value: response ? parseJson(response) || fallback : fallback, mode: response ? "ollama" : "fallback", stage };
}

function fallbackTask(type, input, chunks) {
  const text = chunks.map((chunk) => chunk.text).join("\n\n");
  if (type === "ask") {
    const evidence = chunks.length ? chunks.map((chunk) => `${chunk.documentName}: ${summarizeText(chunk.text)}`).join("\n\n") : "No ready documents were found in this workspace.";
    return { answer: chunks.length ? `Based on the retrieved workspace documents:\n\n${evidence}` : evidence };
  }
  if (type === "summarize") {
    const points = sentences(text).filter((sentence) => sentence.length > 25).slice(0, 5);
    return { summary: summarizeText(text) || "No ready documents were found to summarize.", keyPoints: points.length ? points : ["No ready documents were found."] };
  }
  if (type === "compare") {
    const groups = new Map();
    for (const chunk of chunks) groups.set(chunk.documentId, [...(groups.get(chunk.documentId) || []), chunk]);
    const docs = [...groups.entries()].map(([documentId, items]) => ({ documentId, documentName: items[0].documentName, text: items.map((item) => item.text).join(" ") }));
    const wordSets = docs.map((document) => new Set((document.text.toLowerCase().match(/[a-z]{4,}/g) || [])));
    const shared = wordSets.length > 1 ? [...wordSets[0]].filter((word) => wordSets.slice(1).every((set) => set.has(word))).slice(0, 6) : [];
    return { overview: `Comparison of ${docs.map((document) => document.documentName).join(" and ")}.`, similarities: shared.length ? [`Shared themes include: ${shared.join(", ")}.`] : ["The documents have limited directly overlapping terminology."], differences: docs.map((document) => `${document.documentName} emphasizes ${summarizeText(document.text).slice(0, 160)}.`), documentTakeaways: docs.map((document) => ({ documentId: document.documentId, documentName: document.documentName, takeaway: summarizeText(document.text) })) };
  }
  if (type === "meeting_action_items") {
    const lines = text.split(/\n|(?<=[.!?])\s+/).map((line) => line.trim()).filter((line) => /\b(todo|action|follow up|follow-up|need to|must|should|please|assign|will)\b/i.test(line));
    return { summary: summarizeText(text) || "No ready meeting notes were found.", actionItems: lines.slice(0, 10).map((task) => ({ task, owner: "Unassigned", priority: /urgent|asap|critical/i.test(task) ? "high" : "medium", dueNote: /\b(by|before|due)\s+[^,.]+/i.exec(task)?.[0] || "Not specified" })) };
  }
  const themes = chunks.slice(0, 4).map((chunk) => ({ heading: chunk.documentName, details: sentences(chunk.text).slice(0, 3) }));
  return { title: input.topic || "Workspace research brief", executiveSummary: summarizeText(text) || "No ready documents were found.", themes, conclusion: themes.length ? "The brief is grounded in the retrieved workspace material." : "Upload and process documents to generate a research brief." };
}

function normalizeOutput(type, output, input) {
  if (type === "ask") return { answer: String(output?.answer || "No grounded answer could be generated.") };
  if (type === "summarize") return { summary: String(output?.summary || "No summary available."), keyPoints: Array.isArray(output?.keyPoints) ? output.keyPoints.map(String).slice(0, 8) : [] };
  if (type === "compare") return { overview: String(output?.overview || "No comparison available."), similarities: Array.isArray(output?.similarities) ? output.similarities.map(String) : [], differences: Array.isArray(output?.differences) ? output.differences.map(String) : [], documentTakeaways: Array.isArray(output?.documentTakeaways) ? output.documentTakeaways.map((takeaway) => ({ documentId: String(takeaway.documentId || ""), documentName: String(takeaway.documentName || "Document"), takeaway: String(takeaway.takeaway || "") })) : [] };
  if (type === "meeting_action_items") return { summary: String(output?.summary || "No summary available."), actionItems: Array.isArray(output?.actionItems) ? output.actionItems.map((item) => ({ task: String(item.task || ""), owner: String(item.owner || "Unassigned"), priority: String(item.priority || "medium"), dueNote: String(item.dueNote || "Not specified") })) : [] };
  return { title: String(output?.title || input.topic || "Workspace research brief"), executiveSummary: String(output?.executiveSummary || "No brief available."), themes: Array.isArray(output?.themes) ? output.themes.map((theme) => ({ heading: String(theme.heading || "Theme"), details: Array.isArray(theme.details) ? theme.details.map(String) : [] })) : [], conclusion: String(output?.conclusion || "") };
}

export async function runAgentPipeline(repository, { userId, workspaceId, type, input }) {
  const trace = [];
  const query = input.question || input.prompt || input.topic || titles[type];
  const planned = await stageJson("Planner", `Create a plan for workflow type ${type}. Query: ${query}. Return {"retrievalQuery":"...","documentIds":[]}.`, { retrievalQuery: query, documentIds: input.documentIds || [] });
  trace.push({ stage: "Planner", status: "completed", mode: planned.mode, at: new Date().toISOString() });
  const selectedIds = Array.isArray(planned.value.documentIds) && planned.value.documentIds.length ? planned.value.documentIds : (input.documentIds || []);
  const chunks = await retrieveChunks(repository, { userId, workspaceId, query: planned.value.retrievalQuery || query, documentIds: selectedIds, limit: 5 });
  trace.push({ stage: "Retriever", status: "completed", mode: chunks.some((chunk) => chunk.embedding) ? "embedding" : "keyword", detail: `${chunks.length} chunk(s)`, at: new Date().toISOString() });
  const fallback = fallbackTask(type, input, chunks);
  const tasked = await stageJson("Task", `Complete the ${type} workflow using only these sources. Return the required structured JSON.\n\n${sourceText(chunks)}`, fallback);
  trace.push({ stage: "Task", status: "completed", mode: tasked.mode, at: new Date().toISOString() });
  const written = await stageJson("Writer", `Normalize this ${type} result as valid JSON without adding claims: ${JSON.stringify(tasked.value)}`, normalizeOutput(type, tasked.value, input));
  const output = normalizeOutput(type, written.value, input);
  trace.push({ stage: "Writer", status: "completed", mode: written.mode, at: new Date().toISOString() });
  const fallbackEvaluation = { confidence: chunks.length >= 3 ? "high" : chunks.length ? "medium" : "low", note: chunks.length ? `Grounded in ${chunks.length} retrieved document chunk(s).` : "No ready document chunks were available." };
  const evaluated = await stageJson("Evaluator", `Evaluate this grounded ${type} result. Return {"confidence":"low|medium|high","note":"short note"}. Sources: ${chunks.length}; result: ${JSON.stringify(output)}`, fallbackEvaluation);
  const evaluation = { confidence: ["low", "medium", "high"].includes(evaluated.value?.confidence) ? evaluated.value.confidence : fallbackEvaluation.confidence, note: String(evaluated.value?.note || fallbackEvaluation.note) };
  trace.push({ stage: "Evaluator", status: "completed", mode: evaluated.mode, at: new Date().toISOString() });
  return { output, citations: citationsFor(chunks), evaluation, trace };
}
