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
import { pool } from "./db";
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

      // 문제 유형 프롬프트 프리셋 테이블 생성 및 기본 데이터 등록
      try {
        await storage.query(`
          CREATE TABLE IF NOT EXISTS prompt_templates (
            id SERIAL PRIMARY KEY,
            type TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            task TEXT NOT NULL,
            constraints TEXT NOT NULL,
            output_format TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);

        // 기본 프리셋 데이터 삽입 (이미 존재하면 업데이트)
        const defaultTemplates = [
          {
            type: 'vocabulary',
            name: '어휘 문제',
            role: '너는 대한민국 중고등학교 내신 영어 어휘를 완벽히 분석하는 출제 위원이야. 능률/비상/YBM 교과서의 출제 경향을 정확히 숙지하고 있어.',
            task: '사용자가 입력한 지문에서 핵심 어휘를 선별하여, 문맥상 의미를 묻는 5지선다 어휘 문제를 생성해. 문맥에서 밑줄 친 어휘의 의미로 가장 적절한 것을 고르는 유형이야.',
            constraints: '1. 정답과 오답 선택지는 모두 같은 품사여야 해.\n2. 오답은 지문 내 다른 어휘나 유사 발음 단어로 구성해 혼동을 유발해야 해.\n3. 중학교 수준 이상의 핵심 어휘만 출제해.\n4. 정답 번호는 매번 다르게 설정해.',
            output_format: JSON.stringify({
              question: "다음 밑줄 친 단어의 문맥상 의미로 가장 적절한 것은?",
              passage: "문맥이 담긴 지문 (밑줄 친 어휘 포함)",
              options: ["1번 보기", "2번 보기", "3번 보기", "4번 보기", "5번 보기"],
              answer: "정답 번호 (1~5)",
              explanation: "출제 의도 및 어휘 해설"
            })
          },
          {
            type: 'grammar',
            name: '문법 문제',
            role: '너는 대한민국 중고등학교 내신 영어 문법을 전문으로 출제하는 최고 수준의 출제 위원이야. 수능 영어 문법 출제 패턴과 내신 서술형 유형을 완벽히 이해하고 있어.',
            task: '사용자가 입력한 지문에서 핵심 문법 요소(시제, 관계사, 준동사, 수일치 등)를 파악하고, 해당 문법 사항을 묻는 5지선다 문제를 생성해. 밑줄 친 부분 중 어법상 틀린 것을 고르는 유형이야.',
            constraints: '1. 반드시 지문 내 5개의 밑줄 친 부분을 만들고, 그 중 1개만 어법상 틀린 것으로 설정해.\n2. 오답 선택지는 실제로 쓰이는 올바른 영어 표현이어야 해.\n3. 오류 유형은 시제, 태(능동/수동), 수일치, 관계사 중에서 선택해.',
            output_format: JSON.stringify({
              question: "다음 밑줄 친 부분 중, 어법상 틀린 것은?",
              passage: "밑줄 친 ①②③④⑤가 포함된 지문",
              options: ["①", "②", "③", "④", "⑤"],
              answer: "정답 번호 (1~5)",
              explanation: "틀린 이유 및 올바른 표현 설명"
            })
          },
          {
            type: 'main_idea',
            name: '주제/요지 파악',
            role: '너는 대한민국 수능 및 내신 영어 독해 문제를 전문으로 출제하는 최상위 출제 위원이야. 글의 핵심 논지를 정확히 파악하고 함축적 표현을 이해하는 능력이 탁월해.',
            task: '사용자가 입력한 지문의 핵심 주제 또는 필자의 주장(요지)을 묻는 5지선다 문제를 생성해. 선택지는 글의 내용을 한국어로 압축하여 표현해야 해.',
            constraints: '1. 정답 선택지는 글의 핵심 논지를 정확히 반영해야 해.\n2. 오답 선택지는 지문에 언급된 세부 내용이거나, 지나치게 포괄적/협소한 내용으로 구성해.\n3. 선택지는 반드시 한국어로 작성해.',
            output_format: JSON.stringify({
              question: "다음 글의 주제로 가장 적절한 것은? (또는 '요지로 가장 적절한 것은?')",
              passage: "분석할 원문 지문",
              options: ["한국어 선택지 1", "한국어 선택지 2", "한국어 선택지 3", "한국어 선택지 4", "한국어 선택지 5"],
              answer: "정답 번호 (1~5)",
              explanation: "글의 핵심 논지 요약 및 정답 근거"
            })
          },
          {
            type: 'order',
            name: '순서 배열',
            role: '너는 대한민국 수능 및 내신 영어 독해 순서 배열 문제를 전문으로 출제하는 출제 위원이야. 글의 논리적 흐름과 연결사, 지시어를 통한 단락 간 관계를 완벽히 파악해.',
            task: '사용자가 입력한 지문을 주어진 첫 문단(주제문) 이후 (A), (B), (C) 세 단락으로 자연스럽게 분리하고, 올바른 글의 순서를 묻는 문제를 생성해.',
            constraints: '1. 첫 문단(주어진 글)은 주제나 상황을 제시하는 문장으로 구성해.\n2. (A), (B), (C)는 각각 2~3문장으로 구성해야 해.\n3. 단락 분리 시 연결어(However, Therefore, For example 등)를 활용해 논리적 흐름을 유지해.\n4. 정답 배열은 매번 다르게 설정해.',
            output_format: JSON.stringify({
              question: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?",
              given: "주어진 첫 문단",
              paragraphs: { A: "(A) 단락 내용", B: "(B) 단락 내용", C: "(C) 단락 내용" },
              options: ["(A)-(B)-(C)", "(A)-(C)-(B)", "(B)-(A)-(C)", "(B)-(C)-(A)", "(C)-(A)-(B)"],
              answer: "정답 번호 (1~5)",
              explanation: "각 단락의 연결 근거 및 논리적 흐름 설명"
            })
          },
          {
            type: 'blank',
            name: '빈칸 추론',
            role: '너는 대한민국 수능 및 내신 영어 독해 빈칸 추론 문제를 전문으로 출제하는 최상위 출제 위원이야. 글의 논리적 흐름에서 가장 핵심적인 부분을 빈칸으로 설정하는 능력이 탁월해.',
            task: '사용자가 입력한 지문에서 글의 핵심 논리나 주제를 담고 있는 핵심 어구(구 또는 절)를 선정하여 빈칸으로 처리하고, 문맥에 가장 적절한 것을 고르는 5지선다 빈칸 추론 문제를 생성해.',
            constraints: '1. 빈칸은 반드시 글의 핵심 주장이나 결론을 담은 부분에 설정해.\n2. 오답 선택지는 글에 등장한 소재는 같지만 논리적으로 어긋나는 내용으로 구성해.\n3. 빈칸에 들어갈 내용은 단어 1~2개가 아닌 구(phrase) 이상의 단위로 설정해.',
            output_format: JSON.stringify({
              question: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
              passage: "빈칸(______)이 포함된 지문",
              options: ["영어 선택지 1", "영어 선택지 2", "영어 선택지 3", "영어 선택지 4", "영어 선택지 5"],
              answer: "정답 번호 (1~5)",
              explanation: "빈칸 추론 근거 및 논리적 흐름 설명"
            })
          },
          {
            type: 'summary',
            name: '요약문 완성',
            role: '너는 대한민국 수능 영어 영역 요약문 완성 문제를 전문으로 출제하는 출제 위원이야. 원문의 핵심 내용을 정확하게 압축하는 요약 능력과 적절한 어휘 선택 능력이 탁월해.',
            task: '사용자가 입력한 지문의 내용을 2~3문장으로 압축한 요약문을 만들고, 요약문의 핵심 빈칸 2개에 들어갈 단어를 각각 5지선다로 묻는 문제를 생성해.',
            constraints: '1. 요약문의 빈칸 (A)와 (B)는 반드시 다른 품사 또는 다른 의미 범주에서 선택해.\n2. 오답 선택지는 지문에 등장한 단어이거나 유사 의미의 단어로 구성해.\n3. 요약문은 원문보다 추상적이고 포괄적인 표현을 사용해야 해.',
            output_format: JSON.stringify({
              question: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?",
              passage: "원문 지문",
              summary: "요약문 (빈칸 (A)와 (B) 포함)",
              optionsA: ["(A) 선택지 1", "선택지 2", "선택지 3", "선택지 4", "선택지 5"],
              optionsB: ["(B) 선택지 1", "선택지 2", "선택지 3", "선택지 4", "선택지 5"],
              answer: "(A): 정답번호, (B): 정답번호",
              explanation: "각 빈칸의 선택 근거"
            })
          }
        ];

        for (const tmpl of defaultTemplates) {
          await pool.query(`
            INSERT INTO prompt_templates (type, name, role, task, constraints, output_format, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            ON CONFLICT (type) DO UPDATE SET
              name = EXCLUDED.name,
              role = EXCLUDED.role,
              task = EXCLUDED.task,
              constraints = EXCLUDED.constraints,
              output_format = EXCLUDED.output_format,
              updated_at = NOW()
          `, [tmpl.type, tmpl.name, tmpl.role, tmpl.task, tmpl.constraints, tmpl.output_format]);
        }

        console.log("✅ prompt_templates 테이블 및 기본 프리셋 6종 등록 완료");
      } catch (e) {
        console.log("Notice: prompt_templates 테이블 설정 중 오류:", e);
      }

      } catch (e) {
        console.log("Notice: database schema update might already be applied or partially failed:", e);
      }

      console.log("Database schema updated successfully.");
    } catch (dbErr) {
      console.error("Database schema update warning:", dbErr);
    }

    // saved_custom_prompts 테이블 생성
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS saved_custom_prompts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log("✅ saved_custom_prompts 테이블 준비 완료");
    } catch (e) {
      console.log("Notice: saved_custom_prompts table:", e);
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
