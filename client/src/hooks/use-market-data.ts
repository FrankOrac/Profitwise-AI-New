
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
      const response = await fetch(`/api/market-data/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      return {
        price: data.price,
        change24h: data.changePercent,
        volume24h: data.volume
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
