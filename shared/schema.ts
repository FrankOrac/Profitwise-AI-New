import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("user").notNull(),
  subscriptionTier: text("subscription_tier").default("basic").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

// Portfolio Assets Table
export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  quantity: text("quantity").notNull(),
  currentPrice: text("current_price").notNull(),
  value: text("value").notNull(),
  changePercent: text("change_percent").notNull(),
  icon: text("icon"),
});

export const insertPortfolioAssetSchema = createInsertSchema(portfolioAssets).pick({
  userId: true,
  symbol: true,
  name: true,
  type: true,
  quantity: true,
  currentPrice: true,
  value: true,
  changePercent: true,
  icon: true,
});

// AI Insights Table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  icon: text("icon"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).pick({
  userId: true,
  type: true,
  title: true,
  content: true,
  icon: true,
  status: true,
});

// Educational Content Table
export const educationalContent = pgTable("educational_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: text("duration").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  accessTier: text("access_tier").notNull(),
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).pick({
  title: true,
  description: true,
  category: true,
  difficulty: true,
  duration: true,
  imageUrl: true,
  videoUrl: true,
  accessTier: true,
});

// Subscription Plans Table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  price: text("price").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").notNull(),
  isPopular: boolean("is_popular").default(false),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  price: true,
  description: true,
  features: true,
  isPopular: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolioAsset = z.infer<typeof insertPortfolioAssetSchema>;
export type PortfolioAsset = typeof portfolioAssets.$inferSelect;

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type EducationalContent = typeof educationalContent.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
import { pgTable, serial, text, timestamp, boolean, integer, decimal } from 'drizzle-orm/pg-core';

// User management
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').default('user').notNull(),
  subscriptionTier: text('subscription_tier').default('basic').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Portfolio assets
export const portfolioAssets = pgTable('portfolio_assets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  symbol: text('symbol').notNull(),
  quantity: decimal('quantity').notNull(),
  purchasePrice: decimal('purchase_price').notNull(),
  currentPrice: decimal('current_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// AI Insights
export const aiInsights = pgTable('ai_insights', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  icon: text('icon').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Educational content
export const educationalContent = pgTable('educational_content', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  duration: text('duration').notNull(),
  instructor: text('instructor').notNull(),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  rating: decimal('rating'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Subscription plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: text('price').notNull(),
  description: text('description').notNull(),
  features: text('features').array().notNull()
});
