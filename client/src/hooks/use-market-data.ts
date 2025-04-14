import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "./use-websocket";
import { useEffect } from "react";

interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
}

export function useMarketData(symbol: string) {
  const ws = useWebSocket();

  const { data, refetch } = useQuery<MarketData>({
    queryKey: ["/api/market-data", symbol],
    staleTime: 30000,
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
  });

  useEffect(() => {
    if (!ws) return;

    ws.send(JSON.stringify({
      type: "subscribe",
      channel: `price:${symbol}`,
    }));

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "price" && data.symbol === symbol) {
        refetch();
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.send(JSON.stringify({
        type: "unsubscribe",
        channel: `price:${symbol}`,
      }));
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, symbol, refetch]);

  return { data };
}