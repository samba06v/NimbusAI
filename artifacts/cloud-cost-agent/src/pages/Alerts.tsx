import { useState } from "react";
import { useListAlerts, useResolveAlert } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { AlertCircle, Info, CheckCheck, Siren, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_CONFIG = {
  critical: {
    color: "#ff4444",
    bg: "rgba(255,68,68,0.06)",
    border: "rgba(255,68,68,0.3)",
    label: "CRITICAL",
    icon: Siren,
    pulse: true,
  },
  warning: {
    color: "#ff8228",
    bg: "rgba(255,130,40,0.06)",
    border: "rgba(255,130,40,0.25)",
    label: "WARNING",
    icon: AlertCircle,
    pulse: false,
  },
  info: {
    color: "#00f5ff",
    bg: "rgba(0,245,255,0.04)",
    border: "rgba(0,245,255,0.15)",
    label: "INFO",
    icon: Info,
    pulse: false,
  },
};

function RadarAnimation() {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: "rgba(255,68,68,0.2)",
            transform: `scale(${0.4 + ring * 0.3})`,
            animation: `pulse-glow ${1.5 + ring * 0.5}s ease-in-out infinite`,
            animationDelay: `${ring * 0.3}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,68,68,0.4) 30deg, transparent 60deg)",
          animation: "radar-sweep 2.5s linear infinite",
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "#ff4444", boxShadow: "0 0 10px #ff4444, 0 0 20px rgba(255,68,68,0.5)" }}
        />
      </div>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemAnim = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, x: 20, height: 0, marginBottom: 0, transition: { duration: 0.3 } },
};

export default function Alerts() {
  const [showResolved, setShowResolved] = useState(false);
  const { data: alerts, isLoading, refetch } = useListAlerts({ resolved: showResolved });
  const { mutate: resolveAlertMutation } = useResolveAlert();

  const critical = alerts?.filter(a => a.severity === "critical") || [];
  const warnings = alerts?.filter(a => a.severity === "warning") || [];
  const infos = alerts?.filter(a => a.severity === "info") || [];
  const totalImpact = alerts?.filter(a => !a.resolved).reduce((s, a) => s + a.estimatedImpact, 0) || 0;

  const handleResolve = (id: number) => {
    resolveAlertMutation({ id }, { onSuccess: () => refetch() });
  };

  return (
    <div className="space-y-6">
      {/* Mission Control Header */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,68,68,0.05), rgba(124,58,237,0.04))",
          border: "1px solid rgba(255,68,68,0.15)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,68,68,0.04) 0%, transparent 60%)",
        }} />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          {/* Left: Mission Control UI */}
          <div className="flex items-center gap-5">
            <RadarAnimation />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5" style={{ color: "#ff4fab" }} />
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                  Mission Control
                </h2>
              </div>
              <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,68,68,0.6)" }}>
                Real-time anomaly detection · Active monitoring
              </p>
              <div className="flex items-center gap-4 mt-2">
                {[
                  { label: "Critical", count: critical.length, color: "#ff4444" },
                  { label: "Warning", count: warnings.length, color: "#ff8228" },
                  { label: "Info", count: infos.length, color: "#00f5ff" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`${label === "Critical" ? "led-red" : label === "Warning" ? "led-orange" : ""}`}
                      style={label === "Info" ? { width: 6, height: 6, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 6px #00f5ff" } : { width: 6, height: 6, borderRadius: "50%" }}
                    />
                    <span className="text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color, fontSize: "10px" }}>
                      {count} {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Total Impact */}
          {totalImpact > 0 && (
            <div
              className="px-6 py-4 rounded-xl text-right"
              style={{
                background: "rgba(255,68,68,0.07)",
                border: "1px solid rgba(255,68,68,0.2)",
              }}
            >
              <div className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,68,68,0.5)", fontSize: "9px" }}>
                Total Financial Impact
              </div>
              <div
                className="text-2xl font-black"
                style={{ fontFamily: "'Exo 2', sans-serif", color: "#ff4444", textShadow: "0 0 20px rgba(255,68,68,0.5)" }}
              >
                {formatCurrency(totalImpact)}
              </div>
              <div className="text-xs mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,68,68,0.4)" }}>
                per month at risk
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
          {[
            { label: "Active Alerts", val: false },
            { label: "Resolved", val: true },
          ].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => setShowResolved(val)}
              className="px-5 py-2 text-sm font-semibold transition-all"
              style={{
                background: showResolved === val ? "rgba(255,68,68,0.1)" : "rgba(15,20,40,0.5)",
                color: showResolved === val ? "#ff4444" : "rgba(140,150,180,0.5)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.35)" }}>
          {alerts?.length || 0} total alerts
        </span>
      </div>

      {/* Alert Cards */}
      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))
          : alerts?.length === 0
          ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "rgba(15,20,40,0.5)", border: "1px solid rgba(57,255,20,0.1)" }}
            >
              <CheckCheck className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(57,255,20,0.3)" }} />
              <div className="text-base font-semibold" style={{ fontFamily: "'Exo 2', sans-serif", color: "rgba(180,190,220,0.4)" }}>
                All clear — no alerts
              </div>
              <div className="text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(140,150,180,0.3)" }}>
                Mission control is green
              </div>
            </div>
          )
          : (
            <AnimatePresence>
              {alerts?.map((alert) => {
                const sev = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
                const SevIcon = sev.icon;

                return (
                  <motion.div
                    key={alert.id}
                    variants={itemAnim}
                    exit="exit"
                    layout
                    className="relative rounded-2xl p-5 overflow-hidden"
                    style={{
                      background: sev.bg,
                      border: `1px solid ${sev.border}`,
                      backdropFilter: "blur(16px)",
                      animation: sev.pulse && !alert.resolved ? "alert-flash 2s ease-in-out infinite" : "none",
                    }}
                  >
                    {/* Severity stripe */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                      style={{
                        background: `linear-gradient(180deg, ${sev.color}, ${sev.color}50)`,
                        boxShadow: `0 0 10px ${sev.color}40`,
                      }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-3">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${sev.color}15`,
                          border: `1px solid ${sev.color}30`,
                        }}
                      >
                        <SevIcon className="w-6 h-6" style={{ color: sev.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                            style={{
                              background: `${sev.color}15`,
                              border: `1px solid ${sev.color}35`,
                              color: sev.color,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "9px",
                            }}
                          >
                            {sev.label}
                          </span>
                          {alert.resolved && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                              style={{
                                background: "rgba(57,255,20,0.08)",
                                border: "1px solid rgba(57,255,20,0.2)",
                                color: "#39ff14",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "9px",
                              }}
                            >
                              RESOLVED
                            </span>
                          )}
                          <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.35)" }}>
                            {formatDate(alert.createdAt)}
                          </span>
                        </div>
                        <div
                          className="text-base font-bold mb-1"
                          style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
                        >
                          {alert.title}
                        </div>
                        <div
                          className="text-sm"
                          style={{ fontFamily: "'Inter', sans-serif", color: "rgba(160,170,200,0.6)" }}
                        >
                          {alert.message}
                        </div>
                      </div>

                      {/* Impact + Action */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${sev.color}60`, fontSize: "9px" }}>
                            Est. Impact
                          </div>
                          <div
                            className="text-xl font-black"
                            style={{
                              fontFamily: "'Exo 2', sans-serif",
                              color: sev.color,
                              textShadow: `0 0 15px ${sev.color}40`,
                            }}
                          >
                            {formatCurrency(alert.estimatedImpact)}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                            style={{
                              background: "rgba(57,255,20,0.1)",
                              border: "1px solid rgba(57,255,20,0.25)",
                              color: "#39ff14",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
      </motion.div>
    </div>
  );
}
