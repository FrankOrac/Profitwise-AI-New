
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMarketData } from "@/hooks/use-market-data";

const TOKENS = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "WBTC", name: "Wrapped Bitcoin" },
  { symbol: "DAI", name: "Dai Stablecoin" }
];

export function TokenSwap() {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState(TOKENS[0].symbol);
  const [toToken, setToToken] = useState(TOKENS[1].symbol);
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  
  const { data: fromTokenData } = useMarketData(fromToken);
  const { data: toTokenData } = useMarketData(toToken);

  const handleSwap = async () => {
    if (!amount) return;
    
    setIsSwapping(true);
    try {
      const response = await fetch("/api/web3/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount
        })
      });
      
      if (!response.ok) throw new Error();
      
      toast({
        title: "Swap successful",
        description: `Swapped ${amount} ${fromToken} to ${toToken}`
      });
      
      setAmount("");
    } catch (error) {
      toast({
        title: "Swap failed",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">From</label>
              {fromTokenData && (
                <span className="text-sm text-slate-500">
                  1 {fromToken} = ${fromTokenData.price}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1"
              />
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">To</label>
              {toTokenData && (
                <span className="text-sm text-slate-500">
                  1 {toToken} = ${toTokenData.price}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={amount ? (Number(amount) * (fromTokenData?.price || 0) / (toTokenData?.price || 1)).toFixed(6) : ""}
                readOnly
                placeholder="0.0"
                className="flex-1"
              />
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleSwap}
          disabled={isSwapping || !amount}
        >
          {isSwapping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Swap Tokens
        </Button>
      </CardContent>
    </Card>
  );
}
