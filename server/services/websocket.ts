
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

interface Alert {
  symbol: string;
  condition: 'above' | 'below';
  price: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Set<string>> = new Map();
  private readonly VALID_MESSAGE_TYPES = ['SUBSCRIBE_MARKET', 'SET_ALERT', 'UNSUBSCRIBE_MARKET'];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      try {
        this.clients.set(ws, new Set());
        this.setupClientHandlers(ws);
        this.sendConnectionStatus(ws, true);
      } catch (error) {
        console.error('Error in WebSocket connection setup:', error);
        this.handleError(ws, 'Connection setup failed');
      }
    });
  }

  private setupClientHandlers(ws: WebSocket) {
    ws.on('message', (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        if (!this.validateMessage(data)) {
          throw new Error('Invalid message format');
        }
        this.handleMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message handling error:', error);
        this.handleError(ws, 'Invalid message format or processing error');
      }
    });

    ws.on('close', () => {
      try {
        this.clients.delete(ws);
      } catch (error) {
        console.error('Error in WebSocket close handler:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      this.handleError(ws, 'WebSocket error occurred');
    });
  }

  private validateMessage(data: WebSocketMessage): boolean {
    if (!data.type || !this.VALID_MESSAGE_TYPES.includes(data.type)) {
      return false;
    }

    if (data.type === 'SET_ALERT') {
      return this.validateAlertPayload(data.payload);
    }

    if (data.type === 'SUBSCRIBE_MARKET' || data.type === 'UNSUBSCRIBE_MARKET') {
      return this.validateSymbol(data.payload?.symbol);
    }

    return true;
  }

  private validateAlertPayload(payload: any): boolean {
    return (
      payload &&
      typeof payload.symbol === 'string' &&
      ['above', 'below'].includes(payload.condition) &&
      typeof payload.price === 'number' &&
      !isNaN(payload.price) &&
      payload.price > 0
    );
  }

  private validateSymbol(symbol: any): boolean {
    return typeof symbol === 'string' && symbol.length > 0;
  }

  private validateMarketData(data: any): boolean {
    return (
      data &&
      typeof data.symbol === 'string' &&
      typeof data.price === 'number' &&
      !isNaN(data.price) &&
      typeof data.timestamp === 'number'
    );
  }

  private handleMessage(ws: WebSocket, data: WebSocketMessage) {
    const subscriptions = this.clients.get(ws);
    if (!subscriptions) return;

    try {
      switch (data.type) {
        case 'SUBSCRIBE_MARKET':
          this.handleSubscribe(ws, subscriptions, data.payload);
          break;
        case 'SET_ALERT':
          this.handleSetAlert(ws, subscriptions, data.payload);
          break;
        case 'UNSUBSCRIBE_MARKET':
          this.handleUnsubscribe(ws, subscriptions, data.payload);
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.handleError(ws, 'Error processing request');
    }
  }

  private handleSubscribe(ws: WebSocket, subscriptions: Set<string>, payload: any) {
    if (!this.validateSymbol(payload.symbol)) {
      this.handleError(ws, 'Invalid symbol format');
      return;
    }
    subscriptions.add(payload.symbol);
    this.sendSubscriptionStatus(ws, payload.symbol, true);
  }

  private handleSetAlert(ws: WebSocket, subscriptions: Set<string>, payload: any) {
    if (!this.validateAlertPayload(payload)) {
      this.handleError(ws, 'Invalid alert parameters');
      return;
    }
    const alertKey = `${payload.symbol}:${payload.condition}:${payload.price}`;
    subscriptions.add(alertKey);
    this.sendAlertStatus(ws, payload, true);
  }

  private handleUnsubscribe(ws: WebSocket, subscriptions: Set<string>, payload: any) {
    if (!this.validateSymbol(payload.symbol)) {
      this.handleError(ws, 'Invalid symbol format');
      return;
    }
    subscriptions.delete(payload.symbol);
    this.sendSubscriptionStatus(ws, payload.symbol, false);
  }

  private sendConnectionStatus(ws: WebSocket, connected: boolean) {
    this.sendMessage(ws, 'CONNECTION_STATUS', { status: connected ? 'connected' : 'disconnected' });
  }

  private sendSubscriptionStatus(ws: WebSocket, symbol: string, subscribed: boolean) {
    this.sendMessage(ws, 'SUBSCRIPTION_STATUS', { symbol, status: subscribed ? 'subscribed' : 'unsubscribed' });
  }

  private sendAlertStatus(ws: WebSocket, alert: Alert, success: boolean) {
    this.sendMessage(ws, 'ALERT_STATUS', { alert, success });
  }

  private handleError(ws: WebSocket, message: string) {
    this.sendMessage(ws, 'ERROR', { message });
  }

  private sendMessage(ws: WebSocket, type: string, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type, payload }));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  public broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
    });
  }

  public broadcastMarketData(data: MarketData) {
    try {
      if (!this.validateMarketData(data)) {
        console.error('Invalid market data:', data);
        return;
      }

      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const subscriptions = this.clients.get(client);
          if (!subscriptions) return;

          if (subscriptions.has(data.symbol)) {
            this.sendMessage(client, 'MARKET_UPDATE', data);
          }

          this.checkAlertTriggers(client, subscriptions, data);
        }
      });
    } catch (error) {
      console.error('Error in broadcastMarketData:', error);
    }
  }

  private checkAlertTriggers(ws: WebSocket, subscriptions: Set<string>, data: MarketData) {
    subscriptions.forEach(sub => {
      if (sub.startsWith(data.symbol + ':')) {
        try {
          const [_, condition, price] = sub.split(':');
          const triggerPrice = parseFloat(price);

          if (!isNaN(triggerPrice) && 
              ((condition === 'above' && data.price >= triggerPrice) ||
               (condition === 'below' && data.price <= triggerPrice))) {
            this.sendMessage(ws, 'ALERT_TRIGGERED', {
              symbol: data.symbol,
              condition,
              triggerPrice,
              currentPrice: data.price,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error processing alert trigger:', error);
        }
      }
    });
  }
}
