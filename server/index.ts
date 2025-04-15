import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.set('trust proxy', 1); // Trust first proxy
import { createServer } from 'http';
const server = createServer(app);
import { WebSocketService } from './services/websocket';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import security middleware
import { securityMiddleware, loginLimiter, apiLimiter } from './middleware/security';

// Apply security middleware
app.use(securityMiddleware);
app.use('/api/login', loginLimiter);
app.use('/api', apiLimiter);

// Initialize database before starting server
import { initializeDatabase } from './db';
await initializeDatabase();

// Initialize WebSocket service
const wsService = new WebSocketService();
export { wsService };

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Log error for debugging
    console.error(`Error ${status} on ${req.method} ${req.path}:`, err);

    // Send safe error response to client
    res.status(status).json({
      status: 'error',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      code: status,
      ...(isProduction ? {} : { stack: err.stack })
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    console.error('Unhandled Promise Rejection:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // Give the server a grace period to finish pending requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();