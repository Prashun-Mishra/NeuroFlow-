import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadSingle, uploadErrorHandler } from "../middleware/uploadMiddleware.js";
export function documentRoutes(controller, auth) {
  const workspaceRouter = Router(); workspaceRouter.use(auth); workspaceRouter.get("/:workspaceId/documents", asyncHandler(controller.list)); workspaceRouter.post("/:workspaceId/documents/upload", uploadSingle, uploadErrorHandler, asyncHandler(controller.upload));
  const documentRouter = Router(); documentRouter.use(auth); documentRouter.get("/:id", asyncHandler(controller.get)); documentRouter.post("/:id/reprocess", asyncHandler(controller.reprocess)); documentRouter.delete("/:id", asyncHandler(controller.remove));
  return { workspaceRouter, documentRouter };
}
