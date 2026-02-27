import { db } from "./db";
import { sql } from "drizzle-orm";

async function createEnrollmentProgressTable() {
  try {
    console.log("Creating enrollment_progress table...");

    await db.execute(sql`
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
      );

      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id);
      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_user_id ON enrollment_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_enrollment_progress_type ON enrollment_progress(type);
    `);

    console.log("✅ enrollment_progress table created successfully");
  } catch (error) {
    console.error("Error creating enrollment_progress table:", error);
    throw error;
  }
}

// 스크립트 실행
createEnrollmentProgressTable().catch(console.error);
