import { useState, useMemo } from "react";
import { useListResources, useGetResource, getGetResourceQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Filter, Server, Cpu, MemoryStick, Activity, Tag, Network, X, Database, Layers } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const PROVIDER_COLORS: Record<string, string> = {
  aws: "#FF9900", gcp: "#4285F4", azure: "#0078D4",
};

function StatusLED({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "led-green", idle: "led-orange", unused: "led-red", stopped: "",
  };
  const colors: Record<string, string> = {
    active: "#39ff14", idle: "#ff8228", unused: "#ff4444", stopped: "#555",
  };
  return (
    <div className="flex items-center gap-2">
      <div
        className={map[status] || ""}
        style={!map[status] ? { width: 8, height: 8, borderRadius: "50%", background: "#444" } : { width: 8, height: 8, borderRadius: "50%" }}
      />
      <span
        className="text-xs font-semibold uppercase"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: colors[status] || "#888", fontSize: "10px" }}
      >
        {status}
      </span>
    </div>
  );
}

function NeonBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemAnim = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

export default function Resources() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

  const { data: resources, isLoading } = useListResources();
  const { data: resourceDetails, isLoading: isLoadingDetails } = useGetResource(
    selectedResourceId as number,
    { query: { enabled: !!selectedResourceId, queryKey: selectedResourceId ? getGetResourceQueryKey(selectedResourceId) : ["none"] } }
  );

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter((res) => {
      const matchesSearch = search ? res.name.toLowerCase().includes(search.toLowerCase()) || res.id.toString().includes(search) : true;
      const matchesProvider = providerFilter !== "all" ? res.provider === providerFilter : true;
      const matchesStatus = statusFilter !== "all" ? res.status === statusFilter : true;
      const matchesType = typeFilter !== "all" ? res.resourceType === typeFilter : true;
      return matchesSearch && matchesProvider && matchesStatus && matchesType;
    });
  }, [resources, search, providerFilter, statusFilter, typeFilter]);

  const totalActive = resources?.filter(r => r.status === "active").length || 0;
  const totalIdle = resources?.filter(r => r.status === "idle").length || 0;
  const totalUnused = resources?.filter(r => r.status === "unused").length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(124,58,237,0.03))",
          border: "1px solid rgba(124,58,237,0.15)",
        }}
      >
        {/* Rack art decorative */}
        <div
          className="absolute right-6 top-0 bottom-0 flex items-center gap-1 opacity-20"
          aria-hidden="true"
        >
          {Array(8).fill(0).map((_, i) => (
            <div
              key={i}
              className="w-3 rounded"
              style={{
                height: `${40 + Math.random() * 40}%`,
                background: `hsl(${262 + i * 10}, 70%, 60%)`,
                alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                <Server className="w-5 h-5" style={{ color: "#7c3aed" }} />
              </div>
              <h2 className="text-2xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}>
                Server Rack View
              </h2>
            </div>
            <p className="text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.7)" }}>
              3D infrastructure inventory · {resources?.length || 0} resources scanned
            </p>
          </div>

          {/* Live stats */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Active", count: totalActive, color: "#39ff14" },
              { label: "Idle", count: totalIdle, color: "#ff8228" },
              { label: "Unused", count: totalUnused, color: "#ff4444" },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className="px-4 py-2 rounded-xl"
                style={{
                  background: `${color}10`,
                  border: `1px solid ${color}30`,
                }}
              >
                <div className="text-xl font-black" style={{ fontFamily: "'Exo 2', sans-serif", color, textShadow: `0 0 15px ${color}60` }}>
                  {count}
                </div>
                <div className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${color}80` }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col lg:flex-row gap-4 p-4 rounded-2xl"
        style={{
          background: "rgba(15,20,40,0.7)",
          border: "1px solid rgba(124,58,237,0.12)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(140,150,180,0.4)" }} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full h-10 rounded-xl border pl-10 pr-4 text-sm focus:outline-none"
            style={{
              background: "rgba(10,14,30,0.8)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#c8d0e8",
              fontFamily: "'Inter', sans-serif",
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(124,58,237,0.7)", fontFamily: "'JetBrains Mono', monospace" }}>
            <Filter className="w-3.5 h-3.5" />
            FILTER:
          </div>
          {[
            { val: providerFilter, set: setProviderFilter, opts: [["all", "All Providers"], ["aws", "AWS"], ["gcp", "GCP"], ["azure", "Azure"]] },
            { val: statusFilter, set: setStatusFilter, opts: [["all", "All Status"], ["active", "Active"], ["idle", "Idle"], ["unused", "Unused"], ["stopped", "Stopped"]] },
            { val: typeFilter, set: setTypeFilter, opts: [["all", "All Types"], ["ec2", "EC2"], ["rds", "RDS"], ["s3", "S3"], ["lambda", "Lambda"], ["gce", "GCE"], ["blob_storage", "Blob Storage"]] },
          ].map(({ val, set, opts }, idx) => (
            <Select key={idx} value={val} onValueChange={set}>
              <SelectTrigger
                className="w-[140px] h-9 text-sm border-0 rounded-xl"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "#c8d0e8",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: "rgba(10,14,30,0.98)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "12px" }}>
                {opts.map(([v, l]) => (
                  <SelectItem key={v} value={v} style={{ fontFamily: "'Inter', sans-serif" }}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      <motion.div
        className="space-y-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header row */}
        <div
          className="grid items-center px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.5fr",
            fontFamily: "'JetBrains Mono', monospace",
            color: "rgba(124,58,237,0.5)",
          }}
        >
          <span>Resource</span>
          <span>Provider</span>
          <span>Region</span>
          <span>Status</span>
          <span className="text-right">Monthly Cost</span>
          <span className="pl-4">CPU / RAM</span>
        </div>

        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))
          : filteredResources.length === 0
          ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: "rgba(15,20,40,0.5)", border: "1px solid rgba(124,58,237,0.1)" }}
            >
              <Server className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(124,58,237,0.3)" }} />
              <div className="text-base font-semibold" style={{ fontFamily: "'Exo 2', sans-serif", color: "rgba(180,190,220,0.5)" }}>
                No resources found
              </div>
              <div className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(140,150,180,0.35)" }}>
                Try adjusting your filters
              </div>
            </div>
          )
          : filteredResources.map((res) => (
            <motion.div
              key={res.id}
              variants={itemAnim}
              className="grid items-center px-4 py-3.5 rounded-xl cursor-pointer transition-all"
              style={{
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.5fr",
                background: "rgba(15,20,40,0.7)",
                border: "1px solid rgba(124,58,237,0.1)",
                backdropFilter: "blur(12px)",
              }}
              whileHover={{
                background: "rgba(124,58,237,0.08)",
                borderColor: "rgba(124,58,237,0.25)",
                x: 3,
              }}
              onClick={() => setSelectedResourceId(res.id)}
            >
              {/* Resource name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${PROVIDER_COLORS[res.provider] || "#7c3aed"}15`,
                    border: `1px solid ${PROVIDER_COLORS[res.provider] || "#7c3aed"}30`,
                  }}
                >
                  {res.resourceType === "s3" || res.resourceType === "blob_storage"
                    ? <Database className="w-4 h-4" style={{ color: PROVIDER_COLORS[res.provider] || "#7c3aed" }} />
                    : res.resourceType === "lambda"
                    ? <Layers className="w-4 h-4" style={{ color: PROVIDER_COLORS[res.provider] || "#7c3aed" }} />
                    : <Server className="w-4 h-4" style={{ color: PROVIDER_COLORS[res.provider] || "#7c3aed" }} />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ fontFamily: "'Inter', sans-serif", color: "#c8d0e8" }}>
                    {res.name}
                  </div>
                  <div className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.45)", fontSize: "10px" }}>
                    {res.resourceType.toUpperCase()} · ID:{res.id}
                  </div>
                </div>
              </div>

              {/* Provider */}
              <div
                className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold uppercase w-fit"
                style={{
                  background: `${PROVIDER_COLORS[res.provider] || "#7c3aed"}15`,
                  color: PROVIDER_COLORS[res.provider] || "#7c3aed",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                }}
              >
                {res.provider}
              </div>

              {/* Region */}
              <div className="text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.5)" }}>
                {res.region}
              </div>

              {/* Status */}
              <StatusLED status={res.status} />

              {/* Cost */}
              <div className="text-right">
                <span className="font-black text-sm" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e8ecf5" }}>
                  {formatCurrency(res.monthlyCost)}
                </span>
              </div>

              {/* Utilization bars */}
              <div className="pl-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(140,150,180,0.35)" }} />
                  <NeonBar
                    value={res.cpuUtilization}
                    color={res.cpuUtilization > 80 ? "#ff4444" : res.cpuUtilization < 15 ? "#ff8228" : "#00f5ff"}
                  />
                  <span className="text-xs w-7 text-right" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.5)", fontSize: "10px" }}>
                    {res.cpuUtilization}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(140,150,180,0.35)" }} />
                  <NeonBar
                    value={res.memoryUtilization}
                    color={res.memoryUtilization > 80 ? "#ff4444" : res.memoryUtilization < 15 ? "#ff8228" : "#7c3aed"}
                  />
                  <span className="text-xs w-7 text-right" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.5)", fontSize: "10px" }}>
                    {res.memoryUtilization}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedResourceId} onOpenChange={(open) => !open && setSelectedResourceId(null)}>
        <SheetContent
          className="w-[420px] sm:w-[520px] sm:max-w-lg overflow-y-auto border-0"
          style={{
            background: "linear-gradient(180deg, rgba(8,12,28,0.99) 0%, rgba(5,8,20,0.99) 100%)",
            borderLeft: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(30px)",
          }}
        >
          {isLoadingDetails || !resourceDetails ? (
            <div className="space-y-4 py-8">
              <div className="h-8 w-3/4 rounded-xl shimmer" />
              <div className="h-4 w-1/2 rounded shimmer" />
              <div className="h-48 w-full rounded-xl shimmer mt-8" />
            </div>
          ) : (
            <>
              <SheetHeader className="pb-6" style={{ borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusLED status={resourceDetails.status} />
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg font-bold uppercase ml-1"
                    style={{
                      background: `${PROVIDER_COLORS[resourceDetails.provider] || "#7c3aed"}15`,
                      color: PROVIDER_COLORS[resourceDetails.provider] || "#7c3aed",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "10px",
                    }}
                  >
                    {resourceDetails.provider}
                  </span>
                  <span className="text-xs ml-auto" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.35)" }}>
                    ID:{resourceDetails.id}
                  </span>
                </div>
                <SheetTitle
                  className="text-xl font-black break-all leading-tight"
                  style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
                >
                  {resourceDetails.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-1 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)" }}>
                  <Server className="w-3 h-3" />
                  {resourceDetails.resourceType.toUpperCase()}
                  <span className="mx-1">·</span>
                  <Network className="w-3 h-3" />
                  {resourceDetails.region}
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Cost & Activity */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Monthly Cost", value: formatCurrency(resourceDetails.monthlyCost), color: "#00f5ff" },
                    { label: "Last Active", value: formatDate(resourceDetails.lastActive), color: "#ff8228", small: true },
                  ].map(({ label, value, color, small }) => (
                    <div
                      key={label}
                      className="p-4 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                    >
                      <div className="text-xs mb-1 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${color}70`, fontSize: "9px" }}>
                        {label}
                      </div>
                      <div
                        className={`font-black ${small ? "text-base" : "text-xl"}`}
                        style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Utilization */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
                    Utilization Metrics
                  </div>
                  <div className="space-y-4 p-4 rounded-xl" style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
                    {[
                      { icon: Cpu, label: "CPU", val: resourceDetails.cpuUtilization },
                      { icon: MemoryStick, label: "Memory", val: resourceDetails.memoryUtilization },
                    ].map(({ icon: Icon, label, val }) => (
                      <div key={label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(140,150,180,0.6)" }}>
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </span>
                          <span className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: val > 80 ? "#ff4444" : val < 15 ? "#ff8228" : "#00f5ff" }}>
                            {val}%
                          </span>
                        </div>
                        <NeonBar value={val} color={val > 80 ? "#ff4444" : val < 15 ? "#ff8228" : "#00f5ff"} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {resourceDetails.tags && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-3 pb-2 flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(124,58,237,0.6)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
                      <Tag className="w-3 h-3" />
                      Resource Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resourceDetails.tags.split(",").map((tag, idx) => {
                        const [key, val] = tag.split(":");
                        return (
                          <div
                            key={idx}
                            className="flex rounded-lg overflow-hidden text-xs"
                            style={{ fontFamily: "'JetBrains Mono', monospace", border: "1px solid rgba(124,58,237,0.2)" }}
                          >
                            <span className="px-2 py-1" style={{ background: "rgba(124,58,237,0.15)", color: "rgba(167,100,255,0.8)" }}>
                              {key?.trim()}
                            </span>
                            <span className="px-2 py-1" style={{ background: "rgba(124,58,237,0.06)", color: "#c8d0e8" }}>
                              {val?.trim() || "N/A"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
