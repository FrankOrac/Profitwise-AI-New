import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { RebalanceSettings } from "@shared/schema";

interface AllocationInput {
  symbol: string;
  allocation: number;
}

export function PortfolioRebalance() {
  const [allocations, setAllocations] = useState<AllocationInput[]>([]);
  const [threshold, setThreshold] = useState(0.05);
  const [autoTrade, setAutoTrade] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rebalanceMutation = useMutation({
    mutationFn: async (settings: RebalanceSettings) => {
      const response = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('Failed to rebalance portfolio');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Portfolio rebalancing initiated"
      });
      queryClient.invalidateQueries(['portfolio']);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to rebalance portfolio",
        variant: "destructive"
      });
    }
  });

  const handleRebalance = () => {
    const targetAllocations = allocations.reduce((acc, { symbol, allocation }) => {
      acc[symbol] = allocation / 100;
      return acc;
    }, {} as Record<string, number>);

    rebalanceMutation.mutate({
      targetAllocations,
      threshold,
      autoTrade
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Rebalance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allocations.map((allocation, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                placeholder="Symbol"
                value={allocation.symbol}
                onChange={(e) => {
                  const newAllocations = [...allocations];
                  newAllocations[index].symbol = e.target.value;
                  setAllocations(newAllocations);
                }}
              />
              <Input
                type="number"
                placeholder="Allocation %"
                value={allocation.allocation}
                onChange={(e) => {
                  const newAllocations = [...allocations];
                  newAllocations[index].allocation = parseFloat(e.target.value);
                  setAllocations(newAllocations);
                }}
              />
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setAllocations([...allocations, { symbol: '', allocation: 0 }])}
          >
            Add Asset
          </Button>

          <div className="flex items-center space-x-2 mt-4">
            <Switch
              id="auto-trade"
              checked={autoTrade}
              onCheckedChange={setAutoTrade}
            />
            <Label htmlFor="auto-trade">Auto-execute trades</Label>
          </div>

          <div className="mt-4">
            <Label>Rebalance Threshold (%)</Label>
            <Input
              type="number"
              value={threshold * 100}
              onChange={(e) => setThreshold(parseFloat(e.target.value) / 100)}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleRebalance}
            disabled={rebalanceMutation.isLoading}
            className="mt-4"
          >
            {rebalanceMutation.isLoading ? 'Rebalancing...' : 'Rebalance Portfolio'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
export default PortfolioRebalance;