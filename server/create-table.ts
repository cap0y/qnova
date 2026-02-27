import { storage } from "./storage";

async function createTable() {
  try {
    console.log("Creating enrollment_progress table...");

    // 테이블 생성
    await storage.query(`
      CREATE TABLE IF NOT EXISTS enrollment_progress (
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
      )
    `);

    console.log("Creating indexes...");

    // 인덱스 생성
    await storage.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id)
    `);

    await storage.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_user_id ON enrollment_progress(user_id)
    `);

    await storage.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_type ON enrollment_progress(type)
    `);

    console.log("Table and indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

createTable();
