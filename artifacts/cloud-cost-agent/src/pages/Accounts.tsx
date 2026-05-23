import { useState } from "react";
import { useListAccounts, useCreateAccount } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Globe, CheckCircle, XCircle, RefreshCw, Cloud, Zap, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const PROVIDER_META: Record<string, {
  color: string; accent: string; emoji: string; gradient: string; label: string; bg: string;
}> = {
  aws: {
    color: "#FF9900", accent: "#FFB84D", emoji: "🟠",
    gradient: "linear-gradient(135deg, rgba(255,153,0,0.15), rgba(255,153,0,0.05))",
    bg: "rgba(255,153,0,0.08)", label: "Amazon Web Services",
  },
  gcp: {
    color: "#4285F4", accent: "#7BAAF7", emoji: "🔵",
    gradient: "linear-gradient(135deg, rgba(66,133,244,0.15), rgba(66,133,244,0.05))",
    bg: "rgba(66,133,244,0.08)", label: "Google Cloud Platform",
  },
  azure: {
    color: "#0078D4", accent: "#4DA3E8", emoji: "🟣",
    gradient: "linear-gradient(135deg, rgba(0,120,212,0.15), rgba(124,58,237,0.08))",
    bg: "rgba(0,120,212,0.08)", label: "Microsoft Azure",
  },
};

