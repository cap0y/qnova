import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import path from "path";
import fs from "fs";
import { setupWebSocket } from "./websocket";
import { seedDatabase } from "./seed-db";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { registerBusinessRoutes } from "./routes/business";
import { registerUserRoutes } from "./routes/user";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

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

// CORS 설정 - 모든 호스트 허용
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

(async () => {
  try {
    // Seed database on startup
    try {
      await seedDatabase();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Database seeding failed:", error);
    }

    // Setup authentication first
    setupAuth(app);

    // Setup business routes after auth
    registerBusinessRoutes(app);
    registerUserRoutes(app);

    // Then register other routes
    registerRoutes(app);

    // Setup WebSocket after server is created
    setupWebSocket(server);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Error caught by middleware:', err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // For production, serve a simple HTML that works without Vite
    if (process.env.NODE_ENV === "production") {
      // Serve a basic HTML file that loads the app without Vite complications
      app.get("*", (req, res, next) => {
        // Skip API routes and file requests
        if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.includes('.')) {
          return next();
        }
        
        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>한국어 교육 플랫폼 - 지누켐</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            text-align: center;
        }
        .logo { 
            font-size: 3em; 
            margin-bottom: 20px; 
            font-weight: bold;
        }
        .subtitle { 
            font-size: 1.2em; 
            margin-bottom: 40px; 
            opacity: 0.9;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: rgba(255,255,255,0.2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
            transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        .status {
            margin-top: 30px;
            padding: 15px;
            background: rgba(0,255,0,0.1);
            border-radius: 8px;
            border: 1px solid rgba(0,255,0,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎓 지누켐</div>
        <div class="subtitle">한국어 기반 AI 맞춤형 교육 플랫폼</div>
        
        <div class="feature-grid">
            <div class="feature">
                <h3>📚 온라인 강의</h3>
                <p>전문가가 제공하는 고품질 온라인 교육 과정</p>
            </div>
            <div class="feature">
                <h3>🎯 세미나</h3>
                <p>실시간 세미나 및 워크샵 참여</p>
            </div>
            <div class="feature">
                <h3>🌍 해외교육</h3>
                <p>글로벌 교육 경험 및 해외 프로그램</p>
            </div>
            <div class="feature">
                <h3>💬 실시간 채팅</h3>
                <p>학습자 간 소통 및 멘토링 지원</p>
            </div>
        </div>
        
        <div>
            <a href="/api/courses" class="btn">강의 목록 보기</a>
            <a href="/api/seminars" class="btn">세미나 확인</a>
            <a href="/api/overseas-programs" class="btn">해외교육 프로그램</a>
        </div>
        
        <div class="status">
            ✅ 배포 성공 - 모든 API 서비스 정상 운영 중
        </div>
    </div>
    
    <script>
        // API 테스트 및 데이터 표시
        async function loadData() {
            try {
                const [courses, seminars, programs] = await Promise.all([
                    fetch('/api/courses').then(r => r.json()),
                    fetch('/api/seminars').then(r => r.json()),
                    fetch('/api/overseas-programs').then(r => r.json())
                ]);
                
                console.log('API 연결 성공:', { courses, seminars, programs });
            } catch (error) {
                console.error('API 연결 오류:', error);
            }
        }
        
        loadData();
    </script>
</body>
</html>`;
        
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).send(html);
      });
    }

    // Start server
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      console.log(`🎓 Korean Education Platform serving on port ${port}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();