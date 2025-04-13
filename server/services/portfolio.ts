
import { Portfolio, Asset, RebalanceSettings } from '@shared/schema';
import { marketData } from './market-data';
import { storage } from '../storage';
import { emailService } from './email';

export class PortfolioService {
  async rebalancePortfolio(userId: number, settings: RebalanceSettings) {
    const portfolio = await storage.getPortfolio(userId);
    const targetAllocations = settings.targetAllocations;
    const trades: any[] = [];

    // Calculate current total value
    const totalValue = portfolio.assets.reduce((sum, asset) => {
      return sum + (asset.quantity * asset.currentPrice);
    }, 0);

    // Calculate required trades
    for (const asset of portfolio.assets) {
      const currentAllocation = (asset.quantity * asset.currentPrice) / totalValue;
      const targetAllocation = targetAllocations[asset.symbol] || 0;
      const difference = targetAllocation - currentAllocation;
      
      if (Math.abs(difference) > settings.threshold) {
        const tradeAmount = difference * totalValue;
        const tradeQuantity = Math.abs(tradeAmount / asset.currentPrice);
        
        trades.push({
          symbol: asset.symbol,
          type: difference > 0 ? 'buy' : 'sell',
          quantity: tradeQuantity,
          price: asset.currentPrice
        });
      }
    }

    // Execute trades if auto-trading is enabled
    if (settings.autoTrade) {
      for (const trade of trades) {
        await this.executeTrade(userId, trade);
      }
    }

    // Send notification
    await emailService.sendPortfolioUpdate(userId, {
      type: 'rebalance',
      trades,
      newAllocations: targetAllocations
    });

    return trades;
  }

  private async executeTrade(userId: number, trade: any) {
    // Implement trade execution logic here
    await storage.recordTrade(userId, {
      symbol: trade.symbol,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price,
      timestamp: new Date()
    });
  }

  async getRebalanceSuggestions(userId: number) {
    const portfolio = await storage.getPortfolio(userId);
    const suggestions = [];
    
    for (const asset of portfolio.assets) {
      const analysis = await marketData.analyzeMarketData(asset.symbol);
      if (analysis.riskLevel === 'high') {
        suggestions.push({
          symbol: asset.symbol,
          action: 'reduce',
          reason: 'High market volatility'
        });
      }
    }
    
    return suggestions;
  }
}

export const portfolioService = new PortfolioService();
