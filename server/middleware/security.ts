import rateLimit from 'express-rate-limit';
import ExpressBrute from 'express-brute';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store);

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  legacyHeaders: false,
  standardHeaders: true
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  legacyHeaders: false,
  standardHeaders: true
});

export const securityMiddleware = [
  helmet(),
  rateLimiter,
  (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  }
];