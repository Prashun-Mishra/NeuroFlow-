import mongoose from "mongoose";
const schema = new mongoose.Schema({ userId: String, workspaceId: String, title: String }, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
export default mongoose.models.ChatThread || mongoose.model("ChatThread", schema);
