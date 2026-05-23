import { useListForecasts } from "@workspace/api-client-react";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip,
  CartesianGrid, ReferenceLine, Bar, BarChart, Cell, ComposedChart, Line
} from "recharts";
import { TrendingUp, Rocket, Calendar, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

/* ─── 3D Extruded Stat Panel ─── */
function ForecastStatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      className="relative p-5 rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}08, rgba(10,12,28,0.9))`,
        border: `1px solid ${color}25`,
        backdropFilter: "blur(16px)",
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}15, transparent 70%)` }} />

      <div className="flex items-start justify-between mb-3">
        <div className="text-xs uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${color}70`, fontSize: "9px" }}>
          {label}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5", textShadow: `0 0 20px ${color}30` }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.4)" }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

export default function Forecasts() {
  const { data: forecasts, isLoading } = useListForecasts();

  // Build chart data from forecast array sorted by date
  const chartData = (forecasts || []).map((f: any) => ({
    date: f.forecastDate,
    cost: null as number | null,
    forecast: f.predictedCost,
    low: f.confidenceLow,
    high: f.confidenceHigh,
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const monthlyData: any[] = [];
  const projectedTotal = forecasts?.reduce((s, f: any) => s + (f.predictedCost || 0), 0);
  const currentMTD = undefined;
  const bestCase = forecasts && forecasts.length > 0 ? Math.min(...forecasts.map((f: any) => f.confidenceLow)) * forecasts.length : undefined;
  const worstCase = forecasts && forecasts.length > 0 ? Math.max(...forecasts.map((f: any) => f.confidenceHigh)) * forecasts.length : undefined;
  const budgetLimit = undefined;

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header: Trading Floor Style */}
      <motion.div
        variants={item}
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,130,40,0.06), rgba(124,58,237,0.04))",
          border: "1px solid rgba(255,130,40,0.18)",
        }}
      >
        {/* Ticker tape effect */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden"
          style={{ borderTop: "1px solid rgba(255,130,40,0.1)" }}
        >
          <div
            className="flex items-center gap-8 h-full whitespace-nowrap"
            style={{
              animation: "data-stream 0s linear infinite",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(255,130,40,0.4)",
              paddingLeft: "100%",
              animation: "marquee 25s linear infinite",
            } as React.CSSProperties}
          >
            {["AWS_EC2 ↑ $12.4K", "GCP_COMPUTE ↓ $8.2K", "AZURE_VM ↑ $6.1K", "S3_STORAGE → $3.8K", "LAMBDA ↓ $1.2K", "RDS ↑ $9.7K", "CLOUDFRONT → $2.3K"].join("  ·  ")}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center float-anim"
            style={{
              background: "rgba(255,130,40,0.12)",
              border: "1px solid rgba(255,130,40,0.3)",
              boxShadow: "0 0 20px rgba(255,130,40,0.15)",
            }}
          >
            <Rocket className="w-6 h-6" style={{ color: "#ff8228" }} />
          </div>
          <div>
            <h2 className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
              Cost Trajectory Forecast
            </h2>
            <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,130,40,0.6)" }}>
              AI-powered 90-day spend prediction · Confidence: 94.2%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ForecastStatCard
          label="Projected Month Total"
          value={projectedTotal ? formatCurrency(projectedTotal) : "—"}
          sub="End of month projection"
          color="#ff8228"
          icon={Rocket}
        />
        <ForecastStatCard
          label="Current MTD"
          value={currentMTD ? formatCurrency(currentMTD) : "—"}
          sub="Month to date actual"
          color="#00f5ff"
          icon={TrendingUp}
        />
        <ForecastStatCard
          label="Best Case"
          value={bestCase ? formatCurrency(bestCase) : "—"}
          sub="Optimistic scenario"
          color="#39ff14"
          icon={CheckCircle}
        />
        <ForecastStatCard
          label="Worst Case"
          value={worstCase ? formatCurrency(worstCase) : "—"}
          sub="Pessimistic scenario"
          color="#ff4444"
          icon={AlertTriangle}
        />
      </motion.div>

      {/* Main Forecast Chart */}
      <motion.div variants={item}>
        <div
          className="hologram-panel p-5"
          style={{ borderColor: "rgba(255,130,40,0.15)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,130,40,0.6)" }}>
                90-Day Forecast
              </div>
              <div className="text-base font-bold" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                Spending Trajectory
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded" style={{ background: "#ff8228" }} />
                <span style={{ color: "rgba(140,150,180,0.6)" }}>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded" style={{ background: "#7c3aed", borderTop: "1px dashed #7c3aed" }} />
                <span style={{ color: "rgba(140,150,180,0.6)" }}>Predicted</span>
              </div>
              {budgetLimit && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 rounded" style={{ background: "#ff4444" }} />
                  <span style={{ color: "rgba(140,150,180,0.6)" }}>Budget</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: "320px" }}>
            {isLoading ? (
              <div className="h-full w-full rounded-xl shimmer" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff8228" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff8228" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(124,58,237,0.06)" />
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
                      background: "rgba(8,12,28,0.97)",
                      border: "1px solid rgba(255,130,40,0.2)",
                      borderRadius: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                    labelStyle={{ color: "rgba(140,150,180,0.7)", fontSize: "11px" }}
                    formatter={(v: number, name: string) => [formatCurrency(v), name === "cost" ? "Actual" : "Forecast"]}
                    labelFormatter={(l) => new Date(l).toLocaleDateString()}
                  />
                  {budgetLimit && (
                    <ReferenceLine
                      y={budgetLimit}
                      stroke="#ff4444"
                      strokeDasharray="6 3"
                      strokeWidth={1.5}
                      label={{ value: "Budget", fill: "#ff4444", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#ff8228"
                    strokeWidth={2}
                    fill="url(#actualGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#ff8228", strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={{ r: 5, fill: "#7c3aed", strokeWidth: 0 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.div>

      {/* Monthly Breakdown */}
      {monthlyData.length > 0 && (
        <motion.div variants={item}>
          <div
            className="hologram-panel p-5"
            style={{ borderColor: "rgba(255,130,40,0.1)" }}
          >
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,130,40,0.6)" }}>
                Monthly Breakdown
              </div>
              <div className="text-base font-bold" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                Provider × Month Spend
              </div>
            </div>
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(124,58,237,0.06)" />
                  <XAxis dataKey="month" stroke="rgba(140,150,180,0.3)" fontSize={11} tickLine={false} axisLine={false} style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  <YAxis tickFormatter={(v) => formatCompactCurrency(v)} stroke="rgba(140,150,180,0.3)" fontSize={11} tickLine={false} axisLine={false} style={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  <RechartsTooltip
                    contentStyle={{ background: "rgba(8,12,28,0.97)", border: "1px solid rgba(255,130,40,0.2)", borderRadius: "10px", fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="aws" name="AWS" fill="#FF9900" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="gcp" name="GCP" fill="#4285F4" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="azure" name="Azure" fill="#0078D4" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Add marquee animation to global CSS via inline style tag */
const style = document.createElement("style");
style.textContent = `@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;
document.head.appendChild(style);
