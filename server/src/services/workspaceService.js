import { httpError } from "../utils/httpError.js";

export async function getWorkspaceForUser(repository, workspaceId, userId) {
  const workspace = await repository.getOne("workspaces", { id: workspaceId, userId });
  if (!workspace) throw httpError(404, "Workspace not found");
  return workspace;
}
