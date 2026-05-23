import { useState } from "react";
import { useListAccounts, useCreateAccount, useDeleteAccount, getListAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/format";
import { Building2, Plus, Trash2, ShieldCheck, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form State
  const [provider, setProvider] = useState("aws");
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [region, setRegion] = useState("");

  const { data: accounts, isLoading } = useListAccounts();

  const createMutation = useCreateAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "Account Connected", description: "Successfully connected cloud account." });
        setIsAddOpen(false);
        // Reset form
        setName(""); setAccountId(""); setRegion(""); setProvider("aws");
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      },
      onError: () => {
        toast({ title: "Connection Failed", description: "Could not connect account.", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "Account Removed", description: "Successfully removed cloud account." });
        setDeleteConfirmId(null);
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      }
    }
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !accountId || !region) return;
    
    createMutation.mutate({
      data: { provider, name, accountId, region }
    });
  };

  const getProviderIcon = (prov: string) => {
    switch(prov.toLowerCase()) {
      case 'aws': return <span className="font-bold text-[#FF9900]">AWS</span>;
      case 'gcp': return <span className="font-bold text-[#4285F4]">GCP</span>;
      case 'azure': return <span className="font-bold text-[#0089D6]">AZURE</span>;
      default: return <span className="font-bold">{prov}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Connected Accounts
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">Manage cloud provider integrations and billing scopes</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] font-mono">
            <DialogHeader>
              <DialogTitle className="font-mono text-lg uppercase tracking-tight">Add Cloud Account</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                Provide read-only billing access credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-xs uppercase tracking-wider text-muted-foreground">Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider" className="font-mono">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aws">Amazon Web Services</SelectItem>
                    <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                    <SelectItem value="azure">Microsoft Azure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Alias / Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Production Core" 
                  className="font-mono"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId" className="text-xs uppercase tracking-wider text-muted-foreground">Account ID / Project ID</Label>
                <Input 
                  id="accountId" 
                  placeholder="e.g. 123456789012" 
                  className="font-mono"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="text-xs uppercase tracking-wider text-muted-foreground">Default Region</Label>
                <Input 
                  id="region" 
                  placeholder="e.g. us-east-1" 
                  className="font-mono"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="w-full font-mono bg-primary text-primary-foreground">
                  {createMutation.isPending ? "Connecting..." : "Connect Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Sync Status</p>
              <p className="font-mono font-bold text-foreground">All Healthy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-chart-4/10 flex items-center justify-center border border-chart-4/20 shrink-0">
              <Activity className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Last Ingestion</p>
              <p className="font-mono font-bold text-foreground">14 mins ago</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total Accounts</p>
              <p className="font-mono font-bold text-foreground">{accounts?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[250px]">Account Details</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[150px]">Provider</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[120px]">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider w-[150px]">Region</TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-wider text-right w-[150px]">Current Spend</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : accounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-mono">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-8 w-8 opacity-20 mb-2" />
                      <p>No accounts connected yet.</p>
                      <Button variant="link" onClick={() => setIsAddOpen(true)} className="text-primary mt-2 h-auto p-0">Connect your first account</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                accounts?.map((acc) => (
                  <TableRow key={acc.id} className="group">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-sm text-foreground">{acc.name}</span>
                        <span className="font-mono text-xs text-muted-foreground font-medium">ID: {acc.accountId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 border border-border inline-flex font-mono text-xs">
                        {getProviderIcon(acc.provider)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider border ${
                        acc.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 
                        'bg-muted text-muted-foreground border-border'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${acc.status === 'active' ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                        {acc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {acc.region}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {formatCurrency(acc.monthlyCost)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {deleteConfirmId === acc.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs font-mono"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8 px-2 text-xs font-mono"
                            onClick={() => deleteMutation.mutate({ id: acc.id })}
                            disabled={deleteMutation.isPending}
                          >
                            Confirm
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeleteConfirmId(acc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
