import {
  type User,
  type InsertUser,
  type Course,
  type InsertCourse,
  type Instructor,
  type InsertInstructor,
  type Subscription,
  type Enrollment,
  type InsertEnrollment,
  type Seminar,
  type InsertSeminar,
  type Notice,
  type InsertNotice,
  type Review,
  type InsertReview,
  type ChatChannel, // Added
  type InsertChatChannel, // Added
  type ChatMessage,
  type InsertChatMessage,
  type Payment,
  type InsertPayment,
  type SeminarRegistration,
  type SeminarWishlist,
  type OverseasProgram,
  type InsertOverseasProgram,
  type OverseasRegistration,
  type InsertOverseasRegistration,
  type Certificate,
  type InsertCertificate,
  type PrivateMessage,
  type InsertPrivateMessage,
  type SourceMaterial,
  type InsertSourceMaterial,
  type AuthorApplication,
  type InsertAuthorApplication,
  type BusinessPartnership,
  type InsertBusinessPartnership,
  type CareerApplication,
  type InsertCareerApplication,
} from "../shared/schema.js";
import session from "express-session";
import createMemoryStore from "memorystore";
import { DbStorage } from "./db-storage";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByBusinessNumber(businessNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getPendingBusinesses(): Promise<User[]>;
  updateBusinessApproval(
    businessId: number,
    action: string,
    reason?: string,
  ): Promise<User | undefined>;

  // Course management
  getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(
    id: number,
    course: Partial<InsertCourse>,
  ): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;
  getCoursesByProvider(providerId: number): Promise<Course[]>;
  getPendingCourses(): Promise<Course[]>;
  updateCourseApproval(
    courseId: number,
    action: string,
    reason?: string,
  ): Promise<Course | undefined>;

  // Instructor management
  getInstructors(): Promise<Instructor[]>;
  getInstructorsByProvider(providerId: number): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  updateInstructor(
    id: number,
    instructor: Partial<InsertInstructor>,
  ): Promise<Instructor | undefined>;
  deleteInstructor(id: number): Promise<void>;

  // Subscriptions
  getSubscription(userId: number, instructorId: number): Promise<Subscription | undefined>;
  createSubscription(userId: number, instructorId: number): Promise<Subscription>;
  deleteSubscription(userId: number, instructorId: number): Promise<void>;

  // Enrollment management
  getEnrollments(userId?: number, courseId?: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(
    id: number,
    enrollment: Partial<InsertEnrollment>,
  ): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<void>;
  getEnrollment(enrollmentId: number): Promise<any>;

  // Seminar management
  getSeminars(): Promise<Seminar[]>;
  getSeminar(id: number): Promise<Seminar | undefined>;
  createSeminar(seminar: InsertSeminar): Promise<Seminar>;
  updateSeminar(
    id: number,
    seminar: Partial<InsertSeminar>,
  ): Promise<Seminar | undefined>;
  deleteSeminar(id: number): Promise<void>;
  getSeminarsByProvider(providerId: number): Promise<Seminar[]>;
  registerForSeminar(userId: number, seminarId: number): Promise<void>;
  getSeminarRegistrations(
    seminarId?: number,
    userId?: number,
  ): Promise<SeminarRegistration[]>;
  isSeminarRegistered(userId: number, seminarId: number): Promise<boolean>;
  updateSeminarParticipantCount(seminarId: number): Promise<void>;
  addSeminarToWishlist(userId: number, seminarId: number): Promise<void>;
  removeSeminarFromWishlist(userId: number, seminarId: number): Promise<void>;
  isSeminarInWishlist(userId: number, seminarId: number): Promise<boolean>;

  // Overseas Programs management
  getOverseasPrograms(): Promise<OverseasProgram[]>;
  getAllOverseasPrograms(): Promise<OverseasProgram[]>;
  getOverseasProgram(id: number): Promise<OverseasProgram | undefined>;
  createOverseasProgram(
    program: InsertOverseasProgram,
  ): Promise<OverseasProgram>;
  updateOverseasProgram(
    id: number,
    program: Partial<InsertOverseasProgram>,
  ): Promise<OverseasProgram | undefined>;
  deleteOverseasProgram(id: number): Promise<void>;
  getOverseasProgramsByProvider(providerId: number): Promise<OverseasProgram[]>;
  registerForOverseasProgram(userId: number, overseasId: number): Promise<void>;
  getOverseasRegistrations(
    overseasId?: number,
    userId?: number,
  ): Promise<OverseasRegistration[]>;
  isOverseasRegistered(userId: number, overseasId: number): Promise<boolean>;
  updateOverseasParticipantCount(overseasId: number): Promise<void>;

  // Notice management
  getNotices(
    category?: string,
    page?: number,
    limit?: number,
  ): Promise<{ notices: Notice[]; total: number }>;
  getNotice(id: number): Promise<Notice | undefined>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(
    id: number,
    notice: Partial<InsertNotice>,
  ): Promise<Notice | undefined>;
  deleteNotice(id: number): Promise<void>;
  incrementNoticeViews(id: number): Promise<void>;

  // Review management
  getReviews(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Chat management
  getUserChatChannels(userId: number): Promise<ChatChannel[]>;
  createChatChannel(userId: number): Promise<ChatChannel>;
  updateChatChannel(
    id: number,
    channelData: Partial<InsertChatChannel>,
  ): Promise<ChatChannel | undefined>;
  deleteChatChannel(id: number): Promise<void>; // Added
  getChatMessagesByChannel(channelId: number): Promise<ChatMessage[]>;
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Private Message management (쪽지 시스템)
  getPrivateMessages(
    userId: number,
    type: "received" | "sent",
  ): Promise<PrivateMessage[]>;
  getPrivateMessage(
    messageId: number,
    userId: number,
  ): Promise<PrivateMessage | undefined>;
  createPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage>;
  markMessageAsRead(messageId: number, userId: number): Promise<void>;
  deleteMessage(
    messageId: number,
    userId: number,
    type: "sender" | "receiver",
  ): Promise<void>;
  getUnreadMessageCount(userId: number): Promise<number>;

  // Payment management
  getPayments(userId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(
    id: number,
    payment: Partial<InsertPayment>,
  ): Promise<Payment | undefined>;

  // Admin management
  getDashboardStats(): Promise<any>;

  // Session store
  sessionStore: any;

  // raw query execution
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;

  // Source Material management
  getSourceMaterials(userId: number): Promise<SourceMaterial[]>;
  createSourceMaterial(material: InsertSourceMaterial): Promise<SourceMaterial>;

  // Certificate management
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(enrollmentId: number): Promise<Certificate | null>;

  // Cart management
  getCartItems(userId: number): Promise<any[]>;
  addToCart(userId: number, courseId: number, type?: string): Promise<void>;
  removeFromCart(userId: number, itemId: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  isInCart(userId: number, courseId: number): Promise<boolean>;

  // Application management
  createAuthorApplication(app: InsertAuthorApplication): Promise<AuthorApplication>;
  getAuthorApplications(): Promise<AuthorApplication[]>;
  updateAuthorApplication(id: number, data: Partial<InsertAuthorApplication>): Promise<AuthorApplication | undefined>;

  createBusinessPartnership(partnership: InsertBusinessPartnership): Promise<BusinessPartnership>;
  getBusinessPartnerships(): Promise<BusinessPartnership[]>;
  updateBusinessPartnership(id: number, data: Partial<InsertBusinessPartnership>): Promise<BusinessPartnership | undefined>;

  createCareerApplication(app: InsertCareerApplication): Promise<CareerApplication>;
  getCareerApplications(): Promise<CareerApplication[]>;
  updateCareerApplication(id: number, data: Partial<InsertCareerApplication>): Promise<CareerApplication | undefined>;
}

export class MemStorage implements IStorage {
  sessionStore: any;
  private users: Map<number, User> = new Map();
  private courses: Map<number, Course> = new Map();
  private instructors: Map<number, Instructor> = new Map();
  private enrollments: Map<number, Enrollment> = new Map();
  private seminars: Map<number, Seminar> = new Map();
  private notices: Map<number, Notice> = new Map();
  private reviews: Map<number, Review> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private payments: Map<number, Payment> = new Map();
  private certificates: Map<number, Certificate> = new Map();
  private nextId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    // PostgreSQL을 사용하므로 메모리 기반 더미 데이터는 제거
    // 이 클래스는 호환성을 위해서만 유지됨
  }

  private seedData() {
    // PostgreSQL 데이터베이스를 사용하므로 메모리 기반 더미 데이터는 더 이상 필요하지 않음
    // 모든 데이터는 데이터베이스에서 관리됨
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async getUserByBusinessNumber(
    businessNumber: string,
  ): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.businessNumber === businessNumber) return user;
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextId++;
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone || null,
      userType: userData.userType || "individual",
      role: userData.role || null,
      organizationName: userData.organizationName || null,
      businessNumber: userData.businessNumber || null,
      representativeName: userData.representativeName || null,
      address: userData.address || null,
      isAdmin: userData.isAdmin || false,
      isApproved: true, // 항상 승인된 상태로 생성
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  }

  async getPendingBusinesses(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === "business" && !user.isApproved,
    );
  }

  async updateBusinessApproval(
    businessId: number,
    action: string,
    reason?: string,
  ): Promise<User | undefined> {
    const existingUser = this.users.get(businessId);
    if (!existingUser) return undefined;

    const updatedUser: User = {
      ...existingUser,
      isApproved: action === "approve",
      updatedAt: new Date(),
    };
    this.users.set(businessId, updatedUser);
    return updatedUser;
  }

  // Course methods
  async getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    let filteredCourses = Array.from(this.courses.values()).filter(
      (course) => course.isActive,
    );

    if (filters?.category) {
      filteredCourses = filteredCourses.filter(
        (course) => course.category === filters.category,
      );
    }
    if (filters?.subcategory) {
      filteredCourses = filteredCourses.filter(
        (course) => course.subcategory === filters.subcategory,
      );
    }
    if (filters?.type) {
      filteredCourses = filteredCourses.filter(
        (course) => course.type === filters.type,
      );
    }
    if (filters?.level) {
      filteredCourses = filteredCourses.filter(
        (course) => course.level === filters.level,
      );
    }
    if (filters?.search) {
      filteredCourses = filteredCourses.filter((course) =>
        course.title.toLowerCase().includes(filters.search!.toLowerCase()),
      );
    }

    const total = filteredCourses.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const courses = filteredCourses
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      )
      .slice(offset, offset + limit);

    return { courses, total };
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.nextId++;
    const course: Course = {
      id,
      title: courseData.title,
      description: courseData.description || null,
      category: courseData.category,
      subcategory: courseData.subcategory || null,
      type: courseData.type || "course",
      level: courseData.level || null,
      credit: courseData.credit || 1,
      price: courseData.price || 0,
      discountPrice: courseData.discountPrice || null,
      duration: courseData.duration,
      location: courseData.location || null,
      startDate: courseData.startDate || null,
      endDate: courseData.endDate || null,
      maxStudents: courseData.maxStudents || null,
      enrolledCount: 0,
      imageUrl: courseData.imageUrl || null,
      status:
        courseData.status || (courseData.providerId ? "pending" : "active"),
      approvalStatus:
        courseData.approvalStatus ||
        (courseData.providerId ? "pending" : "approved"),
      instructorId: courseData.instructorId || null,
      providerId: courseData.providerId || null,
      curriculum: courseData.curriculum || null,
      objectives: courseData.objectives || null,
      requirements: courseData.requirements || null,
      materials: courseData.materials || null,
      assessmentMethod: courseData.assessmentMethod || null,
      certificateType: courseData.certificateType || null,
      instructorName: courseData.instructorName || null,
      instructorProfile: courseData.instructorProfile || null,
      instructorExpertise: courseData.instructorExpertise || null,
      targetAudience: courseData.targetAudience || null,
      difficulty: courseData.difficulty || null,
      language: courseData.language || "ko",
      tags: courseData.tags || null,
      features: courseData.features || null,
      recommendations: courseData.recommendations || null,
      totalHours: courseData.totalHours || null,
      enrollmentDeadline: courseData.enrollmentDeadline || null,
      completionDeadline: courseData.completionDeadline || null,
      prerequisites: courseData.prerequisites || null,
      learningMethod: courseData.learningMethod || null,
      videoThumbnails: courseData.videoThumbnails || null,
      quizData: courseData.quizData || null,
      interactiveElements: courseData.interactiveElements || null,
      curriculumItems: courseData.curriculumItems || null,
      learningMaterials: courseData.learningMaterials || null,
      analysisMaterials: courseData.analysisMaterials || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(
    id: number,
    courseData: Partial<InsertCourse>,
  ): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;

    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData,
      // 숫자 필드들을 올바르게 처리
      credit:
        courseData.credit !== undefined
          ? courseData.credit
          : existingCourse.credit,
      price:
        courseData.price !== undefined
          ? courseData.price
          : existingCourse.price,
      discountPrice:
        courseData.discountPrice !== undefined
          ? courseData.discountPrice
          : existingCourse.discountPrice,
      maxStudents:
        courseData.maxStudents !== undefined
          ? courseData.maxStudents
          : existingCourse.maxStudents,
      updatedAt: new Date(),
    };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
  }

  async getCoursesByProvider(providerId: number): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter((course) => course.providerId === providerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
  }

  async getPendingCourses(): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(
        (course) => course.approvalStatus === "pending" && course.isActive,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
  }

  async updateCourseApproval(
    courseId: number,
    action: string,
    reason?: string,
  ): Promise<Course | undefined> {
    const existingCourse = this.courses.get(courseId);
    if (!existingCourse) return undefined;

    const updatedCourse: Course = {
      ...existingCourse,
      approvalStatus: action === "approve" ? "approved" : "rejected",
      status: action === "approve" ? "active" : "inactive",
      updatedAt: new Date(),
    };
    this.courses.set(courseId, updatedCourse);
    return updatedCourse;
  }

  // Instructor methods
  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values()).filter(
      (instructor) => instructor.isActive,
    );
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async createInstructor(
    instructorData: InsertInstructor,
  ): Promise<Instructor> {
    const id = this.nextId++;
    const instructor: Instructor = {
      id,
      name: instructorData.name,
      position: instructorData.position || null,
      expertise: instructorData.expertise || null,
      profile: instructorData.profile || null,
      imageUrl: instructorData.imageUrl || null,
      providerId: instructorData.providerId || null,
      subscribers: instructorData.subscribers || 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.instructors.set(id, instructor);
    return instructor;
  }

  async updateInstructor(
    id: number,
    instructorData: Partial<InsertInstructor>,
  ): Promise<Instructor | undefined> {
    const existingInstructor = this.instructors.get(id);
    if (!existingInstructor) return undefined;

    const updatedInstructor: Instructor = {
      ...existingInstructor,
      ...instructorData,
    };
    this.instructors.set(id, updatedInstructor);
    return updatedInstructor;
  }

  async deleteInstructor(id: number): Promise<void> {
    this.instructors.delete(id);
  }

  // Enrollment methods
  async getEnrollments(
    userId?: number,
    courseId?: number,
  ): Promise<Enrollment[]> {
    let enrollments = Array.from(this.enrollments.values());

    if (userId) {
      enrollments = enrollments.filter(
        (enrollment) => enrollment.userId === userId,
      );
    }
    if (courseId) {
      enrollments = enrollments.filter(
        (enrollment) => enrollment.courseId === courseId,
      );
    }

    return enrollments;
  }

  async createEnrollment(
    enrollmentData: InsertEnrollment,
  ): Promise<Enrollment> {
    const id = this.nextId++;
    const enrollment: Enrollment = {
      id,
      ...enrollmentData,
      progress: 0,
      status: "enrolled",
      grade: null,
      enrolledAt: new Date(),
      completedAt: null,
      subtype: null,
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(
    id: number,
    enrollmentData: Partial<InsertEnrollment>,
  ): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollments.get(id);
    if (!existingEnrollment) return undefined;

    const updatedEnrollment: Enrollment = {
      ...existingEnrollment,
      ...enrollmentData,
    };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async deleteEnrollment(id: number): Promise<void> {
    this.enrollments.delete(id);
  }

  async getEnrollment(enrollmentId: number): Promise<any> {
    const enrollment = Array.from(this.enrollments.values()).find(
      (e) => e.id === enrollmentId,
    );
    if (!enrollment) return null;

    // 관련된 certificate 정보 조회 (새로운 스키마에 맞게 수정)
    const certificate = Array.from(this.certificates.values()).find(
      (c) =>
        c.userId === enrollment.userId && c.courseId === enrollment.courseId,
    );

    return {
      ...enrollment,
      certificateNumber: certificate ? certificate.certificateNumber : null,
    };
  }

  // Seminar methods
  async getSeminars(): Promise<Seminar[]> {
    return Array.from(this.seminars.values())
      .filter((seminar) => seminar.isActive)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    return this.seminars.get(id);
  }

  async createSeminar(seminarData: InsertSeminar): Promise<Seminar> {
    const id = this.nextId++;
    const seminar: Seminar = {
      id,
      title: seminarData.title,
      description: seminarData.description || null,
      date: seminarData.date,
      type: seminarData.type,
      location: seminarData.location || null,
      maxParticipants: seminarData.maxParticipants || null,
      imageUrl: seminarData.imageUrl || null,
      price: seminarData.price || 0,
      benefits: seminarData.benefits || null,
      requirements: seminarData.requirements || null,
      tags: seminarData.tags || null,
      duration: seminarData.duration || null,
      organizer: seminarData.organizer || null,
      contactPhone: seminarData.contactPhone || null,
      contactEmail: seminarData.contactEmail || null,
      programSchedule: seminarData.programSchedule || null,
      program: seminarData.program || null,
      providerId: seminarData.providerId || null,
      currentParticipants: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.seminars.set(id, seminar);
    return seminar;
  }

  async updateSeminar(
    id: number,
    seminarData: Partial<InsertSeminar>,
  ): Promise<Seminar | undefined> {
    const existingSeminar = this.seminars.get(id);
    if (!existingSeminar) return undefined;

    const updatedSeminar: Seminar = {
      ...existingSeminar,
      ...seminarData,
    };
    this.seminars.set(id, updatedSeminar);
    return updatedSeminar;
  }

  async deleteSeminar(id: number): Promise<void> {
    this.seminars.delete(id);
  }

  async getSeminarsByProvider(providerId: number): Promise<Seminar[]> {
    return Array.from(this.seminars.values())
      .filter(
        (seminar) => seminar.providerId === providerId && seminar.isActive,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async registerForSeminar(userId: number, seminarId: number): Promise<void> {
    // Implementation for seminar registration
    // This would typically involve creating a seminar registration record
  }

  async getSeminarRegistrations(
    seminarId?: number,
    userId?: number,
  ): Promise<SeminarRegistration[]> {
    // Implementation for getting seminar registrations
    // This would typically involve querying the database for seminar registrations
    return [];
  }

  async isSeminarRegistered(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    // Implementation for checking if a user is registered for a seminar
    // This would typically involve querying the database for registration status
    return false;
  }

  async updateSeminarParticipantCount(seminarId: number): Promise<void> {
    // Implementation for updating seminar participant count
    // This would typically involve querying the database for seminar and updating its participant count
  }

  async addSeminarToWishlist(userId: number, seminarId: number): Promise<void> {
    // Implementation for adding a seminar to a user's wishlist
    // This would typically involve querying the database for wishlist and adding the seminar
  }

  async removeSeminarFromWishlist(
    userId: number,
    seminarId: number,
  ): Promise<void> {
    // Implementation for removing a seminar from a user's wishlist
    // This would typically involve querying the database for wishlist and removing the seminar
  }

  async isSeminarInWishlist(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
    return false;
  }

  // Notice methods
  async getNotices(
    category?: string,
    page?: number,
    limit?: number,
  ): Promise<{ notices: Notice[]; total: number }> {
    let filteredNotices = Array.from(this.notices.values()).filter(
      (notice) => notice.isActive,
    );

    if (category) {
      filteredNotices = filteredNotices.filter(
        (notice) => notice.category === category,
      );
    }

    const total = filteredNotices.length;
    const actualPage = page || 1;
    const actualLimit = limit || 10;
    const offset = (actualPage - 1) * actualLimit;

    const notices = filteredNotices
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      )
      .slice(offset, offset + actualLimit);

    return { notices, total };
  }

  async getNotice(id: number): Promise<Notice | undefined> {
    return this.notices.get(id);
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const id = this.nextId++;
    const notice: Notice = {
      id,
      title: noticeData.title,
      content: noticeData.content || null,
      category: noticeData.category || "일반공지",
      authorId: noticeData.authorId || null,
      isImportant: noticeData.isImportant || false,
      isActive: true,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notices.set(id, notice);
    return notice;
  }

  async updateNotice(
    id: number,
    noticeData: Partial<InsertNotice>,
  ): Promise<Notice | undefined> {
    const existingNotice = this.notices.get(id);
    if (!existingNotice) return undefined;

    const updatedNotice: Notice = {
      ...existingNotice,
      ...noticeData,
      updatedAt: new Date(),
    };
    this.notices.set(id, updatedNotice);
    return updatedNotice;
  }

  async deleteNotice(id: number): Promise<void> {
    this.notices.delete(id);
  }

  async incrementNoticeViews(id: number): Promise<void> {
    const notice = this.notices.get(id);
    if (notice) {
      const updatedNotice: Notice = {
        ...notice,
        views: (notice.views || 0) + 1,
        updatedAt: new Date(),
      };
      this.notices.set(id, updatedNotice);
    }
  }

  // Review methods
  async getReviews(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.courseId === courseId && review.isActive)
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      );
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.nextId++;
    const review: Review = {
      id,
      userId: reviewData.userId,
      courseId: reviewData.courseId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Chat methods
  async getUserChatChannels(userId: number): Promise<ChatChannel[]> {
    return [];
  }

  async createChatChannel(userId: number): Promise<ChatChannel> {
    throw new Error("Not implemented in MemStorage");
  }

  async updateChatChannel(
    id: number,
    channelData: Partial<InsertChatChannel>,
  ): Promise<ChatChannel | undefined> {
    return undefined;
  }

  async getChatMessagesByChannel(channelId: number): Promise<ChatMessage[]> {
    return [];
  }

  async getChatMessages(limit?: number): Promise<ChatMessage[]> {
    const actualLimit = limit || 50;
    return Array.from(this.chatMessages.values())
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
      )
      .slice(0, actualLimit);
  }

  async createChatMessage(
    messageData: InsertChatMessage,
  ): Promise<ChatMessage> {
    const id = this.nextId++;
    const message: ChatMessage = {
      id,
      channelId: messageData.channelId,
      userId: messageData.userId || null,
      message: messageData.message,
      isAdmin: messageData.isAdmin || false,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Private Message management (쪽지 시스템)
  async getPrivateMessages(
    userId: number,
    type: "received" | "sent",
  ): Promise<PrivateMessage[]> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
    return [];
  }

  async getPrivateMessage(
    messageId: number,
    userId: number,
  ): Promise<PrivateMessage | undefined> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
    return undefined;
  }

  async createPrivateMessage(
    message: InsertPrivateMessage,
  ): Promise<PrivateMessage> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
    throw new Error("메모리 기반 쪽지 생성은 지원되지 않습니다.");
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
  }

  async deleteMessage(
    messageId: number,
    userId: number,
    type: "sender" | "receiver",
  ): Promise<void> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    // 메모리 기반 구현은 생략 (DB 기반으로 사용)
    return 0;
  }

  // Payment methods
  async getPayments(userId?: number): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());

    if (userId) {
      payments = payments.filter((payment) => payment.userId === userId);
    }

    return payments.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    );
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.nextId++;
    const payment: Payment = {
      id,
      userId: paymentData.userId,
      courseId: paymentData.courseId || null,
      amount: paymentData.amount,
      status: paymentData.status || "pending",
      paymentMethod: paymentData.paymentMethod || null,
      transactionId: paymentData.transactionId || null,
      refundReason: paymentData.refundReason || null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(
    id: number,
    paymentData: Partial<InsertPayment>,
  ): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;

    const updatedPayment: Payment = {
      ...existingPayment,
      ...paymentData,
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getDashboardStats(): Promise<any> {
    const totalUsers = this.users.size;
    const totalCourses = Array.from(this.courses.values()).filter(
      (c) => c.isActive,
    ).length;
    const totalEnrollments = this.enrollments.size;
    const pendingBusinesses = Array.from(this.users.values()).filter(
      (u) => u.userType === "business" && !u.isApproved,
    ).length;

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      pendingBusinesses,
    };
  }

  // Overseas Programs management (메모리 기반 구현은 생략)
  async getOverseasPrograms(): Promise<OverseasProgram[]> {
    return [];
  }

  async getAllOverseasPrograms(): Promise<OverseasProgram[]> {
    return [];
  }

  async getOverseasProgram(id: number): Promise<OverseasProgram | undefined> {
    return undefined;
  }

  async createOverseasProgram(
    programData: InsertOverseasProgram,
  ): Promise<OverseasProgram> {
    throw new Error("메모리 기반 해외교육 생성은 지원되지 않습니다.");
  }

  async updateOverseasProgram(
    id: number,
    programData: Partial<InsertOverseasProgram>,
  ): Promise<OverseasProgram | undefined> {
    return undefined;
  }

  async deleteOverseasProgram(id: number): Promise<void> {
    // 메모리 기반 구현은 생략
  }

  async getOverseasProgramsByProvider(
    providerId: number,
  ): Promise<OverseasProgram[]> {
    return [];
  }

  async registerForOverseasProgram(
    userId: number,
    overseasId: number,
  ): Promise<void> {
    // 메모리 기반 구현은 생략
  }

  async getOverseasRegistrations(
    overseasId?: number,
    userId?: number,
  ): Promise<OverseasRegistration[]> {
    return [];
  }

  async isOverseasRegistered(
    userId: number,
    overseasId: number,
  ): Promise<boolean> {
    return false;
  }

  async updateOverseasParticipantCount(overseasId: number): Promise<void> {
    // 메모리 기반 구현은 생략
  }

  // Raw query execution
  async query(sql: string, params?: any[]): Promise<{ rows: any[] }> {
    return { rows: [] };
  }

  // Certificate management
  async createCertificate(
    certificateData: InsertCertificate,
  ): Promise<Certificate> {
    const id = this.nextId++;
    const certificate: Certificate = {
      id,
      userId: certificateData.userId,
      courseId: certificateData.courseId,
      enrollmentId: certificateData.enrollmentId,
      issuedBy: certificateData.issuedBy,
      certificateNumber: certificateData.certificateNumber,
      issuedAt: certificateData.issuedAt || new Date(),
      expiresAt: certificateData.expiresAt || null,
      status: certificateData.status || "active",
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async getCertificate(enrollmentId: number): Promise<Certificate | null> {
    // enrollmentId로 enrollment를 먼저 찾고, 해당 userId와 courseId로 certificate 조회
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return null;

    const certificate = Array.from(this.certificates.values()).find(
      (cert) =>
        cert.userId === enrollment.userId &&
        cert.courseId === enrollment.courseId,
    );
    return certificate || null;
  }

  // Cart management
  async getCartItems(userId: number): Promise<any[]> {
    // Implementation for getting cart items
    return [];
  }

  async addToCart(
    userId: number,
    courseId: number,
    type?: string,
  ): Promise<void> {
    // Implementation for adding to cart
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    // Implementation for removing from cart
  }

  async clearCart(userId: number): Promise<void> {
    // Implementation for clearing cart
  }

  async isInCart(userId: number, courseId: number): Promise<boolean> {
    // Implementation for checking if a course is in the cart
    return false;
  }

  // Application management stubs for MemStorage
  async createAuthorApplication(app: InsertAuthorApplication): Promise<AuthorApplication> {
    throw new Error("Not implemented in MemStorage");
  }
  async getAuthorApplications(): Promise<AuthorApplication[]> {
    return [];
  }
  async updateAuthorApplication(id: number, data: Partial<InsertAuthorApplication>): Promise<AuthorApplication | undefined> {
    return undefined;
  }

  async createBusinessPartnership(partnership: InsertBusinessPartnership): Promise<BusinessPartnership> {
    throw new Error("Not implemented in MemStorage");
  }
  async getBusinessPartnerships(): Promise<BusinessPartnership[]> {
    return [];
  }
  async updateBusinessPartnership(id: number, data: Partial<InsertBusinessPartnership>): Promise<BusinessPartnership | undefined> {
    return undefined;
  }

  async createCareerApplication(app: InsertCareerApplication): Promise<CareerApplication> {
    throw new Error("Not implemented in MemStorage");
  }
  async getCareerApplications(): Promise<CareerApplication[]> {
    return [];
  }
  async updateCareerApplication(id: number, data: Partial<InsertCareerApplication>): Promise<CareerApplication | undefined> {
    return undefined;
  }
  
  // Instructor management methods missing implementation stubs in MemStorage
  async getInstructorsByProvider(providerId: number): Promise<Instructor[]> {
    return [];
  }
  
  // Subscription management methods missing implementation stubs in MemStorage
  async getSubscription(userId: number, instructorId: number): Promise<Subscription | undefined> {
    return undefined;
  }
  async createSubscription(userId: number, instructorId: number): Promise<Subscription> {
    throw new Error("Not implemented in MemStorage");
  }
  async deleteSubscription(userId: number, instructorId: number): Promise<void> {
    // stub
  }
  
  // Chat management methods missing implementation stubs in MemStorage
  async deleteChatChannel(id: number): Promise<void> {
    // stub
  }
  
  // Source Material management methods missing implementation stubs in MemStorage
  async getSourceMaterials(userId: number): Promise<SourceMaterial[]> {
    return [];
  }
  async createSourceMaterial(material: InsertSourceMaterial): Promise<SourceMaterial> {
    throw new Error("Not implemented in MemStorage");
  }
}

// Use database storage instead of memory storage
export const storage = new DbStorage();
