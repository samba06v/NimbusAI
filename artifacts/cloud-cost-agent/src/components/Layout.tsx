import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useLocation } from "wouter";
import { Bell, Search, Zap } from "lucide-react";
import { useListAlerts } from "@workspace/api-client-react";

const PAGE_META: Record<string, { title: string; subtitle: string; color: string }> = {
  "/": { title: "Control Center", subtitle: "Real-time cloud cost overview", color: "#00f5ff" },
  "/resources": { title: "Infrastructure", subtitle: "All cloud resources & status", color: "#7c3aed" },
  "/recommendations": { title: "AI Insights", subtitle: "Optimization recommendations", color: "#39ff14" },
  "/forecasts": { title: "Cost Forecasts", subtitle: "Predictive spending analysis", color: "#ff8228" },
  "/alerts": { title: "Alerts & Anomalies", subtitle: "Critical cost notifications", color: "#ff4fab" },
  "/accounts": { title: "Cloud Accounts", subtitle: "Provider connections & status", color: "#a764ff" },
};

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const meta = PAGE_META[location] || PAGE_META["/"];
  const { data: alerts } = useListAlerts({ resolved: false });
  const unresolvedCount = alerts?.length || 0;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#050a18" }}
    >
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── Top Header Bar ─── */}
        <header
          className="flex h-16 items-center justify-between px-6 flex-shrink-0"
          style={{
            background: "rgba(5,8,20,0.95)",
            borderBottom: "1px solid rgba(124,58,237,0.12)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <div>
              <div
                className="text-lg font-black leading-tight"
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  color: "#e8ecf5",
                }}
              >
                {meta.title}
              </div>
              <div
                className="text-xs leading-tight"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: meta.color,
                  opacity: 0.7,
                }}
              >
                {meta.subtitle}
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "rgba(140,150,180,0.4)" }}
              />
              <input
                type="text"
                placeholder="Search resources, tags..."
                className="h-9 w-60 rounded-xl border pl-9 pr-4 text-sm focus:outline-none focus:ring-1"
                style={{
                  background: "rgba(15,20,40,0.8)",
                  border: "1px solid rgba(124,58,237,0.18)",
                  color: "#c8d0e8",
                  fontFamily: "'Inter', sans-serif",
                  caretColor: "#00f5ff",
                }}
              />
              <kbd
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "rgba(140,150,180,0.4)",
                }}
              >
                ⌘K
              </kbd>
            </div>

            {/* AI Badge */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(57,255,20,0.08)",
                border: "1px solid rgba(57,255,20,0.2)",
                color: "#39ff14",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              AI ACTIVE
            </div>

            {/* Alert Bell */}
            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: unresolvedCount > 0 ? "rgba(255,68,68,0.1)" : "rgba(124,58,237,0.08)",
                border: `1px solid ${unresolvedCount > 0 ? "rgba(255,68,68,0.3)" : "rgba(124,58,237,0.18)"}`,
              }}
            >
              <Bell
                className="w-4 h-4"
                style={{ color: unresolvedCount > 0 ? "#ff4444" : "rgba(140,150,180,0.5)" }}
              />
              {unresolvedCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "#ff4444",
                    color: "white",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    animation: "pulse-led-red 1.5s ease-in-out infinite",
                  }}
                >
                  {unresolvedCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main
          className="flex-1 overflow-y-auto scroll-smooth relative"
          style={{
            background: "linear-gradient(135deg, #050a18 0%, #080520 50%, #050a18 100%)",
          }}
        >
          {/* Subtle background grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
          <div className="relative z-10 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
