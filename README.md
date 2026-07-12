# NeuroFlow AI - Agentic Document Intelligence Workspace

NeuroFlow AI is a robust, local-first document intelligence workspace built on the MERN stack. Unlike generic chat interfaces, NeuroFlow provides isolated workspaces where you can upload documents, process them into searchable chunks, and execute a 5-stage agentic RAG (Retrieval-Augmented Generation) pipeline to extract insights, compare documents, and generate research briefs.

It is designed to run completely free and locally using Ollama, but features a deterministic offline fallback system if AI services or databases are unavailable.

---

## 🚀 Key Features
- **Isolated Workspaces**: Create dedicated environments for different projects to keep your source material organized.
- **Multi-Format Ingestion**: Upload PDF, DOCX, TXT, MD, CSV, and Images. Files are automatically extracted, cleaned, summarized, chunked, and embedded.
- **Local-First AI**: Powered by Ollama (`llama3.1:8b` for chat, `nomic-embed-text` for embeddings). No paid APIs required.
- **Offline Fallback**: If Ollama or MongoDB goes down, NeuroFlow gracefully falls back to deterministic extraction and in-memory storage.
- **Agentic Workflows**: Go beyond chat. Run complex workflows like Document Comparison, Action Item Extraction, and Research Brief generation.
- **Transparent Execution Trace**: Every workflow run generates an execution trace so you can see exactly how the agents arrived at their answer, complete with confidence scores and citations.

---

## 🧠 The Agentic Pipeline (5 Stages)

Every workflow you run goes through a transparent 5-stage pipeline:

1. **Planner**: Analyzes the user's request and decides the exact task, generating a retrieval query and selecting relevant documents.
2. **Retriever**: Fetches the most relevant document chunks based on semantic similarity (embeddings) or keyword overlap (fallback).
3. **Task**: Executes the core logic (Answer, Summarize, Compare, Action Items, Research Brief) grounded entirely in the retrieved chunks.
4. **Writer**: Formats the raw task output into a strict, UI-consumable JSON shape.
5. **Evaluator**: Reviews the final output, producing a confidence score and a brief evaluation note.

---

## 🛠 Tech Stack

**Frontend (Client)**
- **Framework**: React 18 (Vite)
- **Styling**: TailwindCSS, custom Glassmorphism UI
- **State Management**: TanStack React Query, Zustand
- **Routing**: React Router
- **Icons**: Lucide React

**Backend (Server)**
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose) + Memory Mode Fallback
- **Document Processing**: multer, pdf-parse, mammoth, csv-parse, tesseract.js, sharp
- **Authentication**: JWT & bcryptjs

**AI Engine**
- **Inference**: Local Ollama
- **Embeddings**: Stored directly inside DocumentChunks (no vector DB required)

---

## ⚙️ Getting Started

### Prerequisites
1. Node.js (v18+)
2. [Ollama](https://ollama.com/)
3. MongoDB (Optional - falls back to memory mode if unavailable)

### Setup AI Models
Once Ollama is installed, pull the required models:
```bash
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Prashun-Mishra/NeuroFlow-.git
   cd NeuroFlow-
   ```

2. Setup Environment Variables:
   Create a `.env` file in the root directory based on `.env.example`.

3. Install Dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

4. Run the Application:
   ```bash
   # Start backend
   cd server
   npm run dev

   # Start frontend (in a new terminal)
   cd client
   npm run dev
   ```

5. Access the app at `http://localhost:5173`. Use the demo account to log in instantly:
   - Email: `demo@neuroflow.ai`
   - Password: `Password@123`

---

## 📁 Supported Workflows
- **Ask Workspace**: Chat directly with your documents. Every answer is grounded with citations.
- **Summarize**: Generate a high-level summary and key points of your entire workspace or selected documents.
- **Compare Documents**: Select two or more documents to automatically extract shared themes and differences.
- **Meeting Action Items**: Instantly extract tasks, owners, and due dates from meeting transcripts.
- **Research Brief**: Provide a topic and let the agents compile a structured executive summary and thematic breakdown.
