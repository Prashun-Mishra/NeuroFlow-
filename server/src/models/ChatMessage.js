import mongoose from "mongoose";
const schema = new mongoose.Schema({ userId: String, workspaceId: String, threadId: String, role: String, content: String, citations: { type: [Object], default: [] } }, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", schema);
