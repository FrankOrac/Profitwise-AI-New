
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, RefreshCw, Zap } from "lucide-react";

interface Asset {
  symbol: string;
  currentAllocation: number;
  targetAllocation: number;
  value: number;
}

export function PortfolioRebalance() {
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: "AAPL", currentAllocation: 25, targetAllocation: 20, value: 12500 },
    { symbol: "GOOGL", currentAllocation: 15, targetAllocation: 20, value: 7500 },
    { symbol: "MSFT", currentAllocation: 30, targetAllocation: 25, value: 15000 },
    { symbol: "AMZN", currentAllocation: 30, targetAllocation: 35, value: 15000 },
  ]);

  const updateTargetAllocation = (index: number, newValue: number) => {
    const newAssets = [...assets];
    newAssets[index].targetAllocation = newValue;
    setAssets(newAssets);
  };

  const calculateRebalancing = () => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    return assets.map(asset => {
      const targetValue = (totalValue * asset.targetAllocation) / 100;
      const difference = targetValue - asset.value;
      return {
        symbol: asset.symbol,
        action: difference > 0 ? "Buy" : "Sell",
        amount: Math.abs(difference).toFixed(2),
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Portfolio Rebalancing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {assets.map((asset, index) => (
            <div key={asset.symbol} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{asset.symbol}</div>
                <div className="text-sm text-slate-600">
                  Current: {asset.currentAllocation}% <ArrowRight className="inline h-4 w-4 mx-1" /> Target: {asset.targetAllocation}%
                </div>
              </div>
              <Slider
                value={[asset.targetAllocation]}
                onValueChange={(value) => updateTargetAllocation(index, value[0])}
                max={100}
                step={1}
              />
            </div>
          ))}

          <div className="mt-6 space-y-4">
            <div className="text-sm font-medium">Rebalancing Actions:</div>
            {calculateRebalancing().map(({ symbol, action, amount }) => (
              <div
                key={symbol}
                className={`flex items-center justify-between p-2 rounded ${
                  action === "Buy" ? "bg-success/10" : "bg-error/10"
                }`}
              >
                <span className="font-medium">{symbol}</span>
                <span className={action === "Buy" ? "text-success" : "text-error"}>
                  {action} ${amount}
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4">
            <Zap className="h-4 w-4 mr-2" />
            Execute Rebalancing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PortfolioRebalance;
