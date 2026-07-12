import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileJson, Sparkles, Network } from "lucide-react";
import { AppShell } from "../components/AppShell.jsx";
import { Citations } from "../components/Citations.jsx";
import { neuroflowApi } from "../api/neuroflow.js";
import { queryKeys } from "../utils/queryKeys.js";

export function RunDetailPage() {
  const { runId } = useParams();
  const { data, isLoading } = useQuery({ queryKey: queryKeys.run(runId), queryFn: () => neuroflowApi.run(runId) });
  
  const run = data?.run;

  if (isLoading) return (
    <AppShell>
      <div className="flex h-full items-center justify-center text-text-muted">Loading run…</div>
    </AppShell>
  );
  
  if (!run) return (
    <AppShell>
      <div className="flex h-full items-center justify-center text-danger">Run not found.</div>
    </AppShell>
  );

  const renderOutputValue = (value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return <p className="text-text-muted text-sm italic">None</p>;
      return (
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {value.map((item, idx) => (
            <li key={idx} className="text-text leading-relaxed">
              {typeof item === 'object' ? (
                <div className="bg-surface p-3 rounded-lg border border-border mt-1">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="mb-1"><span className="font-semibold text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span> {String(v)}</div>
                  ))}
                </div>
              ) : (
                item
              )}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-text leading-relaxed mt-2">{String(value)}</p>;
  };

  return (
    <AppShell>
      <Link className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors mb-6 font-medium" to={`/workspaces/${run.workspaceId}`}>
        <ArrowLeft size={18} /> Back to workspace
      </Link>
      
      <header className="mb-8 animate-fade-in">
        <p className="text-primary font-bold text-xs tracking-[0.15em] mb-2">WORKFLOW RUN</p>
        <h1 className="text-3xl font-display font-bold text-text mb-4">{run.title}</h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
            run.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            run.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            {run.status}
          </span>
          <span className="text-text-muted text-sm font-medium capitalize flex items-center gap-1.5">
            <Network size={16} /> {run.type.replace('_', ' ')}
          </span>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <section className="glass-panel p-6 md:p-8">
            <h2 className="text-xl font-display font-bold text-text mb-6 flex items-center gap-2 border-b border-border pb-4">
              <FileJson size={20} className="text-primary" /> Output
            </h2>
            
            {run.output ? (
              <div className="flex flex-col gap-6">
                {Object.entries(run.output).map(([key, value]) => (
                  <div key={key} className="bg-surface-muted/30 p-5 rounded-xl border border-border/50">
                    <h3 className="text-lg font-display font-semibold text-primary capitalize mb-2 tracking-tight">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </h3>
                    {renderOutputValue(value)}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="bg-[#0b101e] p-4 rounded-xl border border-border text-[#dce4f7] text-sm overflow-x-auto">
                {JSON.stringify(run.output, null, 2)}
              </pre>
            )}
            
            {run.citations && run.citations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <Citations citations={run.citations} />
              </div>
            )}
          </section>
        </div>
        
        <aside className="lg:col-span-4 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <section className="glass-panel p-6">
            <h2 className="text-lg font-display font-bold text-text mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Evaluation
            </h2>
            <div className="flex flex-col gap-2">
              <p className="inline-block w-fit px-2 py-1 rounded bg-surface border border-border text-xs font-bold uppercase tracking-wider text-primary">
                Confidence: {run.evaluation?.confidence || "—"}
              </p>
              <p className="text-text-muted text-sm leading-relaxed mt-2">
                {run.evaluation?.note || "No evaluation available."}
              </p>
            </div>
          </section>
          
          <section className="glass-panel p-6">
            <h2 className="text-lg font-display font-bold text-text mb-4">Execution trace</h2>
            <div className="relative pl-3">
              <div className="absolute top-0 bottom-0 left-5 w-px bg-border -z-10"></div>
              <ol className="flex flex-col gap-6 relative z-10">
                {run.trace?.map((entry, index) => (
                  <li key={`${entry.stage}-${index}`} className="flex items-start gap-3 group">
                    <div className="mt-0.5 bg-background p-0.5 rounded-full">
                      <CheckCircle2 size={18} className="text-green-500" />
                    </div>
                    <div>
                      <strong className="block text-sm font-medium text-text">{entry.stage}</strong>
                      <p className="text-xs text-text-muted mt-1 capitalize">
                        {entry.mode || entry.status} 
                        {entry.detail && <span className="text-text-muted/70 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">· {entry.detail}</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
