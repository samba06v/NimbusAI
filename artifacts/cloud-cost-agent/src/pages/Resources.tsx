import { useState, useMemo } from "react";
import { useListResources, useGetResource, getGetResourceQueryKey } from "@workspace/api-client-react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Filter, Server, Cpu, MemoryStick, Activity, Tag, Network } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Resources() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

  const { data: resources, isLoading } = useListResources();
  
  const { data: resourceDetails, isLoading: isLoadingDetails } = useGetResource(
    selectedResourceId as number,
    {
      query: {
        enabled: !!selectedResourceId,
        queryKey: selectedResourceId ? getGetResourceQueryKey(selectedResourceId) : ["none"]
      }
    }
  );

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter(res => {
      const matchesSearch = search ? res.name.toLowerCase().includes(search.toLowerCase()) || res.id.toString().includes(search) : true;
      const matchesProvider = providerFilter !== "all" ? res.provider === providerFilter : true;
      const matchesStatus = statusFilter !== "all" ? res.status === statusFilter : true;
      const matchesType = typeFilter !== "all" ? res.resourceType === typeFilter : true;
      return matchesSearch && matchesProvider && matchesStatus && matchesType;
    });
  }, [resources, search, providerFilter, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight">Cloud Resources</h2>
          <p className="text-sm text-muted-foreground font-mono">Inventory and utilization across all connected providers</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-muted-foreground">Total Resources:</span>
          <Badge variant="secondary">{resources?.length || 0}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                className="pl-9 font-mono"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border text-sm font-mono">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filters</span>
              </div>
              
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-[140px] font-mono h-9">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] font-mono h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] font-mono h-9">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ec2">EC2</SelectItem>
                  <SelectItem value="rds">RDS</SelectItem>
                  <SelectItem value="s3">S3</SelectItem>
                  <SelectItem value="lambda">Lambda</SelectItem>
                  <SelectItem value="gce">GCE</SelectItem>
                  <SelectItem value="blob_storage">Blob Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[250px]">Resource</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[100px]">Provider</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[120px]">Region</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[100px]">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right w-[120px]">Monthly Cost</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[200px]">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-mono">
                    No resources found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((res) => (
                  <TableRow 
                    key={res.id} 
                    className="group cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelectedResourceId(res.id)}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-medium text-sm truncate max-w-[230px] group-hover:text-primary transition-colors">{res.name}</span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                          <span className="bg-muted px-1 rounded">{res.resourceType}</span>
                          <span>ID: {res.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono uppercase text-[10px] bg-background">
                        {res.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {res.region}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border ${
                        res.status === 'idle' ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 
                        res.status === 'unused' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                        res.status === 'stopped' ? 'bg-muted text-muted-foreground border-border' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {formatCurrency(res.monthlyCost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Progress 
                            value={res.cpuUtilization} 
                            className="h-1.5"
                            indicatorClassName={res.cpuUtilization > 80 ? "bg-destructive" : res.cpuUtilization < 10 ? "bg-chart-4" : "bg-primary"}
                          />
                          <span className="font-mono text-[10px] w-8 text-right">{res.cpuUtilization}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MemoryStick className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Progress 
                            value={res.memoryUtilization} 
                            className="h-1.5"
                            indicatorClassName={res.memoryUtilization > 80 ? "bg-destructive" : res.memoryUtilization < 10 ? "bg-chart-4" : "bg-primary"}
                          />
                          <span className="font-mono text-[10px] w-8 text-right">{res.memoryUtilization}%</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedResourceId} onOpenChange={(open) => !open && setSelectedResourceId(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] border-l-border bg-background sm:max-w-md overflow-y-auto">
          {isLoadingDetails || !resourceDetails ? (
            <div className="space-y-6 py-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-[200px] w-full mt-8" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          ) : (
            <>
              <SheetHeader className="pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border ${
                    resourceDetails.status === 'idle' ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 
                    resourceDetails.status === 'unused' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                    resourceDetails.status === 'stopped' ? 'bg-muted text-muted-foreground border-border' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {resourceDetails.status}
                  </Badge>
                  <Badge variant="outline" className="font-mono uppercase text-[10px] bg-background">
                    {resourceDetails.provider}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                    ID: {resourceDetails.id}
                  </span>
                </div>
                <SheetTitle className="text-xl font-mono text-primary break-all leading-tight">
                  {resourceDetails.name}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs flex items-center gap-2 mt-2">
                  <Server className="h-3 w-3" />
                  {resourceDetails.resourceType.toUpperCase()}
                  <span className="mx-1">•</span>
                  <Network className="h-3 w-3" />
                  {resourceDetails.region}
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-3 border border-border rounded-md bg-card">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">Monthly Cost</p>
                    <p className="text-xl font-bold font-mono tracking-tight text-foreground">
                      {formatCurrency(resourceDetails.monthlyCost)}
                    </p>
                  </div>
                  <div className="space-y-1 p-3 border border-border rounded-md bg-card">
                    <p className="text-[10px] font-mono uppercase text-muted-foreground">Last Active</p>
                    <p className="text-sm font-bold font-mono tracking-tight text-foreground mt-1 flex items-center gap-1">
                      <Activity className="h-4 w-4 text-chart-4" />
                      {formatDate(resourceDetails.lastActive)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold font-mono uppercase tracking-wider border-b border-border pb-2">
                    Utilization Metrics
                  </h4>
                  <div className="space-y-4 p-4 border border-border rounded-md bg-card/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-muted-foreground" /> CPU</span>
                        <span className="font-bold">{resourceDetails.cpuUtilization}%</span>
                      </div>
                      <Progress 
                        value={resourceDetails.cpuUtilization} 
                        className="h-2"
                        indicatorClassName={resourceDetails.cpuUtilization > 80 ? "bg-destructive" : resourceDetails.cpuUtilization < 10 ? "bg-chart-4" : "bg-primary"}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-1.5"><MemoryStick className="h-3.5 w-3.5 text-muted-foreground" /> Memory</span>
                        <span className="font-bold">{resourceDetails.memoryUtilization}%</span>
                      </div>
                      <Progress 
                        value={resourceDetails.memoryUtilization} 
                        className="h-2"
                        indicatorClassName={resourceDetails.memoryUtilization > 80 ? "bg-destructive" : resourceDetails.memoryUtilization < 10 ? "bg-chart-4" : "bg-primary"}
                      />
                    </div>
                  </div>
                </div>

                {resourceDetails.tags && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold font-mono uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Resource Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resourceDetails.tags.split(',').map((tag, idx) => {
                        const [key, val] = tag.split(':');
                        return (
                          <div key={idx} className="flex border border-border rounded-md overflow-hidden text-xs font-mono bg-background">
                            <span className="px-2 py-1 bg-muted border-r border-border text-muted-foreground">{key?.trim()}</span>
                            <span className="px-2 py-1 font-medium">{val?.trim() || 'N/A'}</span>
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
