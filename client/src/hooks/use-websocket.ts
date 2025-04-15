import { useState, useEffect, useCallback, useRef } from 'react';

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
  sendMessage: (message: any) => void;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}

export function useWebSocket(url: string): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        if (data.type === 'price_update') {
          setMarketData(prev => ({
            ...prev,
            ...data.data.reduce((acc: Record<string, MarketData>, update: any) => {
              acc[update.symbol] = update.data;
              return acc;
            }, {})
          }));
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [url]);

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

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    sendMessage({
      type: 'subscribe',
      symbols
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((symbols: string[]) => {
    sendMessage({
      type: 'unsubscribe',
      symbols
    });
  }, [sendMessage]);

  return {
    isConnected,
    lastMessage,
    marketData,
    sendMessage,
    subscribe,
    unsubscribe
  };
}

// The following code was an attempt to integrate a simpler WebSocket hook, but it was incomplete and didn't replace the original functionality.  
// It's left here as a record of the attempted change.

// import { useEffect, useRef, useCallback } from 'react';
// import { useAuth } from './use-auth';

// export function useWebSocket() {
//   const ws = useRef<WebSocket | null>(null);
//   const { user } = useAuth();

//   const connect = useCallback(() => {
//     if (!user?.id) return;

//     ws.current = new WebSocket(`ws://0.0.0.0:5001?userId=${user.id}`);

//     ws.current.onopen = () => {
//       console.log('WebSocket Connected');
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket Disconnected');
//       setTimeout(connect, 1000);
//     };
//   }, [user?.id]);

//   const subscribe = useCallback((type: string, data: any) => {
//     if (ws.current?.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({ type, ...data }));
//     }
//   }, []);

//   useEffect(() => {
//     connect();
//     return () => {
//       ws.current?.close();
//     };
//   }, [connect]);

//   return { subscribe };
// }