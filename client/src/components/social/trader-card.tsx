
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Star, TrendingUp, Copy } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TraderCardProps {
  trader: {
    id: number;
    name: string;
    avatar: string;
    winRate: number;
    followers: number;
    monthlyReturn: number;
    risk: "low" | "moderate" | "high";
    isFollowing?: boolean;
  };
  onFollow: (id: number) => void;
}

export function TraderCard({ trader, onFollow }: TraderCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCopying, setIsCopying] = useState(trader.isCopying || false);

  const [showSettings, setShowSettings] = useState(false);
  const [riskPercentage, setRiskPercentage] = useState(10);

  const copyTradeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/social/copy-trades/${trader.id}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskPercentage })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to copy trades");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Now copying ${trader.name}'s trades`
      });
      queryClient.invalidateQueries(["traders"]);
      setIsCopying(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to copy trades",
        variant: "destructive"
      });
    }
  });

  const stopCopyTradeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/social/copy-trades/${trader.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to stop copying trades");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Stopped copying ${trader.name}'s trades`
      });
      queryClient.invalidateQueries(["traders"]);
      setIsCopying(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to stop copying trades",
        variant: "destructive"
      });
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-success/20 text-success";
      case "moderate":
        return "bg-warning/20 text-warning";
      case "high":
        return "bg-error/20 text-error";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <img
          src={trader.avatar}
          alt={trader.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{trader.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            <span>{trader.followers} followers</span>
          </div>
        </div>
        <Button 
          onClick={() => onFollow(trader.id)} 
          variant={trader.isFollowing ? "secondary" : "outline"} 
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {trader.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-600">Win Rate</div>
            <div className="font-semibold flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              {trader.winRate}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-slate-600">Monthly Return</div>
            <div className="font-semibold flex items-center text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trader.monthlyReturn}%
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Badge className={getRiskColor(trader.risk)}>
            {trader.risk.charAt(0).toUpperCase() + trader.risk.slice(1)} Risk
          </Badge>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                variant={isCopying ? "destructive" : "outline"}
                size="sm"
                onClick={() => isCopying ? stopCopyTradeMutation.mutate() : setShowSettings(true)}
                disabled={copyTradeMutation.isLoading || stopCopyTradeMutation.isLoading}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isCopying ? 'Stop Copying' : 'Copy Trades'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copy Trading Settings</DialogTitle>
                <DialogDescription>
                  Configure how much of your portfolio to risk per trade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="risk">Risk per trade (%)</Label>
                  <Input
                    id="risk"
                    type="number"
                    value={riskPercentage}
                    onChange={(e) => setRiskPercentage(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => copyTradeMutation.mutate()}>
                  Start Copy Trading
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default TraderCard;
