import express from "express";
import cors from "cors";
import { authController } from "./controllers/authController.js";
import { workspaceController } from "./controllers/workspaceController.js";
import { dashboardController } from "./controllers/dashboardController.js";
import { documentController } from "./controllers/documentController.js";
import { workflowController } from "./controllers/workflowController.js";
import { chatController } from "./controllers/chatController.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { errorMiddleware, notFound } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { workspaceRoutes } from "./routes/workspaceRoutes.js";
import { documentRoutes } from "./routes/documentRoutes.js";
import { workflowRoutes } from "./routes/workflowRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export function createApp(repository) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
  app.use(express.json({ limit: "1mb" }));
  const auth = requireAuth(repository);
  app.get("/api/health", (req, res) => res.json({ status: "ok", repository: repository.mode }));
  app.use("/api/auth", authRoutes(authController(repository), auth));
  app.use("/api/workspaces", workspaceRoutes(workspaceController(repository), auth));
  const documents = documentRoutes(documentController(repository), auth);
  app.use("/api/workspaces", documents.workspaceRouter);
  app.use("/api/documents", documents.documentRouter);
  const workflows = workflowRoutes(workflowController(repository), auth);
  app.use("/api/workspaces", workflows.workspaceRouter);
  app.use("/api/runs", workflows.runRouter);
  app.use("/api/workspaces", chatRoutes(chatController(repository), auth));
  app.get("/api/dashboard", auth, asyncHandler(dashboardController(repository)));
  app.use(notFound);
  app.use(errorMiddleware);
  return app;
}
