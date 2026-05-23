import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Server, 
  Lightbulb, 
  TrendingUp, 
  Bell, 
  Building2,
  Settings,
  Cloud,
  ChevronRight
} from "lucide-react";
import { useListAlerts } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "#00f5ff", desc: "Overview" },
  { href: "/resources", label: "Resources", icon: Server, color: "#7c3aed", desc: "Infra" },
  { href: "/recommendations", label: "AI Insights", icon: Lightbulb, color: "#39ff14", desc: "Optimize" },
  { href: "/forecasts", label: "Forecasts", icon: TrendingUp, color: "#ff8228", desc: "Predict" },
  { href: "/alerts", label: "Alerts", icon: Bell, color: "#ff4fab", desc: "Monitor" },
  { href: "/accounts", label: "Cloud Accounts", icon: Building2, color: "#a764ff", desc: "Providers" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: alerts } = useListAlerts({ resolved: false });
  const unresolvedCount = alerts?.length || 0;

  return (
    <div
      className="flex h-screen w-64 flex-col"
      style={{
        background: "linear-gradient(180deg, rgba(5,8,20,0.99) 0%, rgba(8,5,22,0.99) 100%)",
        borderRight: "1px solid rgba(124,58,237,0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow behind sidebar */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "-80px",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          right: "-40px",
          width: "150px",
          height: "150px",
          background: "radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ─── Logo ─── */}
      <div
        className="flex h-16 items-center px-5"
        style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.25))",
              border: "1px solid rgba(0,245,255,0.25)",
              boxShadow: "0 0 15px rgba(0,245,255,0.15)",
            }}
          >
            <Cloud className="w-5 h-5" style={{ color: "#00f5ff" }} />
          </div>
          <div>
            <div
              className="font-black text-base leading-tight"
              style={{
                fontFamily: "'Exo 2', sans-serif",
                background: "linear-gradient(135deg, #00f5ff, #a764ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NimbusAI
            </div>
            <div
              className="text-xs leading-tight"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(140,150,180,0.5)",
                letterSpacing: "0.05em",
              }}
            >
              COST_INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* ─── Nav Label ─── */}
      <div className="px-5 pt-6 pb-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(124,58,237,0.6)",
          }}
        >
          Navigation
        </span>
      </div>

      {/* ─── Navigation ─── */}
      <div className="flex-1 overflow-auto py-2 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const isHovered = hoveredItem === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="block"
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-250 relative overflow-hidden",
                    isActive ? "active" : "",
                    "nimbus-nav-item"
                  )}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${item.color}12, ${item.color}06)`
                      : isHovered
                      ? "rgba(124,58,237,0.07)"
                      : "transparent",
                    border: isActive
                      ? `1px solid ${item.color}30`
                      : "1px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {/* Active left border */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
                      style={{
                        background: `linear-gradient(180deg, ${item.color}, ${item.color}60)`,
                        boxShadow: `0 0 8px ${item.color}60`,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive || isHovered ? `${item.color}18` : "rgba(30,35,60,0.5)",
                      border: isActive ? `1px solid ${item.color}35` : "1px solid transparent",
                      boxShadow: isActive ? `0 0 12px ${item.color}25` : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color: isActive ? item.color : isHovered ? item.color : "rgba(140,150,180,0.6)",
                        transition: "color 0.25s ease",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-sm truncate"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: isActive ? "#e8ecf5" : isHovered ? "#c8d0e8" : "rgba(160,170,200,0.7)",
                        transition: "color 0.25s ease",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? `${item.color}80` : "rgba(100,110,140,0.4)",
                        fontSize: "10px",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>

                  {/* Alert Badge */}
                  {item.href === "/alerts" && unresolvedCount > 0 && (
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "rgba(255,68,68,0.2)",
                        border: "1px solid rgba(255,68,68,0.4)",
                        color: "#ff4444",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "10px",
                        animation: "pulse-led-red 1.5s ease-in-out infinite",
                      }}
                    >
                      {unresolvedCount}
                    </div>
                  )}

                  {/* Active chevron */}
                  {isActive && (
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: item.color, opacity: 0.6 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ─── Bottom: Settings & User ─── */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}
      >
        <button
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-violet-500/10"
          style={{ color: "rgba(140,150,180,0.5)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
          >
            <Settings className="w-4 h-4" />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif" }}>Settings</span>
        </button>

        {/* User Profile */}
        <div
          className="flex items-center gap-3 mt-2 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.1)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(124,58,237,0.3))",
              border: "1px solid rgba(0,245,255,0.25)",
              color: "#00f5ff",
              fontFamily: "'Exo 2', sans-serif",
              boxShadow: "0 0 10px rgba(0,245,255,0.15)",
            }}
          >
            AD
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-sm font-semibold leading-tight truncate"
              style={{ color: "#c8d0e8", fontFamily: "'Inter', sans-serif" }}
            >
              Admin User
            </span>
            <span
              className="text-xs leading-tight truncate"
              style={{
                color: "rgba(100,110,140,0.6)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
              }}
            >
              Platform Engineer
            </span>
          </div>
          <div className="led-green ml-auto flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
