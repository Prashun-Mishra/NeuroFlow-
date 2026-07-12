import { readFile } from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { parse } from "csv-parse/sync";
import Tesseract from "tesseract.js";

export function detectFileType(filename) {
  const extension = path.extname(filename).toLowerCase();
  return ({ ".pdf": "pdf", ".docx": "docx", ".txt": "txt", ".md": "md", ".csv": "csv", ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image" })[extension] || null;
}

export async function extractDocumentText(filePath, fileType) {
  if (fileType === "pdf") {
    const result = await pdf(await readFile(filePath));
    return { text: result.text, pageCount: result.numpages || 0 };
  }
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value, pageCount: 0 };
  }
  if (fileType === "txt" || fileType === "md") return { text: await readFile(filePath, "utf8"), pageCount: 0 };
  if (fileType === "csv") {
    const rows = parse(await readFile(filePath, "utf8"), { skip_empty_lines: true, relax_column_count: true });
    return { text: rows.map((row) => row.join(" | ")).join("\n"), pageCount: 0 };
  }
  if (fileType === "image") {
    const result = await Tesseract.recognize(filePath, "eng");
    return { text: result.data.text, pageCount: 1 };
  }
  throw new Error("Unsupported file type");
}

export function cleanText(text = "") {
  return text.replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
