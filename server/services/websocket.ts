import { WebSocket, WebSocketServer } from 'ws';
import { marketData } from './market-data';
import { storage } from '../storage';

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket>;

  constructor() {
    this.wss = new WebSocketServer({ 
      port: 5000,
      host: '0.0.0.0'
    });
    this.clients = new Map();
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws, req) => {
      const userId = this.extractUserId(req.url);
      if (userId) {
        this.clients.set(userId, ws);

        ws.on('message', async (message) => {
          const data = JSON.parse(message.toString());
          await this.handleMessage(userId, data);
        });

        ws.on('close', () => {
          this.clients.delete(userId);
        });
      }
    });
  }

  private extractUserId(url: string | undefined): string | null {
    if (!url) return null;
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('userId');
  }

  private async handleMessage(userId: string, data: any) {
    switch (data.type) {
      case 'SUBSCRIBE_PRICE':
        await this.handlePriceSubscription(userId, data.symbols);
        break;
      case 'SUBSCRIBE_TRADES':
        await this.handleTradeSubscription(userId);
        break;
    }
  }

  private async handlePriceSubscription(userId: string, symbols: string[]) {
    const prices = await marketData.getQuotes(symbols);
    this.sendToUser(userId, {
      type: 'PRICE_UPDATE',
      data: prices
    });
  }

  private async handleTradeSubscription(userId: string) {
    const trades = await storage.getRecentTrades(userId);
    this.sendToUser(userId, {
      type: 'TRADE_UPDATE',
      data: trades
    });
  }

  public sendToUser(userId: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  public broadcastMarketUpdate(symbol: string, price: number) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'MARKET_UPDATE',
          data: { symbol, price }
        }));
      }
    });
  }
}

export { WebSocketService };