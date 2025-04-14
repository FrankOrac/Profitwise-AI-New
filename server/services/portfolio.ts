import { prisma } from '../db';
import { MarketDataService } from './market-data';
import { Portfolio, Asset, RebalanceSettings } from '@shared/schema';
import { storage } from '../storage';
import { emailService } from './email';

export class PortfolioService {
  private marketData: MarketDataService;

  constructor() {
    this.marketData = new MarketDataService();
  }

  async rebalancePortfolio(portfolioId: string, settings: RebalanceSettings) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { positions: true }
    });

    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found`);
    }

    const trades = this.calculateRebalanceTrades(portfolio, settings.targetAllocations);

    for (const trade of trades) {
      await prisma.transaction.create({
        data: {
          portfolioId,
          type: trade.type,
          amount: trade.amount,
          asset: trade.asset,
          timestamp: new Date()
        }
      });
    }

    // Send notification -  using existing emailService
    await emailService.sendPortfolioUpdate(parseInt(portfolioId.split('-')[1]), { // Assuming portfolioId format includes userId
      type: 'rebalance',
      trades,
      newAllocations: settings.targetAllocations
    });

    return trades;
  }

  private calculateRebalanceTrades(portfolio: any, targetAllocations: any): any[] {
    // Implementation of rebalancing logic -  combining logic from original
    const trades: any[] = [];
    const totalValue = portfolio.positions.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);

    for (const asset of portfolio.positions) {
      const currentAllocation = (asset.quantity * asset.currentPrice) / totalValue;
      const targetAllocation = targetAllocations[asset.symbol] || 0;
      const difference = targetAllocation - currentAllocation;

      if (Math.abs(difference) > 0.05) { //Using a threshold of 5% for simplicity.  Consider settings.threshold if needed
        const tradeAmount = difference * totalValue;
        const tradeQuantity = Math.abs(tradeAmount / asset.currentPrice);

        trades.push({
          asset: asset.symbol,
          type: difference > 0 ? 'buy' : 'sell',
          amount: tradeAmount
        });
      }
    }
    return trades;
  }


  private async executeTrade(userId: number, trade: any) {
    // This method is now obsolete due to the direct use of Prisma in rebalancePortfolio.
    // Keeping it for potential future use or expansion.
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