import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import { AppShell } from "../components/AppShell.jsx";
import { neuroflowApi } from "../api/neuroflow.js";
import { queryKeys } from "../utils/queryKeys.js";

export function WorkspacesPage() {
  const client = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: queryKeys.workspaces, queryFn: neuroflowApi.workspaces });
  const create = useMutation({ mutationFn: neuroflowApi.createWorkspace, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspaces }) });
  const remove = useMutation({ mutationFn: neuroflowApi.deleteWorkspace, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.workspaces }) });

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 animate-fade-in">
        <div>
          <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">WORKSPACES</p>
          <h1 className="text-3xl font-display font-bold text-text mb-2">Organize your source material</h1>
          <p className="text-text-muted">Create isolated environments for different projects.</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2"
          onClick={() => { const name = window.prompt("Workspace name"); if (name?.trim()) create.mutate({ name }); }}
        >
          <Plus size={18} /> New workspace
        </button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-muted">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p>Loading workspaces…</p>
          </div>
        )}
        
        {data?.workspaces.length === 0 && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-muted border-2 border-dashed border-border rounded-xl bg-surface/30">
            <FolderOpen size={48} className="mb-4 text-primary opacity-80" />
            <p className="text-lg font-medium text-text mb-1">No workspaces yet</p>
            <p className="mb-6">Create a workspace to upload documents and start running AI workflows.</p>
            <button 
              className="btn-primary"
              onClick={() => { const name = window.prompt("Workspace name"); if (name?.trim()) create.mutate({ name }); }}
            >
              <Plus size={18} className="mr-2 inline" /> Create your first workspace
            </button>
          </div>
        )}
        
        {data?.workspaces.map((workspace) => (
          <article 
            className="glass-panel group p-6 flex flex-col h-full hover:-translate-y-1 transition-all duration-300 hover:border-primary/50 relative overflow-hidden" 
            key={workspace.id}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1" 
              style={{ background: workspace.color || '#6366f1' }} 
            />
            <div className="flex-1">
              <Link to={`/workspaces/${workspace.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                <h3 className="text-xl font-display font-bold text-text mb-2 group-hover:text-primary transition-colors">{workspace.name}</h3>
                <p className="text-text-muted text-sm line-clamp-3">{workspace.description || "No description yet"}</p>
              </Link>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors z-10" 
                title="Delete workspace" 
                onClick={(e) => {
                  e.preventDefault();
                  window.confirm(`Delete ${workspace.name}?`) && remove.mutate(workspace.id);
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
