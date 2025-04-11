import { 
  users, 
  User, 
  InsertUser, 
  portfolioAssets, 
  PortfolioAsset, 
  InsertPortfolioAsset,
  aiInsights,
  AiInsight,
  InsertAiInsight,
  educationalContent,
  EducationalContent,
  InsertEducationalContent,
  subscriptionPlans,
  SubscriptionPlan,
  InsertSubscriptionPlan
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Portfolio operations
  getPortfolioAssets(userId: number): Promise<PortfolioAsset[]>;
  addPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset>;
  updatePortfolioAsset(id: number, assetData: Partial<PortfolioAsset>): Promise<PortfolioAsset | undefined>;
  deletePortfolioAsset(id: number): Promise<boolean>;
  
  // AI Insights operations
  getAiInsights(userId: number): Promise<AiInsight[]>;
  addAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  
  // Educational content operations
  getAllEducationalContent(): Promise<EducationalContent[]>;
  getEducationalContentById(id: number): Promise<EducationalContent | undefined>;
  
  // Subscription plans operations
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolioAssets: Map<number, PortfolioAsset>;
  private aiInsightsData: Map<number, AiInsight>;
  private educationalContentData: Map<number, EducationalContent>;
  private subscriptionPlansData: Map<number, SubscriptionPlan>;
  
  sessionStore: session.SessionStore;
  
  currentId: {
    users: number;
    portfolioAssets: number;
    aiInsights: number;
    educationalContent: number;
    subscriptionPlans: number;
  };

  constructor() {
    this.users = new Map();
    this.portfolioAssets = new Map();
    this.aiInsightsData = new Map();
    this.educationalContentData = new Map();
    this.subscriptionPlansData = new Map();
    
    this.currentId = {
      users: 1,
      portfolioAssets: 1,
      aiInsights: 1,
      educationalContent: 1,
      subscriptionPlans: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with default subscription plans
    this.initDefaultData();
  }

  private initDefaultData() {
    // Add default subscription plans
    const basicPlan: InsertSubscriptionPlan = {
      name: 'Basic',
      price: 'Free',
      description: 'Get started with basic tools',
      features: [
        { text: 'Portfolio tracking (up to 5 assets)', included: true },
        { text: 'Basic market data', included: true },
        { text: 'Weekly AI insights (limited)', included: true },
        { text: 'Advanced portfolio analytics', included: false },
        { text: 'Real-time alerts', included: false }
      ],
      isPopular: false
    };
    
    const proPlan: InsertSubscriptionPlan = {
      name: 'Pro',
      price: '$19',
      description: 'Advanced tools for serious investors',
      features: [
        { text: 'Unlimited portfolio tracking', included: true },
        { text: 'Advanced market data & indicators', included: true },
        { text: 'Daily AI insights & recommendations', included: true },
        { text: 'Advanced portfolio analytics', included: true },
        { text: 'Real-time price alerts', included: true }
      ],
      isPopular: true
    };
    
    const enterprisePlan: InsertSubscriptionPlan = {
      name: 'Enterprise',
      price: '$49',
      description: 'For professional traders & institutions',
      features: [
        { text: 'Everything in Pro plan', included: true },
        { text: 'API access for custom integrations', included: true },
        { text: 'Custom AI model training', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'White-label options available', included: true }
      ],
      isPopular: false
    };
    
    this.addSubscriptionPlan(basicPlan);
    this.addSubscriptionPlan(proPlan);
    this.addSubscriptionPlan(enterprisePlan);
    
    // Add educational content
    const content1: InsertEducationalContent = {
      title: 'Understanding Blockchain Technology',
      description: 'Learn the fundamentals of blockchain and how it powers cryptocurrencies like Bitcoin and Ethereum.',
      category: 'CRYPTOCURRENCY',
      difficulty: 'Beginner',
      duration: '15 min',
      imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://example.com/blockchain-basics',
      accessTier: 'basic'
    };
    
    const content2: InsertEducationalContent = {
      title: 'Stock Market Fundamentals',
      description: 'Master the basics of stock investing, including how to read charts, understand P/E ratios, and analyze companies.',
      category: 'INVESTING',
      difficulty: 'Beginner',
      duration: '22 min',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://example.com/stock-market-basics',
      accessTier: 'basic'
    };
    
    const content3: InsertEducationalContent = {
      title: 'Technical Analysis Masterclass',
      description: 'Learn to identify patterns, trends, and signals that can help predict future price movements.',
      category: 'ANALYSIS',
      difficulty: 'Intermediate',
      duration: '30 min',
      imageUrl: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=500&q=80',
      videoUrl: 'https://example.com/technical-analysis',
      accessTier: 'pro'
    };
    
    this.addEducationalContent(content1);
    this.addEducationalContent(content2);
    this.addEducationalContent(content3);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, role: 'user', subscriptionTier: 'basic' };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Portfolio operations
  async getPortfolioAssets(userId: number): Promise<PortfolioAsset[]> {
    return Array.from(this.portfolioAssets.values()).filter(
      (asset) => asset.userId === userId
    );
  }
  
  async addPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const id = this.currentId.portfolioAssets++;
    const newAsset: PortfolioAsset = { ...asset, id };
    this.portfolioAssets.set(id, newAsset);
    return newAsset;
  }
  
  async updatePortfolioAsset(id: number, assetData: Partial<PortfolioAsset>): Promise<PortfolioAsset | undefined> {
    const asset = this.portfolioAssets.get(id);
    if (!asset) return undefined;
    
    const updatedAsset = { ...asset, ...assetData };
    this.portfolioAssets.set(id, updatedAsset);
    return updatedAsset;
  }
  
  async deletePortfolioAsset(id: number): Promise<boolean> {
    return this.portfolioAssets.delete(id);
  }
  
  // AI Insights operations
  async getAiInsights(userId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsightsData.values()).filter(
      (insight) => insight.userId === userId
    );
  }
  
  async addAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const id = this.currentId.aiInsights++;
    const now = new Date();
    const newInsight: AiInsight = { ...insight, id, createdAt: now };
    this.aiInsightsData.set(id, newInsight);
    return newInsight;
  }
  
  // Educational content operations
  async getAllEducationalContent(): Promise<EducationalContent[]> {
    return Array.from(this.educationalContentData.values());
  }
  
  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    return this.educationalContentData.get(id);
  }
  
  async addEducationalContent(content: InsertEducationalContent): Promise<EducationalContent> {
    const id = this.currentId.educationalContent++;
    const newContent: EducationalContent = { ...content, id };
    this.educationalContentData.set(id, newContent);
    return newContent;
  }
  
  // Subscription plans operations
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlansData.values());
  }
  
  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlansData.get(id);
  }
  
  async addSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentId.subscriptionPlans++;
    const newPlan: SubscriptionPlan = { ...plan, id };
    this.subscriptionPlansData.set(id, newPlan);
    return newPlan;
  }
}

export const storage = new MemStorage();
