import { Check } from "lucide-react";

const stages = ["Planner", "Retriever", "Task", "Writer", "Evaluator"];

export function WorkflowGraph({ documents = [], runs = [] }) {
  const ready = documents.some((document) => document.status === "ready"); 
  const completed = runs.filter((run) => run.status === "completed");
  
  const active = [
    true, 
    ready, 
    runs.length > 0, 
    completed.some((run) => run.output && Object.keys(run.output).length), 
    completed.some((run) => run.evaluation && Object.keys(run.evaluation).length)
  ];
  
  return (
    <div className="w-full pt-2 pb-8 px-4 md:px-8">
      <div className="flex items-center justify-between w-full">
        {stages.map((stage, index) => {
          const isActive = active[index];
          const isNextActive = index < stages.length - 1 && active[index + 1];
          const isLast = index === stages.length - 1;
          
          return (
            <div className={`flex items-center ${isLast ? "" : "flex-1"}`} key={stage}>
              {/* Node */}
              <div className="flex flex-col items-center relative">
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm z-10 ${
                    isActive 
                      ? "bg-primary border-primary text-white shadow-primary/30" 
                      : "bg-surface border-border text-text-muted"
                  }`}
                >
                  {isActive ? <Check size={16} strokeWidth={3} className="md:w-[18px] md:h-[18px]" /> : <span className="font-bold text-xs md:text-sm">{index + 1}</span>}
                </div>
                <span className={`text-[9px] md:text-xs font-bold uppercase tracking-wider absolute -bottom-6 md:-bottom-7 whitespace-nowrap transition-colors duration-300 ${
                  isActive ? "text-text" : "text-text-muted/60"
                }`}>
                  {stage}
                </span>
              </div>
              
              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-2 md:mx-4 h-[2px] bg-border relative overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-primary transition-all duration-500 origin-left ${
                      isNextActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
