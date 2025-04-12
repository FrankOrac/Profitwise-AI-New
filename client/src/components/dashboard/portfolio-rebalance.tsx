import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Asset {
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  value: number;
}

export default function PortfolioRebalance() {
  const [isRebalancing, setIsRebalancing] = useState(false);

  const { data: portfolio } = useQuery<Asset[]>({
    queryKey: ["/api/portfolio"],
  });

  const rebalanceMutation = useMutation({
    mutationFn: async (assets: Asset[]) => {
      const response = await fetch("/api/portfolio/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets })
      });
      if (!response.ok) throw new Error("Failed to rebalance portfolio");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Portfolio rebalanced successfully" });
      setIsRebalancing(false);
    },
    onError: () => {
      toast({ title: "Failed to rebalance portfolio", variant: "destructive" });
      setIsRebalancing(false);
    }
  });

  const handleRebalance = () => {
    if (!portfolio) return;
    setIsRebalancing(true);
    rebalanceMutation.mutate(portfolio);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Portfolio Rebalancing</h3>
      <div className="space-y-4">
        {portfolio?.map((asset) => (
          <div key={asset.symbol} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{asset.symbol}</p>
              <p className="text-sm text-slate-500">
                Current: {asset.currentAllocation}% | Target: {asset.targetAllocation}%
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${asset.value.toFixed(2)}</p>
              <p className="text-sm text-slate-500">
                Diff: {(asset.targetAllocation - asset.currentAllocation).toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
      <Button 
        className="w-full mt-4" 
        onClick={handleRebalance}
        disabled={isRebalancing}
      >
        {isRebalancing ? "Rebalancing..." : "Rebalance Portfolio"}
      </Button>
    </Card>
  );
}