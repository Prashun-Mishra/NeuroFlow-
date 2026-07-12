import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function authRoutes(controller, auth) { const router = Router(); router.post("/register", asyncHandler(controller.register)); router.post("/login", asyncHandler(controller.login)); router.get("/me", auth, asyncHandler(controller.me)); return router; }
