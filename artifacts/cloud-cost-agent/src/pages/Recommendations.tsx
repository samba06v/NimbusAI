import { useState, useEffect, useRef } from "react";
import { useListRecommendations, useApplyRecommendation, useDismissRecommendation } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { Brain, Zap, ChevronRight, Check, X, TrendingDown, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

/* ─── Neural Network Background Canvas ─── */
function NeuralNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const layers = [4, 6, 6, 4, 2];
    const getNodes = () => {
      const nodes: { x: number; y: number; layer: number; idx: number }[] = [];
      layers.forEach((count, li) => {
        const xFrac = (li + 1) / (layers.length + 1);
        const x = canvas.width * xFrac;
        for (let i = 0; i < count; i++) {
          const yFrac = (i + 1) / (count + 1);
          nodes.push({ x, y: canvas.height * yFrac, layer: li, idx: i });
        }
      });
      return nodes;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = getNodes();
      t += 0.02;

      // Draw edges
      for (let li = 0; li < layers.length - 1; li++) {
        const layerA = nodes.filter((n) => n.layer === li);
        const layerB = nodes.filter((n) => n.layer === li + 1);
        for (const a of layerA) {
          for (const b of layerB) {
            const pulse = Math.sin(t * 2 + li * 0.7 + a.idx * 0.5) * 0.5 + 0.5;
            const alpha = 0.06 + pulse * 0.12;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(57,255,20,${alpha})`);
            grad.addColorStop(0.5, `rgba(0,245,255,${alpha * 0.8})`);
            grad.addColorStop(1, `rgba(124,58,237,${alpha})`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Traveling pulse dot
            if (pulse > 0.85) {
              const prog = (t * 1.5 + li * 0.3) % 1;
              const px = a.x + (b.x - a.x) * prog;
              const py = a.y + (b.y - a.y) * prog;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(57,255,20,${pulse * 0.8})`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const pulse = Math.sin(t * 1.5 + n.layer * 0.8 + n.idx * 1.2) * 0.5 + 0.5;
        const r = 8 + pulse * 4;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
        const col = n.layer === 0 ? "0,245,255" : n.layer === layers.length - 1 ? "57,255,20" : "124,58,237";
        grd.addColorStop(0, `rgba(${col},${0.6 + pulse * 0.4})`);
        grd.addColorStop(0.5, `rgba(${col},0.15)`);
        grd.addColorStop(1, `rgba(${col},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col},0.9)`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.35 }}
    />
  );
}

const PRIORITY_CONFIG: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  critical: { color: "#ff4444", label: "CRITICAL", icon: AlertCircle },
  high: { color: "#ff8228", label: "HIGH", icon: Zap },
  medium: { color: "#00f5ff", label: "MEDIUM", icon: Lightbulb },
  low: { color: "#39ff14", label: "LOW", icon: TrendingDown },
};

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  rightsizing: { color: "#7c3aed", label: "Rightsizing" },
  idle: { color: "#ff8228", label: "Idle Resource" },
  reserved: { color: "#00f5ff", label: "Reserved Instance" },
  storage: { color: "#39ff14", label: "Storage Optimization" },
  network: { color: "#ff4fab", label: "Network Optimization" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemAnim = {
  hidden: { opacity: 0, x: -30, scale: 0.96 },
  show: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

export default function Recommendations() {
  const [filterStatus, setFilterStatus] = useState<"pending" | "accepted" | "dismissed" | "all">("all");
  const { data: recs, isLoading, refetch } = useListRecommendations(
    filterStatus !== "all" ? { status: filterStatus } : {}
  );
  const { mutate: applyRec } = useApplyRecommendation();
  const { mutate: dismissRec } = useDismissRecommendation();

  const totalSavings = recs?.filter(r => r.status === "pending").reduce((s, r) => s + r.estimatedMonthlySavings, 0) || 0;

  const handleAction = (id: number, action: "accepted" | "dismissed") => {
    if (action === "accepted") {
      applyRec({ id }, { onSuccess: () => refetch() });
    } else {
      dismissRec({ id }, { onSuccess: () => refetch() });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Neural Background */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(57,255,20,0.04), rgba(0,245,255,0.03))",
          border: "1px solid rgba(57,255,20,0.15)",
          minHeight: "140px",
        }}
      >
        <NeuralNetworkBg />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(57,255,20,0.12)",
                    border: "1px solid rgba(57,255,20,0.3)",
                    boxShadow: "0 0 20px rgba(57,255,20,0.15)",
                  }}
                >
                  <Brain className="w-5 h-5" style={{ color: "#39ff14" }} />
                </div>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                  AI Neural Insights
                </h2>
              </div>
              <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(57,255,20,0.6)" }}>
                Machine learning optimization engine · {recs?.length || 0} insights generated
              </p>
            </div>

            {/* Savings counter */}
            {totalSavings > 0 && (
              <div
                className="text-right px-5 py-3 rounded-xl"
                style={{
                  background: "rgba(57,255,20,0.08)",
                  border: "1px solid rgba(57,255,20,0.2)",
                }}
              >
                <div className="text-xs mb-1 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(57,255,20,0.6)", fontSize: "9px" }}>
                  Potential Monthly Savings
                </div>
                <div
                  className="text-2xl font-black"
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    color: "#39ff14",
                    textShadow: "0 0 20px rgba(57,255,20,0.5)",
                  }}
                >
                  {formatCurrency(totalSavings)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "accepted", "dismissed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filterStatus === s ? "rgba(57,255,20,0.12)" : "rgba(15,20,40,0.7)",
              border: filterStatus === s ? "1px solid rgba(57,255,20,0.35)" : "1px solid rgba(124,58,237,0.12)",
              color: filterStatus === s ? "#39ff14" : "rgba(140,150,180,0.6)",
              fontFamily: "'Inter', sans-serif",
              boxShadow: filterStatus === s ? "0 0 15px rgba(57,255,20,0.1)" : "none",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl shimmer" />
            ))
          : recs?.length === 0
          ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "rgba(15,20,40,0.5)", border: "1px solid rgba(57,255,20,0.1)" }}
            >
              <Brain className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(57,255,20,0.2)" }} />
              <div className="text-base font-semibold" style={{ fontFamily: "'Exo 2', sans-serif", color: "rgba(180,190,220,0.4)" }}>
                No recommendations found
              </div>
              <div className="text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(140,150,180,0.3)" }}>
                All optimizations have been applied!
              </div>
            </div>
          )
          : recs?.map((rec) => {
            const pri = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
            const typ = TYPE_CONFIG[rec.recommendationType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.rightsizing;
            const PriIcon = pri.icon;
            const isDismissed = rec.status === "dismissed";
            const isAccepted = rec.status === "applied";

            return (
              <motion.div
                key={rec.id}
                variants={itemAnim}
                className="relative rounded-2xl p-5 overflow-hidden"
                style={{
                  background: "rgba(15,20,40,0.75)",
                  border: `1px solid ${isDismissed ? "rgba(80,80,100,0.15)" : isAccepted ? "rgba(57,255,20,0.2)" : `${pri.color}22`}`,
                  backdropFilter: "blur(16px)",
                  opacity: isDismissed ? 0.5 : 1,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${pri.color}80, ${pri.color}20, transparent)` }}
                />

                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left: Icon + Type */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 float-anim"
                      style={{
                        background: `${pri.color}12`,
                        border: `1px solid ${pri.color}30`,
                        boxShadow: `0 0 20px ${pri.color}15`,
                        animationDelay: `${rec.id * 0.3}s`,
                      }}
                    >
                      <PriIcon className="w-6 h-6" style={{ color: pri.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-bold"
                          style={{
                            background: `${pri.color}15`,
                            border: `1px solid ${pri.color}35`,
                            color: pri.color,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "9px",
                          }}
                        >
                          {pri.label}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs"
                          style={{
                            background: `${typ.color}10`,
                            border: `1px solid ${typ.color}25`,
                            color: typ.color,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "11px",
                          }}
                        >
                          {typ.label}
                        </span>
                        {isAccepted && (
                          <span
                            className="px-2 py-0.5 rounded-lg text-xs"
                            style={{
                              background: "rgba(57,255,20,0.1)",
                              border: "1px solid rgba(57,255,20,0.25)",
                              color: "#39ff14",
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "9px",
                            }}
                          >
                            ✓ ACCEPTED
                          </span>
                        )}
                      </div>

                      <h3
                        className="text-base font-bold mb-1.5"
                        style={{ fontFamily: "'Exo 2', sans-serif", color: isDismissed ? "rgba(180,190,220,0.35)" : "#e8ecf5" }}
                      >
                        {rec.description.length > 60 ? rec.description.slice(0, 60) + "..." : rec.description}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ fontFamily: "'Inter', sans-serif", color: "rgba(160,170,200,0.55)" }}
                      >
                        {rec.description}
                      </p>

                      {/* Resource info */}
                      {rec.resourceName && (
                        <div className="flex items-center gap-2 mt-3">
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(124,58,237,0.4)" }} />
                          <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.45)" }}>
                            {rec.resourceName}
                          </span>
                          {rec.provider && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded uppercase"
                              style={{
                                background: "rgba(124,58,237,0.1)",
                                color: "rgba(167,100,255,0.7)",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "9px",
                              }}
                            >
                              {rec.provider}
                            </span>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right: Savings + Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(57,255,20,0.5)", fontSize: "9px" }}>
                        Monthly Savings
                      </div>
                      <div
                        className="text-2xl font-black"
                        style={{
                          fontFamily: "'Exo 2', sans-serif",
                          color: "#39ff14",
                          textShadow: "0 0 15px rgba(57,255,20,0.4)",
                        }}
                      >
                        {formatCurrency(rec.estimatedMonthlySavings)}
                      </div>
                    </div>

                    {rec.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(rec.id, "dismissed")}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                          style={{
                            background: "rgba(255,68,68,0.1)",
                            border: "1px solid rgba(255,68,68,0.25)",
                            color: "#ff4444",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          <X className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(rec.id, "accepted")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,255,20,0.1))",
                            border: "1px solid rgba(57,255,20,0.35)",
                            color: "#39ff14",
                            fontFamily: "'Inter', sans-serif",
                            boxShadow: "0 0 15px rgba(57,255,20,0.1)",
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
      </motion.div>
    </div>
  );
}
