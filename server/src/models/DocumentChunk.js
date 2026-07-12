import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, workspaceId: { type: String, required: true, index: true },
  documentId: { type: String, required: true, index: true }, chunkIndex: Number, text: String,
  tokenCountApprox: Number, embedding: { type: [Number], default: undefined }, metadata: { type: Object, default: {} },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.models.DocumentChunk || mongoose.model("DocumentChunk", documentChunkSchema);
