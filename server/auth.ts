import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { sendAdminNotification } from "./websocket";
import { User as SelectUser } from "../shared/schema.js";

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
  if (!stored || !stored.includes(".")) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return (
      hashedBuf.length === suppliedBuf.length &&
      timingSafeEqual(hashedBuf, suppliedBuf)
    );
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === "production";

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: isProduction,        // 프로덕션(HTTPS)에서는 secure 쿠키 사용
      httpOnly: true,               // XSS 공격 방지를 위해 httpOnly 활성화
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
      sameSite: isProduction ? "none" : "lax",  // 크로스사이트 요청 시 쿠키 전달 허용
      domain: undefined,
    },
    name: "connect.sid",
    rolling: true,
    proxy: isProduction,            // 리버스 프록시 뒤에서 secure 쿠키 사용 시 필수
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Try to find user by username first, then by email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }

            // Check if user already exists
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user
              user = await storage.createUser({
                username: email,
                email: email,
                name:
                  profile.displayName ||
                  profile.name?.givenName ||
                  "Google User",
                userType: "individual",
                password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  // Kakao OAuth Strategy
  if (process.env.KAKAO_CLIENT_ID) {
    passport.use(
      new KakaoStrategy(
        {
          clientID: process.env.KAKAO_CLIENT_ID,
          callbackURL: "/api/auth/kakao/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile._json?.kakao_account?.email;
            const nickname = profile._json?.properties?.nickname;

            if (!email) {
              return done(new Error("No email found in Kakao profile"));
            }

            // Check if user already exists
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user
              user = await storage.createUser({
                username: email,
                email: email,
                name: nickname || "Kakao User",
                userType: "individual",
                password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  passport.serializeUser((user: any, done) => {
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === "development") {
      console.log("Serializing user:", user.id);
    }
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, user);
      } else {
        // 사용자를 찾을 수 없는 경우에만 로그 출력
        console.log("User not found during deserialization for ID:", id);
        done(null, false);
      }
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    const { username, password, userType, businessNumber } = req.body;

    // 입력 검증
    if (!username || !password || !userType) {
      return res
        .status(400)
        .json({ message: "모든 필수 필드를 입력해주세요." });
    }

    // 선생님회원인 경우 사업자번호 필수 검증
    if (userType === "business" && !businessNumber) {
      return res
        .status(400)
        .json({ message: "선생님회원 로그인 시 사업자번호는 필수입니다." });
    }

    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res
          .status(500)
          .json({ message: "로그인 중 오류가 발생했습니다." });
      }

      if (!user) {
        return res
          .status(401)
          .json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
      }

      // 회원 유형 검증
      if (user.userType !== userType) {
        const memberTypeText =
          userType === "business" ? "선생님회원" : "개인회원";
        const userTypeText =
          user.userType === "business" ? "선생님회원" : "개인회원";
        return res.status(401).json({
          message: `${memberTypeText}으로 로그인하려 하셨지만, 등록된 계정은 ${userTypeText}입니다.`,
          userType: user.userType,
        });
      }

      // 선생님회원의 경우 사업자번호 검증
      if (userType === "business") {
        if (!user.businessNumber) {
          return res
            .status(401)
            .json({
              message: "등록된 사업자번호가 없습니다. 관리자에게 문의해주세요.",
            });
        }

        if (user.businessNumber !== businessNumber) {
          return res
            .status(401)
            .json({ message: "사업자번호가 일치하지 않습니다." });
        }
      }

      // 계정 활성화 상태 확인
      if (!user.isActive) {
        return res
          .status(401)
          .json({ message: "비활성화된 계정입니다. 관리자에게 문의해주세요." });
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Session login error:", err);
          return res
            .status(500)
            .json({ message: "로그인 세션 생성 중 오류가 발생했습니다." });
        }

        if (process.env.NODE_ENV === "development") {
          console.log(
            "User logged in successfully:",
            user.username,
            "Type:",
            user.userType,
          );
        }

        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    // 개발 환경에서만 디버그 로그 출력
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_AUTH) {
      console.log("User info - Session ID:", req.sessionID);
      console.log("User info - isAuthenticated:", req.isAuthenticated());
      console.log("User info - user:", req.user);
      console.log("User info - session:", req.session);
    }

    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    res.json(req.user);
  });

  // OAuth Routes

  // Google OAuth
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth?error=google_login_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect("/");
    },
  );

  // Kakao OAuth
  app.get("/api/auth/kakao", passport.authenticate("kakao"));

  app.get(
    "/api/auth/kakao/callback",
    passport.authenticate("kakao", {
      failureRedirect: "/auth?error=kakao_login_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect("/");
    },
  );
}

// 인증 필요 미들웨어
export function requireAuth(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  next();
}
