
import axios from 'axios';

export class MarketDataService {
  private apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  private baseUrl = 'https://www.alphavantage.co/query';

  async getQuote(symbol: string) {
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
}

export const marketData = new MarketDataService();
