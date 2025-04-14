import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { verify } from './auth';
import { marketDataService } from './market-data';

export class WebSocketService {
  private wss: WebSocketServer;
  private subscriptions: Map<string, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', async (ws: any, req: any) => {
      const token = req.url?.split('token=')[1];
      if (!token || !await verify(token)) {
        ws.close();
        return;
      }
      console.log('Client connected');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (err) {
          console.error('Invalid message format:', err);
        }
      });

      ws.on('close', () => {
        this.removeSubscriber(ws);
        console.log('Client disconnected');
      });
    });

    // Start price updates
    setInterval(() => {
      this.broadcastPriceUpdates();
    }, 1000);
  }

  private handleMessage(ws: any, data: any) {
    // Handle different message types
    switch (data.type) {
      case 'subscribe':
        this.subscribe(data.channel, ws);
        console.log('Client subscribed to:', data.channel);
        break;
      case 'unsubscribe':
        this.unsubscribe(data.channel, ws);
        console.log('Client unsubscribed from:', data.channel);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
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

  public broadcast(channel: string, data: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({ channel, data }));
      }
    });
  }
}