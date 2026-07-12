import User from "./User.js";
import Workspace from "./Workspace.js";
import Document from "./Document.js";
import DocumentChunk from "./DocumentChunk.js";
import ChatThread from "./ChatThread.js";
import ChatMessage from "./ChatMessage.js";
import WorkflowRun from "./WorkflowRun.js";

export const models = { users: User, workspaces: Workspace, documents: Document, document_chunks: DocumentChunk, chat_threads: ChatThread, chat_messages: ChatMessage, workflow_runs: WorkflowRun };
