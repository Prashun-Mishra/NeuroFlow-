import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

export function workflowRoutes(controller, auth) {
  const workspaceRouter = Router();
  workspaceRouter.use(auth);
  workspaceRouter.get("/:workspaceId/runs", asyncHandler(controller.list));
  workspaceRouter.post("/:workspaceId/runs/summarize", asyncHandler(controller.summarize));
  workspaceRouter.post("/:workspaceId/runs/compare", asyncHandler(controller.compare));
  workspaceRouter.post("/:workspaceId/runs/meeting-action-items", asyncHandler(controller.meetingActionItems));
  workspaceRouter.post("/:workspaceId/runs/research-brief", asyncHandler(controller.researchBrief));
  const runRouter = Router(); runRouter.use(auth); runRouter.get("/:id", asyncHandler(controller.get));
  return { workspaceRouter, runRouter };
}
