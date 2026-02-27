import { db } from "./db";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("Seeding database...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

  // Check if admin user exists
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

  if (existingAdmin.length === 0) {
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      email: "admin@gmail.com",
      password: await hashPassword("a@@@12345"), // Properly hashed password
      name: "관리자",
      phone: "010-1234-5678",
      userType: "individual",
      role: "admin",
      isAdmin: true,
      isApproved: true,
      isActive: true,
    });
    console.log("Admin user created");
  } else {
    // Update existing admin password to use correct hash
    await db
      .update(users)
      .set({ password: await hashPassword("a@@@12345") })
      .where(eq(users.username, "admin"));
    console.log("Admin password updated");
  }

  console.log("Database seeding completed");
}

// 직접 실행 시에만 시딩 수행 (모듈로 임포트될 때는 실행 안 함)
if (process.argv[1] && process.argv[1].endsWith('seed-db.ts')) {
  seedDatabase().catch(console.error);
}
