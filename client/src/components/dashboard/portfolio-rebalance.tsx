
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";

export function PortfolioRebalance() {
  const { toast } = useToast();
  const [targetAllocations, setTargetAllocations] = useState<Record<string, number>>({});

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ["/api/portfolio/assets"],
  });

  const rebalanceMutation = useMutation({
    mutationFn: async (allocations: Record<string, number>) => {
      const response = await fetch("/api/portfolio/rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations })
      });
      if (!response.ok) throw new Error("Failed to rebalance portfolio");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Portfolio Rebalanced",
        description: "Your portfolio has been successfully rebalanced."
      });
    }
  });

  const handleRebalance = () => {
    rebalanceMutation.mutate(targetAllocations);
  };

  const updateAllocation = (symbol: string, value: number) => {
    setTargetAllocations(prev => ({
      ...prev,
      [symbol]: value
    }));
  };

  const totalAllocation = Object.values(targetAllocations).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Current Allocation</TableHead>
              <TableHead>Target Allocation</TableHead>
              <TableHead>Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.map((asset: any) => (
              <TableRow key={asset.symbol}>
                <TableCell>{asset.symbol}</TableCell>
                <TableCell>{asset.allocation}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[targetAllocations[asset.symbol] || asset.allocation]}
                      onValueChange={([value]) => updateAllocation(asset.symbol, value)}
                      max={100}
                      step={1}
                    />
                    <span className="w-12 text-right">
                      {targetAllocations[asset.symbol] || asset.allocation}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {((targetAllocations[asset.symbol] || asset.allocation) - asset.allocation).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Total Allocation: {totalAllocation.toFixed(1)}%
          {totalAllocation !== 100 && (
            <span className="text-red-500 ml-2">
              (Must equal 100%)
            </span>
          )}
        </div>
        <Button 
          onClick={handleRebalance}
          disabled={totalAllocation !== 100 || rebalanceMutation.isPending}
        >
          {rebalanceMutation.isPending ? "Rebalancing..." : "Rebalance Portfolio"}
        </Button>
      </div>
    </div>
  );
}

export default PortfolioRebalance;
