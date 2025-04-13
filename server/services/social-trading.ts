
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

  async notifyFollowers(traderId: number, trade: any) {
    const followers = await storage.getTraderFollowers(traderId);
    const trader = await storage.getUser(traderId);
    const analysis = await marketData.analyzeMarketData(trade.symbol);
    
    // Send notifications to all followers
    await Promise.all(followers.map(follower => 
      emailService.sendEmail(follower.email, 'trade-alert', {
        symbol: trade.symbol,
        type: trade.action,
        price: trade.entryPrice,
        confidence: analysis.signals.strength,
        riskLevel: analysis.riskLevel,
        analysis: `${trader.name} has opened a new ${trade.action} position in ${trade.symbol}`,
        dashboardUrl: `${process.env.APP_URL}/social-trading`
      })
    ));
  }

  async sendPerformanceUpdates() {
    const traders = await storage.getAllTraders();
    
    for (const trader of traders) {
      const stats = await this.getTraderStats(trader.id);
      const followers = await storage.getTraderFollowers(trader.id);
      
      if (followers.length > 0) {
        await Promise.all(followers.map(follower =>
          emailService.sendEmail(follower.email, 'portfolio-update', {
            totalValue: stats.performance,
            dailyChange: stats.winRate,
            topPerformer: {
              symbol: trader.topSymbol,
              change: stats.performance
            },
            dashboardUrl: `${process.env.APP_URL}/social-trading/${trader.id}`
          })
        ));
      }
    }
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
