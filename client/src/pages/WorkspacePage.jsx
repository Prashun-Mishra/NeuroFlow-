import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Bot, FileText, Play, RefreshCw, Send, Trash2, Database, MessageSquare } from "lucide-react";
import { AppShell } from "../components/AppShell.jsx";
import { Citations } from "../components/Citations.jsx";
import { DocumentUpload } from "../components/DocumentUpload.jsx";
import { WorkflowGraph } from "../components/WorkflowGraph.jsx";
import { neuroflowApi } from "../api/neuroflow.js";
import { queryKeys } from "../utils/queryKeys.js";

export function WorkspacePage() {
  const { workspaceId } = useParams();
  const client = useQueryClient();
  const [selected, setSelected] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [activeThread, setActiveThread] = useState(null);

  const workspace = useQuery({ queryKey: queryKeys.workspace(workspaceId), queryFn: () => neuroflowApi.workspace(workspaceId) });
  const documents = useQuery({ queryKey: queryKeys.documents(workspaceId), queryFn: () => neuroflowApi.documents(workspaceId) });
  const runs = useQuery({ queryKey: queryKeys.runs(workspaceId), queryFn: () => neuroflowApi.runs(workspaceId) });
  const threads = useQuery({ queryKey: queryKeys.threads(workspaceId), queryFn: () => neuroflowApi.threads(workspaceId) });
  const messages = useQuery({ queryKey: queryKeys.messages(workspaceId, activeThread), queryFn: () => neuroflowApi.messages(workspaceId, activeThread), enabled: Boolean(activeThread) });

  const refresh = () => {
    [queryKeys.documents(workspaceId), queryKeys.runs(workspaceId), queryKeys.threads(workspaceId), queryKeys.dashboard].forEach((key) => client.invalidateQueries({ queryKey: key }));
  };

  const upload = useMutation({ mutationFn: (file) => neuroflowApi.upload(workspaceId, file), onSuccess: refresh });
  const reprocess = useMutation({ mutationFn: neuroflowApi.reprocess, onSuccess: refresh });
  const removeDocument = useMutation({ mutationFn: neuroflowApi.deleteDocument, onSuccess: refresh });

  const workflow = useMutation({ mutationFn: ({ type, payload }) => neuroflowApi[type](workspaceId, payload), onSuccess: refresh });
  const ask = useMutation({
    mutationFn: (payload) => neuroflowApi.ask(workspaceId, payload),
    onSuccess: (result) => {
      setActiveThread(result.thread.id);
      setQuestion("");
      refresh();
      client.invalidateQueries({ queryKey: queryKeys.messages(workspaceId, result.thread.id) });
    }
  });

  const docs = documents.data?.documents || [];
  const recentRuns = runs.data?.runs || [];
  const selectedDocs = docs.filter((document) => selected.includes(document.id));

  const run = (type) => {
    const payload = type === "compare" ? { documentIds: selected, prompt } : type === "meetingActionItems" ? { documentIds: selected, prompt } : type === "researchBrief" ? { topic: prompt, prompt } : { prompt };
    workflow.mutate({ type, payload });
  };

  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 animate-fade-in">
        <div>
          <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">WORKSPACE</p>
          <h1 className="text-3xl font-display font-bold text-text mb-2">{workspace.data?.workspace?.name || "Loading workspace…"}</h1>
          <p className="text-text-muted">{workspace.data?.workspace?.description || "Upload material and run a workflow."}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface/50 border border-border rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-bold font-display text-text">{docs.length}</span>
            <span className="text-xs text-text-muted font-medium">Documents</span>
          </div>
          <div className="bg-surface/50 border border-border rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
            <span className="text-2xl font-bold font-display text-text">{recentRuns.length}</span>
            <span className="text-xs text-text-muted font-medium">Runs</span>
          </div>
        </div>
      </header>

      <section className="glass-panel p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-display font-bold text-text mb-4">Workflow state</h2>
        <WorkflowGraph documents={docs} runs={recentRuns} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text flex items-center gap-2">
                <Database size={18} className="text-primary" /> Documents
              </h2>
              <span className="text-sm font-medium text-text-muted bg-surface-muted px-3 py-1 rounded-full">
                {docs.filter((document) => document.status === "ready").length} ready
              </span>
            </div>
            
            <DocumentUpload uploading={upload.isPending} onUpload={upload.mutate} />
            {upload.error && <p className="text-danger text-sm mt-3">{upload.error.response?.data?.message || "Upload failed"}</p>}
            
            <div className="flex flex-col gap-3 mt-6">
              {docs.map((document) => (
                <article className="flex items-center gap-4 p-4 border border-border bg-surface-muted/30 rounded-lg hover:border-primary/50 transition-colors" key={document.id}>
                  <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background" checked={selected.includes(document.id)} onChange={() => toggle(document.id)} aria-label={`Select ${document.originalName}`} />
                  <FileText size={20} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <strong className="block text-sm text-text truncate">{document.originalName}</strong>
                    <p className="text-xs text-text-muted truncate mt-0.5">{document.summary || document.processingError || "Waiting to process"}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize whitespace-nowrap ${
                    document.status === 'ready' ? 'bg-green-500/10 text-green-400' :
                    document.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {document.status}
                  </span>
                  <div className="flex gap-1 ml-2">
                    <button className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Reprocess" onClick={() => reprocess.mutate(document.id)}>
                      <RefreshCw size={16} />
                    </button>
                    <button className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete document" onClick={() => window.confirm(`Delete ${document.originalName}?`) && removeDocument.mutate(document.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text flex items-center gap-2">
                <Play size={18} className="text-primary" /> Run a workflow
              </h2>
              <span className="text-sm font-medium text-text-muted">
                {selectedDocs.length} selected
              </span>
            </div>
            
            <textarea 
              className="input-field mb-4 resize-none" 
              value={prompt} 
              onChange={(event) => setPrompt(event.target.value)} 
              placeholder="Optional instructions or research topic..." 
              rows="3" 
            />
            
            <div className="flex flex-wrap gap-3">
              <button className="btn-secondary" disabled={workflow.isPending} onClick={() => run("summarize")}>Summarize</button>
              <button className="btn-secondary" disabled={workflow.isPending || selected.length < 2} onClick={() => run("compare")}>Compare selected</button>
              <button className="btn-secondary" disabled={workflow.isPending} onClick={() => run("meetingActionItems")}>Action items</button>
              <button className="btn-secondary" disabled={workflow.isPending} onClick={() => run("researchBrief")}>Research brief</button>
            </div>
            {workflow.error && <p className="text-danger text-sm mt-4 p-3 bg-danger/10 rounded-lg border border-danger/20">{workflow.error.response?.data?.message || "Workflow failed"}</p>}
          </section>
          
          <section className="glass-panel p-6">
            <h2 className="text-lg font-display font-bold text-text mb-4">Recent runs</h2>
            {recentRuns.length ? (
              <ul className="flex flex-col">
                {recentRuns.slice(0, 8).map((item, i) => (
                  <li key={item.id} className={`flex items-center justify-between py-3 ${i !== Math.min(recentRuns.length, 8) - 1 ? 'border-b border-border' : ''}`}>
                    <Link to={`/runs/${item.id}`} className="text-sm font-medium text-text hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full capitalize uppercase tracking-wider ${
                      item.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      item.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-muted text-sm italic">Your completed workflow runs will appear here.</p>
            )}
          </section>
          
        </div>
        
        <aside className="lg:col-span-5 xl:col-span-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="glass-panel p-0 flex flex-col h-[600px] lg:h-[calc(100vh-200px)] sticky top-6">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50 rounded-t-xl">
              <h2 className="text-sm font-display font-bold text-text flex items-center gap-2">
                <Bot size={18} className="text-primary" /> Ask workspace
              </h2>
              <select className="bg-background border border-border rounded-lg text-xs text-text px-2 py-1.5 outline-none focus:border-primary" value={activeThread || ""} onChange={(event) => setActiveThread(event.target.value || null)}>
                <option value="">New conversation</option>
                {threads.data?.threads?.map((thread) => (
                  <option key={thread.id} value={thread.id}>{thread.title}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {!activeThread && (
                <div className="h-full flex flex-col items-center justify-center text-center text-text-muted opacity-60 px-4">
                  <MessageSquare size={32} className="mb-3" />
                  <p className="text-sm">Ask a question to begin a grounded conversation about your documents.</p>
                </div>
              )}
              {messages.data?.messages?.map((message) => (
                <article className={`flex flex-col max-w-[90%] ${message.role === 'user' ? 'self-end items-end' : 'self-start'}`} key={message.id}>
                  <div className={`px-4 py-2.5 rounded-2xl ${message.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-muted border border-border text-text rounded-bl-sm'}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 ml-1">
                      <Citations citations={message.citations} />
                    </div>
                  )}
                </article>
              ))}
            </div>
            
            <div className="p-4 border-t border-border bg-surface/50 rounded-b-xl">
              <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); if (question.trim()) ask.mutate({ question, threadId: activeThread || undefined }); }}>
                <input 
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" 
                  value={question} 
                  onChange={(event) => setQuestion(event.target.value)} 
                  placeholder="Ask about your documents..." 
                />
                <button 
                  className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors disabled:opacity-50" 
                  disabled={ask.isPending || !question.trim()} 
                  title="Send question"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
