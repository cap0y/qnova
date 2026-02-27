-- ============================================
-- Neon PostgreSQL Database Backup
-- Database: neondb
-- Date: 2026-02-12T23:56:34.515Z
-- ============================================

-- ============================================
-- SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS "chat_messages_id_seq" START 1;
CREATE SEQUENCE IF NOT EXISTS "courses_id_seq" START 19;
CREATE SEQUENCE IF NOT EXISTS "enrollments_id_seq" START 75;
CREATE SEQUENCE IF NOT EXISTS "instructors_id_seq" START 2;
CREATE SEQUENCE IF NOT EXISTS "notices_id_seq" START 2;
CREATE SEQUENCE IF NOT EXISTS "payments_id_seq" START 65;
CREATE SEQUENCE IF NOT EXISTS "reviews_id_seq" START 6;
CREATE SEQUENCE IF NOT EXISTS "seminar_registrations_id_seq" START 9;
CREATE SEQUENCE IF NOT EXISTS "seminars_id_seq" START 7;
CREATE SEQUENCE IF NOT EXISTS "users_id_seq" START 69;
CREATE SEQUENCE IF NOT EXISTS "seminar_wishlist_id_seq" START 9;
CREATE SEQUENCE IF NOT EXISTS "overseas_programs_id_seq" START 6;
CREATE SEQUENCE IF NOT EXISTS "cart_id_seq" START 11;
CREATE SEQUENCE IF NOT EXISTS "overseas_registrations_id_seq" START 3;
CREATE SEQUENCE IF NOT EXISTS "certificates_id_seq" START 4;
CREATE SEQUENCE IF NOT EXISTS "enrollment_progress_id_seq" START 34;
CREATE SEQUENCE IF NOT EXISTS "private_messages_id_seq" START 5;
CREATE SEQUENCE IF NOT EXISTS "inquiries_id_seq" START 4;

-- ============================================
-- TABLE STRUCTURES
-- ============================================

