
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface TargetAllocation {
  type: string;
  target: number;
  current: number;
}

export default function PortfolioRebalance() {
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [allocations, setAllocations] = useState<TargetAllocation[]>([
    { type: "Stocks", target: 60, current: 65 },
    { type: "Crypto", target: 20, current: 15 },
    { type: "Bonds", target: 15, current: 12 },
    { type: "Cash", target: 5, current: 8 }
  ]);

  const handleRebalance = async () => {
    setIsRebalancing(true);
    try {
      const response = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations })
      });
      
      if (!response.ok) throw new Error('Rebalance failed');
      
      // Refresh allocations after rebalance
      const result = await response.json();
      setAllocations(result.newAllocations);
    } catch (error) {
      console.error('Rebalancing error:', error);
    } finally {
      setIsRebalancing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {allocations.map((allocation) => (
          <div key={allocation.type} className="flex items-center gap-4">
            <div className="w-24 font-medium">{allocation.type}</div>
            <Input
              type="number"
              value={allocation.target}
              onChange={(e) => {
                const newAllocations = allocations.map(a => 
                  a.type === allocation.type 
                    ? { ...a, target: Number(e.target.value) }
                    : a
                );
                setAllocations(newAllocations);
              }}
              className="w-24"
            />
            <div className="text-sm text-slate-500">
              Current: {allocation.current}%
            </div>
            {Math.abs(allocation.target - allocation.current) > 5 && (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
          </div>
        ))}
      </div>

      {allocations.reduce((sum, a) => sum + a.target, 0) !== 100 && (
        <Alert variant="destructive">
          <AlertDescription>
            Target allocations must sum to 100%
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleRebalance} 
        disabled={isRebalancing || allocations.reduce((sum, a) => sum + a.target, 0) !== 100}
      >
        {isRebalancing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
        Rebalance Portfolio
      </Button>
    </div>
  );
}
