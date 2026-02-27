import express from "express";
import { storage } from "../storage";
import { insertCourseSchema } from "../../shared/schema.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import type { Express } from "express";
import { requireAuth } from "../auth";
import { uploadToCloudinary } from "../cloudinary";

// Cloudinary 업로드를 위해 메모리 스토리지 사용 (파일을 Buffer로 받음)
const memoryStorage = multer.memoryStorage();

// 학습 자료 업로드 설정
const learningMaterialsUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xlsx|zip|rar/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("지원하지 않는 파일 형식입니다."));
    }
  },
});

// 강의 이미지 업로드 설정
const courseImageUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WebP)"));
    }
  },
});

export function registerBusinessRoutes(app: Express) {
  // 학습 자료 업로드 (Cloudinary raw 파일 업로드)
  app.post(
    "/api/business/upload-learning-materials",
    learningMaterialsUpload.array("files", 4),
    async (req, res) => {
      try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
          return res.status(400).json({ message: "업로드된 파일이 없습니다." });
        }

        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            // 한글 파일명을 안전하게 처리
            const originalName = Buffer.from(
              file.originalname,
              "latin1",
            ).toString("utf8");

            // Cloudinary에 raw 파일로 업로드
            const result = await uploadToCloudinary(file.buffer, {
              folder: "training-platform/learning-materials",
              resourceType: "raw",
            });

            return {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: originalName,
              filename: result.publicId,
              size: result.bytes,
              type: file.mimetype,
              url: result.url,
            };
          }),
        );

        res.json({ files: uploadedFiles });
      } catch (error) {
        console.error("파일 업로드 오류:", error);
        res
          .status(500)
          .json({ message: "파일 업로드 중 오류가 발생했습니다." });
      }
    },
  );

  // 강의 이미지 업로드 (Cloudinary 이미지 업로드)
  app.post(
    "/api/business/upload-course-image",
    courseImageUpload.single("image"),
    async (req, res) => {
      try {
        const file = req.file;

        if (!file) {
          return res
            .status(400)
            .json({ message: "업로드된 이미지가 없습니다." });
        }

        // Cloudinary에 이미지 업로드
        const result = await uploadToCloudinary(file.buffer, {
          folder: "training-platform/course-images",
          resourceType: "image",
        });

        const imageInfo = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: result.publicId,
          originalName: file.originalname,
          size: result.bytes,
          type: file.mimetype,
          url: result.url,
        };

        res.json({ image: imageInfo });
      } catch (error) {
        console.error("이미지 업로드 오류:", error);
        res
          .status(500)
          .json({ message: "이미지 업로드 중 오류가 발생했습니다." });
      }
    },
  );

  // 본문 분석 자료 업로드 추가
  app.post(
    "/api/business/upload-course-material",
    learningMaterialsUpload.single("file"),
    async (req, res) => {
      try {
        const file = req.file;

        if (!file) {
          return res.status(400).json({ message: "업로드된 파일이 없습니다." });
        }

        // 한글 파일명을 안전하게 처리
        const originalName = Buffer.from(
          file.originalname,
          "latin1",
        ).toString("utf8");

        // Cloudinary에 raw 파일로 업로드
        const result = await uploadToCloudinary(file.buffer, {
          folder: "training-platform/analysis-materials",
          resourceType: "raw",
        });

        // 내 분석 자료 목록(source_materials)에도 저장
        const material = await storage.createSourceMaterial({
          userId: req.user!.id,
          fileName: originalName,
          fileType: path.extname(originalName).replace(".", "") || "file",
          fileUrl: result.url,
          extractedText: null,
          analysisData: null,
        });

        res.json({
          id: material.id.toString(),
          url: result.url,
          filename: result.publicId,
          name: originalName,
          size: result.bytes,
          type: file.mimetype
        });
      } catch (error) {
        console.error("분석 자료 업로드 오류:", error);
        res.status(500).json({ message: "파일 업로드 중 오류가 발생했습니다." });
      }
    },
  );

  // 샘플 이미지 목록 조회
  app.get("/api/business/sample-images", (req, res) => {
    try {
      // 샘플 이미지는 로컬 uploads 폴더에서 제공 (기존 호환)
      const sampleImages = [
        {
          id: "sample-1",
          filename: "1.jpg",
          url: "/uploads/images/1.jpg",
          name: "교육 샘플 이미지 1",
        },
        {
          id: "sample-4",
          filename: "4.jpg",
          url: "/uploads/images/4.jpg",
          name: "교육 샘플 이미지 4",
        },
        {
          id: "sample-5",
          filename: "5.jpg",
          url: "/uploads/images/5.jpg",
          name: "교육 샘플 이미지 5",
        },
        {
          id: "sample-6",
          filename: "6.jpg",
          url: "/uploads/images/6.jpg",
          name: "교육 샘플 이미지 6",
        },
        {
          id: "sample-12",
          filename: "12.jpg",
          url: "/uploads/images/12.jpg",
          name: "교육 샘플 이미지 12",
        },
      ];

      res.json({ images: sampleImages });
    } catch (error) {
      console.error("샘플 이미지 조회 오류:", error);
      res
        .status(500)
        .json({ message: "샘플 이미지 조회 중 오류가 발생했습니다." });
    }
  });

  // 내 분석 자료 목록 조회 API
  app.get("/api/business/source-materials", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }
      
      const target = req.query.target as string; // 'workbook' or 'course'

      // 1. 전용 테이블(source_materials)에서 조회 (분석 데이터가 있는 것만)
      const allMaterials = await storage.getSourceMaterials(req.user!.id);
      
      // 2. 세미나 테이블에서 분석된 자료(program 필드가 있는 것) 조회하여 변환
      const seminars = await storage.getSeminarsByProvider(req.user!.id);
      const analyzedSeminars = seminars
        .filter(s => s.program && s.program.trim().length > 0) // 분석 데이터가 있는 모든 자료
        .filter(s => {
          if (!target) return true;
          // target이 있어도 필터링을 아예 하지 않고 모든 자료를 반환 (사용자 요청: "보관함에 있는데 안뜨는데?")
          // 필터링은 프론트엔드에서 처리하거나, 사용자가 모든 분석 자료를 보고 선택할 수 있게 함
          return true;
        })
        .map(s => ({
          id: s.id, // ID를 숫자 그대로 유지 (프론트엔드에서 매칭하기 쉽게)
          fileName: s.title, // 카드 제목을 파일명처럼 사용
          fileType: "analysis",
          fileUrl: s.imageUrl || "", // 표지 이미지가 있으면 사용
          isProcessed: true,
          uploadDate: s.createdAt,
          source: "seminar",
          parsedText: s.program, // 분석 데이터(JSON) 포함
          analysisData: null
        }));

      // 3. 문제집(Overseas Programs) 테이블에서도 분석된 자료 조회 (사용자 요청: "문제집 관리 에 이미지 등록 되어 있는데 못 가져 와")
      // 문제집에 이미지를 등록했으면, 해당 문제집을 불러올 때 이미지도 가져와야 함
      const workbooks = await storage.getOverseasProgramsByProvider(req.user!.id);
      const analyzedWorkbooks = workbooks
        .filter(w => w.program && w.program.trim().length > 0)
        .map(w => ({
          id: 100000 + w.id, // ID 충돌 방지 (문제집은 100000 더함)
          fileName: `[문제집] ${w.title}`,
          fileType: "analysis",
          fileUrl: w.imageUrl || "",
          isProcessed: true,
          uploadDate: w.createdAt,
          source: "workbook", // 구분을 위해 source 변경
          parsedText: w.program,
          analysisData: null
        }));

      // 4. 중복 제거 및 소스 병합 logic modified based on user feedback
      let combinedMaterials = [];

      if (target === "workbook" || target === "course") {
        // 워크북/교재 제작 시에는 '보관함(Seminars)' 및 '기존 문제집(Workbooks)' 정보를 불러오도록 변경
        combinedMaterials = [...analyzedSeminars, ...analyzedWorkbooks];
      } else {
        // 그 외의 경우(전체 목록 등)에는 기존 로직대로 병합
        const seminarTitles = new Set(analyzedSeminars.map(s => s.fileName));
        const materialsWithAnalysis = allMaterials
          .map(m => ({
            ...m,
            source: "source",
            isProcessed: true,
            uploadDate: m.createdAt,
            parsedText: m.extractedText,
            analysisData: m.analysisData
          }));
        combinedMaterials = [...materialsWithAnalysis, ...analyzedSeminars];
      }

      // 최신순 정렬
      combinedMaterials.sort((a, b) => {
        const dateA = new Date(a.uploadDate || 0).getTime();
        const dateB = new Date(b.uploadDate || 0).getTime();
        return dateB - dateA;
      });

      res.json({ materials: combinedMaterials });
    } catch (error) {
      console.error("분석 자료 조회 오류:", error);
      res.status(500).json({ message: "분석 자료를 가져오는 중 오류가 발생했습니다." });
    }
  });

  // 학습 자료 파일 다운로드 (Cloudinary URL로 리다이렉트)
  app.get("/api/business/download-learning-material/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      // Cloudinary URL이 쿼리 파라미터로 전달된 경우 리다이렉트
      const fileUrl = req.query.url as string;

      if (fileUrl) {
        return res.redirect(fileUrl);
      }

      // 레거시 로컬 파일 지원 (기존 업로드된 파일 호환)
      const filepath = path.join(
        process.cwd(),
        "uploads",
        "learning-materials",
        filename,
      );

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
      }

      const originalName = req.query.originalName as string;
      const downloadName = originalName || filename;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      );
      res.setHeader("Content-Type", "application/octet-stream");

      res.download(filepath, downloadName, (error) => {
        if (error) {
          console.error("파일 다운로드 오류:", error);
          res
            .status(500)
            .json({ message: "파일 다운로드 중 오류가 발생했습니다." });
        }
      });
    } catch (error) {
      console.error("파일 다운로드 오류:", error);
      res
        .status(500)
        .json({ message: "파일 다운로드 중 오류가 발생했습니다." });
    }
  });

  // 선생님의 강의 목록 조회
  app.get("/api/business/courses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      const courses = await storage.getCoursesByProvider(userId);
      res.json({ courses });
    } catch (error) {
      console.error("Error fetching business courses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 저자(강사) 관리 라우트 추가
  app.get("/api/business/instructors/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const instructors = await storage.getInstructorsByProvider(userId);
      res.json({ instructors });
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({ message: "저자 정보를 가져오는 중 오류가 발생했습니다." });
    }
  });

  app.post("/api/business/instructors", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
      const instructor = await storage.createInstructor({
        ...req.body,
        providerId: req.user!.id,
      });
      res.status(201).json(instructor);
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({ message: "저자 등록 중 오류가 발생했습니다." });
    }
  });

  app.put("/api/business/instructors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
      const id = parseInt(req.params.id);
      const instructor = await storage.updateInstructor(id, req.body);
      res.json(instructor);
    } catch (error) {
      console.error("Error updating instructor:", error);
      res.status(500).json({ message: "저자 수정 중 오류가 발생했습니다." });
    }
  });

  app.delete("/api/business/instructors/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "로그인이 필요합니다." });
      const id = parseInt(req.params.id);
      await storage.deleteInstructor(id);
      res.json({ message: "저자 정보가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting instructor:", error);
      res.status(500).json({ message: "저자 삭제 중 오류가 발생했습니다." });
    }
  });

  // 선생님의 새 강의 등록
  app.post("/api/business/courses", async (req, res) => {
    try {
      console.log("=== 강의 등록 요청 시작 ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      if (!req.isAuthenticated()) {
        console.log("❌ 인증되지 않은 사용자");
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      console.log("User info:", {
        id: user.id,
        userType: user.userType,
        isApproved: user.isApproved,
      });

      if (user.userType !== "business") {
        console.log(
          "❌ 권한 없음: userType =",
          user.userType
        );
        return res
          .status(403)
          .json({ message: "선생님 회원만 강의를 등록할 수 있습니다." });
      }

      const courseData = {
        ...req.body,
        // 숫자 필드들을 올바르게 변환
        credit: req.body.credit ? parseInt(req.body.credit) : 1,
        price: req.body.price ? parseInt(req.body.price) : 0,
        discountPrice: req.body.discountPrice
          ? parseInt(req.body.discountPrice)
          : null,
        maxStudents: req.body.maxStudents
          ? parseInt(req.body.maxStudents)
          : null,
        instructorId: req.body.instructorId
          ? parseInt(req.body.instructorId)
          : null,
        totalHours: req.body.totalHours ? parseInt(req.body.totalHours) : null,
        // 날짜 필드들을 Date 객체로 변환
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        enrollmentDeadline: req.body.enrollmentDeadline
          ? new Date(req.body.enrollmentDeadline)
          : null,
        completionDeadline: req.body.completionDeadline
          ? new Date(req.body.completionDeadline)
          : null,
        // 학습 자료 처리
        learningMaterials: req.body.learningMaterials || [],
        // 본문 분석 자료 처리
        analysisMaterials: req.body.analysisMaterials || [],
        // 기본 설정
        providerId: user.id,
        status: "active",
        approvalStatus: "approved",
        // 필수 값이나 현재 폼에서 누락된 값 기본 설정
        type: req.body.type || "course",
        level: req.body.level || "intermediate",
      };

      console.log(
        "Processed course data:",
        JSON.stringify(courseData, null, 2),
      );

      const result = insertCourseSchema.safeParse(courseData);
      if (!result.success) {
        console.log("❌ 스키마 검증 실패:", result.error.errors);
        return res
          .status(400)
          .json({
            message: "입력 데이터가 올바르지 않습니다.",
            errors: result.error.errors,
          });
      }

      console.log("✅ 스키마 검증 성공, 데이터베이스에 저장 시도...");
      const course = await storage.createCourse(result.data);
      console.log("✅ 강의 저장 성공:", { id: course.id, title: course.title });

      res.status(201).json(course);
    } catch (error) {
      console.error("❌ 강의 등록 중 오류 발생:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      res.status(500).json({ message: "강의 등록 중 오류가 발생했습니다." });
    }
  });

  // 선생님의 강의 수정
  app.put("/api/business/courses/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const courseId = parseInt(req.params.courseId);
      const user = req.user;

      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse || existingCourse.providerId !== user.id) {
        return res
          .status(404)
          .json({ message: "강의를 찾을 수 없거나 수정 권한이 없습니다." });
      }

      // 날짜 필드 안전하게 변환하는 함수
      const convertToDate = (value: any) => {
        if (!value) return null;
        if (value instanceof Date) return value;
        if (typeof value === "string") {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        }
        return null;
      };

      // 숫자 필드 안전하게 변환하는 함수
      const convertToNumber = (value: any, fallback: any) => {
        if (value === null || value === undefined || value === "")
          return fallback;
        const num = parseInt(value);
        return isNaN(num) ? fallback : num;
      };

      // 데이터 변환
      const updateData = {
        // 기본 정보만 포함하고 시스템 생성 필드는 제외
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        type: req.body.type,
        level: req.body.level,
        credit: convertToNumber(req.body.credit, existingCourse.credit),
        price: convertToNumber(req.body.price, existingCourse.price),
        discountPrice: req.body.discountPrice
          ? convertToNumber(req.body.discountPrice, null)
          : null,
        maxStudents: req.body.maxStudents
          ? convertToNumber(req.body.maxStudents, null)
          : null,
        instructorId: req.body.instructorId
          ? convertToNumber(req.body.instructorId, null)
          : null,
        totalHours: req.body.totalHours
          ? convertToNumber(req.body.totalHours, null)
          : null,
        duration: req.body.duration,
        // 이미지 URL 추가
        imageUrl: req.body.imageUrl || null,
        // 날짜 필드들을 안전하게 변환
        startDate: convertToDate(req.body.startDate),
        endDate: convertToDate(req.body.endDate),
        enrollmentDeadline: convertToDate(req.body.enrollmentDeadline),
        completionDeadline: convertToDate(req.body.completionDeadline),
        // 추가 정보 필드들
        curriculum: req.body.curriculum || null,
        objectives: req.body.objectives || null,
        requirements: req.body.requirements || null,
        materials: req.body.materials || null,
        assessmentMethod: req.body.assessmentMethod || null,
        certificateType: req.body.certificateType || null,
        instructorName: req.body.instructorName || null,
        instructorProfile: req.body.instructorProfile || null,
        instructorExpertise: req.body.instructorExpertise || null,
        targetAudience: req.body.targetAudience || null,
        difficulty: req.body.difficulty || null,
        language: req.body.language || "ko",
        location: req.body.location || null,
        features: req.body.features || null,
        recommendations: req.body.recommendations || null,
        prerequisites: req.body.prerequisites || null,
        learningMethod: req.body.learningMethod || null,
        tags: Array.isArray(req.body.tags)
          ? req.body.tags
          : typeof req.body.tags === "string"
            ? req.body.tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0)
            : [],
        // 학습 자료 처리
        learningMaterials: req.body.learningMaterials || [],
        // 본문 분석 자료 처리
        analysisMaterials: req.body.analysisMaterials || [],
        // updatedAt은 자동으로 설정
        updatedAt: new Date(),
      };

      console.log("Course update data:", {
        courseId,
        updateData: {
          ...updateData,
          startDate: updateData.startDate?.toISOString(),
          endDate: updateData.endDate?.toISOString(),
          enrollmentDeadline: updateData.enrollmentDeadline?.toISOString(),
          completionDeadline: updateData.completionDeadline?.toISOString(),
        },
      });

      const course = await storage.updateCourse(courseId, updateData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "강의 수정 중 오류가 발생했습니다." });
    }
  });

  // 선생님의 강의 삭제
  app.delete("/api/business/courses/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      const courseId = parseInt(req.params.courseId);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ message: "강의를 찾을 수 없습니다." });
      }

      if (course.providerId !== user.id) {
        return res
          .status(403)
          .json({ message: "해당 강의를 삭제할 권한이 없습니다." });
      }

      await storage.deleteCourse(courseId);
      res.json({ message: "강의가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 선생님의 수강생 통계
  app.get("/api/business/enrollment-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 제공하는 강의들 조회
      const providerCourses = await storage.getCoursesByProvider(userId);
      const courseIds = providerCourses.map((course) => course.id);

      if (courseIds.length === 0) {
        return res.json({
          total: 0,
          thisMonth: 0,
          lastMonth: 0,
        });
      }

      // 모든 등록 데이터 조회
      const allEnrollments = await storage.getEnrollments();

      // 선생님의 강의에 대한 등록만 필터링
      const providerEnrollments = allEnrollments.filter((enrollment) =>
        courseIds.includes(enrollment.courseId),
      );

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // 이번 달 등록
      const thisMonthEnrollments = providerEnrollments.filter((enrollment) => {
        if (!enrollment.enrolledAt) return false;
        const enrollmentDate = new Date(enrollment.enrolledAt);
        return (
          enrollmentDate.getMonth() === currentMonth &&
          enrollmentDate.getFullYear() === currentYear
        );
      });

      // 지난 달 등록
      const lastMonthEnrollments = providerEnrollments.filter((enrollment) => {
        if (!enrollment.enrolledAt) return false;
        const enrollmentDate = new Date(enrollment.enrolledAt);
        return (
          enrollmentDate.getMonth() === lastMonth &&
          enrollmentDate.getFullYear() === lastMonthYear
        );
      });

      const stats = {
        total: providerEnrollments.length,
        thisMonth: thisMonthEnrollments.length,
        lastMonth: lastMonthEnrollments.length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 선생님의 매출 통계
  app.get("/api/business/revenue-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 제공하는 강의들 조회
      const providerCourses = await storage.getCoursesByProvider(userId);
      const courseIds = providerCourses.map((course) => course.id);

      if (courseIds.length === 0) {
        return res.json({
          monthly: 0,
          yearly: 0,
          total: 0,
        });
      }

      // 모든 결제 데이터 조회
      const allPayments = await storage.getPayments();

      // 선생님의 강의에 대한 완료된 결제만 필터링
      const providerPayments = allPayments.filter(
        (payment) =>
          payment.courseId &&
          courseIds.includes(payment.courseId) &&
          payment.status === "completed",
      );

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // 이번 달 매출
      const monthlyRevenue = providerPayments
        .filter((payment) => {
          if (!payment.createdAt) return false;
          const paymentDate = new Date(payment.createdAt);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      // 올해 매출
      const yearlyRevenue = providerPayments
        .filter((payment) => {
          if (!payment.createdAt) return false;
          const paymentDate = new Date(payment.createdAt);
          return paymentDate.getFullYear() === currentYear;
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      // 총 매출
      const totalRevenue = providerPayments.reduce(
        (sum, payment) => sum + parseFloat(payment.amount),
        0,
      );

      const stats = {
        monthly: Math.round(monthlyRevenue),
        yearly: Math.round(yearlyRevenue),
        total: Math.round(totalRevenue),
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 선생님의 상세 분석 데이터
  app.get("/api/business/analytics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 제공하는 강의들 조회
      const providerCourses = await storage.getCoursesByProvider(userId);
      const courseIds = providerCourses.map((course) => course.id);

      if (courseIds.length === 0) {
        return res.json({
          monthlyData: [],
          courseStats: [],
          enrollmentTrends: [],
          topPerformingCourses: [],
        });
      }

      // 모든 등록 및 결제 데이터 조회
      const allEnrollments = await storage.getEnrollments();
      const allPayments = await storage.getPayments();

      // 선생님의 데이터만 필터링
      const providerEnrollments = allEnrollments.filter((enrollment) =>
        courseIds.includes(enrollment.courseId),
      );

      const providerPayments = allPayments.filter(
        (payment) =>
          payment.courseId &&
          courseIds.includes(payment.courseId) &&
          payment.status === "completed",
      );

      const now = new Date();
      const currentYear = now.getFullYear();

      // 월별 매출 및 수강생 데이터 (최근 12개월)
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = targetDate.getMonth();
        const year = targetDate.getFullYear();

        const monthlyEnrollments = providerEnrollments.filter((enrollment) => {
          if (!enrollment.enrolledAt) return false;
          const enrollmentDate = new Date(enrollment.enrolledAt);
          return (
            enrollmentDate.getMonth() === month &&
            enrollmentDate.getFullYear() === year
          );
        });

        const monthlyPayments = providerPayments.filter((payment) => {
          if (!payment.createdAt) return false;
          const paymentDate = new Date(payment.createdAt);
          return (
            paymentDate.getMonth() === month &&
            paymentDate.getFullYear() === year
          );
        });

        const monthlyRevenue = monthlyPayments.reduce(
          (sum, payment) => sum + parseFloat(payment.amount),
          0,
        );

        monthlyData.push({
          month: targetDate.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
          }),
          enrollments: monthlyEnrollments.length,
          revenue: Math.round(monthlyRevenue),
          date: targetDate.toISOString().slice(0, 7), // YYYY-MM 형식
        });
      }

      // 강의별 통계
      const courseStats = await Promise.all(
        providerCourses.map(async (course) => {
          const courseEnrollments = providerEnrollments.filter(
            (e) => e.courseId === course.id,
          );
          const coursePayments = providerPayments.filter(
            (p) => p.courseId === course.id,
          );
          const courseRevenue = coursePayments.reduce(
            (sum, payment) => sum + parseFloat(payment.amount),
            0,
          );

          return {
            courseId: course.id,
            title: course.title,
            category: course.category,
            enrollments: courseEnrollments.length,
            revenue: Math.round(courseRevenue),
            averageRating: 4.5, // 실제 리뷰 시스템이 구현되면 계산
            completionRate: Math.round(
              (courseEnrollments.filter((e) => e.status === "completed")
                .length /
                Math.max(courseEnrollments.length, 1)) *
                100,
            ),
          };
        }),
      );

      // 카테고리별 통계
      const categoryStats = providerCourses.reduce(
        (acc, course) => {
          const category = course.category || "기타";
          if (!acc[category]) {
            acc[category] = { enrollments: 0, revenue: 0, courses: 0 };
          }

          const courseEnrollments = providerEnrollments.filter(
            (e) => e.courseId === course.id,
          );
          const coursePayments = providerPayments.filter(
            (p) => p.courseId === course.id,
          );
          const courseRevenue = coursePayments.reduce(
            (sum, payment) => sum + parseFloat(payment.amount),
            0,
          );

          acc[category].enrollments += courseEnrollments.length;
          acc[category].revenue += courseRevenue;
          acc[category].courses += 1;

          return acc;
        },
        {} as Record<string, any>,
      );

      // 상위 성과 강의 (수강생 수 기준)
      const topPerformingCourses = courseStats
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);

      res.json({
        monthlyData,
        courseStats,
        categoryStats: Object.entries(categoryStats).map(
          ([category, stats]) => ({
            category,
            ...stats,
            revenue: Math.round(stats.revenue),
          }),
        ),
        topPerformingCourses,
        summary: {
          totalCourses: providerCourses.length,
          totalEnrollments: providerEnrollments.length,
          totalRevenue: Math.round(
            providerPayments.reduce(
              (sum, payment) => sum + parseFloat(payment.amount),
              0,
            ),
          ),
          averageEnrollmentPerCourse: Math.round(
            providerEnrollments.length / Math.max(providerCourses.length, 1),
          ),
          thisMonthGrowth:
            monthlyData.length >= 2
              ? Math.round(
                  (((monthlyData[11]?.enrollments || 0) -
                    (monthlyData[10]?.enrollments || 0)) /
                    Math.max(monthlyData[10]?.enrollments || 1, 1)) *
                    100,
                )
              : 0,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 세미나 등록
  app.post("/api/business/seminars", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 세미나를 등록할 수 있습니다." });
      }

      const seminarData = {
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        location: req.body.location || null,
        maxParticipants: req.body.maxParticipants
          ? parseInt(req.body.maxParticipants)
          : null,
        imageUrl: req.body.imageUrl || null,
        price: req.body.price ? parseInt(req.body.price) : 0,
        benefits: req.body.benefits || null,
        requirements: req.body.requirements || null,
        tags: req.body.tags || null,
        duration: req.body.duration || null,
        organizer: req.body.organizer || null,
        contactPhone: req.body.contactPhone || null,
        contactEmail: req.body.contactEmail || null,
        program: req.body.program || null,
        providerId: user.id,
        programSchedule: req.body.programSchedule
          ? typeof req.body.programSchedule === "string"
            ? JSON.parse(req.body.programSchedule)
            : req.body.programSchedule
          : null,
        isActive: true,
      };

      console.log("=== 세미나 등록 디버그 ===");
      console.log("Request body programSchedule:", req.body.programSchedule);
      console.log(
        "Processed seminarData:",
        JSON.stringify(seminarData, null, 2),
      );

      const newSeminar = await storage.createSeminar(seminarData);

      // Handle source material saving (if provided from fresh analysis)
      if (req.body.sourceMaterial && req.body.sourceMaterial.fileUrl) {
         try {
           await storage.createSourceMaterial({
             userId: user.id,
             fileName: req.body.sourceMaterial.fileName || seminarData.title,
             fileType: req.body.sourceMaterial.fileType || "file",
             fileUrl: req.body.sourceMaterial.fileUrl,
             extractedText: seminarData.program || "",
             analysisData: null,
           });
           console.log(`Source material saved for seminar: ${seminarData.title}`);
         } catch (err) {
           console.error("Failed to save source material:", err);
           // Do not fail the seminar creation if source material save fails
         }
      }

      res.status(201).json(newSeminar);
    } catch (error) {
      console.error("Error creating seminar:", error);
      res.status(500).json({ message: "세미나 등록 중 오류가 발생했습니다." });
    }
  });

  // 세미나 수정
  app.put("/api/business/seminars/:seminarId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 세미나를 수정할 수 있습니다." });
      }

      const seminarId = parseInt(req.params.seminarId);

      // 세미나 존재 여부 및 소유권 확인
      const existingSeminar = await storage.getSeminar(seminarId);
      if (!existingSeminar) {
        return res.status(404).json({ message: "세미나를 찾을 수 없습니다." });
      }

      if (existingSeminar.providerId !== user.id) {
        return res
          .status(403)
          .json({ message: "세미나를 수정할 권한이 없습니다." });
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description || null,
        type: req.body.type,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        location: req.body.location || null,
        maxParticipants: req.body.maxParticipants
          ? parseInt(req.body.maxParticipants)
          : null,
        imageUrl: req.body.imageUrl || null,
        price: req.body.price ? parseInt(req.body.price) : 0,
        benefits: req.body.benefits || null,
        requirements: req.body.requirements || null,
        tags: req.body.tags || null,
        duration: req.body.duration || null,
        organizer: req.body.organizer || null,
        contactPhone: req.body.contactPhone || null,
        contactEmail: req.body.contactEmail || null,
        program: req.body.program || null,
        programSchedule: req.body.programSchedule
          ? typeof req.body.programSchedule === "string"
            ? JSON.parse(req.body.programSchedule)
            : req.body.programSchedule
          : null,
      };

      console.log("=== 세미나 수정 디버그 ===");
      console.log("Seminar ID:", seminarId);
      console.log("Update data:", JSON.stringify(updateData, null, 2));

      const updatedSeminar = await storage.updateSeminar(seminarId, updateData);

      // Handle source material saving (if provided from fresh analysis)
      if (req.body.sourceMaterial && req.body.sourceMaterial.fileUrl) {
         try {
           await storage.createSourceMaterial({
             userId: user.id,
             fileName: req.body.sourceMaterial.fileName || updateData.title,
             fileType: req.body.sourceMaterial.fileType || "file",
             fileUrl: req.body.sourceMaterial.fileUrl,
             extractedText: updateData.program || "",
             analysisData: null,
           });
           console.log(`Source material saved for updated seminar: ${updateData.title}`);
         } catch (err) {
           console.error("Failed to save source material:", err);
         }
      }

      res.json(updatedSeminar);
    } catch (error) {
      console.error("Error updating seminar:", error);
      res.status(500).json({ message: "세미나 수정 중 오류가 발생했습니다." });
    }
  });

  // 세미나 삭제
  app.delete("/api/business/seminars/:seminarId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res.status(403).json({ message: "선생님 회원만 접근 가능합니다." });
      }

      const seminarId = parseInt(req.params.seminarId);
      const seminar = await storage.getSeminar(seminarId);

      if (!seminar) {
        return res.status(404).json({ message: "자료를 찾을 수 없습니다." });
      }

      if (seminar.providerId !== user.id) {
        return res.status(403).json({ message: "삭제 권한이 없습니다." });
      }

      await storage.deleteSeminar(seminarId);
      res.json({ message: "자료가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting seminar:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 해외교육 등록 (새로운 전용 테이블 사용)
  app.post("/api/business/overseas", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({
            message: "선생님 회원만 해외교육를 등록할 수 있습니다.",
          });
      }

      const overseasData = {
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category || 'english', // 추가
        destination: req.body.destination || '전체',
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        type: req.body.type || '기타',
        maxParticipants: req.body.maxParticipants
          ? parseInt(req.body.maxParticipants)
          : null,
        price: req.body.price ? parseInt(req.body.price) : 0,
        duration: req.body.duration || null,
        imageUrl: req.body.imageUrl || null,
        program: req.body.program || null,
        benefits: req.body.benefits || null,
        requirements: req.body.requirements || null,
        tags: Array.isArray(req.body.tags) ? req.body.tags.join(",") : req.body.tags || null,
        airline: req.body.airline || null,
        accommodation: req.body.accommodation || null,
        meals: req.body.meals || null,
        guide: req.body.guide || null,
        visaInfo: req.body.visaInfo || null,
        insurance: req.body.insurance || null,
        currency: req.body.currency || null,
        climate: req.body.climate || null,
        timeZone: req.body.timeZone || null,
        language: req.body.language || null,
        emergencyContact: req.body.emergencyContact || null,
        cancellationPolicy: req.body.cancellationPolicy || null,
        providerId: user.id,
        status: "active", // 등록 시 바로 활성화
        approvalStatus: "approved", // 승인 절차 건너뜀
        isActive: true,
      };

      console.log("=== 해외교육 등록 디버그 ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      console.log(
        "Processed overseasData:",
        JSON.stringify(overseasData, null, 2),
      );

      const newOverseas = await storage.createOverseasProgram(overseasData);
      res.status(201).json(newOverseas);
    } catch (error) {
      console.error("Error creating overseas program:", error);
      res
        .status(500)
        .json({ message: "새 문제집 등록 중 오류가 발생했습니다." });
    }
  });

  // 해외교육 수정
  app.put("/api/business/overseas/:overseasId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({
            message: "선생님 회원만 해외교육를 수정할 수 있습니다.",
          });
      }

      const overseasId = parseInt(req.params.overseasId);

      // 해외교육 존재 여부 및 소유권 확인
      const existingOverseas = await storage.getOverseasProgram(overseasId);
      if (!existingOverseas) {
        return res
          .status(404)
          .json({ message: "해외교육를 찾을 수 없습니다." });
      }

      if (existingOverseas.providerId !== user.id) {
        return res
          .status(403)
          .json({ message: "해외교육를 수정할 권한이 없습니다." });
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description || null,
        category: req.body.category, // 추가
        destination: req.body.destination || '전체',
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        type: req.body.type,
        maxParticipants: req.body.maxParticipants
          ? parseInt(req.body.maxParticipants)
          : null,
        price: req.body.price ? parseInt(req.body.price) : 0,
        duration: req.body.duration || null,
        imageUrl: req.body.imageUrl || null,
        program: req.body.program || null,
        benefits: req.body.benefits || null,
        requirements: req.body.requirements || null,
        tags: Array.isArray(req.body.tags) ? req.body.tags.join(",") : req.body.tags || null,
        airline: req.body.airline || null,
        accommodation: req.body.accommodation || null,
        meals: req.body.meals || null,
        guide: req.body.guide || null,
        visaInfo: req.body.visaInfo || null,
        insurance: req.body.insurance || null,
        currency: req.body.currency || null,
        climate: req.body.climate || null,
        timeZone: req.body.timeZone || null,
        language: req.body.language || null,
        emergencyContact: req.body.emergencyContact || null,
        cancellationPolicy: req.body.cancellationPolicy || null,
      };

      console.log("=== 해외교육 수정 디버그 ===");
      console.log("Overseas ID:", overseasId);
      console.log("Update data:", JSON.stringify(updateData, null, 2));

      const updatedOverseas = await storage.updateOverseasProgram(
        overseasId,
        updateData,
      );
      res.json(updatedOverseas);
    } catch (error) {
      console.error("Error updating overseas program:", error);
      res
        .status(500)
        .json({ message: "해외교육 수정 중 오류가 발생했습니다." });
    }
  });

  // 해외교육 삭제
  app.delete("/api/business/overseas/:overseasId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      const overseasId = parseInt(req.params.overseasId);
      const overseas = await storage.getOverseasProgram(overseasId);

      if (!overseas) {
        return res
          .status(404)
          .json({ message: "해외교육를 찾을 수 없습니다." });
      }

      if (overseas.providerId !== user.id) {
        return res
          .status(403)
          .json({ message: "해당 해외교육를 삭제할 권한이 없습니다." });
      }

      await storage.deleteOverseasProgram(overseasId);
      res.json({ message: "해외교육가 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting overseas program:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 선생님의 해외교육 목록 조회 API
  app.get("/api/business/overseas/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 등록한 해외교육 목록 조회
      const overseas = await storage.getOverseasProgramsByProvider(userId);

      res.json({ overseas, total: overseas.length });
    } catch (error) {
      console.error("Error fetching business overseas programs:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 해외교육 신청자 목록 조회 API
  app.get(
    "/api/business/overseas/:overseasId/registrations",
    async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        const user = req.user;
        if (user.userType !== "business") {
          return res
            .status(403)
            .json({ message: "선생님 회원만 접근 가능합니다." });
        }

        const overseasId = parseInt(req.params.overseasId);

        // 해외교육 존재 여부 확인
        const overseas = await storage.getOverseasProgram(overseasId);
        if (!overseas) {
          return res
            .status(404)
            .json({ message: "해외교육를 찾을 수 없습니다." });
        }

        // 해외교육 신청자 목록 조회
        const registrations =
          await storage.getOverseasRegistrations(overseasId);

        // 세미나 신청자 목록 조회
        const registrationsWithUsers = await Promise.all(
          registrations.map(async (registration) => {
            const userInfo = await storage.getUser(registration.userId);
            return {
              ...registration,
              user: userInfo
                ? {
                    id: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    userType: userInfo.userType,
                    organizationName: userInfo.organizationName,
                  }
                : null,
            };
          }),
        );

        res.json({
          seminar: {
            id: overseas.id,
            title: overseas.title,
            destination: overseas.destination,
            startDate: overseas.startDate,
            endDate: overseas.endDate,
            maxParticipants: overseas.maxParticipants,
            currentParticipants: overseas.currentParticipants,
          },
          registrations: registrationsWithUsers,
        });
      } catch (error) {
        console.error("Error fetching overseas registrations:", error);
        res
          .status(500)
          .json({ message: "신청자 목록 조회 중 오류가 발생했습니다." });
      }
    },
  );

  // 세미나 신청 API
  app.post("/api/seminars/:id/register", requireAuth, async (req, res) => {
    try {
      const seminarId = parseInt(req.params.id);
      const userId = req.user!.id;

      // 세미나 존재 여부 확인
      const seminar = await storage.getSeminar(seminarId);
      if (!seminar) {
        return res.status(404).json({ error: "세미나를 찾을 수 없습니다." });
      }

      // 이미 신청했는지 확인
      const isAlreadyRegistered = await storage.isSeminarRegistered(
        userId,
        seminarId,
      );
      if (isAlreadyRegistered) {
        return res.status(400).json({ error: "이미 신청한 세미나입니다." });
      }

      // 정원 확인
      if (
        seminar.maxParticipants &&
        seminar.currentParticipants &&
        seminar.currentParticipants >= seminar.maxParticipants
      ) {
        return res.status(400).json({ error: "세미나 정원이 마감되었습니다." });
      }

      // 세미나 신청 등록
      await storage.registerForSeminar(userId, seminarId);

      console.log(
        `User ${userId} successfully registered for seminar ${seminarId}`,
      );

      res.json({
        success: true,
        message: "세미나 신청이 완료되었습니다.",
        seminarId,
        userId,
      });
    } catch (error) {
      console.error("Seminar registration error:", error);
      res.status(500).json({ error: "세미나 신청 중 오류가 발생했습니다." });
    }
  });

  // 세미나 관심등록/해제 API
  app.post("/api/seminars/:id/wishlist", requireAuth, async (req, res) => {
    try {
      const seminarId = parseInt(req.params.id);
      const userId = req.user!.id;
      const { action } = req.body; // 'add' 또는 'remove'

      // 세미나 존재 여부 확인
      const seminar = await storage.getSeminar(seminarId);
      if (!seminar) {
        return res.status(404).json({ error: "세미나를 찾을 수 없습니다." });
      }

      if (action === "add") {
        await storage.addSeminarToWishlist(userId, seminarId);
        console.log(`User ${userId} added seminar ${seminarId} to wishlist`);
      } else if (action === "remove") {
        await storage.removeSeminarFromWishlist(userId, seminarId);
        console.log(
          `User ${userId} removed seminar ${seminarId} from wishlist`,
        );
      } else {
        return res.status(400).json({ error: "유효하지 않은 액션입니다." });
      }

      const message =
        action === "add"
          ? "관심등록이 완료되었습니다."
          : "관심등록이 해제되었습니다.";

      res.json({
        success: true,
        message,
        seminarId,
        userId,
        action,
      });
    } catch (error) {
      console.error("Seminar wishlist error:", error);
      res.status(500).json({ error: "관심등록 처리 중 오류가 발생했습니다." });
    }
  });

  // 사용자의 세미나 관심등록 상태 확인 API
  app.get(
    "/api/seminars/:id/wishlist-status",
    requireAuth,
    async (req, res) => {
      try {
        const seminarId = parseInt(req.params.id);
        const userId = req.user!.id;

        // 관심등록 상태 확인
        const isWishlisted = await storage.isSeminarInWishlist(
          userId,
          seminarId,
        );

        res.json({
          isWishlisted,
          seminarId,
          userId,
        });
      } catch (error) {
        console.error("Wishlist status check error:", error);
        res
          .status(500)
          .json({ error: "관심등록 상태 확인 중 오류가 발생했습니다." });
      }
    },
  );

  // 선생님의 세미나 목록 조회 API
  app.get("/api/business/seminars/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 등록한 세미나 목록 조회
      const seminars = await storage.getSeminarsByProvider(userId);

      res.json({ seminars });
    } catch (error) {
      console.error("Error fetching business seminars:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 세미나 신청자 목록 조회 API
  app.get(
    "/api/business/seminars/:seminarId/registrations",
    async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        const user = req.user;
        if (user.userType !== "business") {
          return res
            .status(403)
            .json({ message: "선생님 회원만 접근 가능합니다." });
        }

        const seminarId = parseInt(req.params.seminarId);

        // 세미나 존재 여부 확인
        const seminar = await storage.getSeminar(seminarId);
        if (!seminar) {
          return res
            .status(404)
            .json({ message: "세미나를 찾을 수 없습니다." });
        }

        // 세미나 신청자 목록 조회
        const registrations = await storage.getSeminarRegistrations(seminarId);

        // 세미나 신청자 목록 조회
        const registrationsWithUsers = await Promise.all(
          registrations.map(async (registration) => {
            const userInfo = await storage.getUser(registration.userId);
            return {
              ...registration,
              user: userInfo
                ? {
                    id: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    userType: userInfo.userType,
                    organizationName: userInfo.organizationName,
                  }
                : null,
            };
          }),
        );

        res.json({
          seminar: {
            id: seminar.id,
            title: seminar.title,
            date: seminar.date,
            location: seminar.location,
            maxParticipants: seminar.maxParticipants,
            currentParticipants: seminar.currentParticipants,
          },
          registrations: registrationsWithUsers,
        });
      } catch (error) {
        console.error("Error fetching seminar registrations:", error);
        res
          .status(500)
          .json({ message: "신청자 목록 조회 중 오류가 발생했습니다." });
      }
    },
  );

  // 선생님의 수강생 목록 조회
  app.get("/api/business/enrollments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "선생님 회원만 접근 가능합니다." });
      }

      // 선생님이 제공하는 강의들 조회
      const providerCourses = await storage.getCoursesByProvider(userId);
      const courseIds = providerCourses.map((course) => course.id);

      if (courseIds.length === 0) {
        return res.json([]);
      }

      // 모든 등록 데이터 조회
      const enrollments = await storage.getEnrollments();

      // 선생님의 강의에 대한 등록만 필터링하고 사용자 정보와 강의 정보 추가
      const enrichedEnrollments = await Promise.all(
        enrollments
          .filter((enrollment) => courseIds.includes(enrollment.courseId))
          .map(async (enrollment) => {
            const userInfo = await storage.getUser(enrollment.userId);
            const courseInfo = await storage.getCourse(enrollment.courseId);

            if (!userInfo || !courseInfo) {
              return null;
            }

            return {
              ...enrollment,
              user: {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
              },
              course: {
                id: courseInfo.id,
                title: courseInfo.title,
              },
            };
          }),
      );

      // null 값 필터링
      const filteredEnrollments = enrichedEnrollments.filter(
        (enrollment): enrollment is NonNullable<typeof enrollment> =>
          enrollment !== null,
      );

      res.json(filteredEnrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 수료증 조회
  app.get(
    "/api/business/enrollments/:enrollmentId/certificate",
    async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "로그인이 필요합니다." });
        }

        const user = req.user;
        if (user.userType !== "business") {
          return res
            .status(403)
            .json({ message: "선생님 회원만 접근 가능합니다." });
        }

        const enrollmentId = parseInt(req.params.enrollmentId);
        const enrollment = await storage.getEnrollment(enrollmentId);

        if (!enrollment) {
          return res
            .status(404)
            .json({ message: "수강 정보를 찾을 수 없습니다." });
        }

        const course = await storage.getCourse(enrollment.courseId);
        if (!course || course.providerId !== user.id) {
          return res
            .status(403)
            .json({ message: "수료증을 조회할 권한이 없습니다." });
        }

        // 수료증 정보 조회
        const certificate = await storage.getCertificate(enrollmentId);
        const studentInfo = await storage.getUser(enrollment.userId);
        const providerInfo = await storage.getUser(course.providerId || 0);

        if (!studentInfo || !providerInfo) {
          return res
            .status(404)
            .json({ message: "사용자 정보를 찾을 수 없습니다." });
        }

        // 날짜 포맷팅 함수
        const formatDate = (date: Date | null | undefined) => {
          if (!date) return "날짜 미정";
          return new Date(date).toLocaleDateString("ko-KR");
        };

        // HTML 응답 생성
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>교육 수료증</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

            body {
              margin: 0;
              padding: 0;
              font-family: 'Noto Sans KR', sans-serif;
              background: #f5f5f5;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .certificate-container {
              width: 210mm;
              height: 267mm;
              margin: 10px auto;
              position: relative;
              background: url('/images/certificate-border.png') no-repeat center;
              background-size: 100% 100%;
              padding: 0;
              box-sizing: border-box;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }

            .certificate-content {
              position: relative;
              width: 100%;
              height: 100%;
              padding: 60px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }

            .document-number {
              position: absolute;
              top: 100px;
              right: 100px;
              font-size: 16px;
              color: #666;
            }

            .certificate-text {
              margin-top: 500px;
              font-size: 18px;
              line-height: 2;
              margin-bottom: 5px;
            }

            .certificate-footer {
              margin-top: auto;
              margin-bottom: 10px;
            }

            .issue-date {
              margin-bottom: 10px;
            }

            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 40px;
              position: relative;
              z-index: 2;
            }

            .company-seal {
              position: absolute;
              width: 80px;
              height: 80px;
              background: url('/images/seal.png') no-repeat center;
              background-size: contain;
              right: -80px;
              bottom: -10px;
              opacity: 0.9;
              z-index: 1;
            }

            .certificate-medal {
              display: none;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .certificate-container {
                margin: 0;
                box-shadow: none;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: url('/images/certificate-border.png') no-repeat center !important;
                background-size: 100% 100% !important;
              }

              .company-seal {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background: url('/images/seal.png') no-repeat center !important;
                background-size: contain !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="document-number">
              발급번호: 제 ${certificate?.id || enrollmentId}-${new Date().getFullYear()}호
            </div>

            <div class="certificate-content">
              <div class="certificate-text">
                ${studentInfo.name} 님은 '${course.title}' 교육과정을<br />
                성실히 이수하였기에 이 증서를 수여합니다.<br /><br />
                <span style="font-size: 14px; color: #666;">
                  본 수료증은 「평생교육법」 제25조 및 「학원의 설립·운영 및 과외교습에 관한 법률」<br />
                   제2조의2에 의거하여 발급되었습니다.
                </span>
              </div>

              <div class="certificate-footer">
                <div class="issue-date">
                  발급일: ${formatDate(new Date())}
                </div>

                <div class="company-name">
                  (주) 지누켐 대표이사
                  <div class="company-seal"></div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

        // Content-Type을 text/html로 설정하고 HTML 응답
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        res.send(html);
      } catch (error) {
        console.error("Error fetching certificate:", error);
        res
          .status(500)
          .json({ message: "수료증 조회 중 오류가 발생했습니다." });
      }
    },
  );
}
