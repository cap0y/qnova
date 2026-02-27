import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema.js";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Configure connection pooling for better stability
neonConfig.poolQueryViaFetch = false;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with improved configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduced max connections
  min: 1, // Minimum connections
  idleTimeoutMillis: 20000, // Reduced idle timeout
  connectionTimeoutMillis: 15000, // Increased connection timeout
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

export const db = drizzle(pool, { schema });
