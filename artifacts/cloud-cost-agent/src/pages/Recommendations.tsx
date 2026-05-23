import { useState, useMemo } from "react";
import { 
  useListRecommendations, 
  useApplyRecommendation, 
  useDismissRecommendation 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListRecommendationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { Lightbulb, Zap, Trash2, Shield, Calendar, ArrowRight, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function Recommendations() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useListRecommendations({ status: "pending" });
  
  const applyMutation = useApplyRecommendation({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Recommendation Applied",
          description: "The resource optimization has been initiated.",
        });
        queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey({ status: "pending" }) });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to apply recommendation.",
          variant: "destructive"
        });
      }
    }
  });

  const dismissMutation = useDismissRecommendation({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Recommendation Dismissed",
          description: "This recommendation will not be shown again.",
        });
        queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey({ status: "pending" }) });
      }
    }
  });

  const filteredRecs = useMemo(() => {
    if (!recommendations) return [];
    if (priorityFilter === "all") return recommendations;
    return recommendations.filter(r => r.priority === priorityFilter);
  }, [recommendations, priorityFilter]);

  const totalPotentialSavings = filteredRecs.reduce((acc, curr) => acc + curr.estimatedMonthlySavings, 0);

  const getIconForType = (type: string) => {
    switch(type) {
      case 'shutdown': return <Zap className="h-5 w-5 text-chart-4" />;
      case 'delete': return <Trash2 className="h-5 w-5 text-destructive" />;
      case 'resize_down': return <ArrowRight className="h-5 w-5 text-primary" />;
      case 'reserved_instance': return <Shield className="h-5 w-5 text-chart-3" />;
      case 'schedule': return <Calendar className="h-5 w-5 text-chart-2" />;
      default: return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Active Recommendations
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">AI-generated suggestions to optimize your cloud spend</p>
        </div>
        
        <div className="flex items-center gap-6 bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Potential Savings</span>
            <span className="text-2xl font-bold font-mono text-chart-3">{formatCurrency(totalPotentialSavings)}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
          </div>
          <div className="h-10 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Pending Actions</span>
            <span className="text-2xl font-bold font-mono text-foreground">{filteredRecs.length}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px] font-mono h-9">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2"><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg font-medium text-foreground">All caught up!</h3>
            <p className="font-mono text-sm text-muted-foreground mt-2 max-w-sm">
              Your infrastructure is fully optimized based on our current heuristics. Check back later for new recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRecs.map((rec) => (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <Card className="flex flex-col h-full overflow-hidden group hover:border-primary/50 transition-colors duration-300">
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-muted rounded-md border border-border shrink-0">
                        {getIconForType(rec.recommendationType)}
                      </div>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-mono leading-tight">{rec.resourceName}</CardTitle>
                    <CardDescription className="font-mono text-xs flex items-center gap-2 mt-1">
                      <span className="uppercase">{rec.provider}</span>
                      <span className="text-border">•</span>
                      <span className="uppercase text-muted-foreground">{rec.recommendationType.replace('_', ' ')}</span>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-foreground/80 font-mono mb-4 leading-relaxed line-clamp-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto bg-muted/30 p-3 rounded-md border border-border">
                      <span className="text-xs font-mono text-muted-foreground uppercase">Est. Savings</span>
                      <span className="font-mono font-bold text-chart-3 text-lg">{formatCurrency(rec.estimatedMonthlySavings)}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-0">
                    <Button 
                      variant="outline" 
                      className="flex-1 font-mono text-xs border-dashed"
                      onClick={() => dismissMutation.mutate({ id: rec.id })}
                      disabled={dismissMutation.isPending || applyMutation.isPending}
                    >
                      <X className="mr-2 h-3 w-3" /> Dismiss
                    </Button>
                    <Button 
                      className="flex-1 font-mono text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => applyMutation.mutate({ id: rec.id })}
                      disabled={applyMutation.isPending || dismissMutation.isPending}
                    >
                      <Zap className="mr-2 h-3 w-3" /> Apply Fix
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
