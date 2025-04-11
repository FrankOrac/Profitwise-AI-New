import { db } from "./db";
import { 
  users, 
  portfolioAssets, 
  aiInsights, 
  educationalContent, 
  subscriptionPlans, 
  User, 
  InsertUser, 
  PortfolioAsset, 
  InsertPortfolioAsset, 
  AiInsight, 
  InsertAiInsight,
  EducationalContent,
  SubscriptionPlan
} from "@shared/schema";
import { IStorage } from "./storage";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
    }).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Portfolio operations
  async getPortfolioAssets(userId: number): Promise<PortfolioAsset[]> {
    const assets = await db.select().from(portfolioAssets).where(eq(portfolioAssets.userId, userId));

    // Fetch real-time prices from CoinGecko API
    const updatedAssets = await Promise.all(assets.map(async (asset) => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${asset.symbol.toLowerCase()}&vs_currencies=usd`);
        const data = await response.json();
        const currentPrice = data[asset.symbol.toLowerCase()]?.usd || asset.currentPrice;
        const value = (parseFloat(asset.quantity) * parseFloat(currentPrice)).toString();
        return { ...asset, currentPrice: currentPrice.toString(), value };
      } catch (err) {
        return asset;
      }
    }));

    return updatedAssets;
  }

  async addPortfolioAsset(asset: InsertPortfolioAsset): Promise<PortfolioAsset> {
    const [newAsset] = await db
      .insert(portfolioAssets)
      .values({
        ...asset,
        icon: asset.icon || null
      })
      .returning();
    return newAsset;
  }

  async updatePortfolioAsset(id: number, assetData: Partial<PortfolioAsset>): Promise<PortfolioAsset | undefined> {
    const [updatedAsset] = await db
      .update(portfolioAssets)
      .set(assetData)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return updatedAsset;
  }

  async deletePortfolioAsset(id: number): Promise<boolean> {
    const [deletedAsset] = await db
      .delete(portfolioAssets)
      .where(eq(portfolioAssets.id, id))
      .returning();
    return !!deletedAsset;
  }

  // AI Insights operations
  async getAiInsights(userId: number): Promise<AiInsight[]> {
    return db.select().from(aiInsights).where(eq(aiInsights.userId, userId));
  }

  async addAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const [newInsight] = await db
      .insert(aiInsights)
      .values({
        ...insight,
        icon: insight.icon || null
      })
      .returning();
    return newInsight;
  }

  // Educational content operations
  async getAllEducationalContent(): Promise<EducationalContent[]> {
    return db.select().from(educationalContent);
  }

  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    const [content] = await db.select().from(educationalContent).where(eq(educationalContent.id, id));
    return content;
  }

  // Subscription plans operations
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans);
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }
}