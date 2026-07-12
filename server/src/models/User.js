import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.models.User || mongoose.model("User", userSchema);
