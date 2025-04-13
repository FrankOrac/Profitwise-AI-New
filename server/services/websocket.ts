import WebSocket from 'ws';
import { Server } from 'http';
import { marketData } from './market-data'; // Added import


export class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<WebSocket, Set<string>> = new Map();

  constructor(server: Server) { // Adjusted constructor parameter type
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocketServer();
  }

  private async startPriceUpdates() {
    setInterval(async () => {
      for (const [ws, symbols] of this.clients.entries()) {
        if (symbols.size > 0) {
          const updates = await Promise.all(
            Array.from(symbols).map(async (symbol) => {
              const data = await marketData.getRealTimeData(symbol);
              return {
                symbol,
                data: {
                  price: parseFloat(data['Global Quote']['05. price']),
                  change: parseFloat(data['Global Quote']['09. change']),
                  volume: parseInt(data['Global Quote']['06. volume'])
                }
              };
            })
          );

          ws.send(JSON.stringify({
            type: 'price_update',
            data: updates
          }));
        }
      }
    }, 5000); // Update every 5 seconds
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.set(ws, new Set());

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);

          switch (data.type) {
            case 'subscribe':
              this.handleSubscribe(ws, data.symbols);
              break;
            case 'unsubscribe':
              this.handleUnsubscribe(ws, data.symbols);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    // Start price updates
    this.startPriceUpdates();
  }

  private handleSubscribe(ws: WebSocket, symbols: string[]) {
    const subscriptions = this.clients.get(ws);
    if (subscriptions) {
      symbols.forEach(symbol => subscriptions.add(symbol));
    }
  }

  private handleUnsubscribe(ws: WebSocket, symbols: string[]) {
    const subscriptions = this.clients.get(ws);
    if (subscriptions) {
      symbols.forEach(symbol => subscriptions.delete(symbol));
    }
  }

  private async startPriceUpdates() {
    setInterval(async () => {
      for (const [ws, symbols] of this.clients.entries()) {
        if (symbols.size > 0) {
          try {
            const updates = await Promise.all(
              Array.from(symbols).map(async symbol => ({
                symbol,
                data: await marketData.getRealTimeData(symbol)
              }))
            );

            ws.send(JSON.stringify({
              type: 'price_update',
              data: updates
            }));
          } catch (error) {
            console.error('Price update error:', error);
          }
        }
      }
    }, 5000); // Update every 5 seconds
  }
}