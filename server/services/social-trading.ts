import { prisma } from '../db';
import { marketData } from './market-data';
import { emailService } from './email';
import { TradeSignal, CopyTrade } from '@shared/schema';

export class SocialTradingService {
  async publishTradeSignal(userId: number, signal: TradeSignal) {
    const trade = await prisma.tradeSignal.create({
      data: {
        userId,
        symbol: signal.symbol,
        type: signal.type,
        entry: signal.entry,
        target: signal.target,
        stopLoss: signal.stopLoss,
        analysis: signal.analysis,
        timestamp: new Date()
      }
    });

    const followers = await this.getTraderFollowers(userId);
    for (const follower of followers) {
      await emailService.sendTradeAlert(follower, {
        action: signal.type,
        symbol: signal.symbol,
        price: signal.entry,
        analysis: signal.analysis
      });
    }

    return trade;
  }

  async followTrader(followerId: number, traderId: number) {
    await prisma.traderFollower.create({
      data: {
        followerId,
        traderId
      }
    });
  }

  async unfollowTrader(followerId: number, traderId: number) {
    await prisma.traderFollower.delete({
      where: {
        followerId_traderId: {
          followerId,
          traderId
        }
      }
    });
  }

  async getTraderFollowers(traderId: number) {
    const followers = await prisma.traderFollower.findMany({
      where: { traderId },
      include: { follower: true }
    });
    return followers.map(f => f.follower);
  }

  async getTraderPerformance(traderId: number) {
    const signals = await prisma.tradeSignal.findMany({
      where: { userId: traderId }
    });

    let winCount = 0;
    let totalReturn = 0;

    for (const signal of signals) {
      const currentPrice = await marketData.getQuote(signal.symbol);
      const pnl = signal.type === 'buy'
        ? currentPrice.price - signal.entry
        : signal.entry - currentPrice.price;

      if (pnl > 0) winCount++;
      totalReturn += pnl;
    }

    return {
      winRate: signals.length > 0 ? (winCount / signals.length) * 100 : 0,
      totalReturn,
      signalCount: signals.length
    };
  }

  async getTopTraders() {
    const traders = await prisma.user.findMany({
      where: { role: 'TRADER' },
      include: {
        tradeSignals: true,
        followers: true
      }
    });

    const tradersWithPerformance = await Promise.all(
      traders.map(async (trader) => {
        const performance = await this.getTraderPerformance(trader.id);
        return {
          ...trader,
          ...performance,
          followerCount: trader.followers.length
        };
      })
    );

    return tradersWithPerformance.sort((a, b) => b.totalReturn - a.totalReturn);
  }
}

export const socialTradingService = new SocialTradingService();