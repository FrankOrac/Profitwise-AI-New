
import { storage } from '../storage';
import { marketData } from './market-data';
import { emailService } from './email';

export class SocialTradingService {
  async createPost(userId: number, data: any) {
    const post = await storage.createTradePost({
      ...data,
      userId,
      timestamp: new Date()
    });

    // Get market data for the asset
    const quote = await marketData.getQuote(data.symbol);
    
    // Store entry price for future P&L calculation
    await storage.saveTradeEntry({
      postId: post.id,
      price: quote.price,
      timestamp: new Date()
    });

    return post;
  }

  async copyTrade(followerId: number, postId: number) {
    const post = await storage.getTradePostById(postId);
    if (!post) throw new Error('Trade not found');

    // Check if user has sufficient balance
    const user = await storage.getUser(followerId);
    const quote = await marketData.getQuote(post.symbol);
    
    const copyTrade = await storage.executeCopyTrade({
      followerId,
      traderId: post.userId,
      postId,
      symbol: post.symbol,
      action: post.action,
      position: post.position,
      entryPrice: quote.price,
      timestamp: new Date()
    });

    // Notify original trader
    const trader = await storage.getUser(post.userId);
    await emailService.sendEmail(trader.email, 'trade-copied', {
      trader,
      trade: post
    });

    return copyTrade;
  }

  async getTraderStats(traderId: number) {
    const trades = await storage.getTraderTrades(traderId);
    const followers = await storage.getTraderFollowers(traderId);

    let winCount = 0;
    let totalPnL = 0;

    for (const trade of trades) {
      const quote = await marketData.getQuote(trade.symbol);
      const pnl = (quote.price - trade.entryPrice) * trade.position;
      
      if (pnl > 0) winCount++;
      totalPnL += pnl;
    }

    return {
      totalTrades: trades.length,
      winRate: (winCount / trades.length) * 100,
      performance: (totalPnL / trades.length).toFixed(2),
      followers: followers.length
    };
  }
}

export const socialTrading = new SocialTradingService();
