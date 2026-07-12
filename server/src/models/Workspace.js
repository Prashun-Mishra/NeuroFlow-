import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  color: { type: String, default: "#6366f1" },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
