import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertPortfolioAssetSchema, insertAiInsightSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

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
      const openai = await storage.getAIService();
      const analysis = await openai.analyze({
        portfolio,
        marketData,
        userId
      });
      
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
    const content = await storage.getAllEducationalContent();
    res.json(content);
  });
  
  app.get("/api/education/:id", async (req, res) => {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }
    
    const content = await storage.getEducationalContentById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    res.json(content);
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
  
  // Admin routes for user management
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
