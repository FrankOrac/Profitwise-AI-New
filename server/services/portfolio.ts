
import { db } from '../db';
import { portfolioAssets } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { marketData } from './market-data';

export class PortfolioService {
  async rebalancePortfolio(userId: number, targetAllocations: Record<string, number>) {
    try {
      // Get current portfolio
      const currentAssets = await db.select().from(portfolioAssets).where(eq(portfolioAssets.userId, userId));
      
      // Calculate total portfolio value
      const totalValue = currentAssets.reduce((sum, asset) => sum + Number(asset.value), 0);
      
      // Calculate required trades
      const trades = currentAssets.map(asset => {
        const currentAllocation = (Number(asset.value) / totalValue) * 100;
        const targetAllocation = targetAllocations[asset.symbol] || 0;
        const difference = targetAllocation - currentAllocation;
        
        const tradeValue = (difference / 100) * totalValue;
        const tradeQuantity = Math.abs(tradeValue / Number(asset.currentPrice));
        
        return {
          symbol: asset.symbol,
          action: difference > 0 ? 'buy' : 'sell',
          quantity: tradeQuantity,
          estimatedValue: Math.abs(tradeValue)
        };
      });

      // Update portfolio based on trades
      for (const trade of trades) {
        if (trade.quantity === 0) continue;
        
        await db
          .update(portfolioAssets)
          .set({
            quantity: trade.action === 'buy' 
              ? portfolioAssets.quantity + trade.quantity
              : portfolioAssets.quantity - trade.quantity
          })
          .where(eq(portfolioAssets.symbol, trade.symbol));
      }

      return trades;
    } catch (error) {
      console.error('Failed to rebalance portfolio:', error);
      throw error;
    }
  }

  async getRebalancingRecommendations(userId: number) {
    const assets = await db.select().from(portfolioAssets).where(eq(portfolioAssets.userId, userId));
    const insights = await marketData.generateInsights(assets);
    
    return insights.map(insight => ({
      symbol: insight.symbol,
      recommendation: insight.type,
      confidence: insight.confidence,
      currentAllocation: 0, // Calculate from portfolio
      suggestedAllocation: 0, // Based on risk profile and market conditions
      reason: insight.content
    }));
  }
}

export const portfolio = new PortfolioService();
