import mongoose from "mongoose";
const schema = new mongoose.Schema({
  userId: String, workspaceId: String, type: String,
  status: { type: String, default: "queued" }, title: String, input: { type: Object, default: {} },
  output: { type: Object, default: {} }, citations: { type: [Object], default: [] },
  evaluation: { type: Object, default: {} }, trace: { type: [Object], default: [] },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });
export default mongoose.models.WorkflowRun || mongoose.model("WorkflowRun", schema);
