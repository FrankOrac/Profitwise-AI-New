import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bitcoin, Coins } from "lucide-react";

interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  price: string;
  change: string;
  icon: string;
}

interface TopPerformersProps {
  className?: string;
}

export function TopPerformers({ className }: TopPerformersProps) {
  const [timeframe, setTimeframe] = useState("week");
  
  // Sample top performing assets
  const assets: Asset[] = [
    {
      id: 1,
      symbol: "ETH",
      name: "Ethereum",
      type: "Cryptocurrency",
      price: "$2,486.24",
      change: "+14.2%",
      icon: "ethereum",
    },
    {
      id: 2,
      symbol: "NVDA",
      name: "NVIDIA Corp",
      type: "Technology",
      price: "$482.16",
      change: "+8.7%",
      icon: "stock",
    },
    {
      id: 3,
      symbol: "MSFT",
      name: "Microsoft Corp",
      type: "Technology",
      price: "$328.79",
      change: "+5.3%",
      icon: "stock",
    },
    {
      id: 4,
      symbol: "BTC",
      name: "Bitcoin",
      type: "Cryptocurrency",
      price: "$38,245.16",
      change: "+4.8%",
      icon: "bitcoin",
    },
  ];
  
  const getAssetIcon = (icon: string) => {
    switch (icon) {
      case "ethereum":
        return <Coins className="text-slate-700" />;
      case "bitcoin":
        return <Bitcoin className="text-warning" />;
      case "stock":
      default:
        return <span className="font-bold text-slate-700">{assets.find(a => a.icon === icon)?.symbol || ""}</span>;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Top Performers</h2>
          <div>
            <Select 
              defaultValue={timeframe}
              onValueChange={setTimeframe}
            >
              <SelectTrigger className="h-8 text-sm w-auto">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">This Day</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="flex items-center justify-between py-3 border-b border-slate-100"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                  {getAssetIcon(asset.icon)}
                </div>
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-xs text-slate-500">{asset.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{asset.price}</div>
                <div className="text-xs font-medium text-success">{asset.change}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <a href="/portfolio" className="text-primary-600 text-sm font-medium flex items-center justify-center">
            View All Assets
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopPerformers;
