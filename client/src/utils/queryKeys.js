export const queryKeys = {
  auth: ["auth", "user"], dashboard: ["dashboard"], workspaces: ["workspaces"], workspace: (id) => ["workspace", id], documents: (id) => ["workspace", id, "documents"], threads: (id) => ["workspace", id, "threads"], messages: (workspaceId, threadId) => ["workspace", workspaceId, "thread", threadId, "messages"], runs: (id) => ["workspace", id, "runs"], run: (id) => ["run", id],
};
