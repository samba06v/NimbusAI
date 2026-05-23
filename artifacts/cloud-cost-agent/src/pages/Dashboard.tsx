import {
  useGetDashboardSummary,
  useGetCostTrend,
  useGetSpendingByProvider,
  useGetSpendingByService,
  useGetTopCostlyResources,
  useListAlerts
} from "@workspace/api-client-react";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid,
  Bar, BarChart, PieChart, Pie, Cell
} from "recharts";
import { ArrowDownIcon, ArrowUpIcon, AlertTriangle, AlertCircle, Info, Zap, TrendingDown, Activity, Server } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useRef } from "react";

/* ─── Holographic Grid Floor Canvas ─── */
function HoloGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    let t = 0;
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 40;
      const rows = Math.ceil(canvas.height / spacing) + 2;
      const cols = Math.ceil(canvas.width / spacing) + 2;
      ctx.save();
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * spacing - (t % spacing);
          const y = i * spacing;
          const dist = Math.sqrt(Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height, 2));
          const alpha = Math.max(0, 0.12 - dist / (canvas.width * 1.5));
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,245,255,${alpha})`;
          ctx.fill();
        }
      }
      ctx.restore();
      t += 0.3;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ─── 3D Stat Card ─── */
function StatCard({
  title, value, isLoading, change, color = "#00f5ff", icon: Icon, sub
}: {
  title: string; value?: number | null; isLoading?: boolean; change?: number | null;
  color?: string; icon?: React.ElementType; sub?: string;
}) {
  return (
    <motion.div
      className="relative rounded-2xl p-5 overflow-hidden card-3d"
      style={{
        background: `linear-gradient(135deg, rgba(15,20,40,0.85), rgba(10,12,28,0.9))`,
        border: `1px solid ${color}22`,
        backdropFilter: "blur(20px)",
      }}
      whileHover={{ y: -6, rotateX: 3, rotateY: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
      />
      {/* Corner glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: `${color}90` }}
        >
          {title}
        </div>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}12`, border: `1px solid ${color}25` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-9 w-32 rounded shimmer" />
      ) : (
        <div
          className="text-3xl font-black tracking-tight mb-1"
          style={{
            fontFamily: "'Exo 2', sans-serif",
            color: "#e8ecf5",
            textShadow: `0 0 20px ${color}30`,
          }}
        >
          {value != null ? formatCurrency(value) : "—"}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        {sub && (
          <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.4)" }}>
            {sub}
          </span>
        )}
        {change != null && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: change > 0 ? "#ff4444" : "#39ff14",
            }}
          >
            {change > 0
              ? <ArrowUpIcon className="w-3 h-3" />
              : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(change)}% vs last mo
          </span>
        )}
      </div>
    </motion.div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: costTrend } = useGetCostTrend();
  const { data: byProvider } = useGetSpendingByProvider();
  const { data: byService } = useGetSpendingByService();
  const { data: topResources } = useGetTopCostlyResources();
  const { data: alerts } = useListAlerts({ resolved: false });

  const activeAlerts = alerts?.slice(0, 3) || [];

  const PROVIDER_COLORS: Record<string, string> = {
    aws: "#FF9900",
    gcp: "#4285F4",
    azure: "#0078D4",
  };

  const CHART_COLORS = ["#00f5ff", "#7c3aed", "#39ff14", "#ff8228", "#ff4fab"];

  return (
    <motion.div
      className="space-y-6 relative"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ─── Holographic header banner ─── */}
      <motion.div
        variants={item}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,245,255,0.04), rgba(124,58,237,0.08), rgba(0,245,255,0.04))",
          border: "1px solid rgba(0,245,255,0.15)",
          padding: "20px 24px",
          minHeight: "80px",
        }}
      >
        <HoloGrid />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div
              className="text-2xl font-black"
              style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
            >
              Holographic Control Room
            </div>
            <div
              className="text-sm mt-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,255,0.6)" }}
            >
              AI monitoring {(summary?.totalMonthlyCost || 0) > 0 ? "ACTIVE" : "INITIALIZING"} · Multi-cloud scan running
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="led-green" />
            <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#39ff14" }}>
              ALL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </motion.div>

      {/* ─── Alert Strip ─── */}
      {activeAlerts.length > 0 && (
        <motion.div variants={item} className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: alert.severity === "critical"
                  ? "rgba(255,68,68,0.08)"
                  : alert.severity === "warning"
                  ? "rgba(255,130,40,0.08)"
                  : "rgba(0,245,255,0.06)",
                border: `1px solid ${alert.severity === "critical" ? "rgba(255,68,68,0.3)" : alert.severity === "warning" ? "rgba(255,130,40,0.3)" : "rgba(0,245,255,0.2)"}`,
                animation: alert.severity === "critical" ? "alert-flash 1.5s ease-in-out infinite" : "none",
              }}
            >
              {alert.severity === "critical"
                ? <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#ff4444" }} />
                : alert.severity === "warning"
                ? <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#ff8228" }} />
                : <Info className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />}
              <span className="font-bold" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                {alert.title}
              </span>
              <span className="truncate flex-1" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(180,190,220,0.6)" }}>
                {alert.message}
              </span>
              <span className="font-bold whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ff8228" }}>
                Impact: {formatCurrency(alert.estimatedImpact)}
              </span>
              <Link href="/alerts">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-lg transition-all hover:opacity-100 opacity-70"
                  style={{
                    background: "rgba(0,245,255,0.1)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    color: "#00f5ff",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                  }}
                >
                  VIEW →
                </span>
              </Link>
            </div>
          ))}
        </motion.div>
      )}

      {/* ─── Stat Cards ─── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Spend MTD"
          value={summary?.totalMonthlyCost}
          isLoading={isLoadingSummary}
          change={summary?.costChangePercent}
          color="#00f5ff"
          icon={Activity}
        />
        <StatCard
          title="Projected EOM"
          value={summary?.projectedMonthCost}
          isLoading={isLoadingSummary}
          color="#7c3aed"
          icon={TrendingDown}
          sub="End of month forecast"
        />
        <StatCard
          title="Potential Savings"
          value={summary?.potentialMonthlySavings}
          isLoading={isLoadingSummary}
          color="#39ff14"
          icon={Zap}
          sub="AI-identified"
        />
        <motion.div
          className="relative rounded-2xl p-5 overflow-hidden card-3d"
          style={{
            background: "linear-gradient(135deg, rgba(15,20,40,0.85), rgba(10,12,28,0.9))",
            border: "1px solid rgba(255,130,40,0.22)",
            backdropFilter: "blur(20px)",
          }}
          whileHover={{ y: -6, rotateX: 3, rotateY: 2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,130,40,0.6), transparent)" }} />
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,130,40,0.12), transparent 70%)" }} />
          <div className="flex items-start justify-between mb-3">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,130,40,0.8)" }}>
              Wasted Resources
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,130,40,0.12)", border: "1px solid rgba(255,130,40,0.25)" }}>
              <Server className="w-4 h-4" style={{ color: "#ff8228" }} />
            </div>
          </div>
          {isLoadingSummary ? (
            <div className="h-9 w-20 rounded shimmer" />
          ) : (
            <div className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
              {(summary?.idleResources ?? 0) + (summary?.unusedResources ?? 0)}
              <span className="text-base font-normal ml-1" style={{ color: "rgba(140,150,180,0.5)" }}>items</span>
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ff8228" }}>
              <span className="led-orange" style={{ width: "6px", height: "6px" }} />
              {summary?.idleResources ?? 0} Idle
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ff4444" }}>
              <span className="led-red" style={{ width: "6px", height: "6px" }} />
              {summary?.unusedResources ?? 0} Unused
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost Trend - Hologram */}
        <motion.div variants={item} className="lg:col-span-2">
          <div
            className="hologram-panel p-5 h-full"
            style={{ minHeight: "340px" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,255,0.6)" }}>
                  30-Day Cost Trend
                </div>
                <div className="text-base font-bold mt-0.5" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                  Spending Trajectory
                </div>
              </div>
              <div className="led-green" />
            </div>
            <div className="h-[260px] w-full">
              {costTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(124,58,237,0.08)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      stroke="rgba(140,150,180,0.3)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCompactCurrency(v)}
                      stroke="rgba(140,150,180,0.3)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "rgba(8,12,28,0.95)",
                        border: "1px solid rgba(0,245,255,0.2)",
                        borderRadius: "10px",
                        backdropFilter: "blur(20px)",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      labelStyle={{ color: "rgba(140,150,180,0.7)", fontSize: "11px" }}
                      itemStyle={{ color: "#00f5ff" }}
                      formatter={(v: number) => [formatCurrency(v), "Cost"]}
                      labelFormatter={(l) => new Date(l).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#00f5ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#costGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#00f5ff", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-xl shimmer" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Provider Breakdown */}
        <motion.div variants={item}>
          <div
            className="hologram-panel p-5 h-full flex flex-col"
            style={{ minHeight: "340px" }}
          >
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.7)" }}>
                Cloud Providers
              </div>
              <div className="text-base font-bold mt-0.5" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                Spend Distribution
              </div>
            </div>
            {byProvider ? (
              <div className="flex flex-col items-center gap-4 flex-1">
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byProvider}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="monthlyCost"
                        nameKey="provider"
                        stroke="none"
                      >
                        {byProvider.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PROVIDER_COLORS[entry.provider] || CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{
                          background: "rgba(8,12,28,0.95)",
                          border: "1px solid rgba(0,245,255,0.2)",
                          borderRadius: "10px",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2">
                  {byProvider.map((p) => (
                    <div key={p.provider} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            background: PROVIDER_COLORS[p.provider],
                            boxShadow: `0 0 6px ${PROVIDER_COLORS[p.provider]}60`,
                          }}
                        />
                        <span
                          className="text-sm font-semibold uppercase"
                          style={{ fontFamily: "'Exo 2', sans-serif", color: "#c8d0e8" }}
                        >
                          {p.provider}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.5)" }}>
                          {p.percentage}%
                        </span>
                        <span className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e8ecf5" }}>
                          {formatCompactCurrency(p.monthlyCost)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full shimmer" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Breakdown Bar Chart */}
        <motion.div variants={item}>
          <div className="hologram-panel p-5" style={{ minHeight: "300px" }}>
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,130,40,0.7)" }}>
                Top Services
              </div>
              <div className="text-base font-bold mt-0.5" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                Cost by Service
              </div>
            </div>
            <div className="h-[230px] w-full">
              {byService ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byService} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(124,58,237,0.06)" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="service"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(140,150,180,0.6)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                      width={70}
                    />
                    <RechartsTooltip
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{
                        background: "rgba(8,12,28,0.95)",
                        border: "1px solid rgba(255,130,40,0.2)",
                        borderRadius: "10px",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                      cursor={{ fill: "rgba(124,58,237,0.04)" }}
                    />
                    <Bar dataKey="monthlyCost" radius={[0, 6, 6, 0]} barSize={18}>
                      {byService.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-xl shimmer" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Costly Resources */}
        <motion.div variants={item}>
          <div className="hologram-panel p-5" style={{ minHeight: "300px" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,75,171,0.7)" }}>
                  Cost Hotspots
                </div>
                <div className="text-base font-bold mt-0.5" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                  Top Expensive Resources
                </div>
              </div>
              <Link href="/resources">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer transition-all hover:opacity-90"
                  style={{
                    background: "rgba(255,75,171,0.1)",
                    border: "1px solid rgba(255,75,171,0.2)",
                    color: "#ff4fab",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  View All →
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              {topResources ? (
                topResources.slice(0, 5).map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all hover:bg-white/[0.02]"
                    style={{
                      borderBottom: idx < 4 ? "1px solid rgba(124,58,237,0.08)" : "none",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{
                        background: `${PROVIDER_COLORS[r.provider] || "#7c3aed"}18`,
                        border: `1px solid ${PROVIDER_COLORS[r.provider] || "#7c3aed"}30`,
                        color: PROVIDER_COLORS[r.provider] || "#7c3aed",
                        fontFamily: "'Exo 2', sans-serif",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ fontFamily: "'Inter', sans-serif", color: "#c8d0e8" }}>
                        {r.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs uppercase px-1.5 py-0.5 rounded"
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "9px",
                            background: `${PROVIDER_COLORS[r.provider] || "#7c3aed"}15`,
                            color: PROVIDER_COLORS[r.provider] || "#7c3aed",
                          }}
                        >
                          {r.provider}
                        </span>
                        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.4)", fontSize: "10px" }}>
                          {r.resourceType}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-black text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e8ecf5" }}>
                        {formatCurrency(r.monthlyCost)}
                      </span>
                      <span
                        className={`status-pill ${r.status}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 w-full rounded-xl shimmer" />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
