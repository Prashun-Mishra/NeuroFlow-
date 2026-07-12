import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function workspaceRoutes(controller, auth) { const router = Router(); router.use(auth); router.get("/", asyncHandler(controller.list)); router.post("/", asyncHandler(controller.create)); router.get("/:id", asyncHandler(controller.get)); router.patch("/:id", asyncHandler(controller.update)); router.delete("/:id", asyncHandler(controller.remove)); return router; }
