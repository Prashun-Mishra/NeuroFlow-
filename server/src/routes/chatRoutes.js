import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function chatRoutes(controller, auth) { const router = Router(); router.use(auth); router.get("/:workspaceId/chat", asyncHandler(controller.list)); router.get("/:workspaceId/chat/:threadId/messages", asyncHandler(controller.messages)); router.post("/:workspaceId/chat", asyncHandler(controller.ask)); return router; }