-- Table: cart
CREATE TABLE IF NOT EXISTS "cart" (
  "id" integer DEFAULT nextval('cart_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "type" text DEFAULT 'course'::text NOT NULL,
  "added_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: certificates
CREATE TABLE IF NOT EXISTS "certificates" (
  "id" integer DEFAULT nextval('certificates_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "enrollment_id" integer NOT NULL,
  "issued_by" integer NOT NULL,
  "certificate_number" text NOT NULL,
  "issued_at" timestamp without time zone DEFAULT now(),
  "expires_at" timestamp without time zone,
  "status" text DEFAULT 'active'::text,
  PRIMARY KEY ("id")
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" integer DEFAULT nextval('chat_messages_id_seq'::regclass) NOT NULL,
  "user_id" integer,
  "message" text NOT NULL,
  "is_admin" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: courses
CREATE TABLE IF NOT EXISTS "courses" (
  "id" integer DEFAULT nextval('courses_id_seq'::regclass) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "category" text NOT NULL,
  "type" text NOT NULL,
  "level" text NOT NULL,
  "credit" integer NOT NULL,
  "price" integer NOT NULL,
  "discount_price" integer,
  "duration" text NOT NULL,
  "max_students" integer,
  "enrolled_count" integer DEFAULT 0,
  "start_date" timestamp without time zone,
  "end_date" timestamp without time zone,
  "instructor_id" integer,
  "image_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "provider_id" integer,
  "approval_status" text DEFAULT 'pending'::text,
  "curriculum" text,
  "objectives" text,
  "requirements" text,
  "status" text DEFAULT 'pending'::text,
  "materials" text,
  "assessment_method" text,
  "certificate_type" text,
  "instructor_name" text,
  "instructor_profile" text,
  "instructor_expertise" text,
  "target_audience" text,
  "difficulty" text,
  "language" text DEFAULT 'ko'::text,
  "location" text,
  "tags" json,
  "features" text,
  "recommendations" text,
  "total_hours" integer,
  "enrollment_deadline" timestamp without time zone,
  "completion_deadline" timestamp without time zone,
  "prerequisites" text,
  "learning_method" text,
  "video_thumbnails" json,
  "quiz_data" json,
  "interactive_elements" json,
  "curriculum_items" json,
  "learning_materials" json,
  "subcategory" text,
  PRIMARY KEY ("id")
);

-- Table: enrollment_progress
CREATE TABLE IF NOT EXISTS "enrollment_progress" (
  "id" integer DEFAULT nextval('enrollment_progress_id_seq'::regclass) NOT NULL,
  "enrollment_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "item_id" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL,
  "progress" integer DEFAULT 0,
  "completed_at" timestamp without time zone,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: enrollments
CREATE TABLE IF NOT EXISTS "enrollments" (
  "id" integer DEFAULT nextval('enrollments_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "status" text DEFAULT 'enrolled'::text NOT NULL,
  "progress" integer DEFAULT 0,
  "grade" numeric(3,1),
  "enrolled_at" timestamp without time zone DEFAULT now(),
  "completed_at" timestamp without time zone,
  "type" text NOT NULL,
  "subtype" text,
  PRIMARY KEY ("id")
);

-- Table: inquiries
CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" integer DEFAULT nextval('inquiries_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "type" text DEFAULT 'general'::text NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "is_private" boolean DEFAULT false,
  "attachment_url" text,
  "answer" text,
  "answered_by" integer,
  "answered_at" timestamp without time zone,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: instructors
CREATE TABLE IF NOT EXISTS "instructors" (
  "id" integer DEFAULT nextval('instructors_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL,
  "position" text,
  "expertise" text,
  "profile" text,
  "image_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: notices
CREATE TABLE IF NOT EXISTS "notices" (
  "id" integer DEFAULT nextval('notices_id_seq'::regclass) NOT NULL,
  "title" text NOT NULL,
  "content" text,
  "category" text DEFAULT 'notice'::text NOT NULL,
  "author_id" integer,
  "is_important" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "views" integer DEFAULT 0,
  PRIMARY KEY ("id")
);

-- Table: overseas_programs
CREATE TABLE IF NOT EXISTS "overseas_programs" (
  "id" integer DEFAULT nextval('overseas_programs_id_seq'::regclass) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "destination" text NOT NULL,
  "start_date" timestamp without time zone NOT NULL,
  "end_date" timestamp without time zone NOT NULL,
  "type" text NOT NULL,
  "max_participants" integer,
  "current_participants" integer DEFAULT 0,
  "price" integer NOT NULL,
  "duration" text,
  "image_url" text,
  "program" text,
  "benefits" text,
  "requirements" text,
  "tags" text,
  "airline" text,
  "accommodation" text,
  "meals" text,
  "guide" text,
  "visa_info" text,
  "insurance" text,
  "currency" text,
  "climate" text,
  "time_zone" text,
  "language" text,
  "emergency_contact" text,
  "cancellation_policy" text,
  "provider_id" integer,
  "status" text DEFAULT 'pending'::text,
  "approval_status" text DEFAULT 'pending'::text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "program_schedule" json,
  PRIMARY KEY ("id")
);

-- Table: overseas_registrations
CREATE TABLE IF NOT EXISTS "overseas_registrations" (
  "id" integer DEFAULT nextval('overseas_registrations_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "overseas_id" integer NOT NULL,
  "status" text DEFAULT 'registered'::text NOT NULL,
  "registered_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: payments
CREATE TABLE IF NOT EXISTS "payments" (
  "id" integer DEFAULT nextval('payments_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer,
  "amount" numeric(10,2) NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "payment_method" text,
  "transaction_id" text,
  "created_at" timestamp without time zone DEFAULT now(),
  "refund_reason" text,
  PRIMARY KEY ("id")
);

-- Table: private_messages
CREATE TABLE IF NOT EXISTS "private_messages" (
  "id" integer DEFAULT nextval('private_messages_id_seq'::regclass) NOT NULL,
  "sender_id" integer NOT NULL,
  "receiver_id" integer NOT NULL,
  "subject" text NOT NULL,
  "content" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "is_deleted_by_sender" boolean DEFAULT false,
  "is_deleted_by_receiver" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT now(),
  "read_at" timestamp without time zone,
  PRIMARY KEY ("id")
);

-- Table: reviews
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" integer DEFAULT nextval('reviews_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "course_id" integer NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: seminar_registrations
CREATE TABLE IF NOT EXISTS "seminar_registrations" (
  "id" integer DEFAULT nextval('seminar_registrations_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "seminar_id" integer NOT NULL,
  "status" text DEFAULT 'registered'::text NOT NULL,
  "registered_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: seminar_wishlist
CREATE TABLE IF NOT EXISTS "seminar_wishlist" (
  "id" integer DEFAULT nextval('seminar_wishlist_id_seq'::regclass) NOT NULL,
  "user_id" integer NOT NULL,
  "seminar_id" integer NOT NULL,
  "created_at" timestamp without time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

-- Table: seminars
CREATE TABLE IF NOT EXISTS "seminars" (
  "id" integer DEFAULT nextval('seminars_id_seq'::regclass) NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "type" text NOT NULL,
  "date" timestamp without time zone NOT NULL,
  "location" text,
  "max_participants" integer,
  "current_participants" integer DEFAULT 0,
  "image_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "program_schedule" json,
  "provider_id" integer,
  "price" integer DEFAULT 0,
  "benefits" text,
  "requirements" text,
  "tags" text,
  "duration" text,
  "organizer" text,
  "contact_phone" text,
  "contact_email" text,
  PRIMARY KEY ("id")
);

-- Table: users
CREATE TABLE IF NOT EXISTS "users" (
  "id" integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  "username" text NOT NULL,
  "email" text NOT NULL,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "phone" text,
  "user_type" text DEFAULT 'individual'::text NOT NULL,
  "business_number" text,
  "is_admin" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  "updated_at" timestamp without time zone DEFAULT now(),
  "role" text DEFAULT 'user'::text,
  "organization_name" text,
  "representative_name" text,
  "address" text,
  "is_approved" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

-- ============================================
-- INDEXES
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS certificates_certificate_number_unique ON public.certificates USING btree (certificate_number);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment_id ON public.enrollment_progress USING btree (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_type ON public.enrollment_progress USING btree (type);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_user_id ON public.enrollment_progress USING btree (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON public.users USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON public.users USING btree (username);

-- ============================================
-- DROP EXISTING FOREIGN KEYS (복원 전 기존 FK 제거)
-- ============================================

ALTER TABLE "chat_messages" DROP CONSTRAINT IF EXISTS "chat_messages_user_id_users_id_fk";
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_instructor_id_instructors_id_fk";
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_provider_id_users_id_fk";
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_user_id_users_id_fk";
ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_course_id_courses_id_fk";
ALTER TABLE "notices" DROP CONSTRAINT IF EXISTS "notices_author_id_users_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_user_id_users_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_course_id_courses_id_fk";
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_user_id_users_id_fk";
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_course_id_courses_id_fk";
ALTER TABLE "seminar_registrations" DROP CONSTRAINT IF EXISTS "seminar_registrations_user_id_users_id_fk";
ALTER TABLE "seminar_registrations" DROP CONSTRAINT IF EXISTS "seminar_registrations_seminar_id_seminars_id_fk";
ALTER TABLE "seminar_wishlist" DROP CONSTRAINT IF EXISTS "seminar_wishlist_user_id_users_id_fk";
ALTER TABLE "seminar_wishlist" DROP CONSTRAINT IF EXISTS "seminar_wishlist_seminar_id_seminars_id_fk";
ALTER TABLE "seminars" DROP CONSTRAINT IF EXISTS "seminars_provider_id_users_id_fk";
ALTER TABLE "overseas_programs" DROP CONSTRAINT IF EXISTS "overseas_programs_provider_id_users_id_fk";
ALTER TABLE "overseas_registrations" DROP CONSTRAINT IF EXISTS "overseas_registrations_user_id_users_id_fk";
ALTER TABLE "overseas_registrations" DROP CONSTRAINT IF EXISTS "overseas_registrations_overseas_id_overseas_programs_id_fk";
ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_user_id_users_id_fk";
ALTER TABLE "cart" DROP CONSTRAINT IF EXISTS "cart_course_id_courses_id_fk";
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_user_id_users_id_fk";
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_course_id_courses_id_fk";
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_enrollment_id_enrollments_id_fk";
ALTER TABLE "certificates" DROP CONSTRAINT IF EXISTS "certificates_issued_by_users_id_fk";
ALTER TABLE "private_messages" DROP CONSTRAINT IF EXISTS "private_messages_sender_id_users_id_fk";
ALTER TABLE "private_messages" DROP CONSTRAINT IF EXISTS "private_messages_receiver_id_users_id_fk";
ALTER TABLE "enrollment_progress" DROP CONSTRAINT IF EXISTS "enrollment_progress_enrollment_id_enrollments_id_fk";
ALTER TABLE "enrollment_progress" DROP CONSTRAINT IF EXISTS "enrollment_progress_user_id_users_id_fk";
ALTER TABLE "inquiries" DROP CONSTRAINT IF EXISTS "inquiries_user_id_users_id_fk";
ALTER TABLE "inquiries" DROP CONSTRAINT IF EXISTS "inquiries_answered_by_users_id_fk";

-- ============================================
-- TRUNCATE ALL TABLES (기존 데이터 제거)
-- ============================================

TRUNCATE TABLE "enrollment_progress" CASCADE;
TRUNCATE TABLE "certificates" CASCADE;
TRUNCATE TABLE "cart" CASCADE;
TRUNCATE TABLE "chat_messages" CASCADE;
TRUNCATE TABLE "reviews" CASCADE;
TRUNCATE TABLE "payments" CASCADE;
TRUNCATE TABLE "private_messages" CASCADE;
TRUNCATE TABLE "inquiries" CASCADE;
TRUNCATE TABLE "seminar_registrations" CASCADE;
TRUNCATE TABLE "seminar_wishlist" CASCADE;
TRUNCATE TABLE "overseas_registrations" CASCADE;
TRUNCATE TABLE "enrollments" CASCADE;
TRUNCATE TABLE "notices" CASCADE;
TRUNCATE TABLE "courses" CASCADE;
TRUNCATE TABLE "seminars" CASCADE;
TRUNCATE TABLE "overseas_programs" CASCADE;
TRUNCATE TABLE "instructors" CASCADE;
TRUNCATE TABLE "users" CASCADE;

-- ============================================
-- DATA (부모 테이블 먼저, 자식 테이블 나중에 삽입)
-- ============================================
-- Table "users": 10 rows
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (65, 'brainai', 'dongseom63@gmail.com', 'e4883546a0218409f9e11d3891f4ae6247bfc5af34e3249779f54e3657b2d88662f6c23c79a860da50b07f44a4ad1274ca87ca8a495ffcd97c6516404ffbe8df.c9ae9ec66bec4f122b33ae44dfe6002d', '강미숙', '01085456342', 'business', '', FALSE, TRUE, '2025-07-03T22:25:31.631Z', '2025-07-03T22:25:31.631Z', 'business', '', '', '', TRUE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (66, '김김', 'anwjr7878@gmail.com', 'e4006c9babe1152fedad7be37061ae87368d1d8e7bbff1459c3030b4173c86a6550d043d61bb9393b3959b6fc799e3389dc808e4c6e7686cb57e92040242dd1a.82a4d4987eb81929f09e2039edcda6c9', '김', '010-1111-1111', 'individual', '', FALSE, TRUE, '2025-07-06T09:50:23.898Z', '2025-07-06T09:50:23.898Z', 'user', '', '', '서울', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (67, '김병선', 'kuchem97@gmail.com', '82b3685dd59c3c7a277276f4ac1485e4c6aa9eb3bcad53b297797e20810c306ea577a96e764da5dba75b0905bca8914712705c0bd435163be98f0aa7da91bad7.58440c24da30ac5fb81ba52eb0fbd303', '김병선', '01087991053', 'individual', '', FALSE, TRUE, '2025-07-07T18:44:04.981Z', '2025-07-07T18:44:04.981Z', 'user', '', '', '경남 진주시 진주대로 501', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (5, '개인1', 'decom@gmail.com', '8074e809831781cedd34416446143e8409fbf53ce6fdc4ba60d45576b464c2d2b79e3cf55d02eb1e71ad45310c2b64c60dfb9359b4b48d048d9aaff1f5c762d9.5223e6301ee2bd788c5bbd082c52077a', '개인2', '124124124', 'individual', '', FALSE, TRUE, '2025-06-21T03:39:19.584Z', '2025-06-21T03:39:19.584Z', 'user', '', '', '경남 진주시 동부로 169번길 12 윙스타워 a동 604', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (68, '엘리', 'rmmpm@naver.com', '2f22c0eae6bdce8fb5cd2c8c74fd63df83bde2e81e66a64e1e40cbb09d0754274b0b34400e4d6812e87ca523712709c7d2ef17bc06b81b94a4a2cb2593e5950e.45ad66cf4158611084185654a8b088e6', '박아름', '01036501126', 'individual', '', FALSE, TRUE, '2025-07-07T21:47:07.593Z', '2025-07-07T21:47:07.593Z', 'user', '', '', '경남 사천시 조동길 49-43 엘크루101-101', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (69, '박솔희', 'sol7224@naver.com', '42b20f4bb881645b5146ed8e554dbb4487f1a8abc7e962dfb76c3e36981acde02efc234ddd82452a55da72b38c461af7a9b64b6fb5e0fc73776ef6b13ba3e82c.39757b3a763f3a7f7bfb4c15d2e33fcf', '박솔희', '01012345678', 'individual', '', FALSE, TRUE, '2025-07-08T19:58:58.395Z', '2025-07-08T19:58:58.395Z', 'user', '', '', '경남', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (7, '최정', 'jchoi57@hanmail.net', '771dc761a0bf49113e94918e20b32d73bc7696f87bb87b7ee8bc3d6ded907107e5a5212e826857983d70ca23295ed37cfaea949ad1ed1a7cff54363989229032.4b981ed6d4575041ad5eddd3f9c28339', '최정', '01098701956', 'individual', '', FALSE, TRUE, '2025-06-22T22:57:46.816Z', '2025-06-22T22:57:46.816Z', 'user', '', '', '경남 진주시 동진로 55', FALSE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (3, 'decom', 'decom2soft@gmail.com', '8e17445b162fd9a2ad318d432a6d2659f3c075b24db0ec50f8ef86ec7fd70f9bde78d7d8a9d83dbda515aad66b74485b7f315ca4c5219f620a067850a5d00178.79bef8b21a5b0e15d900e81330f4d911', '김영철', '01045299703', 'business', '2573700989', FALSE, TRUE, '2025-06-20T20:45:33.121Z', '2025-06-20T20:45:33.121Z', 'business', '디컴소프트', '김영철', '', TRUE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (6, 'business1', 'business1@example.com', '9e491d3704e869f831673524a4e6d85ca6c96b10a69cb796897049284a0f4f0628ca438a9f0de59e1b627f6767584d91e3d5bab512a8d728819e65a45b2287db.064093424f4b5c65fab2409b9d4bcd49', '한국교육연구원', '02-1234-5678', 'business', '123-45-67890', FALSE, TRUE, '2025-06-21T19:07:07.904Z', '2025-06-21T19:07:07.904Z', 'business', '한국교육연구원', '김대표', '서울시 강남구 테헤란로 123', TRUE);
INSERT INTO "users" ("id", "username", "email", "password", "name", "phone", "user_type", "business_number", "is_admin", "is_active", "created_at", "updated_at", "role", "organization_name", "representative_name", "address", "is_approved") VALUES (1, 'admin', 'admin@example.com', '3a8ca71e6411cbba595817ec251000989ede3ba53041ff637f4a093bdffafbc3cc5262018a1dd5bb5eb1a453f494b61cc233b8a8b106855598dfa58fc5b0d2a2.9100f69ee402cbe883bc775bba21c42e', '관리자', NULL, 'individual', NULL, TRUE, TRUE, '2025-06-20T04:12:44.436Z', '2025-06-20T04:12:44.436Z', 'admin', NULL, NULL, NULL, TRUE);

-- Table "instructors": 2 rows
INSERT INTO "instructors" ("id", "name", "position", "expertise", "profile", "image_url", "is_active", "created_at") VALUES (1, '김교수', '교육학과 교수', '교육과정 전문가', '20년 이상의 교육과정 연구 경험', NULL, TRUE, '2025-06-20T04:12:56.998Z');
INSERT INTO "instructors" ("id", "name", "position", "expertise", "profile", "image_url", "is_active", "created_at") VALUES (2, '이박사', '디지털교육 연구원', '교육공학 전문가', '디지털 교육 도구 개발 및 연구', NULL, TRUE, '2025-06-20T04:12:56.998Z');

-- Table "courses": 9 rows
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (1, '2025 교육과정 개정안 이해와 적용', '새로운 교육과정의 주요 변화사항과 현장 적용 방안을 학습합니다.', '교육과정', 'online', 'beginner', 15, 50000, 40000, '30시간', 100, 0, NULL, NULL, 1, NULL, TRUE, '2025-06-20T04:20:55.284Z', '2025-06-20T04:20:55.284Z', NULL, 'approved', '1. 개정 배경
2. 주요 변화사항
3. 적용 방안', '교육과정 이해, 현장 적용 능력 향상', '교육 관련 업무 경험', 'active', '교육과정 개정안 자료집, 실습 워크북', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ko', NULL, NULL, NULL, NULL, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (2, '디지털 교육 도구 활용 워크숍', '최신 디지털 교육 도구를 활용한 효과적인 수업 방법을 익힙니다.', '전문성강화교육', 'blended', 'intermediate', 10, 30000, NULL, '20시간', 50, 0, NULL, NULL, 2, NULL, TRUE, '2025-06-20T04:20:55.284Z', '2025-06-20T04:20:55.284Z', NULL, 'approved', '1. 디지털 도구 소개
2. 실습
3. 적용 사례', '디지털 도구 활용, 수업 효과성 향상', '기본적인 컴퓨터 활용 능력', 'active', '디지털 도구 매뉴얼, 실습용 소프트웨어', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ko', NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '교육공학');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (8, '화학물질 안전보건교육 (MSDS 포함)', '화학물질 취급 시 필요한 안전보건 교육과 MSDS 작성 및 관리 방법을 학습합니다.', '법정의무교육', '온라인', '기초', 8, 80000, 64000, '8시간', 50, 23, NULL, NULL, NULL, NULL, TRUE, '2025-06-21T16:34:24.120Z', '2025-06-21T16:34:24.120Z', NULL, 'approved', '1차시: 화학물질의 이해
2차시: MSDS 작성법
3차시: 안전보건 조치
4차시: 응급처치', '화학물질 안전 취급, MSDS 작성 및 관리', '화학물질 취급 업무 담당자', 'active', 'MSDS 작성 가이드, 안전보건 매뉴얼', '온라인 평가', '법정교육 수료증', '김안전', '산업안전 전문가, 20년 경력', '화학물질 안전관리', '화학물질 취급 근로자', '기초', 'ko', NULL, NULL, NULL, NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '화학물질');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (9, '산업안전보건교육 - 관리감독자 과정', '관리감독자가 알아야 할 산업안전보건법과 현장 안전관리 실무를 학습합니다.', '법정의무교육', '블렌디드', '심화', 16, 120000, NULL, '16시간', 30, 18, NULL, NULL, NULL, NULL, TRUE, '2025-06-21T16:34:24.288Z', '2025-06-21T16:34:24.288Z', NULL, 'approved', '1차시: 산업안전보건법 개요
2차시: 위험성 평가
3차시: 안전관리 체계
4차시: 사고 예방 대책', '관리감독자 안전관리 역량 향상', '관리감독자 또는 안전관리 업무 담당자', 'active', '산업안전보건법 해설서, 사례집', '필기시험 + 실습평가', '법정교육 수료증', '박관리', '산업안전 컨설턴트', '산업안전보건법, 위험성평가', '관리감독자, 안전관리자', '심화', 'ko', NULL, NULL, NULL, NULL, 16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '산업안전');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (10, '소방안전교육 - 화재예방 및 대응', '화재 예방을 위한 기초 지식과 화재 발생 시 대응 방법을 학습합니다.', '법정의무교육', '온라인', '기초', 4, 40000, 32000, '4시간', 100, 67, NULL, NULL, NULL, NULL, TRUE, '2025-06-21T16:34:24.447Z', '2025-06-21T16:34:24.447Z', NULL, 'approved', '1차시: 화재의 이해
2차시: 소방시설 사용법
3차시: 대피 요령
4차시: 응급처치', '화재 예방 및 초기 대응 능력 향상', '전 직원 대상', 'active', '소방안전 매뉴얼, 대피도', '온라인 퀴즈', '법정교육 수료증', '이소방', '소방안전 전문가', '화재예방, 소방시설', '전 직원', '기초', 'ko', NULL, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '소방안전');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (11, '개인정보보호교육 - 개인정보보호법 준수', '개인정보보호법의 주요 내용과 개인정보 처리 시 준수사항을 학습합니다.', '법정의무교육', '온라인', '기초', 2, 30000, NULL, '2시간', 200, 145, NULL, NULL, NULL, NULL, TRUE, '2025-06-21T16:34:24.605Z', '2025-06-21T16:34:24.605Z', NULL, 'approved', '1차시: 개인정보보호법 개요
2차시: 개인정보 처리 원칙
3차시: 정보주체 권리
4차시: 위반 시 제재', '개인정보보호법 이해 및 준수', '개인정보 처리 업무 담당자', 'active', '개인정보보호법 해설서', '온라인 평가', '법정교육 수료증', '정보호', '개인정보보호 전문가', '개인정보보호법, 정보보안', '개인정보 처리 담당자', '기초', 'ko', NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '개인정보');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (18, '123123', '124', '전문성강화교육', 'online', 'intermediate', 1, 4444, 111, '2시간', 40, 0, '2025-06-22T15:00:00.000Z', '2025-06-26T15:00:00.000Z', NULL, '/uploads/images/12.jpg', FALSE, '2025-06-22T21:16:19.583Z', '2025-06-22T21:16:19.583Z', 3, 'approved', '', '124', '', 'active', '', '', '', '124', '124', '124', '', '', 'ko', '진주시 동진로 55 경상대학교', '[]', '', '11', 40, '2025-06-15T15:00:00.000Z', '2025-06-26T15:00:00.000Z', '', '', NULL, NULL, NULL, '[]', '[]', '심리학');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (7, '생성형 AI 활용한 대학생을 위한 사업게획서 작성법1', '생성형 AI 활용한 대학생을 위한 사업게획서 작성법', '전문성강화교육', 'online', 'intermediate', 3, 500000, 48090, '1', 48, 0, '2025-06-20T15:00:00.000Z', '2025-06-29T15:00:00.000Z', 2, '/uploads/images/course-1750550667415-usgshjk1v.png', TRUE, '2025-06-20T21:55:28.146Z', '2025-07-08T22:53:17.080Z', 3, 'approved', '1차시: 수업 영상과 퀴즈 (60)
1교시 수업 영상과 퀴즈 입니다. 

2차시: ', '생성형 AI 활용한 대학생을 위한 사업게획서 작성법', '11', 'active', '11', 'quiz', 'completion', '이박사', '디지털 교육 도구 개발 및 연구', '교육공학 전문가', '11', '', 'ko', '진주시 동진로 55 경상대학교', '["AI","리더쉽"]', '11', '학부모, 교사, 학생', 14, '2025-06-19T15:00:00.000Z', '2025-06-29T15:00:00.000Z', '11', 'instructor-led', NULL, NULL, NULL, '[{"id":"1750496053680-0","title":"수업 영상과 퀴즈","duration":"60","description":"1교시 수업 영상과 퀴즈 입니다. ","isCompleted":false,"videos":[{"id":"1751613463994","title":"생성형 AI 활용한 대학생을 위한 사업게획서 작성법","url":"https://youtu.be/-jlDM5GK4bA","duration":"15","type":"youtube"}],"quizzes":[{"id":"1750511230251","title":"오랜지 색은 무슨 색 일까요?","questions":[{"id":"1750511189526","question":"오랜지는 노란색이다.","type":"true-false","options":["","","",""],"correctAnswer":"O","explanation":"오랜지 색"}]}]},{"id":"1752044774154","title":"","duration":"","description":"","isCompleted":false,"videos":[],"quizzes":[]}]', '[{"id":"1750520529477-6e64l9vc2","name":"중소기업 확인서_디컴소프트.pdf","size":127113,"type":"application/pdf","filename":"1750520529463-cn6h9h6j6.pdf","url":"/api/business/download-learning-material/1750520529463-cn6h9h6j6.pdf"}]', '교육학');
INSERT INTO "courses" ("id", "title", "description", "category", "type", "level", "credit", "price", "discount_price", "duration", "max_students", "enrolled_count", "start_date", "end_date", "instructor_id", "image_url", "is_active", "created_at", "updated_at", "provider_id", "approval_status", "curriculum", "objectives", "requirements", "status", "materials", "assessment_method", "certificate_type", "instructor_name", "instructor_profile", "instructor_expertise", "target_audience", "difficulty", "language", "location", "tags", "features", "recommendations", "total_hours", "enrollment_deadline", "completion_deadline", "prerequisites", "learning_method", "video_thumbnails", "quiz_data", "interactive_elements", "curriculum_items", "learning_materials", "subcategory") VALUES (19, '강의1', '1', '법정의무교육', 'online', 'intermediate', -2, 1, NULL, '1', NULL, 0, NULL, NULL, NULL, '', TRUE, '2025-07-08T22:58:05.970Z', '2025-07-08T22:58:05.970Z', 3, 'approved', '', '', '', 'active', '', '', '', '', '', '', '', '', 'ko', '', '[]', '', '', NULL, NULL, NULL, '', '', NULL, NULL, NULL, '[]', '[]', '화학물질 안전교육');

-- Table "notices": 2 rows
INSERT INTO "notices" ("id", "title", "content", "category", "author_id", "is_important", "is_active", "created_at", "updated_at", "views") VALUES (1, '2025년 상반기 교육 일정 공지', '2025년 상반기 교육 일정이 확정되었습니다. 자세한 내용은 첨부파일을 확인해주세요.', 'notice', 1, TRUE, TRUE, '2025-06-20T04:20:55.446Z', '2025-07-26T07:52:54.404Z', 16);
INSERT INTO "notices" ("id", "title", "content", "category", "author_id", "is_important", "is_active", "created_at", "updated_at", "views") VALUES (2, '온라인 교육 시스템 점검 안내', '시스템 안정성 향상을 위한 정기 점검을 실시합니다.', 'system', 1, FALSE, TRUE, '2025-06-20T04:20:55.446Z', '2025-10-19T22:00:23.554Z', 17);

-- Table "enrollments": 17 rows
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (65, 3, 10, 'enrolled', 0, NULL, '2025-06-28T05:04:15.464Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (66, 66, 11, 'enrolled', 0, NULL, '2025-07-06T09:50:45.493Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (67, 68, 10, 'enrolled', 0, NULL, '2025-07-07T21:48:22.587Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (68, 69, 10, 'enrolled', 0, NULL, '2025-07-08T20:10:52.648Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (69, 69, 9, 'enrolled', 0, NULL, '2025-07-08T20:11:37.806Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (70, 69, 8, 'enrolled', 0, NULL, '2025-07-08T20:12:30.995Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (3, 5, 7, 'completed', 100, NULL, '2025-06-23T02:16:34.824Z', '2025-06-23T21:21:59.124Z', 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (71, 69, 11, 'enrolled', 0, NULL, '2025-07-08T20:12:47.619Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (72, 69, 1, 'enrolled', 0, NULL, '2025-07-08T20:36:33.282Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (1, 5, 11, 'completed', 100, NULL, '2025-06-22T18:47:39.206Z', '2025-06-23T21:21:54.403Z', 'course', '온라인');
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (73, 69, 19, 'enrolled', 0, NULL, '2025-07-08T23:11:19.777Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (74, 69, 7, 'enrolled', 0, NULL, '2025-07-09T19:47:49.448Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (75, 3, 9, 'enrolled', 0, NULL, '2025-08-19T05:53:38.970Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (4, 5, 10, 'completed', 100, NULL, '2025-06-23T21:13:00.368Z', '2025-06-24T00:15:31.841Z', 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (5, 5, 8, 'enrolled', 0, NULL, '2025-06-24T00:28:56.848Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (6, 3, 8, 'enrolled', 0, NULL, '2025-06-24T22:21:12.377Z', NULL, 'course', NULL);
INSERT INTO "enrollments" ("id", "user_id", "course_id", "status", "progress", "grade", "enrolled_at", "completed_at", "type", "subtype") VALUES (7, 1, 10, 'enrolled', 0, NULL, '2025-06-25T00:24:11.613Z', NULL, 'course', NULL);


-- Table "enrollment_progress": 20 rows
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (15, 5, 5, '1-video-1-1', 'video', 6, NULL, '2025-06-25T02:30:52.624Z', '2025-06-26T17:14:11.499Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (21, 4, 5, '0-video-0-1', 'video', 1, NULL, '2025-06-26T21:32:38.745Z', '2025-06-26T21:32:38.745Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (22, 4, 5, '0-quiz-0-1', 'quiz', 100, NULL, '2025-06-26T21:32:46.376Z', '2025-06-26T21:32:46.549Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (23, 66, 66, '1-video-1-1', 'video', 1, NULL, '2025-07-06T09:51:40.777Z', '2025-07-06T09:51:40.777Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (24, 66, 66, '0-video-0-1', 'video', 4, NULL, '2025-07-06T09:51:53.714Z', '2025-07-06T09:51:58.722Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (25, 67, 68, '0-video-0-1', 'video', 4, NULL, '2025-07-07T21:54:10.042Z', '2025-07-07T21:54:49.138Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (28, 69, 69, '1-video-1-1', 'video', 7, NULL, '2025-07-08T20:31:45.889Z', '2025-07-08T20:32:45.843Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (27, 69, 69, '0-video-0-1', 'video', 9, NULL, '2025-07-08T20:31:30.967Z', '2025-07-08T20:32:45.960Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (1, 5, 5, '0-quiz-0-1', 'quiz', 100, NULL, '2025-06-24T03:30:21.024Z', '2025-06-25T01:59:20.541Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (26, 68, 69, '0-video-0-1', 'video', 18, NULL, '2025-07-08T20:27:54.025Z', '2025-07-09T22:27:33.309Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (30, 1, 5, '0-video-0-1', 'video', 1, NULL, '2025-07-22T22:26:46.604Z', '2025-07-22T22:26:46.604Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (29, 1, 5, '1-video-1-1', 'video', 1, NULL, '2025-07-22T22:26:16.302Z', '2025-07-22T22:27:03.876Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (31, 65, 3, '0-quiz-0-1', 'video', 100, NULL, '2025-07-23T16:45:52.583Z', '2025-07-23T16:45:52.583Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (32, 65, 3, '0-quiz-0-1', 'quiz', 100, NULL, '2025-07-23T16:45:52.594Z', '2025-07-23T16:45:52.594Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (3, 5, 5, '0-video-0-1', 'video', 14, NULL, '2025-06-24T22:49:33.950Z', '2025-06-25T20:46:41.955Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (19, 6, 3, '0-quiz-0-1', 'video', 100, NULL, '2025-06-25T21:51:24.295Z', '2025-10-19T21:57:37.306Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (18, 6, 3, '0-video-0-1', 'video', 91, NULL, '2025-06-25T21:24:29.873Z', '2025-12-21T20:54:56.201Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (33, 75, 3, '0-video-0-1', 'video', 9, NULL, '2025-08-19T05:54:07.470Z', '2025-12-23T21:36:15.971Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (34, 75, 3, '0-quiz-0-1', 'video', 100, NULL, '2025-08-19T05:54:12.314Z', '2025-12-23T21:36:28.122Z');
INSERT INTO "enrollment_progress" ("id", "enrollment_id", "user_id", "item_id", "type", "progress", "completed_at", "created_at", "updated_at") VALUES (20, 6, 3, '0-quiz-0-1', 'quiz', 100, NULL, '2025-06-25T21:51:24.294Z', '2025-06-25T21:51:24.294Z');

-- Table "certificates": 3 rows
INSERT INTO "certificates" ("id", "user_id", "course_id", "enrollment_id", "issued_by", "certificate_number", "issued_at", "expires_at", "status") VALUES (1, 5, 11, 1, 1, 'CERT-1-2025', '2025-06-23T21:21:54.214Z', NULL, 'active');
INSERT INTO "certificates" ("id", "user_id", "course_id", "enrollment_id", "issued_by", "certificate_number", "issued_at", "expires_at", "status") VALUES (2, 5, 7, 3, 3, 'CERT-3-2025', '2025-06-23T21:21:58.958Z', NULL, 'active');
INSERT INTO "certificates" ("id", "user_id", "course_id", "enrollment_id", "issued_by", "certificate_number", "issued_at", "expires_at", "status") VALUES (3, 5, 10, 4, 1, 'CERT-4-2025', '2025-06-24T00:15:31.673Z', NULL, 'active');

-- Table "cart": 8 rows
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (1, 5, 10, 'course', '2025-06-23T20:25:05.847Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (3, 1, 10, 'course', '2025-06-25T00:24:14.982Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (4, 67, 9, 'course', '2025-07-07T21:52:36.593Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (5, 5, 8, 'course', '2025-07-08T16:19:32.626Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (8, 3, 10, 'course', '2025-07-08T21:33:28.773Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (9, 3, 9, 'course', '2025-07-09T09:56:08.900Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (10, 69, 1, 'course', '2025-07-09T19:52:39.124Z');
INSERT INTO "cart" ("id", "user_id", "course_id", "type", "added_at") VALUES (11, 69, 19, 'course', '2025-07-13T21:17:26.524Z');


-- Table "chat_messages": 0 rows (empty)


-- Table "inquiries": 4 rows
INSERT INTO "inquiries" ("id", "user_id", "title", "content", "type", "status", "is_private", "attachment_url", "answer", "answered_by", "answered_at", "is_active", "created_at", "updated_at") VALUES (1, 5, '상품 문의 드려요', '상품 문의 드려요', 'product', 'answered', FALSE, NULL, '네 문의 주셔서 감사합니다. 좋은 기업이 되도록 하겠습니다. ', 1, '2025-06-25T17:09:02.703Z', TRUE, '2025-06-25T16:52:03.597Z', '2025-06-25T17:09:02.703Z');
INSERT INTO "inquiries" ("id", "user_id", "title", "content", "type", "status", "is_private", "attachment_url", "answer", "answered_by", "answered_at", "is_active", "created_at", "updated_at") VALUES (4, 3, '결제', '1', 'payment', 'pending', FALSE, NULL, NULL, NULL, NULL, TRUE, '2025-07-08T21:35:32.466Z', '2025-07-08T21:35:32.466Z');
INSERT INTO "inquiries" ("id", "user_id", "title", "content", "type", "status", "is_private", "attachment_url", "answer", "answered_by", "answered_at", "is_active", "created_at", "updated_at") VALUES (3, 69, '배송', '배송이 안와요', 'delivery', 'answered', TRUE, NULL, '네
', 1, '2025-07-08T22:27:56.133Z', TRUE, '2025-07-08T21:14:31.027Z', '2025-07-08T22:27:56.133Z');
INSERT INTO "inquiries" ("id", "user_id", "title", "content", "type", "status", "is_private", "attachment_url", "answer", "answered_by", "answered_at", "is_active", "created_at", "updated_at") VALUES (2, 69, '결제', '결제가 안 돼요', 'payment', 'answered', TRUE, NULL, '알겠습니다', 1, '2025-07-08T22:28:02.774Z', TRUE, '2025-07-08T21:14:14.640Z', '2025-07-08T22:28:02.774Z');



-- Table "overseas_programs": 6 rows
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (2, '독일 인더스트리 4.0 스마트팩토리 교육', '독일의 첨단 제조업 혁신 현장을 직접 체험하는 산업 전문가를 위한 교육 프로그램입니다. 지멘스, BMW, 보쉬 등 글로벌 제조업 리더들의 스마트팩토리를 견학하고 인더스트리 4.0의 실제 적용 사례를 학습합니다.', '독일 뮌헨, 슈투트가르트', '2025-04-09T15:00:00.000Z', '2025-04-16T15:00:00.000Z', '연구교육', 15, 0, 4200000, '7박 8일', '/uploads/images/4.jpg', '
1일차: 인천공항 출발 → 뮌헨 도착 → 환영만찬
2일차: 지멘스 본사 및 디지털 팩토리 견학
3일차: BMW 뮌헨 공장 투어 → 기술 워크샵
4일차: 뮌헨 → 슈투트가르트 이동 → 메르세데스-벤츠 박물관
5일차: 보쉬 연구소 방문 → 스마트팩토리 세미나
6일차: 프라운호퍼 연구소 → 산학협력 모델 학습
7일차: 슈투트가르트 시내 관광 → 귀국 준비
8일차: 프랑크푸르트 출발 → 인천공항 도착
        ', '
• 독일 주요 제조업체 스마트팩토리 견학
• 인더스트리 4.0 전문가 강의 수강
• 독일 기업과의 비즈니스 미팅 주선
• 독일 공과대학 연구소 방문
• 현지 기술 동향 리포트 제공
• 독일어-한국어 전문 통역 서비스
        ', '
• 제조업, 엔지니어링 관련 업종 종사자
• 대학 졸업 이상 또는 관련 경력 3년 이상
• 기본적인 영어 의사소통 가능
• 유럽 여행 경험 권장
• 독일 비자 발급 가능자
        ', '독일, 제조업, 스마트팩토리, 인더스트리4.0, 기술교육', '루프트한자 항공 직항편', '힐튼 뮌헨 파크 & 메리어트 슈투트가르트 (4성급)', '조식 포함, 중식/석식 독일 전통요리 및 한식 제공', '독일 거주 한국인 전문 가이드', '독일 단기 비자 필요 (여행사 대행 신청)', '유럽 여행자보험 단체 가입', 'EUR (유로)', '온대 기후 (평균 10-18도, 봄철)', 'UTC+1 (한국 대비 -8시간)', '독일어, 영어 (전문 통역 지원)', '+49-89-123-4567 (현지 긴급연락처)', '출발 45일 전: 무료, 30일 전: 20% 수수료, 15일 전: 50%, 7일 전: 80%', 3, 'active', 'approved', TRUE, '2025-06-22T03:16:40.401Z', '2025-06-22T03:16:40.401Z', '[{"id":"1-1-1750595036791","day":1,"time":"09:00","title":"인천공항 출발","description":"1일차 인천공항 출발","location":"공항","type":"transport"},{"id":"1-2-1750595036791","day":1,"time":"14:00","title":"뮌헨 도착","description":"1일차 뮌헨 도착","location":"현지","type":"transport"},{"id":"1-3-1750595036791","day":1,"time":"19:00","title":"환영만찬","description":"1일차 환영만찬","location":"현지","type":"meal"},{"id":"2-1-1750595036791","day":2,"time":"10:00","title":"지멘스 본사 및 디지털 팩토리 견학","description":"2일차 지멘스 본사 및 디지털 팩토리 견학","location":"지멘스 본사 및 디지털 팩토리 견학","type":"activity"},{"id":"3-1-1750595036791","day":3,"time":"10:00","title":"BMW 뮌헨 공장 투어","description":"3일차 BMW 뮌헨 공장 투어","location":"BMW 뮌헨 공장 투어","type":"activity"},{"id":"3-2-1750595036791","day":3,"time":"14:00","title":"기술 워크샵","description":"3일차 기술 워크샵","location":"현지","type":"activity"},{"id":"4-1-1750595036791","day":4,"time":"10:00","title":"뮌헨","description":"4일차 뮌헨","location":"현지","type":"activity"},{"id":"4-2-1750595036791","day":4,"time":"14:00","title":"슈투트가르트 이동","description":"4일차 슈투트가르트 이동","location":"현지","type":"transport"},{"id":"4-3-1750595036791","day":4,"time":"16:00","title":"메르세데스-벤츠 박물관","description":"4일차 메르세데스-벤츠 박물관","location":"현지","type":"activity"},{"id":"5-1-1750595036791","day":5,"time":"10:00","title":"보쉬 연구소 방문","description":"5일차 보쉬 연구소 방문","location":"보쉬 연구소 방문","type":"activity"},{"id":"5-2-1750595036791","day":5,"time":"14:00","title":"스마트팩토리 세미나","description":"5일차 스마트팩토리 세미나","location":"현지","type":"activity"},{"id":"6-1-1750595036791","day":6,"time":"10:00","title":"프라운호퍼 연구소","description":"6일차 프라운호퍼 연구소","location":"프라운호퍼 연구소","type":"activity"},{"id":"6-2-1750595036791","day":6,"time":"14:00","title":"산학협력 모델 학습","description":"6일차 산학협력 모델 학습","location":"현지","type":"activity"},{"id":"7-1-1750595036791","day":7,"time":"15:00","title":"슈투트가르트 시내 관광","description":"7일차 슈투트가르트 시내 관광","location":"현지","type":"rest"},{"id":"7-2-1750595036791","day":7,"time":"14:00","title":"귀국 준비","description":"7일차 귀국 준비","location":"현지","type":"activity"},{"id":"8-1-1750595036791","day":8,"time":"09:00","title":"프랑크푸르트 출발","description":"8일차 프랑크푸르트 출발","location":"현지","type":"transport"},{"id":"8-2-1750595036791","day":8,"time":"18:00","title":"인천공항 도착","description":"8일차 인천공항 도착","location":"공항","type":"transport"}]');
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (1, '미국 실리콘밸리 IT 기업 탐방 교육', '세계 최고의 IT 기업들이 모인 실리콘밸리에서 최신 기술 동향을 체험하고 글로벌 네트워크를 구축하는 프리미엄 교육 프로그램입니다. Google, Apple, Meta 등 주요 기업 방문과 현지 전문가들과의 만남을 통해 미래 기술에 대한 인사이트를 얻을 수 있습니다.', '미국 캘리포니아 실리콘밸리', '2025-03-14T15:00:00.000Z', '2025-03-21T15:00:00.000Z', '교육시찰', 20, 0, 3500000, '7박 8일', '/uploads/images/1.jpg', '
1일차: 인천공항 출발 → 샌프란시스코 도착 → 오리엔테이션
2일차: 구글 본사 방문 → 스탠포드 대학교 캠퍼스 투어
3일차: 애플 파크 방문 → 실리콘밸리 박물관
4일차: 메타(페이스북) 본사 → 스타트업 인큐베이터 방문
5일차: 테슬라 공장 견학 → 기술 세미나 참석
6일차: 네트워킹 세션 → 자유시간
7일차: 샌프란시스코 시내 관광 → 출발 준비
8일차: 샌프란시스코 출발 → 인천공항 도착
        ', '
• 글로벌 IT 기업 직접 방문 및 견학
• 현지 전문가와의 1:1 멘토링 세션
• 실리콘밸리 네트워킹 파티 참석
• 영문 수료증 발급
• 현지 가이드 및 통역 서비스 제공
• 전 일정 식사 및 숙박 포함
        ', '
• IT 관련 업종 종사자 또는 관련 전공 학생
• 기본적인 영어 의사소통 가능자
• 여권 유효기간 6개월 이상 잔여
• 미국 비자(ESTA) 발급 가능자
• 해외여행자보험 가입 필수
        ', 'IT, 실리콘밸리, 기업탐방, 기술교육, 네트워킹', '대한항공 직항편 (KE 경유)', '힐튼 샌프란시스코 유니온 스퀘어 (4성급)', '조식 포함, 중식/석식 현지식 제공', '현지 한국인 가이드 및 전문 통역사', 'ESTA 신청 필요 (개별 신청, 약 $21)', '해외여행자보험 단체 가입 (의료비 최대 1억원)', 'USD (미국 달러)', '온화한 지중해성 기후 (평균 15-20도)', 'UTC-8 (한국 대비 -17시간)', '영어 (현지 통역 지원)', '+1-415-123-4567 (현지 긴급연락처)', '출발 30일 전: 10% 수수료, 15일 전: 50%, 7일 전: 80%, 당일: 100%', 3, 'active', 'approved', TRUE, '2025-06-22T03:16:40.227Z', '2025-06-22T03:16:40.227Z', '[{"id":"1-1-1750595036125","day":1,"time":"09:00","title":"인천공항 출발","description":"1일차 인천공항 출발","location":"공항","type":"transport"},{"id":"1-2-1750595036125","day":1,"time":"14:00","title":"샌프란시스코 도착","description":"1일차 샌프란시스코 도착","location":"현지","type":"transport"},{"id":"1-3-1750595036125","day":1,"time":"16:00","title":"오리엔테이션","description":"1일차 오리엔테이션","location":"현지","type":"activity"},{"id":"2-1-1750595036125","day":2,"time":"10:00","title":"구글 본사 방문","description":"2일차 구글 본사 방문","location":"구글 본사 방문","type":"activity"},{"id":"2-2-1750595036126","day":2,"time":"14:00","title":"스탠포드 대학교 캠퍼스 투어","description":"2일차 스탠포드 대학교 캠퍼스 투어","location":"현지","type":"activity"},{"id":"3-1-1750595036126","day":3,"time":"10:00","title":"애플 파크 방문","description":"3일차 애플 파크 방문","location":"현지","type":"activity"},{"id":"3-2-1750595036126","day":3,"time":"14:00","title":"실리콘밸리 박물관","description":"3일차 실리콘밸리 박물관","location":"현지","type":"activity"},{"id":"4-1-1750595036126","day":4,"time":"10:00","title":"메타(페이스북) 본사","description":"4일차 메타(페이스북) 본사","location":"메타(페이스북) 본사","type":"activity"},{"id":"4-2-1750595036126","day":4,"time":"14:00","title":"스타트업 인큐베이터 방문","description":"4일차 스타트업 인큐베이터 방문","location":"현지","type":"activity"},{"id":"5-1-1750595036126","day":5,"time":"10:00","title":"테슬라 공장 견학","description":"5일차 테슬라 공장 견학","location":"테슬라 공장 견학","type":"activity"},{"id":"5-2-1750595036126","day":5,"time":"14:00","title":"기술 세미나 참석","description":"5일차 기술 세미나 참석","location":"현지","type":"activity"},{"id":"6-1-1750595036126","day":6,"time":"10:00","title":"네트워킹 세션","description":"6일차 네트워킹 세션","location":"현지","type":"activity"},{"id":"6-2-1750595036126","day":6,"time":"15:00","title":"자유시간","description":"6일차 자유시간","location":"현지","type":"rest"},{"id":"7-1-1750595036126","day":7,"time":"15:00","title":"샌프란시스코 시내 관광","description":"7일차 샌프란시스코 시내 관광","location":"현지","type":"rest"},{"id":"7-2-1750595036126","day":7,"time":"18:00","title":"출발 준비","description":"7일차 출발 준비","location":"현지","type":"transport"},{"id":"8-1-1750595036126","day":8,"time":"09:00","title":"샌프란시스코 출발","description":"8일차 샌프란시스코 출발","location":"현지","type":"transport"},{"id":"8-2-1750595036126","day":8,"time":"18:00","title":"인천공항 도착","description":"8일차 인천공항 도착","location":"공항","type":"transport"}]');
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (3, '일본 도쿄 디지털 트랜스포메이션 교육', '일본의 디지털 혁신 선도 기업들을 방문하여 DX(Digital Transformation) 전략과 실행 방법을 학습하는 단기 집중 교육입니다. 소프트뱅크, 라쿠텐, NTT 등 일본 대표 기업의 디지털 혁신 사례를 직접 체험할 수 있습니다.', '일본 도쿄', '2025-05-19T15:00:00.000Z', '2025-05-23T15:00:00.000Z', '교육과정개발', 25, 0, 1800000, '4박 5일', '/uploads/images/5.jpg', '
1일차: 김포공항 출발 → 하네다공항 도착 → 도쿄 시내 투어
2일차: 소프트뱅크 본사 방문 → AI 로봇 페퍼 체험
3일차: 라쿠텐 크림슨 하우스 → 이커머스 혁신 세미나
4일차: NTT 도코모 5G 체험센터 → 디지털 트윈 데모
5일차: 도쿄 자유시간 → 하네다공항 출발 → 김포공항 도착
        ', '
• 일본 대표 IT 기업 방문 및 견학
• DX 전문가와의 질의응답 세션
• 최신 기술 데모 체험 (AI, 5G, IoT)
• 일본 디지털 정책 동향 브리핑
• 현지 비즈니스 네트워킹 기회
• 일한 동시통역 서비스
        ', '
• IT, 경영, 마케팅 관련 업종 종사자
• 기업 임원 또는 팀장급 이상 권장
• 일본어 또는 영어 기초 회화 가능
• 일본 입국 가능자 (여권 유효기간 6개월 이상)
        ', '일본, 도쿄, DX, 디지털혁신, AI, 5G', '대한항공 김포-하네다 직항편', '그랜드 하얏트 도쿄 (5성급)', '조식 포함, 중식/석식 일본 현지식 및 한식', '일본 거주 한국인 가이드', '무비자 입국 (90일 이하 체류)', '일본 여행자보험 단체 가입', 'JPY (일본 엔)', '온화한 기후 (평균 20-25도, 봄철)', 'UTC+9 (한국과 동일)', '일본어 (한일 동시통역 지원)', '+81-3-1234-5678 (현지 긴급연락처)', '출발 14일 전: 10% 수수료, 7일 전: 30%, 3일 전: 50%, 당일: 100%', 3, 'active', 'approved', TRUE, '2025-06-22T03:16:40.547Z', '2025-06-22T03:16:40.547Z', '[{"id":"1-1-1750595037112","day":1,"time":"09:00","title":"김포공항 출발","description":"1일차 김포공항 출발","location":"공항","type":"transport"},{"id":"1-2-1750595037112","day":1,"time":"14:00","title":"하네다공항 도착","description":"1일차 하네다공항 도착","location":"공항","type":"transport"},{"id":"1-3-1750595037112","day":1,"time":"16:00","title":"도쿄 시내 투어","description":"1일차 도쿄 시내 투어","location":"현지","type":"activity"},{"id":"2-1-1750595037112","day":2,"time":"10:00","title":"소프트뱅크 본사 방문","description":"2일차 소프트뱅크 본사 방문","location":"소프트뱅크 본사 방문","type":"activity"},{"id":"2-2-1750595037112","day":2,"time":"14:00","title":"AI 로봇 페퍼 체험","description":"2일차 AI 로봇 페퍼 체험","location":"현지","type":"activity"},{"id":"3-1-1750595037112","day":3,"time":"10:00","title":"라쿠텐 크림슨 하우스","description":"3일차 라쿠텐 크림슨 하우스","location":"현지","type":"activity"},{"id":"3-2-1750595037112","day":3,"time":"14:00","title":"이커머스 혁신 세미나","description":"3일차 이커머스 혁신 세미나","location":"현지","type":"activity"},{"id":"4-1-1750595037112","day":4,"time":"10:00","title":"NTT 도코모 5G 체험센터","description":"4일차 NTT 도코모 5G 체험센터","location":"현지","type":"activity"},{"id":"4-2-1750595037112","day":4,"time":"14:00","title":"디지털 트윈 데모","description":"4일차 디지털 트윈 데모","location":"현지","type":"activity"},{"id":"5-1-1750595037112","day":5,"time":"15:00","title":"도쿄 자유시간","description":"5일차 도쿄 자유시간","location":"현지","type":"rest"},{"id":"5-2-1750595037112","day":5,"time":"14:00","title":"하네다공항 출발","description":"5일차 하네다공항 출발","location":"공항","type":"transport"},{"id":"5-3-1750595037112","day":5,"time":"18:00","title":"김포공항 도착","description":"5일차 김포공항 도착","location":"공항","type":"transport"}]');
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (4, '싱가포르 핀테크 & 블록체인 혁신 교육', '아시아 금융 허브 싱가포르에서 핀테크와 블록체인 기술의 최신 동향을 학습하는 금융 전문가를 위한 교육 프로그램입니다. 싱가포르 통화청(MAS)과 주요 핀테크 기업들을 방문하여 규제 샌드박스와 디지털 금융 혁신 사례를 직접 체험합니다.', '싱가포르', '2025-06-14T15:00:00.000Z', '2025-06-18T15:00:00.000Z', '국제교류', 18, 0, 2200000, '4박 5일', '/uploads/images/6.jpg', '
1일차: 인천공항 출발 → 창이공항 도착 → 환영 리셉션
2일차: 싱가포르 통화청(MAS) 방문 → 핀테크 정책 브리핑
3일차: DBS 은행 디지털 혁신센터 → 그랩 핀테크 본사
4일차: 블록체인 스타트업 인큐베이터 → 크립토 거래소 견학
5일차: 싱가포르 자유시간 → 창이공항 출발 → 인천공항 도착
        ', '
• 아시아 최고 핀테크 허브 체험
• 싱가포르 금융당국과의 정책 대화
• 글로벌 핀테크 기업 CEO 특강
• 블록체인 기술 실습 워크샵
• 아시아 핀테크 네트워크 구축
• 영어-한국어 전문 통역
        ', '
• 금융, IT, 핀테크 관련 업종 종사자
• 대학 졸업 이상 또는 관련 경력 2년 이상
• 영어 비즈니스 회화 가능
• 블록체인/암호화폐 기초 지식 권장
• 싱가포르 입국 가능자
        ', '싱가포르, 핀테크, 블록체인, 금융혁신, 암호화폐', '싱가포르항공 직항편', '마리나 베이 샌즈 (5성급)', '조식 포함, 중식/석식 다국적 요리', '싱가포르 거주 한국인 금융 전문가', '무비자 입국 (30일 이하 체류)', '싱가포르 여행자보험 단체 가입', 'SGD (싱가포르 달러)', '열대 기후 (평균 28-32도, 습도 높음)', 'UTC+8 (한국 대비 -1시간)', '영어 (공용어, 통역 지원)', '+65-6123-4567 (현지 긴급연락처)', '출발 21일 전: 15% 수수료, 14일 전: 40%, 7일 전: 70%, 당일: 100%', 3, 'pending', 'pending', TRUE, '2025-06-22T03:16:40.702Z', '2025-06-22T03:16:40.702Z', '[{"id":"1-1-1750595037429","day":1,"time":"09:00","title":"인천공항 출발","description":"1일차 인천공항 출발","location":"공항","type":"transport"},{"id":"1-2-1750595037429","day":1,"time":"14:00","title":"창이공항 도착","description":"1일차 창이공항 도착","location":"공항","type":"transport"},{"id":"1-3-1750595037429","day":1,"time":"16:00","title":"환영 리셉션","description":"1일차 환영 리셉션","location":"현지","type":"activity"},{"id":"2-1-1750595037429","day":2,"time":"10:00","title":"싱가포르 통화청(MAS) 방문","description":"2일차 싱가포르 통화청(MAS) 방문","location":"현지","type":"activity"},{"id":"2-2-1750595037429","day":2,"time":"14:00","title":"핀테크 정책 브리핑","description":"2일차 핀테크 정책 브리핑","location":"현지","type":"activity"},{"id":"3-1-1750595037429","day":3,"time":"10:00","title":"DBS 은행 디지털 혁신센터","description":"3일차 DBS 은행 디지털 혁신센터","location":"현지","type":"activity"},{"id":"3-2-1750595037429","day":3,"time":"14:00","title":"그랩 핀테크 본사","description":"3일차 그랩 핀테크 본사","location":"그랩 핀테크 본사","type":"activity"},{"id":"4-1-1750595037429","day":4,"time":"10:00","title":"블록체인 스타트업 인큐베이터","description":"4일차 블록체인 스타트업 인큐베이터","location":"현지","type":"activity"},{"id":"4-2-1750595037429","day":4,"time":"14:00","title":"크립토 거래소 견학","description":"4일차 크립토 거래소 견학","location":"현지","type":"activity"},{"id":"5-1-1750595037429","day":5,"time":"15:00","title":"싱가포르 자유시간","description":"5일차 싱가포르 자유시간","location":"현지","type":"rest"},{"id":"5-2-1750595037429","day":5,"time":"14:00","title":"창이공항 출발","description":"5일차 창이공항 출발","location":"공항","type":"transport"},{"id":"5-3-1750595037429","day":5,"time":"18:00","title":"인천공항 도착","description":"5일차 인천공항 도착","location":"공항","type":"transport"}]');
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (6, '일본', '해외 교육', '일본', '2025-07-09T15:00:00.000Z', '2025-07-26T15:00:00.000Z', '교육시찰', 22, 0, 11, '1달', '/uploads/images/1.jpg', '1', '1', '1', '{"#교육"}', '1', '1', '1', '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, 'pending', 'pending', TRUE, '2025-07-08T22:55:16.234Z', '2025-07-08T22:55:16.234Z', NULL);
INSERT INTO "overseas_programs" ("id", "title", "description", "destination", "start_date", "end_date", "type", "max_participants", "current_participants", "price", "duration", "image_url", "program", "benefits", "requirements", "tags", "airline", "accommodation", "meals", "guide", "visa_info", "insurance", "currency", "climate", "time_zone", "language", "emergency_contact", "cancellation_policy", "provider_id", "status", "approval_status", "is_active", "created_at", "updated_at", "program_schedule") VALUES (5, '호주 시드니 교육혁신 & 에듀테크 교육1', '호주의 선진 교육 시스템과 에듀테크 혁신 사례를 학습하는 교육 전문가를 위한 교육 프로그램입니다. 시드니 대학교, UNSW 등 명문 대학과 혁신적인 에듀테크 스타트업들을 방문하여 미래 교육의 방향을 모색합니다.', '호주 시드니', '2025-07-07T15:00:00.000Z', '2025-07-14T15:00:00.000Z', '어학교육', 20, 3, 3800000, '7박 8일', '/uploads/images/12.jpg', '
1일차: 인천공항 출발 → 시드니공항 도착 → 시드니 하버 투어
2일차: 시드니 대학교 캠퍼스 투어 → 교육학과 특강
3일차: UNSW 혁신 연구소 → 에듀테크 데모 세션
4일차: 호주 교육부 방문 → 교육정책 브리핑
5일차: 현지 초중고 학교 방문 → 교육 현장 체험
6일차: 에듀테크 스타트업 인큐베이터 → 네트워킹 파티
7일차: 블루마운틴 관광 → 문화 체험
8일차: 시드니공항 출발 → 인천공항 도착
        ', '
호주 명문대학 교육 시스템 체험
• 현지 교육 현장 직접 방문
• 에듀테크 최신 기술 데모 참여
• 호주 교육 전문가와의 토론
• 국제 교육 네트워크 구축
• 영어 몰입 환경 체험
        ', '
• 교육 관련 업종 종사자 (교사, 교육공무원, 교육기업 등)
• 교육학 관련 전공자 또는 교육 경력 1년 이상
• 영어 중급 이상 (TOEIC 700점 또는 이에 준하는 실력)
• 호주 비자 발급 가능자
• 해외 교육 교육 경험 권장
        ', '{"{\"호주\"","\"시드니\"","\"교육혁신\"","\"에듀테크\"","\"대학교육\"}"}', '제트스타 항공 직항편', '시드니 하버 마리어트 (4성급)', '조식 포함, 중식/석식 호주 현지식', '호주 거주 한국인 교육 전문가', '호주 관광비자 필요 (ETA 온라인 신청)', '호주 여행자보험 단체 가입', 'AUD (호주 달러)', '온대 기후 (겨울철, 평균 8-18도)', 'UTC+10 (한국 대비 +1시간)', '영어 (공용어, 통역 지원)', '+61-2-1234-5678 (현지 긴급연락처)', '출발 60일 전: 무료, 30일 전: 25% 수수료, 15일 전: 60%, 7일 전: 85%', 3, 'active', 'approved', TRUE, '2025-06-22T03:16:40.847Z', '2025-07-08T22:57:17.204Z', '[{"id":"1-1-1750595037748","day":1,"time":"09:00","title":"인천공항 출발","description":"1일차 인천공항 출발","location":"공항","type":"transport"},{"id":"1-2-1750595037748","day":1,"time":"14:00","title":"시드니공항 도착","description":"1일차 시드니공항 도착","location":"공항","type":"transport"},{"id":"1-3-1750595037748","day":1,"time":"16:00","title":"시드니 하버 투어","description":"1일차 시드니 하버 투어","location":"현지","type":"activity"},{"id":"2-1-1750595037748","day":2,"time":"10:00","title":"시드니 대학교 캠퍼스 투어","description":"2일차 시드니 대학교 캠퍼스 투어","location":"현지","type":"activity"},{"id":"2-2-1750595037748","day":2,"time":"14:00","title":"교육학과 특강","description":"2일차 교육학과 특강","location":"현지","type":"activity"},{"id":"3-1-1750595037748","day":3,"time":"10:00","title":"UNSW 혁신 연구소","description":"3일차 UNSW 혁신 연구소","location":"UNSW 혁신 연구소","type":"activity"},{"id":"3-2-1750595037748","day":3,"time":"14:00","title":"에듀테크 데모 세션","description":"3일차 에듀테크 데모 세션","location":"현지","type":"activity"},{"id":"4-1-1750595037748","day":4,"time":"10:00","title":"호주 교육부 방문","description":"4일차 호주 교육부 방문","location":"현지","type":"activity"},{"id":"4-2-1750595037748","day":4,"time":"14:00","title":"교육정책 브리핑","description":"4일차 교육정책 브리핑","location":"현지","type":"activity"},{"id":"5-1-1750595037748","day":5,"time":"10:00","title":"현지 초중고 학교 방문","description":"5일차 현지 초중고 학교 방문","location":"현지","type":"activity"},{"id":"5-2-1750595037748","day":5,"time":"14:00","title":"교육 현장 체험","description":"5일차 교육 현장 체험","location":"현지","type":"activity"},{"id":"6-1-1750595037749","day":6,"time":"10:00","title":"에듀테크 스타트업 인큐베이터","description":"6일차 에듀테크 스타트업 인큐베이터","location":"현지","type":"activity"},{"id":"6-2-1750595037749","day":6,"time":"14:00","title":"네트워킹 파티","description":"6일차 네트워킹 파티","location":"현지","type":"activity"},{"id":"7-1-1750595037749","day":7,"time":"15:00","title":"블루마운틴 관광","description":"7일차 블루마운틴 관광","location":"현지","type":"rest"},{"id":"7-2-1750595037749","day":7,"time":"14:00","title":"문화 체험","description":"7일차 문화 체험","location":"현지","type":"activity"},{"id":"8-1-1750595037749","day":8,"time":"09:00","title":"시드니공항 출발","description":"8일차 시드니공항 출발","location":"공항","type":"transport"},{"id":"8-2-1750595037749","day":8,"time":"18:00","title":"인천공항 도착","description":"8일차 인천공항 도착","location":"공항","type":"transport"}]');

-- Table "overseas_registrations": 3 rows
INSERT INTO "overseas_registrations" ("id", "user_id", "overseas_id", "status", "registered_at") VALUES (1, 5, 5, 'registered', '2025-06-22T19:48:31.411Z');
INSERT INTO "overseas_registrations" ("id", "user_id", "overseas_id", "status", "registered_at") VALUES (2, 3, 5, 'registered', '2025-06-22T20:46:12.085Z');
INSERT INTO "overseas_registrations" ("id", "user_id", "overseas_id", "status", "registered_at") VALUES (3, 66, 5, 'registered', '2025-07-06T09:55:50.880Z');

-- Table "payments": 4 rows
INSERT INTO "payments" ("id", "user_id", "course_id", "amount", "status", "payment_method", "transaction_id", "created_at", "refund_reason") VALUES (6, 1, 2, '180000.00', 'failed', 'credit_card', 'TXN003', '2025-06-20T04:46:11.690Z', NULL);
INSERT INTO "payments" ("id", "user_id", "course_id", "amount", "status", "payment_method", "transaction_id", "created_at", "refund_reason") VALUES (7, 1, 1, '200000.00', 'refunded', 'credit_card', 'TXN004', '2025-06-20T04:46:11.690Z', '고객 요청에 의한 환불');
INSERT INTO "payments" ("id", "user_id", "course_id", "amount", "status", "payment_method", "transaction_id", "created_at", "refund_reason") VALUES (8, 1, 2, '90000.00', 'completed', 'paypal', 'TXN005', '2025-06-20T04:46:11.690Z', NULL);
INSERT INTO "payments" ("id", "user_id", "course_id", "amount", "status", "payment_method", "transaction_id", "created_at", "refund_reason") VALUES (5, 1, 1, '120000.00', 'completed', 'bank_transfer', 'TXN002', '2025-06-20T04:46:11.690Z', NULL);

-- Table "private_messages": 5 rows
INSERT INTO "private_messages" ("id", "sender_id", "receiver_id", "subject", "content", "is_read", "is_deleted_by_sender", "is_deleted_by_receiver", "created_at", "read_at") VALUES (1, 3, 5, '안녕하세요', '문의 드립니다.', TRUE, FALSE, FALSE, '2025-06-25T03:44:56.089Z', '2025-06-25T03:48:20.156Z');
INSERT INTO "private_messages" ("id", "sender_id", "receiver_id", "subject", "content", "is_read", "is_deleted_by_sender", "is_deleted_by_receiver", "created_at", "read_at") VALUES (2, 5, 3, 'Re: 안녕하세요', '쪽지 잘 받았습니다.', TRUE, FALSE, FALSE, '2025-06-25T03:49:51.527Z', '2025-06-25T21:48:47.909Z');
INSERT INTO "private_messages" ("id", "sender_id", "receiver_id", "subject", "content", "is_read", "is_deleted_by_sender", "is_deleted_by_receiver", "created_at", "read_at") VALUES (3, 5, 3, 'Re: 안녕하세요', '확인했습니다.', TRUE, FALSE, FALSE, '2025-06-28T00:12:15.887Z', '2025-07-07T21:59:02.970Z');
INSERT INTO "private_messages" ("id", "sender_id", "receiver_id", "subject", "content", "is_read", "is_deleted_by_sender", "is_deleted_by_receiver", "created_at", "read_at") VALUES (4, 3, 5, 'Re: 안녕하세요', '111', TRUE, FALSE, FALSE, '2025-06-28T05:04:39.103Z', '2025-07-08T20:05:44.609Z');
INSERT INTO "private_messages" ("id", "sender_id", "receiver_id", "subject", "content", "is_read", "is_deleted_by_sender", "is_deleted_by_receiver", "created_at", "read_at") VALUES (5, 69, 5, '쪽지', '쪽지 확인', TRUE, TRUE, TRUE, '2025-07-08T20:00:47.414Z', '2025-07-08T20:05:48.109Z');

-- Table "reviews": 6 rows
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (1, 3, 7, 5, '111', TRUE, '2025-06-21T05:17:16.176Z');
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (2, 5, 11, 5, '좋은 강의 였어요', TRUE, '2025-06-23T20:46:53.192Z');
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (3, 66, 11, 3, '22', TRUE, '2025-07-06T09:51:56.553Z');
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (4, 5, 7, 4, 'Test 후기 작성
', TRUE, '2025-07-08T22:05:25.902Z');
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (5, 67, 9, 5, '별점 4.5점 드립니다. 화이팅!', TRUE, '2025-07-18T03:57:39.176Z');
INSERT INTO "reviews" ("id", "user_id", "course_id", "rating", "comment", "is_active", "created_at") VALUES (6, 67, 9, 3, '두번째는 아주 좋아요. 3점 드립니다.', TRUE, '2025-07-18T03:57:59.504Z');

-- Table "seminar_registrations": 9 rows
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (1, 3, 6, 'registered', '2025-06-21T18:59:08.668Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (2, 5, 5, 'registered', '2025-06-22T16:24:41.677Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (3, 5, 4, 'registered', '2025-06-22T18:44:48.962Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (4, 5, 3, 'registered', '2025-06-22T18:47:06.964Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (5, 5, 2, 'registered', '2025-06-22T19:05:08.101Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (6, 67, 2, 'registered', '2025-07-07T18:44:39.591Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (7, 68, 1, 'registered', '2025-07-07T21:51:58.901Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (8, 69, 6, 'registered', '2025-07-08T21:09:04.248Z');
INSERT INTO "seminar_registrations" ("id", "user_id", "seminar_id", "status", "registered_at") VALUES (9, 3, 5, 'registered', '2025-10-19T22:00:11.167Z');

-- Table "seminar_wishlist": 7 rows
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (1, 3, 6, '2025-06-22T02:13:47.402Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (2, 3, 6, '2025-06-22T02:13:47.459Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (3, 5, 3, '2025-06-22T18:47:03.584Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (4, 67, 2, '2025-07-07T18:44:47.708Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (6, 69, 3, '2025-07-08T21:00:44.633Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (7, 69, 5, '2025-07-08T21:10:19.332Z');
INSERT INTO "seminar_wishlist" ("id", "user_id", "seminar_id", "created_at") VALUES (9, 3, 5, '2025-12-21T20:57:31.746Z');

-- Table "seminars": 7 rows
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (6, '온라인 수업설계 세미나1', '효과적인 온라인 수업 설계와 운영 방법을 다루는 세미나입니다.', '정책세미나', '2025-10-09T15:00:00.000Z', '온라인', 100, 2, '/uploads/images/1.jpg', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"10:00","title":"글로벌 교육 현황 개관","description":"세계 각국의 디지털 교육 현황과 트렌드","speaker":"Dr. John Smith (MIT)","location":"온라인 메인홀","type":"session"},{"id":"2","time":"11:00","title":"AI 기반 개인화 학습","description":"인공지능을 활용한 맞춤형 학습 시스템","speaker":"Prof. Sarah Johnson (Stanford)","location":"온라인 메인홀","type":"session"},{"id":"3","time":"12:00","title":"휴식 시간","description":"온라인 브레이크아웃 룸에서 자유 토론","location":"브레이크아웃 룸","type":"break"},{"id":"4","time":"13:00","title":"VR/AR 교육 활용 사례","description":"가상현실과 증강현실을 활용한 교육 혁신","speaker":"김가상 박사 (KAIST)","location":"온라인 세션룸 A","type":"session"},{"id":"5","time":"14:30","title":"글로벌 네트워킹","description":"전 세계 교육자들과의 네트워킹 세션","location":"온라인 네트워킹 룸","type":"networking"}]', 3, 50000, '커피 쿠폰 제공', '교사, 학생, 학부모', 'it, 교육, 강사, 서울', '1일', '디컴소프트', '055-762-9703', 'decom2soft@gmail.com');
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (4, '창의교육 실무 워크샵', '창의적 사고력 향상을 위한 실무 중심의 워크샵입니다.', '워크샵', '2025-09-04T15:00:00.000Z', '경기대학교', 150, 1, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"09:00","title":"개회식 및 환영사","description":"한국교육학회장 환영사 및 개회식 진행","speaker":"김교육 학회장","location":"대강당","type":"session"},{"id":"2","time":"09:30","title":"기조강연: AI 시대의 교육 패러다임","description":"인공지능 시대에 맞는 새로운 교육 방향성 제시","speaker":"이AI 교수 (서울대)","location":"대강당","type":"session"},{"id":"3","time":"10:30","title":"커피 브레이크","description":"참가자 간 네트워킹 시간","location":"로비","type":"break"},{"id":"4","time":"11:00","title":"세션 1: 디지털 교육 혁신","description":"디지털 기술을 활용한 교육 혁신 사례 발표","speaker":"박디지털 박사","location":"제1세미나실","type":"session"},{"id":"5","time":"12:00","title":"점심식사","description":"한식 뷔페 제공","location":"식당","type":"meal"},{"id":"6","time":"13:30","title":"세션 2: 미래 교육과정 설계","description":"2030년을 대비한 교육과정 설계 방안","speaker":"최미래 교수","location":"제2세미나실","type":"session"},{"id":"7","time":"15:00","title":"네트워킹 세션","description":"참가자 간 경험 공유 및 네트워킹","location":"라운지","type":"networking"}]', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (1, '2025 한국교육학회 춘계학술대회', '한국교육학회에서 주최하는 춘계학술대회입니다. 최신 교육 트렌드와 연구 성과를 공유합니다.', '교육학회', '2025-07-14T15:00:00.000Z', '서울대학교 교육종합연구원', 500, 1, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"14:00","title":"심포지엄 개막식","description":"AI 교육의 현재와 미래에 대한 개막 세션","speaker":"정AI 원장","location":"컨벤션홀 A","type":"session"},{"id":"2","time":"14:30","title":"패널 토론: AI 윤리와 교육","description":"AI 시대 교육에서의 윤리적 고려사항","speaker":"전문가 패널 5명","location":"컨벤션홀 A","type":"session"},{"id":"3","time":"16:00","title":"다과 시간","description":"케이크와 음료 제공","location":"로비","type":"meal"},{"id":"4","time":"16:30","title":"AI 교육 도구 체험","description":"최신 AI 교육 도구 직접 체험","speaker":"기술 전문가팀","location":"체험존","type":"session"}]', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (5, '글로벌 교육정책 국제행사', '세계 각국의 교육정책 동향과 우수 사례를 공유하는 국제행사입니다.', '국제행사', '2025-09-19T15:00:00.000Z', '부산 BEXCO', 800, 2, 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"13:30","title":"창의교육 이론 소개","description":"창의교육의 기본 원리와 방법론","speaker":"송창의 교수","location":"워크샵룸 1","type":"session"},{"id":"2","time":"14:30","title":"실습 1: 브레인스토밍 기법","description":"효과적인 브레인스토밍 방법 실습","speaker":"김실습 강사","location":"워크샵룸 1","type":"session"},{"id":"3","time":"15:30","title":"간식 시간","description":"에너지 충전을 위한 간식 제공","location":"휴게실","type":"break"},{"id":"4","time":"16:00","title":"실습 2: 창의적 문제해결","description":"창의적 사고를 통한 문제해결 실습","speaker":"이문제 박사","location":"워크샵룸 2","type":"session"},{"id":"5","time":"17:00","title":"성과 공유 및 마무리","description":"워크샵 결과 발표 및 경험 공유","location":"워크샵룸 1","type":"networking"}]', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (3, 'AI와 교육의 미래 심포지엄', '인공지능 시대의 교육 방향성과 미래 교육 패러다임을 탐구합니다.', '심포지엄', '2025-08-24T15:00:00.000Z', '서울 COEX', 300, 1, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"09:30","title":"국제행사 개막식","description":"각국 교육부 장관 참석 개막식","speaker":"교육부 장관","location":"컨벤션센터 메인홀","type":"session"},{"id":"2","time":"10:30","title":"주제발표: 핀란드 교육정책","description":"핀란드의 혁신적 교육정책 사례","speaker":"Dr. Mika Virtanen (핀란드 교육부)","location":"컨벤션센터 메인홀","type":"session"},{"id":"3","time":"12:00","title":"국제 교류 점심","description":"각국 대표단과의 교류 점심식사","location":"VIP 식당","type":"meal"},{"id":"4","time":"14:00","title":"분과세션: 아시아 교육정책","description":"아시아 각국의 교육정책 비교 분석","speaker":"아시아 교육전문가 패널","location":"세미나실 A","type":"session"},{"id":"5","time":"15:30","title":"문화공연 및 네트워킹","description":"한국 전통문화 공연과 국제 네트워킹","location":"문화공연장","type":"networking"}]', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (7, '세미나', '1', '학술세미나', '2025-07-08T22:56:00.000Z', '1', 1, 0, NULL, TRUE, '2025-07-08T22:56:30.153Z', '[{"id":"1","time":"15:00","title":"온라인 교육의 현재와 미래","description":"포스트 코로나 시대 온라인 교육 트렌드","speaker":"박온라인 교수","location":"Zoom 메인룸","type":"session"},{"id":"2","time":"16:00","title":"효과적인 온라인 수업 설계","description":"학습자 참여를 높이는 온라인 수업 설계법","speaker":"김설계 박사","location":"Zoom 메인룸","type":"session"},{"id":"3","time":"17:00","title":"온라인 도구 활용법","description":"다양한 온라인 교육 도구 실습","speaker":"이도구 전문가","location":"Zoom 실습룸","type":"session"},{"id":"4","time":"18:00","title":"Q&A 및 경험 공유","description":"참가자들의 질문 답변 및 경험 공유","location":"Zoom 토론룸","type":"networking"}]', 3, 1, NULL, NULL, NULL, '1', NULL, NULL, NULL);
INSERT INTO "seminars" ("id", "title", "description", "type", "date", "location", "max_participants", "current_participants", "image_url", "is_active", "created_at", "program_schedule", "provider_id", "price", "benefits", "requirements", "tags", "duration", "organizer", "contact_phone", "contact_email") VALUES (2, '디지털 교육혁신 국제 컨퍼런스', 'AI와 디지털 기술을 활용한 교육 혁신 방안을 논의하는 국제 컨퍼런스입니다.', 'AI 컨퍼런스', '2025-08-09T15:00:00.000Z', '온라인', 1200, 2, 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop', TRUE, '2025-06-20T17:09:15.914Z', '[{"id":"1","time":"15:00","title":"온라인 교육의 현재와 미래","description":"포스트 코로나 시대 온라인 교육 트렌드","speaker":"박온라인 교수","location":"Zoom 메인룸","type":"session"},{"id":"2","time":"16:00","title":"효과적인 온라인 수업 설계","description":"학습자 참여를 높이는 온라인 수업 설계법","speaker":"김설계 박사","location":"Zoom 메인룸","type":"session"},{"id":"3","time":"17:00","title":"온라인 도구 활용법","description":"다양한 온라인 교육 도구 실습","speaker":"이도구 전문가","location":"Zoom 실습룸","type":"session"},{"id":"4","time":"18:00","title":"Q&A 및 경험 공유","description":"참가자들의 질문 답변 및 경험 공유","location":"Zoom 토론룸","type":"networking"}]', 3, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- ============================================
-- SEQUENCE RESET (시퀀스 값을 데이터에 맞게 재설정)
-- ============================================

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('instructors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM instructors));
SELECT setval('courses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM courses));
SELECT setval('enrollments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM enrollments));
SELECT setval('enrollment_progress_id_seq', (SELECT COALESCE(MAX(id), 1) FROM enrollment_progress));
SELECT setval('certificates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM certificates));
SELECT setval('cart_id_seq', (SELECT COALESCE(MAX(id), 1) FROM cart));
SELECT setval('chat_messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM chat_messages));
SELECT setval('inquiries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM inquiries));
SELECT setval('notices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notices));
SELECT setval('payments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payments));
SELECT setval('private_messages_id_seq', (SELECT COALESCE(MAX(id), 1) FROM private_messages));
SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews));
SELECT setval('seminar_registrations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM seminar_registrations));
SELECT setval('seminar_wishlist_id_seq', (SELECT COALESCE(MAX(id), 1) FROM seminar_wishlist));
SELECT setval('seminars_id_seq', (SELECT COALESCE(MAX(id), 1) FROM seminars));
SELECT setval('overseas_programs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM overseas_programs));
SELECT setval('overseas_registrations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM overseas_registrations));

-- ============================================
-- FOREIGN KEYS (모든 데이터 삽입 후 FK 제약 추가)
-- ============================================

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id");
ALTER TABLE "courses" ADD CONSTRAINT "courses_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "users"("id");
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id");
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id");
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "seminar_registrations" ADD CONSTRAINT "seminar_registrations_seminar_id_seminars_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "seminars"("id");
ALTER TABLE "seminar_wishlist" ADD CONSTRAINT "seminar_wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "seminar_wishlist" ADD CONSTRAINT "seminar_wishlist_seminar_id_seminars_id_fk" FOREIGN KEY ("seminar_id") REFERENCES "seminars"("id");
ALTER TABLE "seminars" ADD CONSTRAINT "seminars_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "users"("id");
ALTER TABLE "overseas_programs" ADD CONSTRAINT "overseas_programs_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "users"("id");
ALTER TABLE "overseas_registrations" ADD CONSTRAINT "overseas_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "overseas_registrations" ADD CONSTRAINT "overseas_registrations_overseas_id_overseas_programs_id_fk" FOREIGN KEY ("overseas_id") REFERENCES "overseas_programs"("id");
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "cart" ADD CONSTRAINT "cart_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id");
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id");
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id");
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "users"("id");
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id");
ALTER TABLE "private_messages" ADD CONSTRAINT "private_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "users"("id");
ALTER TABLE "enrollment_progress" ADD CONSTRAINT "enrollment_progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id");
ALTER TABLE "enrollment_progress" ADD CONSTRAINT "enrollment_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_answered_by_users_id_fk" FOREIGN KEY ("answered_by") REFERENCES "users"("id");

