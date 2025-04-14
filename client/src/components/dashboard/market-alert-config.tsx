
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export function MarketAlertConfig() {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('price');
  const [threshold, setThreshold] = useState('');

  const createAlert = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/alerts/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create alert');
      return response.json();
    }
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-medium">Configure Market Alert</h3>
        </div>
        
        <div className="space-y-4">
          <Input 
            placeholder="Enter symbol (e.g. BTC, ETH)" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          
          <Select value={type} onValueChange={setType}>
            <option value="price">Price Alert</option>
            <option value="volume">Volume Alert</option>
            <option value="trend">Trend Alert</option>
          </Select>
          
          <Input
            type="number"
            placeholder="Alert threshold"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          
          <Button 
            onClick={() => createAlert.mutate({ symbol, type, threshold })}
            disabled={createAlert.isPending}
          >
            Create Alert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
