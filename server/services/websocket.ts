import WebSocket from 'ws';
import { Server } from 'http';
import { verify } from './auth';
import { marketDataService } from './market-data';

export class WebSocketService {
  private wss: WebSocket.Server;
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      const token = req.url?.split('token=')[1];
      if (!token || !await verify(token)) {
        ws.close();
        return;
      }

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          switch (message.type) {
            case 'subscribe':
              this.subscribe(message.channel, ws);
              break;
            case 'unsubscribe':
              this.unsubscribe(message.channel, ws);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.removeSubscriber(ws);
      });
    });

    // Start price updates
    setInterval(() => {
      this.broadcastPriceUpdates();
    }, 1000);
  }

  private subscribe(channel: string, ws: WebSocket) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)?.add(ws);
  }

  private unsubscribe(channel: string, ws: WebSocket) {
    this.subscriptions.get(channel)?.delete(ws);
  }

  private removeSubscriber(ws: WebSocket) {
    for (const subscribers of this.subscriptions.values()) {
      subscribers.delete(ws);
    }
  }

  private async broadcastPriceUpdates() {
    for (const [channel, subscribers] of this.subscriptions.entries()) {
      if (channel.startsWith('price:')) {
        const symbol = channel.split(':')[1];
        const price = await marketDataService.getPrice(symbol);

        const message = JSON.stringify({
          type: 'price',
          symbol,
          price
        });

        subscribers.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    }
  }
}

export const createWebSocketService = (server: Server) => {
  return new WebSocketService(server);
};