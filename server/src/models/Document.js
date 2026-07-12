import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  workspaceId: { type: String, required: true, index: true },
  originalName: String, storedName: String, storagePath: String, mimeType: String, size: Number,
  fileType: { type: String, enum: ["pdf", "docx", "txt", "md", "csv", "image"] },
  status: { type: String, enum: ["uploaded", "processing", "ready", "failed"], default: "uploaded" },
  extractedText: { type: String, default: "" }, summary: { type: String, default: "" },
  pageCount: { type: Number, default: 0 }, metadata: { type: Object, default: {} }, processingError: String,
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.models.Document || mongoose.model("Document", documentSchema);
