import axios from 'axios';
import { technicalAnalysis } from '@mathieuc/tradingview';
import OpenAI from 'openai';
import { storage } from '../storage';

export class MarketDataService {
  private apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  private baseUrl = 'https://www.alphavantage.co/query';
  private openai: OpenAI;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async getQuote(symbol: string) {
    if (!this.apiKey) {
      // Use mock data if API key is not available
      const mockPrice = this.mockPrices[symbol] || 100;
      return {
        symbol,
        price: mockPrice,
        change: (Math.random() - 0.5) * 2,
        changePercent: (Math.random() - 0.5) * 2,
        volume: Math.floor(Math.random() * 1000000)
      };
    }
    
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey
        }
      });

      const data = response.data['Global Quote'];
      return {
        symbol,
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume'])
      };
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      throw error;
    }
  }

  async analyzeMarketData(symbol: string) {
    try {
      const [quote, history] = await Promise.all([
        this.getQuote(symbol),
        this.getHistoricalData(symbol)
      ]);

      // Calculate advanced technical indicators
      const prices = history.map(day => day.close);
      const sma20 = this.calculateSMA(prices, 20);
      const sma50 = this.calculateSMA(prices, 50);
      const rsi = this.calculateRSI(prices, 14);
      const macd = this.calculateMACD(prices);
      const volatility = this.calculateVolatility(prices, 20);

      // Generate trading signals
      const signals = {
        trend: quote.price > sma20 ? 'upward' : 'downward',
        strength: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral',
        momentum: macd.histogram > 0 ? 'positive' : 'negative',
        volatility: volatility > quote.price * 0.1 ? 'high' : 'moderate'
      };

      return {
        currentPrice: quote.price,
        technicalIndicators: {
          sma20: sma20,
          sma50: sma50,
          rsi: rsi,
          macd: macd,
          volatility: volatility
        },
        signals,
        riskLevel: this.calculateRiskLevel(signals)
      };
    } catch (error) {
      console.error(`Failed to analyze market data for ${symbol}:`, error);
      throw error;
    }
  }

  private calculateSMA(prices: number[], period: number): number {
    return prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
  }

  private calculateRSI(prices: number[], period: number): number {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period + 1; i++) {
      const difference = prices[prices.length - i] - prices[prices.length - i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { line: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA([macdLine], 9);

    return {
      line: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  private calculateVolatility(prices: number[], period: number): number {
    const mean = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
    const squaredDiffs = prices.slice(-period).map(price => Math.pow(price - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period);
  }

  private calculateRiskLevel(signals: any): 'low' | 'moderate' | 'high' {
    let riskScore = 0;

    if (signals.volatility === 'high') riskScore += 2;
    if (signals.strength === 'overbought' || signals.strength === 'oversold') riskScore += 1;
    if (signals.momentum !== signals.trend) riskScore += 1;

    return riskScore <= 1 ? 'low' : riskScore <= 2 ? 'moderate' : 'high';
  }

  async generateInsights(portfolio: any[]) {
    try {
      const analyses = await Promise.all(
        portfolio.map(asset => this.analyzeMarketData(asset.symbol))
      );

      const openaiInsights = await this.generateMarketInsights(analyses);


      return analyses.map((analysis, index) => {
        const asset = portfolio[index];
        const signals = analysis.signals;

        let recommendation = 'hold';
        let confidence = 'moderate';

        if (signals.trend === 'upward' && signals.momentum === 'positive' && signals.strength !== 'overbought') {
          recommendation = 'buy';
          confidence = 'high';
        } else if (signals.trend === 'downward' && signals.momentum === 'negative' && signals.strength !== 'oversold') {
          recommendation = 'sell';
          confidence = 'high';
        }

        return {
          symbol: asset.symbol,
          type: recommendation,
          title: `${asset.symbol} ${recommendation.toUpperCase()} Signal`,
          content: `${confidence.toUpperCase()} confidence ${recommendation} signal based on:
          - Trend: ${signals.trend}
          - Momentum: ${signals.momentum}
          - RSI: ${analysis.technicalIndicators.rsi.toFixed(2)}
          - Risk Level: ${analysis.riskLevel}
          
          Current price $${analysis.currentPrice} with ${signals.volatility} volatility.  ${openaiInsights}`,
          indicators: analysis.technicalIndicators,
          confidence,
          timestamp: new Date()
        };
      });
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          outputsize: 'compact',
          apikey: this.apiKey
        }
      });

      const timeSeries = response.data['Time Series (Daily)'];
      return Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
        date,
        open: parseFloat(data['1. open']),
        high: parseFloat(data['2. high']),
        low: parseFloat(data['3. low']),
        close: parseFloat(data['4. close']),
        volume: parseInt(data['5. volume'])
      }));
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async generateMarketInsights(data: any) {
    if (!this.openai) {
      return "AI insights unavailable - OpenAI API key not configured";
    }

    const prompt = `Analyze this market data and provide trading insights:
      ${JSON.stringify(data)}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  }

  // Mock market data for testing
  private mockPrices: Record<string, number> = {
    'BTC': 43000,
    'ETH': 2200,
    'AAPL': 185,
    'GOOGL': 140,
    'MSFT': 330,
  };

  async getRealTimeData(symbol: string) {
    // Generate random price fluctuation
    const basePrice = this.mockPrices[symbol] || 100;
    const fluctuation = (Math.random() - 0.5) * 2; // -1% to +1%
    const price = basePrice * (1 + fluctuation / 100);
    
    return {
      'Global Quote': {
        '01. symbol': symbol,
        '05. price': price.toFixed(2),
        '09. change': (fluctuation * basePrice / 100).toFixed(2),
        '10. change percent': `${fluctuation.toFixed(2)}%`,
        '06. volume': Math.floor(Math.random() * 1000000)
      }
    };
  }
}

export const marketData = new MarketDataService();