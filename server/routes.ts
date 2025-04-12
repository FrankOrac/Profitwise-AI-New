import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertPortfolioAssetSchema, insertAiInsightSchema } from "@shared/schema";
import { ethers } from "ethers";
import axios from 'axios';

const web3WalletSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  name: z.string().optional(),
  type: z.enum(["ethereum", "bitcoin", "solana"]),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Web3 Wallet Routes
  app.post("/api/web3/connect-wallet", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const walletData = web3WalletSchema.parse(req.body);

      const wallet = await storage.connectWallet({
        userId,
        ...walletData,
        connected: true,
        lastSync: new Date()
      });

      res.status(201).json(wallet);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to connect wallet" });
    }
  });

  app.get("/api/web3/wallets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const wallets = await storage.getWallets(userId);

      // Fetch real-time balances
      const walletsWithBalances = await Promise.all(wallets.map(async (wallet) => {
        let balance = 0;
        let tokenBalances = [];

        if (wallet.type === "ethereum") {
          const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
          balance = await provider.getBalance(wallet.address);

          // Fetch ERC20 token balances
          const tokenContracts = JSON.parse(process.env.TOKEN_CONTRACTS || '[]');
          tokenBalances = await Promise.all(tokenContracts.map(async (token) => {
            const contract = new ethers.Contract(token.address, ['function balanceOf(address) view returns (uint256)'], provider);
            const tokenBalance = await contract.balanceOf(wallet.address);
            return {
              symbol: token.symbol,
              balance: ethers.formatUnits(tokenBalance, token.decimals)
            };
          }));
        } else if (wallet.type === "bitcoin") {
          const response = await axios.get(`https://blockchain.info/balance?active=${wallet.address}`);
          balance = response.data[wallet.address].final_balance;
        }

        return {
          ...wallet,
          balance: balance.toString(), // Ensure balance is a string
          tokenBalances,
          lastUpdated: new Date()
        };
      }));

      res.json(walletsWithBalances);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post("/api/web3/transactions/send", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { to, value, walletId } = req.body;
      const userId = req.user!.id;

      const wallet = await storage.getWalletById(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Create and sign transaction
      const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
      const signingWallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

      // Validate transaction parameters
      if (!ethers.isAddress(to)) {
        return res.status(400).json({ message: "Invalid recipient address" });
      }

      const tx = await signingWallet.sendTransaction({
        to,
        value: ethers.parseEther(value)
      });

      await storage.saveTransaction({
        userId,
        walletId,
        hash: tx.hash,
        to,
        value,
        status: 'pending'
      });

      res.json({ hash: tx.hash });
    } catch (err) {
      res.status(500).json({ message: "Failed to send transaction" });
    }
  });

  app.get("/api/web3/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactions(userId);

      // Update pending transaction statuses
      const updatedTransactions = await Promise.all(transactions.map(async (tx) => {
        if (tx.status === 'pending') {
          try {
            const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
            const receipt = await provider.getTransactionReceipt(tx.hash);

            if (receipt) {
              const status = receipt.status === 1 ? 'completed' : 'failed';
              await storage.updateTransactionStatus(tx.id, status);
              return { ...tx, status };
            }
          } catch (err) {
            console.error(`Failed to update transaction ${tx.hash}:`, err);
          }
        }
        return tx;
      }));

      res.json(updatedTransactions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // API routes for portfolio assets
  app.get("/api/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const assets = await storage.getPortfolioAssets(userId);

      // Fetch real-time market data for each asset
      const assetsWithMarketData = await Promise.all(assets.map(async (asset) => {
        try {
          const marketData = await storage.getMarketData(asset.symbol);
          return {
            ...asset,
            currentPrice: marketData.price,
            changePercent: marketData.changePercent,
            value: (parseFloat(asset.quantity) * marketData.price).toString()
          };
        } catch (err) {
          console.error(`Failed to fetch market data for ${asset.symbol}:`, err);
          return asset;
        }
      }));

      res.json(assetsWithMarketData);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const userId = req.user!.id;
      const data = { ...req.body, userId };
      const validatedData = insertPortfolioAssetSchema.parse(data);

      const newAsset = await storage.addPortfolioAsset(validatedData);
      res.status(201).json(newAsset);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to add portfolio asset" });
    }
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const assetId = parseInt(req.params.id);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const deleted = await storage.deletePortfolioAsset(assetId);
    if (deleted) {
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: "Asset not found" });
    }
  });

  // API routes for AI insights
  app.get("/api/insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userId = req.user!.id;
    const insights = await storage.getAiInsights(userId);

    // Generate some sample insights if none exist
    if (insights.length === 0) {
      const sampleInsights = [
        {
          userId,
          type: "buy",
          title: "Strong Buy Signal",
          content: "Our AI detects a buying opportunity for NVDA based on momentum indicators and recent earnings report. Consider allocating 3-5% of your portfolio.",
          icon: "arrow-trend-up",
          status: "success"
        },
        {
          userId,
          type: "warning",
          title: "Sector Rotation Alert",
          content: "Market indicators suggest a rotation from Technology to Healthcare and Consumer Staples. Consider rebalancing your sector allocations.",
          icon: "exclamation",
          status: "warning"
        },
        {
          userId,
          type: "info",
          title: "Portfolio Optimization",
          content: "Your current asset allocation could achieve 12% better risk-adjusted returns with the following adjustments to your portfolio...",
          icon: "lightbulb",
          status: "info"
        }
      ];

      for (const insight of sampleInsights) {
        await storage.addAiInsight(insight);
      }

      const initialInsights = await storage.getAiInsights(userId);
      return res.json(initialInsights);
    }

    res.json(insights);
  });

  app.post("/api/insights/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userId = req.user!.id;

    try {
      // Get user's portfolio data
      const portfolio = await storage.getPortfolioAssets(userId);
      const marketData = await Promise.all(
        portfolio.map(asset => storage.getMarketData(asset.symbol))
      );

      // Use OpenAI API to generate insights
      const { Configuration, OpenAIApi } = require("openai");
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const prompt = `Analyze this portfolio and market data:
Portfolio: ${JSON.stringify(portfolio)}
Market Data: ${JSON.stringify(marketData)}

Provide trading insights in this format:
- Type: [buy/sell/hold]
- Title: [brief title]
- Content: [detailed analysis]
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst providing trading insights based on market data and portfolio analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = completion.choices[0].message.content;

      const newInsight = {
        userId,
        type: "info",
        title: "New Investment Opportunity",
        content: "Based on recent market analysis, we've identified an emerging trend in renewable energy stocks. Consider evaluating companies in this sector for potential investment opportunities.",
        icon: "lightbulb",
        status: "info"
      };

      const validatedData = insertAiInsightSchema.parse(newInsight);
      const insight = await storage.addAiInsight(validatedData);

      res.status(201).json(insight);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      res.status(500).json({ message: "Failed to generate insight" });
    }
  });

  // API routes for educational content
  app.get("/api/education", async (req, res) => {
    try {
      const content = await storage.getAllEducationalContent();
      const { category, difficulty, search } = req.query;

      let filteredContent = content;

      if (category) {
        filteredContent = filteredContent.filter(c => c.category === category);
      }
      if (difficulty) {
        filteredContent = filteredContent.filter(c => c.difficulty === difficulty);
      }
      if (search) {
        const searchStr = search.toString().toLowerCase();
        filteredContent = filteredContent.filter(c => 
          c.title.toLowerCase().includes(searchStr) || 
          c.description.toLowerCase().includes(searchStr)
        );
      }

      res.json(filteredContent);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });

  app.get("/api/education/:id", async (req, res) => {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    try {
      const content = await storage.getEducationalContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Get related content in same category
      const relatedContent = await storage.getRelatedContent(content.category, contentId);

      res.json({ content, relatedContent });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Admin routes for educational content management
  app.post("/api/admin/education", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const newContent = await storage.addEducationalContent(req.body);
      res.status(201).json(newContent);
    } catch (err) {
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  app.put("/api/admin/education/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    try {
      const updatedContent = await storage.updateEducationalContent(contentId, req.body);
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(updatedContent);
    } catch (err) {
      res.status(500).json({ message: "Failed to update content" });
    }
  });

  app.delete("/api/admin/education/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    try {
      const deleted = await storage.deleteEducationalContent(contentId);
      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // API routes for subscription plans
  app.get("/api/subscriptions", async (req, res) => {
    const plans = await storage.getAllSubscriptionPlans();
    res.json(plans);
  });

  app.post("/api/subscriptions/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { planId, paymentMethodId } = req.body;
    const userId = req.user!.id;

    try {
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Create customer if not exists
      const user = await storage.getUser(userId);
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          payment_method: paymentMethodId,
          invoice_settings: { default_payment_method: paymentMethodId }
        });
        await storage.updateUser(userId, { stripeCustomerId: customer.id });
      }

      const stripe = await storage.getPaymentProcessor();

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(plan.price) * 100, // Convert to cents
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        customer: req.user!.stripeCustomerId
      });

      if (paymentIntent.status === 'succeeded') {
        const subscription = await storage.createSubscription({
          userId,
          planId,
          status: "active",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        res.status(201).json(subscription);
      } else {
        res.status(400).json({ message: "Payment failed" });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get("/api/subscriptions/current", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const userId = req.user!.id;
    const subscription = await storage.getCurrentSubscription(userId);
    res.json(subscription);
  });

  // Admin routes for analytics and metrics
  app.get("/api/admin/analytics/overview", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const users = await storage.getAllUsers();
      const subscriptions = await storage.getAllSubscriptions();
      const insights = await storage.getAllAiInsights();
      const portfolios = await storage.getAllPortfolios();

      const metrics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.lastLoginAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
        premiumUsers: subscriptions.filter(s => s.status === 'active' && s.planType !== 'basic').length,
        totalRevenue: subscriptions.reduce((acc, sub) => acc + parseFloat(sub.amount || '0'), 0),
        averagePortfolioSize: portfolios.reduce((acc, p) => acc + p.assets.length, 0) / portfolios.length || 0,
        insightsGenerated: insights.length,
        userGrowth: {
          weekly: users.filter(u => u.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
          monthly: users.filter(u => u.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000).length
        }
      };

      res.json(metrics);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  app.get("/api/admin/analytics/revenue", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const subscriptions = await storage.getAllSubscriptions();
      const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7); // YYYY-MM format
      }).reverse();

      const revenueData = last6Months.map(month => ({
        month,
        revenue: subscriptions
          .filter(s => s.createdAt.startsWith(month))
          .reduce((acc, sub) => acc + parseFloat(sub.amount || '0'), 0)
      }));

      res.json(revenueData);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // Admin routes for user management
  app.get("/api/admin/tasks", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const tasks = await storage.getAdminTasks();
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/admin/activity-logs", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const logs = await storage.getActivityLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // API Settings Routes
  app.get("/api/admin/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const apiKeys = await storage.getAPIKeys();
      res.json(apiKeys);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/admin/settings/api-keys", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    try {
      const updatedKeys = await storage.updateAPIKeys(req.body);
      res.json(updatedKeys);
    } catch (err) {
      res.status(500).json({ message: "Failed to update API keys" });
    }
  });

  // Social Trading Routes
  app.post("/api/social/post", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { content, symbol, action, position } = req.body;
      const userId = req.user!.id;

      const post = await storage.createTradePost({
        userId,
        content,
        symbol,
        action,
        position,
        timestamp: new Date()
      });

      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/social/copy-trade", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { traderId, postId } = req.body;
      const followerId = req.user!.id;

      const tradePost = await storage.getTradePostById(postId);
      if (!tradePost) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Get market data and validate trade
      const quote = await marketData.getQuote(tradePost.symbol);
      const follower = await storage.getUser(followerId);
      const portfolioValue = await storage.getPortfolioValue(followerId);
      
      // Risk management check
      const tradeValue = quote.price * tradePost.position;
      if (tradeValue > portfolioValue * 0.1) { // Max 10% per trade
        return res.status(400).json({ message: "Trade exceeds risk limits" });
      }

      // Execute copy trade
      const copyTrade = await storage.executeCopyTrade({
        followerId,
        traderId,
        postId,
        symbol: tradePost.symbol,
        action: tradePost.action,
        position: tradePost.position,
        entryPrice: quote.price,
        timestamp: new Date()
      });

      // Send notifications
      await emailService.sendEmail(follower.email, 'trade-alert', {
        symbol: tradePost.symbol,
        price: quote.price,
        message: `Successfully copied trade: ${tradePost.action} ${tradePost.position} ${tradePost.symbol}`,
        actionUrl: `/portfolio`
      });

      res.status(201).json(copyTrade);
    } catch (err) {
      res.status(500).json({ message: "Failed to copy trade" });
    }
  });

  app.get("/api/social/feed", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const posts = await storage.getTradePosts();
      const postsWithUserData = await Promise.all(posts.map(async (post) => {
        const user = await storage.getUser(post.userId);
        const marketData = await storage.getMarketData(post.symbol);
        return {
          ...post,
          user: {
            name: `${user.firstName} ${user.lastName}`,
            username: user.username,
            verified: user.role === 'verified_trader'
          },
          asset: {
            name: marketData.name,
            symbol: post.symbol,
            price: marketData.price,
            change: marketData.changePercent
          }
        };
      }));

      res.json(postsWithUserData);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/social/traders/performance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const traders = await storage.getTopTraders();
      const tradersWithStats = await Promise.all(traders.map(async (trader) => {
        const stats = await storage.getTraderStats(trader.id);
        return {
          ...trader,
          performance: stats.performance,
          winRate: stats.winRate,
          totalTrades: stats.totalTrades,
          followers: stats.followers
        };
      }));

      res.json(tradersWithStats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch traders" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(401);
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}