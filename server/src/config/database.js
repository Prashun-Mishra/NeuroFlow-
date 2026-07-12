import mongoose from "mongoose";
import { MemoryRepository, MongoRepository } from "../data/repository.js";

export async function createRepository() {
  if (!process.env.MONGODB_URI) return new MemoryRepository();
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3500 });
    console.info("Connected to MongoDB.");
    return new MongoRepository();
  } catch (error) {
    console.warn(`MongoDB unavailable; using in-memory repository. (${error.message})`);
    return new MemoryRepository();
  }
}
