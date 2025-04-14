import { db } from '../db';
import { MarketDataService } from './market-data';
import { portfolioAssets } from '@shared/schema';
import { storage } from '../storage';
import { emailService } from './email';
import { eq } from 'drizzle-orm';

export class PortfolioService {
  private marketData: MarketDataService;

  constructor() {
    this.marketData = new MarketDataService();
  }

  async rebalancePortfolio(portfolioId: string, settings: any) {
    const portfolio = await db.select().from(portfolioAssets)
      .where(eq(portfolioAssets.id, parseInt(portfolioId)))
      .execute();

    if (!portfolio.length) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    const trades = this.calculateRebalanceTrades(portfolio[0], settings.targetAllocations);

    // Record trades using storage
    for (const trade of trades) {
      await storage.recordTrade(parseInt(portfolioId), {
        symbol: trade.asset,
        type: trade.type,
        quantity: trade.amount,
        price: trade.price,
        timestamp: new Date()
      });
    }

    // Send notification using existing emailService
    await emailService.sendPortfolioUpdate(parseInt(portfolioId), {
      type: 'rebalance',
      trades,
      newAllocations: settings.targetAllocations
    });

    return trades;
  }

  private calculateRebalanceTrades(portfolio: any, targetAllocations: any): any[] {
    const trades: any[] = [];
    const totalValue = portfolio.value || 0;

    for (const [symbol, targetAllocation] of Object.entries(targetAllocations)) {
      const currentAllocation = (portfolio.quantity * portfolio.currentPrice) / totalValue;
      const difference = (targetAllocation as number) - currentAllocation;

      if (Math.abs(difference) > 0.05) {
        const tradeAmount = difference * totalValue;
        trades.push({
          asset: symbol,
          type: difference > 0 ? 'buy' : 'sell',
          amount: Math.abs(tradeAmount),
          price: portfolio.currentPrice
        });
      }
    }
    return trades;
  }

  async getRebalanceSuggestions(userId: number) {
    const portfolio = await storage.getPortfolio(userId);
    const suggestions = [];

    for (const asset of portfolio.assets) {
      const analysis = await this.marketData.analyzeMarketData(asset.symbol);
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