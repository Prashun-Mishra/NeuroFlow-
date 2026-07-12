const baseUrl = () => (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "");
let unavailableUntil = 0;

async function request(path, body) {
  if (Date.now() < unavailableUntil) throw new Error("Ollama is temporarily unavailable");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${baseUrl()}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
    return response.json();
  } catch (error) {
    unavailableUntil = Date.now() + 30_000;
    throw error;
  } finally { clearTimeout(timer); }
}

export async function createEmbedding(text) {
  try {
    const result = await request("/api/embeddings", { model: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text", prompt: text });
    return Array.isArray(result.embedding) ? result.embedding : null;
  } catch { return null; }
}

export async function chatWithOllama(messages, format = "json") {
  try {
    const result = await request("/api/chat", { model: process.env.OLLAMA_CHAT_MODEL || "llama3.1:8b", messages, stream: false, format });
    return result.message?.content || null;
  } catch { return null; }
}
