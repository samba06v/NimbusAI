import { useState } from "react";
import { useListAlerts, useResolveAlert, getListAlertsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusTab, setStatusTab] = useState("unresolved");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isResolved = statusTab === "resolved";
  const { data: alerts, isLoading } = useListAlerts({ 
    resolved: isResolved,
    severity: severityFilter !== "all" ? severityFilter : null 
  });

  const resolveMutation = useResolveAlert({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Alert Resolved",
          description: "The alert has been marked as resolved.",
        });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({ resolved: false }) });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey({ resolved: true }) });
      }
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-chart-4" />;
      case 'info': return <Info className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'warning': return 'bg-chart-4/10 border-chart-4/20 text-chart-4';
      case 'info': return 'bg-primary/10 border-primary/20 text-primary';
      default: return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Cost Anomalies & Alerts
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">Real-time detection of unexpected spending spikes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={statusTab} onValueChange={setStatusTab} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2 font-mono h-10">
            <TabsTrigger value="unresolved">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px] font-mono h-10">
            <SelectValue placeholder="Filter by Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 mt-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 mt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : alerts && alerts.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
              >
                <Card className={`overflow-hidden border-l-4 ${
                  alert.severity === 'critical' ? 'border-l-destructive' :
                  alert.severity === 'warning' ? 'border-l-chart-4' :
                  'border-l-primary'
                }`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 p-5">
                      <div className="hidden sm:flex h-12 w-12 rounded-full items-center justify-center shrink-0 border bg-background mb-4 sm:mb-0">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </Badge>
                          {alert.resolved && (
                            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-muted text-muted-foreground border-border">
                              Resolved
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground font-mono flex items-center ml-auto">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-mono font-bold text-foreground mb-1 leading-tight">
                          {alert.title}
                        </h3>
                        <p className="text-sm text-foreground/80 font-mono mb-4">
                          {alert.message}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-6 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estimated Impact</span>
                            <span className="font-mono font-bold text-sm text-foreground">
                              {formatCurrency(alert.estimatedImpact)}
                            </span>
                          </div>
                          
                          {!alert.resolved && (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="ml-auto font-mono text-xs h-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                              onClick={() => resolveMutation.mutate({ id: alert.id })}
                              disabled={resolveMutation.isPending}
                            >
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark as Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="border-dashed border-2 bg-transparent mt-8">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="font-mono text-lg font-medium text-foreground">No alerts found</h3>
              <p className="font-mono text-sm text-muted-foreground mt-2">
                {isResolved 
                  ? "There are no resolved alerts matching your filters." 
                  : "All quiet on the western front. No active cost anomalies detected."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
