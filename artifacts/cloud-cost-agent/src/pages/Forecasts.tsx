import { useState } from "react";
import { useListForecasts, useListAccounts } from "@workspace/api-client-react";
import { 
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ComposedChart, Line
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatCompactCurrency } from "@/lib/format";
import { TrendingUp, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";

export default function Forecasts() {
  const [accountId, setAccountId] = useState<string>("all");
  const [days, setDays] = useState<string>("30");

  const { data: accounts } = useListAccounts();
  const { data: forecasts, isLoading } = useListForecasts({
    accountId: accountId !== "all" ? Number(accountId) : null,
    days: Number(days)
  });

  // Calculate totals
  const currentTotal = forecasts ? forecasts[0]?.predictedCost || 0 : 0;
  const projectedTotal = forecasts ? forecasts[forecasts.length - 1]?.predictedCost || 0 : 0;
  const variance = projectedTotal - currentTotal;
  const variancePercent = currentTotal > 0 ? (variance / currentTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Cost Forecasts
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">Predictive cost modeling with confidence intervals</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="w-[200px] font-mono h-9">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts?.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>
                  {acc.name} ({acc.provider.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[120px] font-mono h-9">
              <SelectValue placeholder="30 Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Current Run Rate</span>
            <span className="text-3xl font-bold font-mono text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-9 w-32 mt-1" /> : formatCurrency(currentTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Projected EOP</span>
            <span className="text-3xl font-bold font-mono text-foreground tracking-tight">
              {isLoading ? <Skeleton className="h-9 w-32 mt-1" /> : formatCurrency(projectedTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Expected Variance</span>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold font-mono tracking-tight ${variance > 0 ? 'text-destructive' : 'text-chart-3'}`}>
                {isLoading ? <Skeleton className="h-9 w-32 mt-1" /> : `${variance > 0 ? '+' : ''}${formatCurrency(variance)}`}
              </span>
              {!isLoading && (
                <span className={`text-sm font-mono font-medium px-2 py-1 rounded bg-muted ${variance > 0 ? 'text-destructive' : 'text-chart-3'}`}>
                  {variance > 0 ? '↗' : '↘'} {Math.abs(variancePercent).toFixed(1)}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-mono uppercase tracking-wider">Cost Projection Model</CardTitle>
          <CardDescription className="font-mono text-xs">Based on historical usage patterns and active commitments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : forecasts && forecasts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecasts} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="forecastDate" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    minTickGap={40}
                  />
                  <YAxis 
                    tickFormatter={(val) => formatCompactCurrency(val)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ fontFamily: 'monospace', fontSize: '12px' }}
                    labelStyle={{ fontFamily: 'monospace', fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'predictedCost' ? 'Predicted' : name === 'confidenceHigh' ? 'Upper Bound' : 'Lower Bound'
                    ]}
                  />
                  
                  {/* Confidence Interval Band */}
                  <Area 
                    type="monotone" 
                    dataKey="confidenceHigh" 
                    stroke="none" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="confidenceLow" 
                    stroke="none" 
                    fill="hsl(var(--background))" 
                    fillOpacity={1} 
                  />
                  
                  {/* Main Prediction Line */}
                  <Line 
                    type="monotone" 
                    dataKey="predictedCost" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center flex-col text-muted-foreground font-mono">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>No forecast data available for selected parameters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-mono uppercase tracking-wider">Forecast Data Points</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Predicted Cost</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Lower Bound (95%)</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Upper Bound (95%)</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right">Variance Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : forecasts && forecasts.length > 0 ? (
                // Only show roughly 7-10 points to avoid long tables, pick evenly spaced
                forecasts.filter((_, i) => i % Math.max(1, Math.floor(forecasts.length / 10)) === 0 || i === forecasts.length - 1).map((forecast) => {
                  const variance = forecast.confidenceHigh - forecast.predictedCost;
                  const variancePercent = (variance / forecast.predictedCost) * 100;
                  
                  return (
                    <TableRow key={forecast.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {new Date(forecast.forecastDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-primary">
                        {formatCurrency(forecast.predictedCost)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(forecast.confidenceLow)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(forecast.confidenceHigh)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        ±{variancePercent.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-mono">
                    No data to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
