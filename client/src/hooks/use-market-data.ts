
import { useQuery } from "@tanstack/react-query";

interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
}

export function useMarketData(symbol: string) {
  return useQuery<MarketData>({
    queryKey: ["market", symbol],
    queryFn: async () => {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`);
      const data = await response.json();
      return {
        price: data[symbol.toLowerCase()].usd,
        change24h: data[symbol.toLowerCase()].usd_24h_change,
        volume24h: data[symbol.toLowerCase()].usd_24h_vol
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
