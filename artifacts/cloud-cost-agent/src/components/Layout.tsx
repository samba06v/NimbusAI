import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { Bell, Search } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/": return "Dashboard Overview";
      case "/resources": return "Cloud Resources";
      case "/recommendations": return "Cost Recommendations";
      case "/forecasts": return "Cost Forecasts";
      case "/alerts": return "Cost Alerts";
      case "/accounts": return "Cloud Accounts";
      default: return "Dashboard";
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold font-mono tracking-tight text-foreground">{getPageTitle()}</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search resources, tags..." 
                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
            
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive border border-background"></span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
