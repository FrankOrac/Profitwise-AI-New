import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format");
      return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export const authenticateUser = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
};

export const verify = async (token: string) => {
  try {
    // Implement token verification logic
    return true; // For now, accept all tokens
  } catch (error) {
    return false;
  }
};

import { securityMiddleware, loginLimiter } from './middleware/security';
import { TwoFactorService } from './services/two-factor';

export function setupAuth(app: Express) {
  // Apply security middleware
  app.use(securityMiddleware);

  const sessionSettings: session.SessionOptions = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    secret: process.env.SESSION_SECRET || "profitwise-ai-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Extend the base schema with additional validation
      const registerSchema = insertUserSchema.extend({
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      });

      const userData = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/2fa/setup", authenticateUser, async (req, res) => {
    try {
      const { secret, qrCode } = await TwoFactorService.generateSecret(req.user!.id);
      res.json({ secret, qrCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  app.post("/api/2fa/verify", authenticateUser, async (req, res) => {
    try {
      const isValid = await TwoFactorService.verifyToken(req.user!.id, req.body.token);
      if (isValid) {
        await db.update(users)
          .set({ twoFactorEnabled: true })
          .where(eq(users.id, req.user!.id));
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid 2FA token" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to verify 2FA token" });
    }
  });

  app.post("/api/login", loginLimiter, async (req, res, next) => {
    try {
      console.log("Login attempt:", {
        username: req.body.username,
        hasPassword: !!req.body.password,
        sessionStore: !!storage.sessionStore,
        dbConnected: !!storage.pool
      });

      res.setHeader('Content-Type', 'application/json');

      // Check database connection
      try {
        const dbCheck = await storage.pool.query('SELECT 1');
        console.log("Database connection check:", dbCheck.rowCount === 1);
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        return res.status(500).json({ message: "Database connection error" });
      }

      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      if (!storage.sessionStore) {
        console.error("Session store not initialized");
        return res.status(500).json({ message: "Session store error" });
      }

      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Session error:", loginErr);
            return res.status(500).json({ message: "Failed to create session" });
          }

          return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error("Unexpected login error:", error);
      return res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Add an admin user if none exists
  (async () => {
    const adminUser = await storage.getUserByUsername("admin");

    if (!adminUser) {
      try {
        const admin = {
          username: "admin",
          password: await hashPassword("admin123"),
          email: "admin@profitwise.ai",
          firstName: "Admin",
          lastName: "User",
        };

        const user = await storage.createUser(admin);
        await storage.updateUser(user.id, { role: "admin" });
        console.log("Admin user created with username: admin and password: admin123");
      } catch (error) {
        console.error("Failed to create admin user:", error);
      }
    }
  })().catch(error => {
    console.error("Auth initialization error:", error);
  });
}