import { db } from "./db";
import { chatChannels, chatMessages } from "@shared/schema";
import { lt, sql, eq, inArray } from "drizzle-orm";

/**
 * Cleans up chat channels and messages that are older than 1 hour.
 * This function should be called periodically (e.g., every 10 minutes).
 */
export async function cleanupOldChats() {
  console.log("[Cleanup] Starting cleanup of old chat history...");
  
  try {
    // 1시간 전 시간 계산
    // PostgreSQL specific interval syntax
    const oneHourAgo = sql`NOW() - INTERVAL '1 hour'`;

    // 1. Find channels inactive for more than 1 hour
    // lastMessageAt이 1시간 전보다 작거나(오래됨), lastMessageAt이 없고 createdAt이 1시간 전보다 작은 경우
    const oldChannels = await db
      .select({ id: chatChannels.id })
      .from(chatChannels)
      .where(
        sql`${chatChannels.lastMessageAt} < ${oneHourAgo} OR (${chatChannels.lastMessageAt} IS NULL AND ${chatChannels.createdAt} < ${oneHourAgo})`
      );

    if (oldChannels.length === 0) {
      console.log("[Cleanup] No old chat channels found.");
      return;
    }

    const channelIds = oldChannels.map((c) => c.id);
    console.log(`[Cleanup] Found ${channelIds.length} old channels to delete: ${channelIds.join(", ")}`);

    // 2. Delete messages belonging to these channels
    const deletedMessages = await db
      .delete(chatMessages)
      .where(inArray(chatMessages.channelId, channelIds))
      .returning({ id: chatMessages.id });
    
    console.log(`[Cleanup] Deleted ${deletedMessages.length} messages.`);

    // 3. Delete the channels
    const deletedChannels = await db
      .delete(chatChannels)
      .where(inArray(chatChannels.id, channelIds))
      .returning({ id: chatChannels.id });

    console.log(`[Cleanup] Deleted ${deletedChannels.length} channels.`);
    console.log("[Cleanup] Cleanup completed successfully.");
  } catch (error) {
    console.error("[Cleanup] Error cleaning up old chats:", error);
  }
}

