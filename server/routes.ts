import express from 'express';
import multer from 'multer';
import { fileConversionService } from './services/file-conversion';
import { marketDataService } from './services/market-data';
import { portfolioService } from './services/portfolio';
import { paymentService } from './services/payment';
import { authenticateUser } from './auth';
import stripe from 'stripe';
import { storage } from './storage';

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express) {
  app.get("/api/social/traders/performance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const traders = await storage.getTopTraders();
      const tradersWithStats = await Promise.all(traders.map(async (trader) => {
        const stats = await storage.getTraderStats(trader.id);
        const isFollowing = await storage.isFollowing(userId, trader.id);
        return {
          ...trader,
          performance: stats.performance,
          winRate: stats.winRate,
          totalTrades: stats.totalTrades,
          followers: stats.followers,
          isFollowing
        };
      }));

      res.json(tradersWithStats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch traders" });
    }
  });

  app.post("/api/social/follow/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);

      if (followerId === traderId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      await storage.followTrader(followerId, traderId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to follow trader" });
    }
  });

  app.post("/api/social/unfollow/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);
      await storage.unfollowTrader(followerId, traderId);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ message: "Failed to unfollow trader" });
    }
  });

  app.post("/api/social/copy-trades/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);

      // Check subscription status
      const user = await storage.getUser(followerId);
      if (!user.subscription?.includes('copy_trading')) {
        return res.status(403).json({ message: "Copy trading requires a premium subscription" });
      }

      // Enable copy trading
      await storage.enableCopyTrading(followerId, traderId);

      // Follow trader if not already following
      const isFollowing = await storage.isFollowing(followerId, traderId);
      if (!isFollowing) {
        await storage.followTrader(followerId, traderId);
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to enable copy trading" });
    }
  });

  app.delete("/api/social/copy-trades/:traderId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);
      await storage.disableCopyTrading(followerId, traderId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to disable copy trading" });
    }
  });

  app.post("/api/social/copy-trades/:traderId/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const followerId = req.user!.id;
      const traderId = parseInt(req.params.traderId);
      const { riskPercentage } = req.body;

      await socialTrading.enableCopyTrading(followerId, traderId, riskPercentage);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ 
        message: err instanceof Error ? err.message : "Failed to update copy settings" 
      });
    }
  });

  app.get("/api/social/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const alerts = await storage.getTradeAlerts(userId);
      res.json(alerts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/portfolio/rebalance', authenticateUser, async (req, res) => {
    const trades = await portfolioService.rebalancePortfolio(req.user.id, req.body);
    res.json({ trades });
  });

  app.post('/api/subscriptions', authenticateUser, async (req, res) => {
    try {
      const { paymentMethodId, planId } = req.body;
      const result = await paymentService.createSubscription(
        req.user.id,
        paymentMethodId,
        planId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create subscription'
      });
    }
  });

  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      await paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Webhook Error'
      });
    }
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const result = await fileConversionService.processFile(req.file.buffer);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process file' });
    }
  });

  return app;
}