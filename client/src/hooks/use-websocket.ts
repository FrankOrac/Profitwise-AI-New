import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

interface WebSocketHook {
  isConnected: boolean;
  lastMessage: any;
  marketData: Record<string, MarketData>;
  subscribePrices: (symbols: string[]) => void;
  subscribeTrades: () => void;
}

export function useWebSocket(): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  const connect = useCallback(() => {
    if (!user?.id) return;

    const ws = new WebSocket(`ws://0.0.0.0:5000?userId=${user.id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        switch (data.type) {
          case 'PRICE_UPDATE':
            setMarketData(prev => ({
              ...prev,
              ...data.data
            }));
            break;
          case 'MARKET_UPDATE':
            setMarketData(prev => ({
              ...prev,
              [data.data.symbol]: {
                ...prev[data.data.symbol],
                price: data.data.price
              }
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [user?.id]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const subscribePrices = useCallback((symbols: string[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_PRICE',
        symbols
      }));
    }
  }, []);

  const subscribeTrades = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_TRADES'
      }));
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    marketData,
    subscribePrices,
    subscribeTrades
  };
}