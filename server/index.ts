import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupProductionVite } from "./production-vite";
import { setupAuth } from "./auth";
import path from "path";
import fs from "fs";
import { setupWebSocket } from "./websocket";
import { seedDatabase } from "./seed-db";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerBusinessRoutes } from "./routes/business";
import { registerUserRoutes } from "./routes/user";
import { storage } from "./storage";
import { cleanupOldChats } from "./cleanup";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Railway 등 리버스 프록시 뒤에서 동작할 때 필수 설정
// 프록시가 전달하는 X-Forwarded-Proto, X-Forwarded-For 헤더를 신뢰
app.set("trust proxy", 1);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), "public")));

// 한글 파일명 처리를 위한 인코딩 설정
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

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

// 정적 파일 제공 설정
app.use(express.static("public"));
app.use("/images", express.static("public/images"));

// Host bypass middleware - must come before Vite middleware
app.use((req, res, next) => {
  // Override host check for Railway, Replit environments and custom domains
  if (req.headers.host && (
    req.headers.host.includes('railway.app') ||
    req.headers.host.includes('replit.dev') || 
    req.headers.host.includes('replit.app') ||
    req.headers.host.includes('decomsoft.com') ||
    req.headers.host.includes('brainai.ai.kr')
  )) {
    req.headers.host = `localhost:${process.env.PORT || '5000'}`;
  }
  next();
});

// CORS 설정
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // For uncaught exceptions, we should exit gracefully
  process.exit(1);
});

(async () => {
  try {
    // Ensure 'program' column exists in 'seminars' table before seeding
    try {
      console.log("Checking/Adding columns and constraints...");
      await storage.query("ALTER TABLE seminars ADD COLUMN IF NOT EXISTS program TEXT;");
      await storage.query("ALTER TABLE overseas_programs ADD COLUMN IF NOT EXISTS category TEXT;");
      
      // Update instructors table
      await storage.query("ALTER TABLE instructors ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES users(id);");
      await storage.query("ALTER TABLE instructors ADD COLUMN IF NOT EXISTS subscribers INTEGER DEFAULT 0;");
      
      // Remove NOT NULL constraints from start_date and end_date in overseas_programs
      try {
        await storage.query("ALTER TABLE overseas_programs ALTER COLUMN start_date DROP NOT NULL;");
        await storage.query("ALTER TABLE overseas_programs ALTER COLUMN end_date DROP NOT NULL;");
        console.log("Updated overseas_programs constraints (dropped NOT NULL).");
      } catch (e) {
        console.log("Notice: overseas_programs constraints might already be updated.");
      }

      // Update courses table constraints for type and level
      try {
        await storage.query(`
          CREATE TABLE IF NOT EXISTS source_materials (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_url TEXT NOT NULL,
            parsed_text TEXT,
            page_count INTEGER,
            is_processed BOOLEAN DEFAULT false,
            upload_date TIMESTAMP DEFAULT NOW()
          );
        `);
        await storage.query(`
          CREATE TABLE IF NOT EXISTS exam_generations (
            id SERIAL PRIMARY KEY,
            source_id INTEGER NOT NULL REFERENCES source_materials(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            prompt_type TEXT NOT NULL,
            options JSONB,
            result_content JSONB,
            output_format TEXT,
            status TEXT DEFAULT 'pending',
            error_message TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        await storage.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS analysis_materials JSON;");
        await storage.query("ALTER TABLE courses ALTER COLUMN type DROP NOT NULL;");
        await storage.query("ALTER TABLE courses ALTER COLUMN level DROP NOT NULL;");
        await storage.query("ALTER TABLE courses ALTER COLUMN credit DROP NOT NULL;");
        console.log("Updated database schema: Added source_materials, exam_generations tables and analysis_materials column.");
      } catch (e) {
        console.log("Notice: database schema update might already be applied or partially failed:", e);
      }

      console.log("Database schema updated successfully.");
    } catch (dbErr) {
      console.error("Database schema update warning:", dbErr);
    }

    // Seed database on startup (with better error handling)
    try {
      await seedDatabase();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Database seeding failed:", error);
      // Continue running even if seeding fails
    }

    // Railway 헬스체크 엔드포인트
    app.get("/api/health", (_req, res) => {
      res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Setup authentication first
    setupAuth(app);

    // Setup business routes after auth
    registerBusinessRoutes(app);
    registerUserRoutes(app);

    // Then register other routes
    registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Error caught by middleware:', err);
      
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // Importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    
    // Use production-optimized Vite for deployment that bypasses host restrictions
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      await setupProductionVite(app, server);
    } else {
      await setupVite(app, server);
    }

    // Setup WebSocket after server is created and Vite is setup
    setupWebSocket(server);

    // Run initial cleanup on startup
    cleanupOldChats().catch(err => console.error("Initial chat cleanup failed:", err));

    // Schedule chat cleanup task (every 10 minutes)
    setInterval(() => {
      cleanupOldChats().catch(err => console.error("Chat cleanup failed:", err));
    }, 10 * 60 * 1000);

    // Railway는 PORT 환경변수를 동적으로 할당하므로 이를 우선 사용
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
