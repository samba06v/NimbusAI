import { 
  useGetDashboardSummary, 
  useGetCostTrend, 
  useGetSpendingByProvider, 
  useGetSpendingByService,
  useGetTopCostlyResources,
  useListAlerts
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactCurrency, formatCurrency, formatPercent } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, 
  Bar, BarChart, PieChart, Pie, Cell, Legend
} from "recharts";
import { ArrowDownIcon, ArrowUpIcon, AlertTriangle, AlertCircle, Info, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
    aws: "hsl(var(--chart-4))", 
    gcp: "hsl(var(--chart-1))", 
    azure: "hsl(var(--chart-2))"
  };

  const SERVICE_COLORS = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", 
    "hsl(var(--chart-4))", "hsl(var(--chart-5))"
  ];

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Alerts Strip */}
      {activeAlerts.length > 0 && (
        <motion.div variants={item} className="flex flex-col gap-2">
          {activeAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-md border text-sm font-mono ${
                alert.severity === 'critical' ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' :
                alert.severity === 'warning' ? 'bg-chart-4/10 border-chart-4/20 text-foreground' :
                'bg-primary/10 border-primary/20 text-foreground'
              }`}
            >
              {alert.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-destructive" /> : 
               alert.severity === 'warning' ? <AlertCircle className="h-4 w-4 text-chart-4" /> : 
               <Info className="h-4 w-4 text-primary" />}
              <span className="font-semibold">{alert.title}</span>
              <span className="text-muted-foreground truncate flex-1">{alert.message}</span>
              <span className="font-bold whitespace-nowrap ml-auto">Impact: {formatCurrency(alert.estimatedImpact)}</span>
              <Link href="/alerts" className="underline underline-offset-4 ml-4 font-medium opacity-80 hover:opacity-100">
                View
              </Link>
            </div>
          ))}
        </motion.div>
      )}

      {/* Top Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Monthly Spend" 
          value={summary?.totalMonthlyCost} 
          isLoading={isLoadingSummary}
          prefix={<span className="text-muted-foreground text-sm font-normal mr-1">MTD</span>}
          change={summary?.costChangePercent}
        />
        <SummaryCard 
          title="Projected Cost" 
          value={summary?.projectedMonthCost} 
          isLoading={isLoadingSummary}
          prefix={<span className="text-muted-foreground text-sm font-normal mr-1">EOM</span>}
        />
        <SummaryCard 
          title="Potential Savings" 
          value={summary?.potentialMonthlySavings} 
          isLoading={isLoadingSummary}
          valueColor="text-chart-3"
          icon={<Zap className="h-4 w-4 text-chart-3" />}
        />
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium font-mono text-muted-foreground">Resource Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
                  {summary?.idleResources + summary?.unusedResources} <span className="text-sm text-muted-foreground font-normal">wasted</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-chart-4" /> {summary?.idleResources} Idle</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> {summary?.unusedResources} Unused</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost Trend Chart */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-muted-foreground">30-Day Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {costTrend ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={costTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        tickFormatter={(val) => formatCompactCurrency(val)}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'monospace' }}
                        formatter={(value: number) => [formatCurrency(value), 'Cost']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-full w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provider Breakdown */}
        <motion.div variants={item}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Spend by Provider</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
              {byProvider ? (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byProvider}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="monthlyCost"
                          nameKey="provider"
                          stroke="none"
                        >
                          {byProvider.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PROVIDER_COLORS[entry.provider] || SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-3">
                    {byProvider.map((provider) => (
                      <div key={provider.provider} className="flex items-center justify-between font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: PROVIDER_COLORS[provider.provider] }}></span>
                          <span className="uppercase">{provider.provider}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{provider.percentage}%</span>
                          <span className="font-semibold">{formatCompactCurrency(provider.monthlyCost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Breakdown */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-2">
                {byService ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byService} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="service" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'monospace' }}
                        width={80}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      />
                      <Bar dataKey="monthlyCost" radius={[0, 4, 4, 0]} barSize={20}>
                        {byService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-full w-full" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Costly Resources */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Top Expensive Resources</CardTitle>
              <Link href="/resources" className="text-xs font-mono text-primary hover:underline underline-offset-4">View All</Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {topResources ? (
                  topResources.slice(0, 5).map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <span className="font-mono font-medium text-sm text-foreground truncate">{resource.name}</span>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                          <span className="uppercase text-[10px] bg-muted px-1.5 py-0.5 rounded">{resource.provider}</span>
                          <span>{resource.resourceType}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-mono font-bold text-sm text-foreground">{formatCurrency(resource.monthlyCost)}</span>
                        <Badge variant="outline" className={`font-mono text-[10px] h-4 py-0 ${
                          resource.status === 'idle' ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 
                          resource.status === 'unused' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {resource.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SummaryCard({ title, value, isLoading, prefix, change, valueColor = "text-foreground", icon }: any) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium font-mono text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="flex flex-col gap-1">
            <div className={`text-2xl font-bold font-mono tracking-tight ${valueColor}`}>
              {prefix}
              {value != null ? formatCurrency(value) : "—"}
            </div>
            {change != null && (
              <div className="flex items-center gap-1 text-xs font-mono">
                {change > 0 ? (
                  <span className="flex items-center text-destructive"><ArrowUpIcon className="h-3 w-3 mr-0.5"/>{change}% from last mo</span>
                ) : change < 0 ? (
                  <span className="flex items-center text-chart-3"><ArrowDownIcon className="h-3 w-3 mr-0.5"/>{Math.abs(change)}% from last mo</span>
                ) : (
                  <span className="text-muted-foreground">0% from last mo</span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
