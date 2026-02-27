import { db } from "./db";
import {
  users,
  courses,
  instructors,
  subscriptions, // Added
  enrollments,
  seminars,
  notices,
  reviews,
  chatChannels, // Added
  chatMessages,
  payments,
  seminarRegistrations,
  seminarWishlist,
  overseasPrograms,
  overseasRegistrations,
  certificates,
  cart,
  privateMessages,
  inquiries,
  sourceMaterials,
  authorApplications,
  businessPartnerships,
  careerApplications,
} from "../shared/schema.js";
import { eq, like, desc, and, sql, or, count, gte, lte } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Course,
  InsertCourse,
  Instructor,
  InsertInstructor,
  Subscription, // Added
  Enrollment,
  InsertEnrollment,
  Seminar,
  InsertSeminar,
  Notice,
  InsertNotice,
  Review,
  InsertReview,
  ChatChannel, // Added
  InsertChatChannel, // Added
  ChatMessage,
  InsertChatMessage,
  Payment,
  InsertPayment,
  SeminarRegistration,
  SeminarWishlist,
  OverseasProgram,
  InsertOverseasProgram,
  OverseasRegistration,
  InsertOverseasRegistration,
  Certificate,
  InsertCertificate,
  Cart,
  InsertCart,
  PrivateMessage,
  InsertPrivateMessage,
  Inquiry,
  InsertInquiry,
  SourceMaterial,
  InsertSourceMaterial,
  AuthorApplication,
  InsertAuthorApplication,
  BusinessPartnership,
  InsertBusinessPartnership,
  CareerApplication,
  InsertCareerApplication,
} from "../shared/schema.js";
import type { IStorage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class DbStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Neon DB 호환성을 위해 메모리 기반 세션 스토어 사용
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async getUserByBusinessNumber(
    businessNumber: string,
  ): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.businessNumber, businessNumber))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by business number:", error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(
    id: number,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    try {
      // 트랜잭션으로 모든 관련 데이터를 삭제
      await db.transaction(async (tx) => {
        // 1. 장바구니 아이템 삭제
        await tx.delete(cart).where(eq(cart.userId, id));

        // 2. 개인 메시지 삭제 (보낸 메시지와 받은 메시지)
        await tx
          .delete(privateMessages)
          .where(eq(privateMessages.senderId, id));
        await tx
          .delete(privateMessages)
          .where(eq(privateMessages.receiverId, id));

        // 3. 결제 정보 삭제
        await tx.delete(payments).where(eq(payments.userId, id));

        // 4. 수강 신청 삭제
        await tx.delete(enrollments).where(eq(enrollments.userId, id));

        // 5. 세미나 등록 삭제
        await tx
          .delete(seminarRegistrations)
          .where(eq(seminarRegistrations.userId, id));

        // 6. 해외교육 등록 삭제
        await tx
          .delete(overseasRegistrations)
          .where(eq(overseasRegistrations.userId, id));

        // 7. 세미나 위시리스트 삭제
        await tx.delete(seminarWishlist).where(eq(seminarWishlist.userId, id));

        // 8. 리뷰 삭제
        await tx.delete(reviews).where(eq(reviews.userId, id));

        // 9. 채팅 메시지 삭제
        await tx.delete(chatMessages).where(eq(chatMessages.userId, id));

        // 10. 수료증 삭제
        await tx.delete(certificates).where(eq(certificates.userId, id));

        // 11. 선생님 사용자인 경우 제공한 강의들도 비활성화
        const user = await tx
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        if (user[0]?.userType === "business") {
          await tx
            .update(courses)
            .set({ isActive: false })
            .where(eq(courses.providerId, id));
          await tx
            .update(seminars)
            .set({ isActive: false })
            .where(eq(seminars.providerId, id));
          await tx
            .update(overseasPrograms)
            .set({ isActive: false })
            .where(eq(overseasPrograms.providerId, id));
        }

        // 12. 마지막으로 사용자 삭제
        await tx.delete(users).where(eq(users.id, id));
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("사용자 삭제 중 오류가 발생했습니다.");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  async getPendingBusinesses(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.userType, "business"),
          eq(users.isApproved, false),
          eq(users.isActive, true),
        ),
      );
  }

  async updateBusinessApproval(
    businessId: number,
    action: string,
    reason?: string,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({
        isApproved: action === "approve",
        role: action === "approve" ? "business" : "user",
      })
      .where(eq(users.id, businessId))
      .returning();
    return result[0];
  }

  async getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    console.log("getCourses 함수 호출됨", filters);

    const conditions = [eq(courses.isActive, true)];

    // Category mapping for cross-table compatibility
    const categoryMap: Record<string, string[]> = {
      english: ["english", "영어", "영어교육"],
      korean: ["korean", "국어", "국어교육"],
      math: ["math", "수학", "수학교육"],
      science: ["science", "과학", "과학교육"],
      social: ["social", "사회", "사회교육"],
      mock: ["mock", "모의고사"],
    };

    if (filters?.category && filters.category !== "all") {
      const mappedValues = categoryMap[filters.category] || [filters.category];
      if (mappedValues.length > 1) {
        conditions.push(or(...mappedValues.map(v => eq(courses.category, v))) as any);
      } else {
        conditions.push(eq(courses.category, mappedValues[0]));
      }
    }

    if (filters?.subcategory && filters.subcategory !== "all") {
      conditions.push(eq(courses.subcategory, filters.subcategory));
    }

    if (filters?.type && filters.type !== "all") {
      // Use case-insensitive search for type as well
      const typeValue = filters.type.toLowerCase();
      // Handle special type mappings if needed (e.g. 'suneung' might map to specific DB value)
      const typeMap: Record<string, string[]> = {
        'suneung': ['suneung', '수능특강'],
        'completion': ['completion', '수능완성'],
        'grammar': ['grammar', '문법'],
        'reading': ['reading', '독해']
      };
      
      const mappedTypes = typeMap[typeValue] || [filters.type];
      
      if (mappedTypes.length > 1) {
        conditions.push(or(...mappedTypes.map(v => eq(courses.type, v))) as any);
      } else {
        conditions.push(eq(courses.type, mappedTypes[0]));
      }
    }

    if (filters?.level && filters.level !== "all") {
      const levelMap: Record<string, string[]> = {
        'beginner': ['beginner', '1학년', '중1'],
        'intermediate': ['intermediate', '2학년', '중2'],
        'advanced': ['advanced', '3학년', '중3'],
        'high1': ['high1', '고1', '1학년'],
        'high2': ['high2', '고2', '2학년'],
        'high3': ['high3', '고3', '3학년']
      };
      
      const mappedLevels = levelMap[filters.level] || [filters.level];
      
      // Remove overlapping '1학년', '2학년', '3학년' if context is clear (middle vs high)
      // This is tricky because '1학년' is stored in DB. We need to rely on 'subcategory' or assume '1학년' means different things based on context.
      // However, the DB column 'level' might just store '1학년'. If so, 'beginner' (middle 1) and 'high1' (high 1) might both match '1학년'.
      // To fix this, we should rely on the 'subcategory' or explicit level names if available.
      // But since we are stuck with existing data, we can try to filter by 'subcategory' if it exists.
      
      if (mappedLevels.length > 1) {
        conditions.push(or(...mappedLevels.map(v => eq(courses.level, v))) as any);
      } else {
        conditions.push(eq(courses.level, mappedLevels[0]));
      }
      
      // Additional filtering for Middle vs High using subcategory or type if possible
      if (['beginner', 'intermediate', 'advanced'].includes(filters.level)) {
         // This implies Middle School. Exclude High School types if possible or rely on data consistency.
         // If course has subcategory 'high', exclude it.
         conditions.push(or(eq(courses.subcategory, 'middle'), sql`${courses.subcategory} IS NULL`) as any);
      } else if (['high1', 'high2', 'high3'].includes(filters.level)) {
         // This implies High School.
         conditions.push(eq(courses.subcategory, 'high'));
      }
    }

    if (filters?.search) {
      conditions.push(like(courses.title, `%${filters.search}%`));
    }

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalResult = await db.select().from(courses).where(whereClause);
    const total = totalResult.length;

    // Get paginated results
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const coursesResult = await db
      .select({
        course: courses,
        provider: {
          name: users.name,
          organizationName: users.organizationName,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.providerId, users.id))
      .where(whereClause)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);

    // Also get matching items from overseas_programs (Workbooks)
    const overseasConditions = [eq(overseasPrograms.isActive, true)];
    
    if (filters?.category && filters.category !== "all") {
      const mappedValues = categoryMap[filters.category] || [filters.category];
      if (mappedValues.length > 1) {
        overseasConditions.push(or(...mappedValues.map(v => eq(overseasPrograms.category, v))) as any);
      } else {
        overseasConditions.push(eq(overseasPrograms.category, mappedValues[0]));
      }
    }
    
    if (filters?.search) {
      overseasConditions.push(like(overseasPrograms.title, `%${filters.search}%`));
    }

    // Filter Overseas Programs by Type and Level (based on hardcoded values in mapping)
    // Overseas programs are mapped as type='overseas' and level='intermediate'
    if (filters?.type && filters.type !== "all") {
      // If filtering by specific type that is NOT 'overseas' or 'workbook', exclude overseas programs
      // Note: 'workbook' logic might need adjustment if users use that filter
      const allowedTypes = ['overseas', 'workbook']; 
      if (!allowedTypes.includes(filters.type)) {
         overseasConditions.push(sql`1 = 0`); // Force empty result
      }
    }

    if (filters?.level && filters.level !== "all") {
      // If filtering by specific level that is NOT 'intermediate', exclude overseas programs
      const allowedLevels = ['intermediate', '2학년', '중2', 'high2', '고2']; // Allowing all intermediate variants
      if (!allowedLevels.includes(filters.level)) {
         overseasConditions.push(sql`1 = 0`); // Force empty result
      }
    }
    
    const overseasWhere = overseasConditions.length > 1 ? and(...overseasConditions) : overseasConditions[0];
    const overseasResult = await db
      .select({
        program: overseasPrograms,
        provider: {
          name: users.name,
          organizationName: users.organizationName,
        },
      })
      .from(overseasPrograms)
      .leftJoin(users, eq(overseasPrograms.providerId, users.id))
      .where(overseasWhere)
      .orderBy(desc(overseasPrograms.createdAt))
      .limit(limit);

    // Map overseas programs to Course structure
    const mappedOverseas: any[] = overseasResult.map(res => {
      const op = res.program;
      return {
        id: 100000 + op.id, // Offset to avoid ID collision
        title: op.title,
        description: op.description,
        category: op.category || '기타',
        subcategory: null,
        type: 'overseas',
        level: 'intermediate',
        credit: 0,
        price: op.price,
        discountPrice: null,
        duration: op.duration || '',
        maxStudents: op.maxParticipants,
        enrolledCount: op.currentParticipants,
        providerId: op.providerId,
        providerName: res.provider?.organizationName || res.provider?.name || '공통',
        startDate: op.startDate,
        endDate: op.endDate,
        instructorId: null,
        imageUrl: op.imageUrl,
        status: op.status,
        approvalStatus: op.approvalStatus,
        curriculum: op.program,
        isActive: op.isActive,
        createdAt: op.createdAt,
        updatedAt: op.updatedAt
      };
    });

    const mappedCourses: any[] = coursesResult.map(res => ({
      ...res.course,
      providerName: res.provider?.organizationName || res.provider?.name || '공통',
    }));

    // Combine and sort
    const combined = [...mappedCourses, ...mappedOverseas]
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    return { courses: combined, total: total + mappedOverseas.length };
  }

  async getCourse(id: number): Promise<Course | undefined> {
    // Offset ID 처리 (100000 이상은 overseas_programs)
    if (id >= 100000) {
      const overseasId = id - 100000;
      const result = await db
        .select({
          program: overseasPrograms,
          provider: {
            name: users.name,
            organizationName: users.organizationName,
          },
        })
        .from(overseasPrograms)
        .leftJoin(users, eq(overseasPrograms.providerId, users.id))
        .where(eq(overseasPrograms.id, overseasId))
        .limit(1);

      if (result.length > 0) {
        const res = result[0];
        const op = res.program;
        // Course 구조로 매핑
        return {
          id: 100000 + op.id,
          title: op.title,
          description: op.description,
          category: op.category || "기타",
          subcategory: null,
          type: "overseas",
          level: "intermediate",
          credit: 0,
          price: op.price,
          discountPrice: null,
          duration: op.duration || "",
          maxStudents: op.maxParticipants,
          enrolledCount: op.currentParticipants,
          providerId: op.providerId,
          providerName:
            res.provider?.organizationName || res.provider?.name || "공통",
          startDate: op.startDate,
          endDate: op.endDate,
          instructorId: null,
          instructorName: res.provider?.name || "전문 저자",
          instructorProfile: "본 도서는 AI Bridge에서 제공하는 전문 학습 자료입니다.",
          instructorExpertise: op.category || "학습 자료 전문가",
          imageUrl: op.imageUrl,
          status: op.status,
          approvalStatus: op.approvalStatus,
          curriculum: op.program,
          isActive: op.isActive,
          createdAt: op.createdAt,
          updatedAt: op.updatedAt,
        } as any;
      }
      return undefined;
    }

    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return result[0];
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    console.log("DbStorage: Creating course with data:", JSON.stringify(courseData, null, 2));
    const result = await db.insert(courses).values(courseData).returning();
    console.log("DbStorage: Created course result:", JSON.stringify(result[0], null, 2));
    return result[0];
  }

  async updateCourse(
    id: number,
    courseData: Partial<InsertCourse>,
  ): Promise<Course | undefined> {
    console.log(`DbStorage: Updating course ${id} with data:`, JSON.stringify(courseData, null, 2));
    // undefined나 null 값을 제거하고, 날짜 필드를 확인
    const cleanData: any = {};
    for (const [key, value] of Object.entries(courseData)) {
      // undefined인 경우만 건너뛰고 null이나 빈 배열 등은 포함하도록 수정 (데이터 삭제 가능하게 함)
      if (value !== undefined) {
        cleanData[key] = value;

        // 날짜 필드인 경우 타입 확인
        if (
          [
            "startDate",
            "endDate",
            "enrollmentDeadline",
            "completionDeadline",
            "createdAt",
            "updatedAt",
          ].includes(key) && value
        ) {
          console.log(`날짜 필드 ${key}:`, {
            value,
            type: typeof value,
            isDate: value instanceof Date,
            toString: value?.toString?.(),
          });
        }
      }
    }

    console.log("DbStorage: Clean update data:", JSON.stringify(cleanData, null, 2));

    const result = await db
      .update(courses)
      .set(cleanData)
      .where(eq(courses.id, id))
      .returning();
    
    console.log("DbStorage: Updated course result:", JSON.stringify(result[0], null, 2));
    return result[0];
  }

  async deleteCourse(id: number): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async getCoursesByProvider(providerId: number): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.providerId, providerId), eq(courses.isActive, true)),
      )
      .orderBy(desc(courses.createdAt));
  }

  async getPendingCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.approvalStatus, "pending"), eq(courses.isActive, true)),
      );
  }

  async updateCourseApproval(
    courseId: number,
    action: string,
    reason?: string,
  ): Promise<Course | undefined> {
    const result = await db
      .update(courses)
      .set({
        approvalStatus: action === "approve" ? "approved" : "rejected",
        status: action === "approve" ? "active" : "inactive",
      })
      .where(eq(courses.id, courseId))
      .returning();
    return result[0];
  }

  async getInstructors(): Promise<Instructor[]> {
    return await db
      .select()
      .from(instructors)
      .where(eq(instructors.isActive, true));
  }

  async getInstructorsByProvider(providerId: number): Promise<Instructor[]> {
    return await db
      .select()
      .from(instructors)
      .where(and(eq(instructors.providerId, providerId), eq(instructors.isActive, true)));
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    const result = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, id))
      .limit(1);
    return result[0];
  }

  async createInstructor(
    instructorData: InsertInstructor,
  ): Promise<Instructor> {
    const result = await db
      .insert(instructors)
      .values(instructorData)
      .returning();
    return result[0];
  }

  async updateInstructor(
    id: number,
    instructorData: Partial<InsertInstructor>,
  ): Promise<Instructor | undefined> {
    const result = await db
      .update(instructors)
      .set(instructorData)
      .where(eq(instructors.id, id))
      .returning();
    return result[0];
  }

  async deleteInstructor(id: number): Promise<void> {
    await db
      .update(instructors)
      .set({ isActive: false })
      .where(eq(instructors.id, id));
  }

  // Subscriptions
  async getSubscription(userId: number, instructorId: number): Promise<Subscription | undefined> {
    const result = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.instructorId, instructorId)))
      .limit(1);
    return result[0];
  }

  async createSubscription(userId: number, instructorId: number): Promise<Subscription> {
    const existing = await this.getSubscription(userId, instructorId);
    if (existing) return existing;

    const [result] = await db.insert(subscriptions).values({ userId, instructorId }).returning();
    
    // Increment subscriber count
    await db
      .update(instructors)
      .set({ subscribers: sql`${instructors.subscribers} + 1` })
      .where(eq(instructors.id, instructorId));

    return result;
  }

  async deleteSubscription(userId: number, instructorId: number): Promise<void> {
    const existing = await this.getSubscription(userId, instructorId);
    if (!existing) return;

    await db
      .delete(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.instructorId, instructorId)));

    // Decrement subscriber count
    await db
      .update(instructors)
      .set({ subscribers: sql`${instructors.subscribers} - 1` })
      .where(eq(instructors.id, instructorId));
  }

  async getEnrollments(
    userId?: number,
    courseId?: number,
  ): Promise<Enrollment[]> {
    // 1. regular enrollments 처리
    const conditions = [];
    if (userId) conditions.push(eq(enrollments.userId, userId));
    if (courseId && courseId < 100000)
      conditions.push(eq(enrollments.courseId, courseId));

    const enrolls =
      conditions.length > 0
        ? await db
            .select()
            .from(enrollments)
            .where(and(...conditions))
        : courseId && courseId < 100000
          ? []
          : await db.select().from(enrollments);

    // 2. overseas registrations 처리 (workbook)
    const overseasConditions = [];
    if (userId) overseasConditions.push(eq(overseasRegistrations.userId, userId));
    if (courseId && courseId >= 100000)
      overseasConditions.push(
        eq(overseasRegistrations.overseasId, courseId - 100000),
      );

    const overseasRegs =
      overseasConditions.length > 0
        ? await db
            .select()
            .from(overseasRegistrations)
            .where(and(...overseasConditions))
        : courseId && courseId >= 100000
          ? []
          : await db.select().from(overseasRegistrations);

    // 3. overseas registrations를 Enrollment 형식으로 매핑
    const mappedOverseas = overseasRegs.map((reg) => ({
      id: 100000 + reg.id,
      userId: reg.userId,
      courseId: 100000 + reg.overseasId,
      status: reg.status === "registered" ? "enrolled" : reg.status,
      progress: 0,
      grade: null,
      enrolledAt: reg.registeredAt,
      completedAt: null,
      subtype: "overseas",
    }));

    // 만약 특정 courseId를 요청했는데 그게 100000 이상이면 overseas만 반환
    if (courseId && courseId >= 100000) {
      return mappedOverseas as any;
    }
    // 특정 courseId를 요청했는데 100000 미만이면 regular만 반환
    if (courseId && courseId < 100000) {
      return enrolls;
    }

    // 그 외 (userId만 있거나 둘 다 없는 경우) 합쳐서 반환
    return [...enrolls, ...(mappedOverseas as any)];
  }

  async createEnrollment(
    enrollmentData: InsertEnrollment,
  ): Promise<Enrollment> {
    const courseId = enrollmentData.courseId;

    // Workbook (overseas program) 처리
    if (courseId >= 100000) {
      const overseasId = courseId - 100000;
      const result = await db
        .insert(overseasRegistrations)
        .values({
          userId: enrollmentData.userId,
          overseasId: overseasId,
          status: "registered",
        })
        .returning();

      const reg = result[0];
      return {
        id: 100000 + reg.id,
        userId: reg.userId,
        courseId: 100000 + reg.overseasId,
        status: "enrolled",
        progress: 0,
        grade: null,
        enrolledAt: reg.registeredAt,
        completedAt: null,
        subtype: "overseas",
      } as any;
    }

    const result = await db
      .insert(enrollments)
      .values(enrollmentData)
      .returning();
    return result[0];
  }

  async updateEnrollment(
    id: number,
    enrollmentData: Partial<InsertEnrollment>,
  ): Promise<Enrollment | undefined> {
    // 1. overseas_registrations 처리 (workbook)
    if (id >= 100000) {
      const overseasId = id - 100000;
      const result = await db
        .update(overseasRegistrations)
        .set({
          status:
            enrollmentData.status === "enrolled"
              ? "registered"
              : enrollmentData.status,
        })
        .where(eq(overseasRegistrations.id, overseasId))
        .returning();

      if (result.length > 0) {
        const reg = result[0];
        return {
          id: 100000 + reg.id,
          userId: reg.userId,
          courseId: 100000 + reg.overseasId,
          status: "enrolled",
          progress: 0,
          grade: null,
          enrolledAt: reg.registeredAt,
          completedAt: null,
          subtype: "overseas",
        } as any;
      }
      return undefined;
    }

    // 2. regular enrollments 처리
    const result = await db
      .update(enrollments)
      .set(enrollmentData)
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }

  async deleteEnrollment(id: number): Promise<void> {
    if (id >= 100000) {
      const overseasId = id - 100000;
      await db
        .delete(overseasRegistrations)
        .where(eq(overseasRegistrations.id, overseasId));
    } else {
      await db.delete(enrollments).where(eq(enrollments.id, id));
    }
  }

  async getSeminars(): Promise<Seminar[]> {
    return await db
      .select()
      .from(seminars)
      .where(eq(seminars.isActive, true))
      .orderBy(desc(seminars.date));
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    const result = await db
      .select()
      .from(seminars)
      .where(eq(seminars.id, id))
      .limit(1);
    return result[0];
  }

  async createSeminar(seminarData: InsertSeminar): Promise<Seminar> {
    const result = await db.insert(seminars).values(seminarData).returning();
    return result[0];
  }

  async updateSeminar(
    id: number,
    seminarData: Partial<InsertSeminar>,
  ): Promise<Seminar | undefined> {
    console.log("=== updateSeminar 호출 ===");
    console.log("Seminar ID:", id);
    console.log("Update data:", JSON.stringify(seminarData, null, 2));

    const result = await db
      .update(seminars)
      .set(seminarData)
      .where(eq(seminars.id, id))
      .returning();
    return result[0];
  }

  async deleteSeminar(id: number): Promise<void> {
    await db.update(seminars).set({ isActive: false }).where(eq(seminars.id, id));
  }

  async registerForSeminar(userId: number, seminarId: number): Promise<void> {
    await db.insert(seminarRegistrations).values({
      userId,
      seminarId,
      status: "registered",
    });

    // 세미나 참가자 수 업데이트
    await this.updateSeminarParticipantCount(seminarId);
  }

  async getSeminarRegistrations(
    seminarId?: number,
    userId?: number,
  ): Promise<SeminarRegistration[]> {
    let whereConditions = [];

    if (seminarId) {
      whereConditions.push(eq(seminarRegistrations.seminarId, seminarId));
    }
    if (userId) {
      whereConditions.push(eq(seminarRegistrations.userId, userId));
    }

    const whereClause =
      whereConditions.length > 0
        ? whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
        : undefined;

    return await db
      .select()
      .from(seminarRegistrations)
      .where(whereClause)
      .orderBy(desc(seminarRegistrations.registeredAt));
  }

  async isSeminarRegistered(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(seminarRegistrations)
      .where(
        and(
          eq(seminarRegistrations.userId, userId),
          eq(seminarRegistrations.seminarId, seminarId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async updateSeminarParticipantCount(seminarId: number): Promise<void> {
    // 해당 세미나의 등록된 참가자 수 계산
    const registrations = await db
      .select()
      .from(seminarRegistrations)
      .where(eq(seminarRegistrations.seminarId, seminarId));

    const participantCount = registrations.length;

    // 세미나 테이블의 currentParticipants 업데이트
    await db
      .update(seminars)
      .set({ currentParticipants: participantCount })
      .where(eq(seminars.id, seminarId));
  }

  async getNotices(
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ notices: Notice[]; total: number }> {
    const offset = (page - 1) * limit;

    // views 컬럼 없이 조회하는 기본 쿼리
    let baseConditions = [eq(notices.isActive, true)];
    if (category && category !== "all") {
      baseConditions.push(eq(notices.category, category));
    }
    const whereClause =
      baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    try {
      const [noticesResult, totalCountResult] = await Promise.all([
        db
          .select({
            id: notices.id,
            title: notices.title,
            content: notices.content,
            category: notices.category,
            authorId: notices.authorId,
            isImportant: notices.isImportant,
            isActive: notices.isActive,
            createdAt: notices.createdAt,
            updatedAt: notices.updatedAt,
          })
          .from(notices)
          .where(whereClause)
          .orderBy(desc(notices.createdAt))
          .limit(limit)
          .offset(offset),
        // Neon DB 호환 방식으로 count 구하기
        db.select().from(notices).where(whereClause),
      ]);

      // views 컬럼이 없으므로 기본값 0으로 설정
      const noticesWithViews = noticesResult.map((notice) => ({
        ...notice,
        views: 0,
      }));

      return {
        notices: noticesWithViews,
        total: totalCountResult.length,
      };
    } catch (error) {
      console.error("Error fetching notices:", error);
      // 완전히 실패한 경우 빈 결과 반환
      return {
        notices: [],
        total: 0,
      };
    }
  }

  async getNotice(id: number): Promise<Notice | undefined> {
    const result = await db
      .select()
      .from(notices)
      .where(eq(notices.id, id))
      .limit(1);
    return result[0];
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const result = await db.insert(notices).values(noticeData).returning();
    return result[0];
  }

  async updateNotice(
    id: number,
    noticeData: Partial<InsertNotice>,
  ): Promise<Notice | undefined> {
    const result = await db
      .update(notices)
      .set(noticeData)
      .where(eq(notices.id, id))
      .returning();
    return result[0];
  }

  async deleteNotice(id: number): Promise<void> {
    await db.update(notices).set({ isActive: false }).where(eq(notices.id, id));
  }

  async incrementNoticeViews(id: number): Promise<void> {
    try {
      // Neon DB에서는 raw SQL 대신 별도의 select와 update를 사용
      const currentNotice = await db
        .select()
        .from(notices)
        .where(eq(notices.id, id))
        .limit(1);
      if (currentNotice[0]) {
        const currentViews = currentNotice[0].views || 0;
        await db
          .update(notices)
          .set({
            views: currentViews + 1,
            updatedAt: new Date(),
          })
          .where(eq(notices.id, id));
      }
    } catch (error) {
      // views 컬럼이 없는 경우 무시하고 updatedAt만 업데이트
      console.log("Views column not found, skipping view increment");
      try {
        await db
          .update(notices)
          .set({ updatedAt: new Date() })
          .where(eq(notices.id, id));
      } catch (updateError) {
        console.error("Error updating notice:", updateError);
      }
    }
  }

  async getReviews(courseId: number): Promise<Review[]> {
    const targetId = courseId >= 100000 ? courseId - 100000 : courseId;
    const result = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        courseId: reviews.courseId,
        rating: reviews.rating,
        comment: reviews.comment,
        isActive: reviews.isActive,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.courseId, targetId), eq(reviews.isActive, true)))
      .orderBy(desc(reviews.createdAt));
    return result as any;
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(reviewData).returning();
    return result[0];
  }

  // Chat management
  async getUserChatChannels(userId: number): Promise<ChatChannel[]> {
    return await db
      .select()
      .from(chatChannels)
      .where(eq(chatChannels.userId, userId))
      .orderBy(desc(chatChannels.updatedAt));
  }

  async createChatChannel(userId: number): Promise<ChatChannel> {
    const result = await db
      .insert(chatChannels)
      .values({ userId, status: "active" })
      .returning();
    return result[0];
  }

  async updateChatChannel(
    id: number,
    channelData: Partial<InsertChatChannel>,
  ): Promise<ChatChannel | undefined> {
    const result = await db
      .update(chatChannels)
      .set({ ...channelData, updatedAt: new Date() })
      .where(eq(chatChannels.id, id))
      .returning();
    return result[0];
  }

  async deleteChatChannel(id: number): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. 해당 채널의 모든 메시지 삭제
      await tx.delete(chatMessages).where(eq(chatMessages.channelId, id));
      // 2. 채널 삭제
      await tx.delete(chatChannels).where(eq(chatChannels.id, id));
    });
  }

  async getChatMessagesByChannel(channelId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(chatMessages.createdAt);
  }

  async getChatMessages(limit?: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit || 50);
  }

  async createChatMessage(
    messageData: InsertChatMessage,
  ): Promise<ChatMessage> {
    const result = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();

    // Update channel's last message info
    if (messageData.channelId) {
      await this.updateChatChannel(messageData.channelId, {
        lastMessage: messageData.message,
        lastMessageAt: new Date(),
      });
    }

    return result[0];
  }

  async getPayments(userId?: number): Promise<any[]> {
    const whereClause = userId ? eq(payments.userId, userId) : undefined;
    return await db
      .select({
        id: payments.id,
        userId: payments.userId,
        courseId: payments.courseId,
        amount: payments.amount,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        createdAt: payments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
        },
        course: {
          id: courses.id,
          title: courses.title,
          category: courses.category,
          price: courses.price,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(paymentData).returning();
    return result[0];
  }

  async updatePayment(
    id: number,
    paymentData: Partial<InsertPayment>,
  ): Promise<Payment | undefined> {
    const result = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async getDashboardStats(): Promise<any> {
    // Neon DB 호환 방식으로 count 구하기 - 개별 쿼리로 분리
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true));
    const businessUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.userType, "business"), eq(users.isActive, true)));
    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true));
    const pendingCoursesList = await db
      .select()
      .from(courses)
      .where(eq(courses.approvalStatus, "pending"));
    const allEnrollments = await db.select().from(enrollments);
    const pendingBusinessesList = await db
      .select()
      .from(users)
      .where(and(eq(users.userType, "business"), eq(users.isApproved, false)));

    // 월 매출 계산 (이번 달)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const monthlyPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.status, "completed"),
          gte(payments.createdAt, firstDayOfMonth),
          lte(payments.createdAt, lastDayOfMonth),
        ),
      );

    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    return {
      totalUsers: allUsers.length,
      businessUsers: businessUsers.length,
      pendingBusinesses: pendingBusinessesList.length,
      totalCourses: allCourses.length,
      pendingCourses: pendingCoursesList.length,
      monthlyRevenue: monthlyRevenue,
    };
  }

  async getAnalyticsStats(): Promise<any> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );

      // 1. 사용자 증가율 데이터 (최근 6개월)
      const monthlyUserGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const usersThisMonth = await db
          .select()
          .from(users)
          .where(
            and(
              gte(users.createdAt, monthStart),
              lte(users.createdAt, monthEnd),
              eq(users.isActive, true),
            ),
          );

        monthlyUserGrowth.push({
          month: monthStart.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
          }),
          users: usersThisMonth.length,
          individual: usersThisMonth.filter((u) => u.userType === "individual")
            .length,
          business: usersThisMonth.filter((u) => u.userType === "business")
            .length,
        });
      }

      // 2. 매출 분석 (최근 6개월)
      const monthlyRevenue = [];
      let totalRevenue = 0;
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const paymentsThisMonth = await db
          .select()
          .from(payments)
          .where(
            and(
              eq(payments.status, "completed"),
              gte(payments.createdAt, monthStart),
              lte(payments.createdAt, monthEnd),
            ),
          );

        const monthRevenue = paymentsThisMonth.reduce((sum, payment) => {
          return sum + parseFloat(payment.amount);
        }, 0);

        totalRevenue += monthRevenue;

        monthlyRevenue.push({
          month: monthStart.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
          }),
          revenue: monthRevenue,
          transactions: paymentsThisMonth.length,
        });
      }

      // 3. 강의 성과 분석
      const allCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.isActive, true));
      const allEnrollments = await db.select().from(enrollments);

      // 카테고리별 강의 수
      const coursesByCategory: Record<string, number> = {};
      allCourses.forEach((course) => {
        if (course.category) {
          coursesByCategory[course.category] =
            (coursesByCategory[course.category] || 0) + 1;
        }
      });

      // 인기 강의 TOP 10
      const courseEnrollmentCount: Record<number, number> = {};
      allEnrollments.forEach((enrollment) => {
        courseEnrollmentCount[enrollment.courseId] =
          (courseEnrollmentCount[enrollment.courseId] || 0) + 1;
      });

      const topCourses = await Promise.all(
        Object.entries(courseEnrollmentCount)
          .sort(([, a], [, b]) => Number(b) - Number(a))
          .slice(0, 10)
          .map(async ([courseId, enrollmentCount]) => {
            const course = await db
              .select()
              .from(courses)
              .where(eq(courses.id, parseInt(courseId)))
              .limit(1);
            return {
              id: parseInt(courseId),
              title: course[0]?.title || "알 수 없는 강의",
              category: course[0]?.category || "기타",
              enrollments: Number(enrollmentCount),
              price: course[0]?.price || 0,
            };
          }),
      );

      // 4. 사용자 활동 통계
      const thisMonthUsers = await db
        .select()
        .from(users)
        .where(
          and(gte(users.createdAt, currentMonth), eq(users.isActive, true)),
        );

      const lastMonthUsers = await db
        .select()
        .from(users)
        .where(
          and(
            gte(users.createdAt, lastMonth),
            lte(users.createdAt, currentMonth),
            eq(users.isActive, true),
          ),
        );

      const userGrowthRate =
        lastMonthUsers.length > 0
          ? ((thisMonthUsers.length - lastMonthUsers.length) /
              lastMonthUsers.length) *
            100
          : 0;

      // 5. 매출 성장률
      const thisMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.status, "completed"),
            gte(payments.createdAt, currentMonth),
          ),
        );

      const lastMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.status, "completed"),
            gte(payments.createdAt, lastMonth),
            lte(payments.createdAt, currentMonth),
          ),
        );

      const thisMonthRevenue = thisMonthPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );
      const lastMonthRevenue = lastMonthPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );

      const revenueGrowthRate =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // 6. 전체 통계 요약
      const totalUsers = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true));
      const totalBusinessUsers = await db
        .select()
        .from(users)
        .where(and(eq(users.userType, "business"), eq(users.isActive, true)));

      return {
        // 성장률 지표
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,

        // 월별 데이터
        monthlyUserGrowth,
        monthlyRevenue,

        // 강의 성과
        coursesByCategory: Object.entries(coursesByCategory).map(
          ([category, count]) => ({
            category,
            count,
          }),
        ),
        topCourses,

        // 전체 통계
        totalStats: {
          totalUsers: totalUsers.length,
          businessUsers: totalBusinessUsers.length,
          individualUsers: totalUsers.filter((u) => u.userType === "individual")
            .length,
          totalCourses: allCourses.length,
          totalEnrollments: allEnrollments.length,
          totalRevenue: Math.round(totalRevenue),
          averageRevenuePerUser:
            totalUsers.length > 0
              ? Math.round(totalRevenue / totalUsers.length)
              : 0,
        },
      };
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      throw error;
    }
  }

  async addSeminarToWishlist(userId: number, seminarId: number): Promise<void> {
    // 이미 관심등록되어 있는지 확인
    const existing = await db
      .select()
      .from(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      )
      .limit(1);

    // 중복이 아닌 경우에만 추가
    if (existing.length === 0) {
      await db.insert(seminarWishlist).values({
        userId,
        seminarId,
      });
    }
  }

  async removeSeminarFromWishlist(
    userId: number,
    seminarId: number,
  ): Promise<void> {
    await db
      .delete(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      );
  }

  async isSeminarInWishlist(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async getSeminarsByProvider(providerId: number): Promise<Seminar[]> {
    return await db
      .select()
      .from(seminars)
      .where(
        and(eq(seminars.providerId, providerId), eq(seminars.isActive, true)),
      )
      .orderBy(desc(seminars.date));
  }

  // Overseas Programs management
  async getOverseasPrograms(): Promise<OverseasProgram[]> {
    return await db
      .select()
      .from(overseasPrograms)
      .where(eq(overseasPrograms.isActive, true))
      .orderBy(desc(overseasPrograms.startDate));
  }

  async getAllOverseasPrograms(): Promise<OverseasProgram[]> {
    return await db
      .select()
      .from(overseasPrograms)
      .orderBy(desc(overseasPrograms.createdAt));
  }

  async getOverseasProgram(id: number): Promise<OverseasProgram | undefined> {
    const result = await db
      .select()
      .from(overseasPrograms)
      .where(eq(overseasPrograms.id, id))
      .limit(1);
    return result[0];
  }

  async createOverseasProgram(
    programData: InsertOverseasProgram,
  ): Promise<OverseasProgram> {
    const result = await db
      .insert(overseasPrograms)
      .values(programData)
      .returning();
    return result[0];
  }

  async updateOverseasProgram(
    id: number,
    programData: Partial<InsertOverseasProgram>,
  ): Promise<OverseasProgram | undefined> {
    const result = await db
      .update(overseasPrograms)
      .set({
        ...programData,
        updatedAt: new Date(),
      })
      .where(eq(overseasPrograms.id, id))
      .returning();
    return result[0];
  }

  async deleteOverseasProgram(id: number): Promise<void> {
    await db
      .update(overseasPrograms)
      .set({ isActive: false })
      .where(eq(overseasPrograms.id, id));
  }

  async getOverseasProgramsByProvider(
    providerId: number,
  ): Promise<OverseasProgram[]> {
    return await db
      .select()
      .from(overseasPrograms)
      .where(
        and(
          eq(overseasPrograms.providerId, providerId),
          eq(overseasPrograms.isActive, true),
        ),
      )
      .orderBy(desc(overseasPrograms.createdAt));
  }

  async registerForOverseasProgram(
    userId: number,
    overseasId: number,
  ): Promise<void> {
    await db.insert(overseasRegistrations).values({
      userId,
      overseasId,
      status: "registered",
    });

    // 해외교육 참가자 수 업데이트
    await this.updateOverseasParticipantCount(overseasId);
  }

  async getOverseasRegistrations(
    overseasId?: number,
    userId?: number,
  ): Promise<OverseasRegistration[]> {
    let whereConditions = [];

    if (overseasId) {
      whereConditions.push(eq(overseasRegistrations.overseasId, overseasId));
    }
    if (userId) {
      whereConditions.push(eq(overseasRegistrations.userId, userId));
    }

    const whereClause =
      whereConditions.length > 0
        ? whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
        : undefined;

    const results = await db
      .select()
      .from(overseasRegistrations)
      .where(whereClause)
      .orderBy(desc(overseasRegistrations.registeredAt));

    return results.map((result) => ({
      id: result.id,
      userId: result.userId,
      overseasId: result.overseasId,
      status: result.status,
      registeredAt: result.registeredAt,
    }));
  }

  async isOverseasRegistered(
    userId: number,
    overseasId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(overseasRegistrations)
      .where(
        and(
          eq(overseasRegistrations.userId, userId),
          eq(overseasRegistrations.overseasId, overseasId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async updateOverseasParticipantCount(overseasId: number): Promise<void> {
    // 해당 해외교육의 등록된 참가자 수 계산
    const registrations = await db
      .select()
      .from(overseasRegistrations)
      .where(eq(overseasRegistrations.overseasId, overseasId));

    const participantCount = registrations.length;

    // 해외교육 테이블의 currentParticipants 업데이트
    await db
      .update(overseasPrograms)
      .set({ currentParticipants: participantCount })
      .where(eq(overseasPrograms.id, overseasId));
  }

  async query(sqlString: string, params?: any[]): Promise<{ rows: any[] }> {
    const result = await db.execute(sql.raw(sqlString));
    return { rows: Array.isArray(result) ? result : [result] };
  }

  // Source Material management
  async getSourceMaterials(userId: number): Promise<SourceMaterial[]> {
    return await db
      .select()
      .from(sourceMaterials)
      .where(eq(sourceMaterials.userId, userId))
      .orderBy(desc(sourceMaterials.createdAt));
  }

  async createSourceMaterial(
    materialData: InsertSourceMaterial,
  ): Promise<SourceMaterial> {
    const result = await db
      .insert(sourceMaterials)
      .values(materialData)
      .returning();
    return result[0];
  }

  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1);
    return result[0];
  }

  async createCertificate(
    certificateData: InsertCertificate,
  ): Promise<Certificate> {
    const result = await db
      .insert(certificates)
      .values(certificateData)
      .returning();
    return result[0];
  }

  async getCertificate(enrollmentId: number): Promise<Certificate | null> {
    // enrollmentId로 enrollment 정보를 먼저 조회하고, 해당 userId와 courseId로 certificate 조회
    const enrollment = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);
    if (!enrollment[0]) return null;

    const result = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, enrollment[0].userId),
          eq(certificates.courseId, enrollment[0].courseId),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  // Cart management methods
  async getCartItems(userId: number): Promise<any[]> {
    const cartItems = await db
      .select({
        id: cart.id,
        courseId: cart.courseId,
        type: cart.type,
        addedAt: cart.addedAt,
        courseName: courses.title,
        courseImage: courses.imageUrl,
        price: courses.price,
        discountPrice: courses.discountPrice,
        instructor: courses.instructorName,
      })
      .from(cart)
      .innerJoin(courses, eq(cart.courseId, courses.id))
      .where(eq(cart.userId, userId))
      .orderBy(desc(cart.addedAt));

    return cartItems.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      courseName: item.courseName,
      courseImage: item.courseImage || "/uploads/images/1.jpg",
      price: item.price,
      discountPrice: item.discountPrice,
      instructor: item.instructor || "강사명",
      addedAt: item.addedAt,
    }));
  }

  async addToCart(
    userId: number,
    courseId: number,
    type: string = "course",
  ): Promise<void> {
    // 이미 장바구니에 있는지 확인
    const existing = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.courseId, courseId)))
      .limit(1);

    // 중복이 아닌 경우에만 추가
    if (existing.length === 0) {
      await db.insert(cart).values({
        userId,
        courseId,
        type,
      });
    }
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    await db
      .delete(cart)
      .where(and(eq(cart.userId, userId), eq(cart.id, itemId)));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  async isInCart(userId: number, courseId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.courseId, courseId)))
      .limit(1);

    return result.length > 0;
  }

  // Private Message management (쪽지 시스템)
  async getPrivateMessages(
    userId: number,
    type: "received" | "sent",
  ): Promise<PrivateMessage[]> {
    try {
      let query;
      if (type === "received") {
        // 받은 쪽지: 발송자 정보 조인
        query = db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            senderName: users.name,
            senderEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.senderId))
          .where(
            and(
              eq(privateMessages.receiverId, userId),
              eq(privateMessages.isDeletedByReceiver, false),
            ),
          )
          .orderBy(desc(privateMessages.createdAt));
      } else {
        // 보낸 쪽지: 수신자 정보 조인
        query = db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            receiverName: users.name,
            receiverEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.receiverId))
          .where(
            and(
              eq(privateMessages.senderId, userId),
              eq(privateMessages.isDeletedBySender, false),
            ),
          )
          .orderBy(desc(privateMessages.createdAt));
      }

      return await query;
    } catch (error) {
      console.error("Error fetching private messages:", error);
      return [];
    }
  }

  async getPrivateMessage(
    messageId: number,
    userId: number,
  ): Promise<PrivateMessage | undefined> {
    try {
      // 먼저 메시지가 받은 것인지 보낸 것인지 확인
      const messageCheck = await db
        .select({
          senderId: privateMessages.senderId,
          receiverId: privateMessages.receiverId,
        })
        .from(privateMessages)
        .where(eq(privateMessages.id, messageId))
        .limit(1);

      if (!messageCheck[0]) return undefined;

      const isReceived = messageCheck[0].receiverId === userId;
      const isSent = messageCheck[0].senderId === userId;

      if (!isReceived && !isSent) return undefined;

      let result;
      if (isReceived) {
        // 받은 쪽지: 발송자 정보 조인
        result = await db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            senderName: users.name,
            senderEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.senderId))
          .where(eq(privateMessages.id, messageId))
          .limit(1);
      } else {
        // 보낸 쪽지: 수신자 정보 조인
        result = await db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            receiverName: users.name,
            receiverEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.receiverId))
          .where(eq(privateMessages.id, messageId))
          .limit(1);
      }

      return result[0];
    } catch (error) {
      console.error("Error fetching private message:", error);
      return undefined;
    }
  }

  async createPrivateMessage(
    message: InsertPrivateMessage,
  ): Promise<PrivateMessage> {
    try {
      const result = await db
        .insert(privateMessages)
        .values(message)
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating private message:", error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    try {
      await db
        .update(privateMessages)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(privateMessages.id, messageId),
            eq(privateMessages.receiverId, userId),
          ),
        );
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async deleteMessage(
    messageId: number,
    userId: number,
    type: "sender" | "receiver",
  ): Promise<void> {
    try {
      const updateData =
        type === "sender"
          ? { isDeletedBySender: true }
          : { isDeletedByReceiver: true };

      const whereCondition =
        type === "sender"
          ? and(
              eq(privateMessages.id, messageId),
              eq(privateMessages.senderId, userId),
            )
          : and(
              eq(privateMessages.id, messageId),
              eq(privateMessages.receiverId, userId),
            );

      await db.update(privateMessages).set(updateData).where(whereCondition);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(privateMessages)
        .where(
          and(
            eq(privateMessages.receiverId, userId),
            eq(privateMessages.isRead, false),
            eq(privateMessages.isDeletedByReceiver, false),
          ),
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting unread message count:", error);
      return 0;
    }
  }

  // 문의사항 관련 메서드들
  async getInquiries(
    userId?: number,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ inquiries: Inquiry[]; total: number }> {
    try {
      let baseConditions = [eq(inquiries.isActive, true)];

      if (userId) {
        baseConditions.push(eq(inquiries.userId, userId));
      }

      if (status) {
        baseConditions.push(eq(inquiries.status, status));
      }

      const whereClause = and(...baseConditions);
      const offset = (page - 1) * limit;

      const [inquiriesResult, totalCountResult] = await Promise.all([
        db
          .select({
            id: inquiries.id,
            userId: inquiries.userId,
            title: inquiries.title,
            content: inquiries.content,
            type: inquiries.type,
            status: inquiries.status,
            isPrivate: inquiries.isPrivate,
            attachmentUrl: inquiries.attachmentUrl,
            answer: inquiries.answer,
            answeredBy: inquiries.answeredBy,
            answeredAt: inquiries.answeredAt,
            isActive: inquiries.isActive,
            createdAt: inquiries.createdAt,
            updatedAt: inquiries.updatedAt,
            userName: users.name,
            userEmail: users.email,
            answererName: sql`answerer.name`.as("answererName"),
          })
          .from(inquiries)
          .leftJoin(users, eq(inquiries.userId, users.id))
          .leftJoin(
            sql`${users} as answerer`,
            sql`${inquiries.answeredBy} = answerer.id`,
          )
          .where(whereClause)
          .orderBy(desc(inquiries.createdAt))
          .limit(limit)
          .offset(offset),

        db
          .select({ count: sql`count(*)` })
          .from(inquiries)
          .where(whereClause),
      ]);

      const total = Number(totalCountResult[0]?.count || 0);

      return {
        inquiries: inquiriesResult,
        total,
      };
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      return {
        inquiries: [],
        total: 0,
      };
    }
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const result = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1);
    return result[0];
  }

  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiryData).returning();
    return result[0];
  }

  async updateInquiry(
    id: number,
    inquiryData: Partial<InsertInquiry>,
  ): Promise<Inquiry | undefined> {
    const result = await db
      .update(inquiries)
      .set(inquiryData)
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async answerInquiry(
    id: number,
    answer: string,
    answeredBy: number,
  ): Promise<Inquiry | undefined> {
    const result = await db
      .update(inquiries)
      .set({
        answer,
        answeredBy,
        answeredAt: new Date(),
        status: "answered",
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async deleteInquiry(id: number): Promise<void> {
    await db
      .update(inquiries)
      .set({ isActive: false })
      .where(eq(inquiries.id, id));
  }

  // Application management implementation
  async createAuthorApplication(app: InsertAuthorApplication): Promise<AuthorApplication> {
    const result = await db.insert(authorApplications).values(app).returning();
    return result[0];
  }

  async getAuthorApplications(): Promise<AuthorApplication[]> {
    return await db.select().from(authorApplications).orderBy(desc(authorApplications.createdAt));
  }

  async updateAuthorApplication(id: number, data: Partial<InsertAuthorApplication>): Promise<AuthorApplication | undefined> {
    const result = await db.update(authorApplications).set(data).where(eq(authorApplications.id, id)).returning();
    return result[0];
  }

  async createBusinessPartnership(partnership: InsertBusinessPartnership): Promise<BusinessPartnership> {
    const result = await db.insert(businessPartnerships).values(partnership).returning();
    return result[0];
  }

  async getBusinessPartnerships(): Promise<BusinessPartnership[]> {
    return await db.select().from(businessPartnerships).orderBy(desc(businessPartnerships.createdAt));
  }

  async updateBusinessPartnership(id: number, data: Partial<InsertBusinessPartnership>): Promise<BusinessPartnership | undefined> {
    const result = await db.update(businessPartnerships).set(data).where(eq(businessPartnerships.id, id)).returning();
    return result[0];
  }

  async createCareerApplication(app: InsertCareerApplication): Promise<CareerApplication> {
    const result = await db.insert(careerApplications).values(app).returning();
    return result[0];
  }

  async getCareerApplications(): Promise<CareerApplication[]> {
    return await db.select().from(careerApplications).orderBy(desc(careerApplications.createdAt));
  }

  async updateCareerApplication(id: number, data: Partial<InsertCareerApplication>): Promise<CareerApplication | undefined> {
    const result = await db.update(careerApplications).set(data).where(eq(careerApplications.id, id)).returning();
    return result[0];
  }
}
