import { LayoutDashboard, LogOut, FolderKanban, BrainCircuit } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";

export function AppShell({ children }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-[260px] flex-shrink-0 flex flex-col bg-surface/50 border-r border-border backdrop-blur-sm">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 text-text font-display font-bold text-xl transition-opacity hover:opacity-80">
            <BrainCircuit className="text-primary" size={26} />
            NeuroFlow
          </Link>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 mt-4">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-muted'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/workspaces" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-muted'}`}>
            <FolderKanban size={18} /> Workspaces
          </NavLink>
        </nav>
        
        <div className="p-4 mt-auto border-t border-border">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{user?.name || "Workspace user"}</p>
              <p className="text-xs text-text-muted truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-4 py-2 mt-2 text-sm text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-8 md:p-10 lg:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
