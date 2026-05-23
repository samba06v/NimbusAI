import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Server, 
  Lightbulb, 
  TrendingUp, 
  Bell, 
  Building2,
  Settings
} from "lucide-react";
import { useListAlerts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resources", label: "Resources", icon: Server },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/forecasts", label: "Forecasts", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/accounts", label: "Accounts", icon: Building2 },
];

export function Sidebar() {
  const [location] = useLocation();

  const { data: alerts } = useListAlerts({ resolved: false });
  const unresolvedCount = alerts?.length || 0;

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 font-mono font-bold tracking-tight text-primary">
          <Server className="h-5 w-5" />
          <span>NEXUS_COST_OPS</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-primary/10 text-primary" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === "/alerts" && unresolvedCount > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs font-mono">
                    {unresolvedCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <div className="mt-4 flex items-center gap-3 px-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-mono text-xs font-bold text-primary">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Admin User</span>
            <span className="text-xs text-muted-foreground mt-1">Platform Eng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
