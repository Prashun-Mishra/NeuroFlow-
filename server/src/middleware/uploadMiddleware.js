import path from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { detectFileType } from "../services/documentExtractionService.js";
import { httpError } from "../utils/httpError.js";

const storage = multer.diskStorage({
  destination: (req, file, done) => { const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads", req.user.id, req.params.workspaceId); mkdirSync(directory, { recursive: true }); done(null, directory); },
  filename: (req, file, done) => done(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
});
const uploader = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, done) => done(detectFileType(file.originalname) ? null : httpError(400, "Unsupported file type"), Boolean(detectFileType(file.originalname))) });

export const uploadSingle = uploader.single("file");
export function uploadErrorHandler(error, req, res, next) { if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return next(httpError(400, "Upload exceeds the 10MB limit")); return next(error); }
