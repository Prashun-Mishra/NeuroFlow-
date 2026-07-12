import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Folder, FileText, Activity } from "lucide-react";
import { AppShell } from "../components/AppShell.jsx";
import { neuroflowApi } from "../api/neuroflow.js";
import { queryKeys } from "../utils/queryKeys.js";

export function DashboardPage() {
  const client = useQueryClient();
  const dashboard = useQuery({ queryKey: queryKeys.dashboard, queryFn: neuroflowApi.dashboard });
  const workspaces = useQuery({ queryKey: queryKeys.workspaces, queryFn: neuroflowApi.workspaces });
  
  const create = useMutation({
    mutationFn: neuroflowApi.createWorkspace,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspaces })
  });

  const stats = dashboard.data?.stats || {};

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in">
        <div>
          <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">OVERVIEW</p>
          <h1 className="text-4xl font-display font-bold text-text mb-2">Document intelligence.</h1>
          <p className="text-text-muted text-lg max-w-2xl">Upload source material, then run grounded workflows with citations.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            const name = window.prompt("Workspace name");
            if (name?.trim()) create.mutate({ name: name.trim() });
          }}
        >
          <Plus size={18} /> New workspace
        </button>
      </header>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-text-muted mb-2">
            <Folder size={20} className="text-primary" />
            <span className="font-medium text-sm">Workspaces</span>
          </div>
          <strong className="text-4xl font-display text-text">{stats.workspaceCount ?? "—"}</strong>
        </div>
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-text-muted mb-2">
            <FileText size={20} className="text-blue-400" />
            <span className="font-medium text-sm">Documents</span>
          </div>
          <strong className="text-4xl font-display text-text">{stats.documentCount ?? "—"}</strong>
        </div>
        <div className="glass-panel p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 text-text-muted mb-2">
            <Activity size={20} className="text-green-400" />
            <span className="font-medium text-sm">Workflow runs</span>
          </div>
          <strong className="text-4xl font-display text-text">{stats.runCount ?? "—"}</strong>
        </div>
      </section>
      
      <section className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-text flex items-center gap-2">
            Your workspaces
          </h2>
          <Link to="/workspaces" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.data?.workspaces?.slice(0, 6).map((workspace) => (
            <Link className="glass-card p-6 flex flex-col group relative overflow-hidden" to={`/workspaces/${workspace.id}`} key={workspace.id}>
              <div className="absolute top-0 left-0 w-full h-1" style={{ background: workspace.color || '#6366f1' }} />
              <h3 className="text-lg font-display font-bold text-text mb-2 mt-2 group-hover:text-primary transition-colors">{workspace.name}</h3>
              <p className="text-sm text-text-muted line-clamp-2">{workspace.description || "No description yet"}</p>
            </Link>
          )) || <p className="text-text-muted col-span-full">Loading workspaces…</p>}
        </div>
      </section>
      
      <section className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-xl font-display font-bold text-text mb-6">Recent workflow activity</h2>
        
        {dashboard.data?.recentRuns?.length ? (
          <ul className="flex flex-col">
            {dashboard.data.recentRuns.map((run, i) => (
              <li key={run.id} className={`flex items-center justify-between py-4 ${i !== dashboard.data.recentRuns.length - 1 ? 'border-b border-border' : ''}`}>
                <Link to={`/runs/${run.id}`} className="font-medium text-text hover:text-primary transition-colors">
                  {run.title}
                </Link>
                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                  run.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  run.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {run.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center border border-dashed border-border rounded-lg">
            <p className="text-text-muted">No workflows have run yet.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
