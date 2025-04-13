
import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketHook {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (message: any) => void;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}

export function useWebSocket(url: string): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [url]);

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
    sendMessage,
    subscribe,
    unsubscribe
  };
}