/* ─── Orbiting Solar System ─── */
function SolarSystem({ providers }: { providers: string[] }) {
  return (
    <div className="relative w-48 h-48 mx-auto my-4" style={{ perspective: "600px" }}>
      {/* Sun / Hub */}
      <div
        className="absolute"
        style={{
          inset: "36%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,255,0.8) 0%, rgba(124,58,237,0.4) 50%, transparent 100%)",
          boxShadow: "0 0 30px rgba(0,245,255,0.4), 0 0 60px rgba(124,58,237,0.2)",
          animation: "float-3d 4s ease-in-out infinite",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Cloud className="w-5 h-5" style={{ color: "#00f5ff" }} />
        </div>
      </div>

      {/* Orbit rings */}
      {[0, 1, 2].slice(0, Math.max(providers.length, 1)).map((ring) => {
        const prov = providers[ring];
        const meta = prov ? PROVIDER_META[prov] : null;
        const sizes = ["60%", "75%", "90%"];
        const durations = ["7s", "10s", "14s"];
        return (
          <div key={ring}>
            {/* Ring */}
            <div
              className="absolute"
              style={{
                inset: `${(100 - parseInt(sizes[ring])) / 2}%`,
                borderRadius: "50%",
                border: `1px solid ${meta ? `${meta.color}25` : "rgba(124,58,237,0.15)"}`,
              }}
            />
            {/* Planet */}
            {meta && (
              <div
                style={{
                  position: "absolute",
                  inset: `${(100 - parseInt(sizes[ring])) / 2}%`,
                  animation: `orbit ${durations[ring]} linear infinite`,
                  animationDelay: `${-ring * 2.5}s`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    left: "calc(50% - 6px)",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: meta.color,
                    boxShadow: `0 0 10px ${meta.color}, 0 0 20px ${meta.color}50`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

export default function Accounts() {
  const { data: accounts, isLoading, refetch } = useListAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", provider: "aws", accountId: "", region: "us-east-1" });

  const providers = [...new Set(accounts?.map(a => a.provider) || [])];
  const totalSpend = accounts?.reduce((s, a) => s + (a.monthlyCost || 0), 0) || 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount({ data: formData }, {
      onSuccess: () => { setShowForm(false); setFormData({ name: "", provider: "aws", accountId: "", region: "us-east-1" }); refetch(); }
    });
  };

  return (
    <div className="space-y-6">
      {/* Solar System Header */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(0,245,255,0.03))",
          border: "1px solid rgba(124,58,237,0.15)",
        }}
      >
        {/* Stars */}
        {Array(20).fill(0).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              background: "white",
              opacity: Math.random() * 0.4 + 0.1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse-glow ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <SolarSystem providers={providers} />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
                >
                  <Globe className="w-5 h-5" style={{ color: "#a764ff" }} />
                </div>
                <h2 className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                  Multi-Cloud Universe
                </h2>
              </div>
              <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)" }}>
                {accounts?.length || 0} connected accounts · {providers.length} cloud providers
              </p>
              <div
                className="text-2xl font-black mt-2"
                style={{ fontFamily: "'Exo 2', sans-serif", color: "#a764ff", textShadow: "0 0 20px rgba(124,58,237,0.5)" }}
              >
                {formatCurrency(totalSpend)}
                <span className="text-sm font-normal ml-1" style={{ color: "rgba(140,150,180,0.5)" }}>total/mo</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,245,255,0.1))",
              border: "1px solid rgba(124,58,237,0.35)",
              color: "#a764ff",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 0 20px rgba(124,58,237,0.1)",
            }}
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-2xl p-6"
          style={{
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
            Connect Cloud Account
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "name", label: "Account Name", placeholder: "Production AWS" },
              { key: "accountId", label: "Account ID", placeholder: "123456789012" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)" }}>
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  required
                  className="w-full h-10 rounded-xl px-4 text-sm focus:outline-none"
                  style={{
                    background: "rgba(10,14,30,0.8)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "#c8d0e8",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs mb-1.5 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)" }}>
                Provider
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData(p => ({ ...p, provider: e.target.value }))}
                className="w-full h-10 rounded-xl px-4 text-sm focus:outline-none"
                style={{
                  background: "rgba(10,14,30,0.8)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#c8d0e8",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <option value="aws">AWS</option>
                <option value="gcp">GCP</option>
                <option value="azure">Azure</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-3 mt-2">
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #00f5ff)",
                  color: "#050a18",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Zap className="w-4 h-4" />
                {isCreating ? "Connecting..." : "Connect"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,68,68,0.08)",
                  border: "1px solid rgba(255,68,68,0.2)",
                  color: "#ff4444",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Accounts Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl shimmer" />
            ))
          : accounts?.length === 0
          ? (
            <div
              className="md:col-span-2 xl:col-span-3 text-center py-20 rounded-2xl"
              style={{ background: "rgba(15,20,40,0.5)", border: "1px solid rgba(124,58,237,0.1)" }}
            >
              <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(124,58,237,0.2)" }} />
              <div className="text-base font-semibold" style={{ fontFamily: "'Exo 2', sans-serif", color: "rgba(180,190,220,0.4)" }}>
                No accounts connected
              </div>
              <div className="text-sm mt-1" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(140,150,180,0.3)" }}>
                Connect your first cloud account to start monitoring
              </div>
            </div>
          )
          : accounts?.map((account) => {
            const meta = PROVIDER_META[account.provider] || PROVIDER_META.aws;
            return (
              <motion.div
                key={account.id}
                variants={itemAnim}
                className="relative rounded-2xl p-5 overflow-hidden card-3d"
                style={{
                  background: meta.gradient,
                  border: `1px solid ${meta.color}25`,
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${meta.color}80, ${meta.accent}50, transparent)` }} />
                {/* Corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${meta.color}18, transparent 70%)` }} />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: meta.bg,
                      border: `1px solid ${meta.color}30`,
                      boxShadow: `0 0 20px ${meta.color}15`,
                    }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    {account.status === "active" ? (
                      <>
                        <div className="led-green" />
                        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#39ff14", fontSize: "10px" }}>LIVE</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" style={{ color: "#ff4444" }} />
                        <span className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ff4444", fontSize: "10px" }}>ERROR</span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className="text-lg font-black mb-0.5 truncate"
                  style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
                >
                  {account.name}
                </div>
                <div
                  className="text-xs mb-3"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: `${meta.color}80` }}
                >
                  {meta.label}
                </div>

                {/* Account ID */}
                {account.accountId && (
                  <div
                    className="text-xs px-3 py-1.5 rounded-lg mb-3 font-mono"
                    style={{
                      background: `${meta.color}10`,
                      border: `1px solid ${meta.color}20`,
                      color: "rgba(140,150,180,0.5)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ID: {account.accountId}
                  </div>
                )}

                {/* Divider */}
                <div className="h-px mb-3" style={{ background: `${meta.color}20` }} />

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${meta.color}60`, fontSize: "9px" }}>
                      Monthly Cost
                    </div>
                    <div
                      className="text-xl font-black"
                      style={{ fontFamily: "'Exo 2', sans-serif", color: meta.color, textShadow: `0 0 15px ${meta.color}40` }}
                    >
                      {formatCurrency(account.monthlyCost || 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.35)", fontSize: "9px" }}>
                      Created
                    </div>
                    <div className="text-xs flex items-center gap-1 justify-end" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.45)" }}>
                      <RefreshCw className="w-3 h-3" />
                      {formatDate(account.createdAt)}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </motion.div>
    </div>
  );
}
