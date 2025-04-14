
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

export default function PortfolioRebalance() {
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const rebalanceMutation = useMutation({
    mutationFn: async (data: Record<string, number>) => {
      const response = await fetch('/api/portfolio/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to rebalance portfolio');
      return response.json();
    }
  });

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">Portfolio Rebalancing</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="BTC allocation (%)"
              type="number"
              onChange={(e) => setAllocations(prev => ({
                ...prev,
                BTC: Number(e.target.value)
              }))}
            />
            <Input
              placeholder="ETH allocation (%)"
              type="number"
              onChange={(e) => setAllocations(prev => ({
                ...prev,
                ETH: Number(e.target.value)
              }))}
            />
          </div>

          <Button 
            onClick={() => rebalanceMutation.mutate(allocations)}
            disabled={rebalanceMutation.isPending}
          >
            Rebalance Portfolio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
