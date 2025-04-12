
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TradeEntry {
  id: string;
  symbol: string;
  entry: number;
  exit: number;
  strategy: string;
  notes: string;
  analysis: string;
}

export function TradeJournal() {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const { toast } = useToast();
  
  const analyzeTrade = async (trade: Partial<TradeEntry>) => {
    // This would connect to your AI backend
    return "Based on your entry and exit points, consider waiting for stronger confirmation of trend reversal. Your success rate with this strategy could improve by 15% by implementing stricter stop-loss rules.";
  };

  const addTrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTrade = {
      id: Date.now().toString(),
      symbol: formData.get('symbol') as string,
      entry: Number(formData.get('entry')),
      exit: Number(formData.get('exit')),
      strategy: formData.get('strategy') as string,
      notes: formData.get('notes') as string,
    };

    const analysis = await analyzeTrade(newTrade);
    setTrades([...trades, { ...newTrade, analysis }]);
    
    toast({
      title: "Trade Added",
      description: "Your trade has been logged and analyzed.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Trade Journal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTrade} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input name="symbol" placeholder="Symbol (e.g. BTC/USD)" required />
            <Input name="entry" type="number" placeholder="Entry Price" required />
            <Input name="exit" type="number" placeholder="Exit Price" required />
            <Input name="strategy" placeholder="Strategy Used" required />
          </div>
          <Textarea name="notes" placeholder="Trade Notes" />
          <Button type="submit">Log Trade</Button>
        </form>
        
        <div className="mt-6 space-y-4">
          {trades.map((trade) => (
            <Card key={trade.id}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{trade.symbol}</span>
                  <span className={trade.exit > trade.entry ? 'text-green-500' : 'text-red-500'}>
                    {((trade.exit - trade.entry) / trade.entry * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{trade.notes}</p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-medium">AI Analysis:</p>
                  <p className="text-sm text-slate-600">{trade.analysis}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
