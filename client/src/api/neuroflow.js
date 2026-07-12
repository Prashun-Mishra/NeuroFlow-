import { apiClient } from "./client.js";
const data = (request) => request.then((response) => response.data);

export const neuroflowApi = {
  register: (payload) => data(apiClient.post("/auth/register", payload)), login: (payload) => data(apiClient.post("/auth/login", payload)), me: () => data(apiClient.get("/auth/me")),
  dashboard: () => data(apiClient.get("/dashboard")),
  workspaces: () => data(apiClient.get("/workspaces")), createWorkspace: (payload) => data(apiClient.post("/workspaces", payload)), workspace: (id) => data(apiClient.get(`/workspaces/${id}`)), updateWorkspace: (id, payload) => data(apiClient.patch(`/workspaces/${id}`, payload)), deleteWorkspace: (id) => data(apiClient.delete(`/workspaces/${id}`)),
  documents: (workspaceId) => data(apiClient.get(`/workspaces/${workspaceId}/documents`)), upload: (workspaceId, file) => { const form = new FormData(); form.append("file", file); return data(apiClient.post(`/workspaces/${workspaceId}/documents/upload`, form)); }, reprocess: (id) => data(apiClient.post(`/documents/${id}/reprocess`)), deleteDocument: (id) => data(apiClient.delete(`/documents/${id}`)),
  runs: (workspaceId) => data(apiClient.get(`/workspaces/${workspaceId}/runs`)), run: (id) => data(apiClient.get(`/runs/${id}`)), summarize: (workspaceId, payload) => data(apiClient.post(`/workspaces/${workspaceId}/runs/summarize`, payload)), compare: (workspaceId, payload) => data(apiClient.post(`/workspaces/${workspaceId}/runs/compare`, payload)), meetingActionItems: (workspaceId, payload) => data(apiClient.post(`/workspaces/${workspaceId}/runs/meeting-action-items`, payload)), researchBrief: (workspaceId, payload) => data(apiClient.post(`/workspaces/${workspaceId}/runs/research-brief`, payload)),
  threads: (workspaceId) => data(apiClient.get(`/workspaces/${workspaceId}/chat`)), messages: (workspaceId, threadId) => data(apiClient.get(`/workspaces/${workspaceId}/chat/${threadId}/messages`)), ask: (workspaceId, payload) => data(apiClient.post(`/workspaces/${workspaceId}/chat`, payload)),
};
