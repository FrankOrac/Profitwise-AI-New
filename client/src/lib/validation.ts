
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const portfolioAssetSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.string().regex(/^\d*\.?\d+$/, "Must be a valid number"),
  type: z.enum(["crypto", "stock", "commodity"]),
});

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Must be a valid email"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PortfolioAssetInput = z.infer<typeof portfolioAssetSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
