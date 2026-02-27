import { storage } from "./storage";

async function createTables() {
  try {
    console.log("Creating enrollment_progress table...");

    // 기존 테이블이 있다면 삭제
    await storage.query(`DROP TABLE IF EXISTS enrollment_progress CASCADE;`);

    // 테이블 생성
    await storage.query(`
      CREATE TABLE enrollment_progress (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(enrollment_id, user_id, item_id)
      );
    `);

    // 인덱스 생성
    await storage.query(`
      CREATE INDEX idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id);
      CREATE INDEX idx_enrollment_progress_user_id ON enrollment_progress(user_id);
      CREATE INDEX idx_enrollment_progress_type ON enrollment_progress(type);
    `);

    console.log("Tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}

createTables();
