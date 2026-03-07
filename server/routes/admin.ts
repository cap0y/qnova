import { Express } from "express";
import { storage } from "../storage";
import { pool } from "../db";

export function registerAdminRoutes(app: Express) {
  // 관리자 권한 확인 미들웨어
  const requireAdmin = (req: any, res: any, next: any) => {
    // 개발 환경에서만 디버그 로그 출력
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_AUTH) {
      console.log("requireAdmin - isAuthenticated:", req.isAuthenticated());
      console.log("requireAdmin - user:", req.user);
      console.log("requireAdmin - user.isAdmin:", req.user?.isAdmin);
      console.log("requireAdmin - user.role:", req.user?.role);
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!req.user || (!req.user.isAdmin && req.user.role !== "admin")) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    next();
  };

  // 대시보드 통계
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "통계 조회 중 오류가 발생했습니다." });
    }
  });

  // 분석 통계 (Analytics)
  app.get("/api/admin/analytics-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAnalyticsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      res
        .status(500)
        .json({ message: "분석 통계 조회 중 오류가 발생했습니다." });
    }
  });

  // 승인 대기 중인 선생님 목록
  app.get("/api/admin/pending-businesses", requireAdmin, async (req, res) => {
    try {
      const pendingBusinesses = await storage.getPendingBusinesses();
      res.json(pendingBusinesses);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 승인 대기 중인 강의 목록
  app.get("/api/admin/pending-courses", requireAdmin, async (req, res) => {
    try {
      const pendingCourses = await storage.getPendingCourses();
      res.json(pendingCourses);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 전체 사용자 목록
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 사용자 상세 정보 및 통계
  app.get(
    "/api/admin/users/:userId/details",
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
          return res
            .status(400)
            .json({ message: "유효하지 않은 사용자 ID입니다." });
        }

        // 사용자 기본 정보
        const user = await storage.getUser(userId);
        if (!user) {
          return res
            .status(404)
            .json({ message: "사용자를 찾을 수 없습니다." });
        }

        // 사용자 활동 통계 - 각각 개별적으로 처리하여 하나가 실패해도 다른 것들은 계속 진행
        let enrollments: any[] = [];
        let payments: any[] = [];
        let courses: any[] = [];

        try {
          enrollments = await storage.getEnrollments(userId);
        } catch (error) {
          console.error("Error fetching user enrollments:", error);
        }

        try {
          payments = await storage.getPayments(userId);
        } catch (error) {
          console.error("Error fetching user payments:", error);
        }

        if (user.userType === "business") {
          try {
            courses = await storage.getCoursesByProvider(userId);
          } catch (error) {
            console.error("Error fetching user courses:", error);
          }
        }

        const userStats = {
          totalEnrollments: enrollments.length,
          totalPayments: payments.length,
          totalSpent: payments
            .filter((p) => p.status === "completed")
            .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0),
          totalCourses: courses.length,
          lastLoginDate: user.updatedAt || user.createdAt,
        };

        res.json({
          user,
          stats: userStats,
          enrollments: enrollments.slice(0, 5), // 최근 5개만
          payments: payments.slice(0, 5), // 최근 5개만
          courses: courses.slice(0, 5), // 최근 5개만
        });
      } catch (error: any) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
          message: "사용자 상세 정보 조회 중 오류가 발생했습니다.",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        });
      }
    },
  );

  // 선생님 승인/거부
  app.put(
    "/api/admin/business-approval/:businessId",
    requireAdmin,
    async (req, res) => {
      try {
        const businessId = parseInt(req.params.businessId);
        const { action, reason } = req.body;

        if (!["approve", "reject"].includes(action)) {
          return res.status(400).json({ message: "유효하지 않은 액션입니다." });
        }

        const result = await storage.updateBusinessApproval(
          businessId,
          action,
          reason,
        );
        res.json(result);
      } catch (error) {
        console.error("Error updating business approval:", error);
        res
          .status(500)
          .json({ message: "선생님 승인 처리 중 오류가 발생했습니다." });
      }
    },
  );

  // 강의 승인/거부
  app.put(
    "/api/admin/course-approval/:courseId",
    requireAdmin,
    async (req, res) => {
      try {
        const courseId = parseInt(req.params.courseId);
        const { action, reason } = req.body;

        if (!["approve", "reject"].includes(action)) {
          return res.status(400).json({ message: "유효하지 않은 액션입니다." });
        }

        const result = await storage.updateCourseApproval(
          courseId,
          action,
          reason,
        );
        res.json(result);
      } catch (error) {
        console.error("Error updating course approval:", error);
        res
          .status(500)
          .json({ message: "강의 승인 처리 중 오류가 발생했습니다." });
      }
    },
  );

  // 사용자 상태 업데이트 (활성화/비활성화)
  app.put("/api/admin/users/:userId/status", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isActive } = req.body;

      const result = await storage.updateUser(userId, { isActive });
      res.json(result);
    } catch (error) {
      console.error("Error updating user status:", error);
      res
        .status(500)
        .json({ message: "사용자 상태 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 사용자 역할 업데이트
  app.put("/api/admin/users/:userId/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { role, isAdmin } = req.body;

      const result = await storage.updateUser(userId, { role, isAdmin });
      res.json(result);
    } catch (error) {
      console.error("Error updating user role:", error);
      res
        .status(500)
        .json({ message: "사용자 역할 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 사용자 삭제
  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      // 자기 자신은 삭제할 수 없음
      if (req.user && userId === req.user.id) {
        return res
          .status(400)
          .json({ message: "자기 자신의 계정은 삭제할 수 없습니다." });
      }

      await storage.deleteUser(userId);
      res.json({ message: "사용자가 성공적으로 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "사용자 삭제 중 오류가 발생했습니다." });
    }
  });

  // 전체 문제집 목록 조회
  app.get("/api/admin/overseas", requireAdmin, async (req, res) => {
    try {
      const overseas = await storage.getAllOverseasPrograms();
      res.json(overseas);
    } catch (error) {
      console.error("Error fetching all overseas programs:", error);
      res.status(500).json({ message: "문제집 목록 조회 중 오류가 발생했습니다." });
    }
  });

  // ─── 프롬프트 템플릿 관리 (관리자 전용) ───────────────────────────────────

  // 전체 목록 조회
  app.get("/api/admin/prompt-templates", requireAdmin, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM prompt_templates ORDER BY id ASC");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      res.status(500).json({ message: "프롬프트 템플릿 조회 중 오류가 발생했습니다." });
    }
  });

  // 단일 조회
  app.get("/api/admin/prompt-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await pool.query("SELECT * FROM prompt_templates WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching prompt template:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 수정
  app.put("/api/admin/prompt-templates/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, role, task, constraints, output_format, is_active } = req.body;
      const result = await pool.query(
        `UPDATE prompt_templates
         SET name=$1, role=$2, task=$3, constraints=$4, output_format=$5, is_active=$6, updated_at=NOW()
         WHERE id=$7 RETURNING *`,
        [name, role, task, constraints, output_format, is_active, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "템플릿을 찾을 수 없습니다." });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating prompt template:", error);
      res.status(500).json({ message: "템플릿 수정 중 오류가 발생했습니다." });
    }
  });

  // ─── 선생님이 사용하는 공개 프롬프트 조회 (활성화된 것만) ─────────────────
  app.get("/api/prompt-templates", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, type, name FROM prompt_templates WHERE is_active = true ORDER BY id ASC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching active prompt templates:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 특정 타입의 전체 프롬프트 정보 조회 (AI 호출 시 사용)
  app.get("/api/prompt-templates/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const result = await pool.query(
        "SELECT * FROM prompt_templates WHERE type = $1 AND is_active = true",
        [type]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "해당 유형의 템플릿을 찾을 수 없습니다." });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching prompt template by type:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // ─── 저장된 커스텀 프롬프트 CRUD ─────────────────────────────────────────

  // 목록 조회 (로그인 사용자 본인 것만)
  app.get("/api/saved-prompts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
    try {
      const result = await pool.query(
        "SELECT id, name, content, created_at FROM saved_custom_prompts WHERE user_id = $1 ORDER BY created_at DESC",
        [(req.user as any).id]
      );
      res.json(result.rows);
    } catch (e) {
      console.error("saved-prompts GET error:", e);
      res.status(500).json({ message: "서버 오류" });
    }
  });

  // 새 프롬프트 저장
  app.post("/api/saved-prompts", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
    const { name, content } = req.body;
    if (!name?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "이름과 내용을 모두 입력해주세요." });
    }
    try {
      const result = await pool.query(
        "INSERT INTO saved_custom_prompts (user_id, name, content) VALUES ($1, $2, $3) RETURNING id, name, content, created_at",
        [(req.user as any).id, name.trim(), content.trim()]
      );
      res.status(201).json(result.rows[0]);
    } catch (e) {
      console.error("saved-prompts POST error:", e);
      res.status(500).json({ message: "서버 오류" });
    }
  });

  // 삭제
  app.delete("/api/saved-prompts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
    try {
      const result = await pool.query(
        "DELETE FROM saved_custom_prompts WHERE id = $1 AND user_id = $2 RETURNING id",
        [req.params.id, (req.user as any).id]
      );
      if (result.rowCount === 0) return res.status(404).json({ message: "찾을 수 없습니다." });
      res.json({ success: true });
    } catch (e) {
      console.error("saved-prompts DELETE error:", e);
      res.status(500).json({ message: "서버 오류" });
    }
  });

  // 결제 목록 조회
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const { status, userId, courseId, page = 1, limit = 50 } = req.query;
      const payments = await storage.getPayments(
        userId ? parseInt(userId as string) : undefined,
      );

      // 필터링
      let filteredPayments = payments;
      if (status && status !== "all") {
        filteredPayments = payments.filter((p) => p.status === status);
      }
      if (courseId) {
        filteredPayments = filteredPayments.filter(
          (p) => p.courseId === parseInt(courseId as string),
        );
      }

      res.json({
        payments: filteredPayments,
        total: filteredPayments.length,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      res
        .status(500)
        .json({ message: "결제 목록 조회 중 오류가 발생했습니다." });
    }
  });

  // 결제 상태 업데이트
  app.put(
    "/api/admin/payments/:paymentId/status",
    requireAdmin,
    async (req, res) => {
      try {
        const paymentId = parseInt(req.params.paymentId);
        const { status } = req.body;

        if (!["pending", "completed", "failed", "refunded"].includes(status)) {
          return res
            .status(400)
            .json({ message: "유효하지 않은 결제 상태입니다." });
        }

        const result = await storage.updatePayment(paymentId, { status });
        res.json(result);
      } catch (error) {
        console.error("Error updating payment status:", error);
        res
          .status(500)
          .json({ message: "결제 상태 업데이트 중 오류가 발생했습니다." });
      }
    },
  );

  // 환불 처리
  app.post(
    "/api/admin/payments/:paymentId/refund",
    requireAdmin,
    async (req, res) => {
      try {
        const paymentId = parseInt(req.params.paymentId);
        const { reason } = req.body;

        const result = await storage.updatePayment(paymentId, {
          status: "refunded",
          refundReason: reason,
        });
        res.json(result);
      } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({ message: "환불 처리 중 오류가 발생했습니다." });
      }
    },
  );
}
