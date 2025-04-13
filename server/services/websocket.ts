
import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

interface MarketData {
  symbol: string;
  price: number;
  timestamp: number;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.set(ws, new Set());

      ws.on('message', (message: string) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      // Send initial connection status
      ws.send(JSON.stringify({ type: 'CONNECTION_STATUS', payload: { status: 'connected' }}));
    });
  }

  private handleMessage(ws: WebSocket, data: WebSocketMessage) {
    const subscriptions = this.clients.get(ws);
    
    switch (data.type) {
      case 'SUBSCRIBE_MARKET':
        if (data.payload.symbol) {
          subscriptions?.add(data.payload.symbol);
          ws.send(JSON.stringify({ 
            type: 'SUBSCRIPTION_STATUS',
            payload: { symbol: data.payload.symbol, status: 'subscribed' }
          }));
        }
        break;

      case 'SET_ALERT':
        if (data.payload.symbol && data.payload.condition && data.payload.price) {
          // Store alert in user's subscription set with alert metadata
          const alertKey = `${data.payload.symbol}:${data.payload.condition}:${data.payload.price}`;
          subscriptions?.add(alertKey);
        }
        break;
        
      case 'UNSUBSCRIBE_MARKET':
        if (data.payload.symbol) {
          subscriptions?.delete(data.payload.symbol);
        }
        break;
    }
  }

  public broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastMarketData(data: MarketData) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const subscriptions = this.clients.get(client);
        
        // Check regular market subscriptions
        if (subscriptions?.has(data.symbol)) {
          client.send(JSON.stringify({
            type: 'MARKET_UPDATE',
            payload: data
          }));
        }

        // Check price alerts
        subscriptions?.forEach(sub => {
          if (sub.startsWith(data.symbol + ':')) {
            const [_, condition, price] = sub.split(':');
            const triggerPrice = parseFloat(price);
            
            if ((condition === 'above' && data.price >= triggerPrice) ||
                (condition === 'below' && data.price <= triggerPrice)) {
              client.send(JSON.stringify({
                type: 'ALERT_TRIGGERED',
                payload: {
                  symbol: data.symbol,
                  condition,
                  triggerPrice,
                  currentPrice: data.price
                }
              }));
            }
          }
        });
      }
    });
  }
}
