// src/sync/queue/sync-queue.repository.ts
import { and, asc, eq, lte } from "drizzle-orm";
import * as Crypto from "expo-crypto";
import { localDb } from "@/db/client";
import { syncQueue, SyncQueueRow } from "@/db/client/schema/sync-queue-schema";

export interface EnqueueParams {
  userId: string;
  entity: "profile" | "workout" | "workout_set" | "exercise";
  operation: "create" | "update" | "delete";
  entityId: string;
  payload: Record<string, unknown>;
}

const MAX_ATTEMPTS = 5;
const BACKOFF_DELAYS_MS = [1000, 5000, 15000, 30000, 60000];
const DEFAULT_STALE_PROCESSING_MS = 5 * 60 * 1000; // 5 minutes

export const syncQueueRepository = {
  /**
   * 1. Nayi mutation ko queue me insert karta hai
   */
  // syncQueueRepository के अंदर enqueue मेथड को इस तरह बदलें:
async enqueue(params: EnqueueParams, tx?: any): Promise<SyncQueueRow> {
    const now = new Date();
    const id = Crypto.randomUUID();

    // 🟢 यहाँ चेक करें: अगर बाहर से 'tx' पास हुआ है तो उसका उपयोग करें, नहीं तो 'localDb' यूज़ करें
    const dbClient = tx ?? localDb;

    const [inserted] = await dbClient
      .insert(syncQueue)
      .values({
        id,
        userId: params.userId,
        entity: params.entity,
        operation: params.operation,
        entityId: params.entityId,
        payload: JSON.stringify(params.payload),
        status: "pending",
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS,
        createdAt: now,
        nextRetryAt: now, // Turant eligible for processing
        updatedAt: now,
      })
      .returning();

    return inserted;
  },


  /**
   * 2. Processing ke liye pending rows fetch karta hai (FIFO + Due Retry Time)
   */
  async getNextPendingBatch(
    userId: string,
    limit = 10,
  ): Promise<SyncQueueRow[]> {
    const now = new Date();

    return await localDb
      .select()
      .from(syncQueue)
      .where(
        and(
          eq(syncQueue.status, "pending"),
          eq(syncQueue.userId, userId),
          lte(syncQueue.nextRetryAt, now), // Sirf wahi jo retry ke liye eligible hain
        ),
      )
      .orderBy(asc(syncQueue.createdAt)) // FIFO guarantee
      .limit(limit);
  },

  /**
  App crash ya internet jaane ke kaaran 5 minutes se zyada time se 'processing' mein atke hue sync operations ko dobara 'pending' mein daalkar restart karta hai.

  Interrupted sync attempts ko recover karta hai taaki user ka offline gym data kabhi loss na ho.
*/

  async recoverStaleProcessing(
    userId: string,
    staleAfterMs = DEFAULT_STALE_PROCESSING_MS,
  ): Promise<void> {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - staleAfterMs);

    await localDb
      .update(syncQueue)
      .set({
        status: "pending",
        nextRetryAt: now,
        updatedAt: now,
        lastError: "Recovered after an interrupted sync attempt",
      })
      .where(
        and(
          eq(syncQueue.userId, userId),
          eq(syncQueue.status, "processing"),
          lte(syncQueue.updatedAt, staleBefore),
        ),
      );
  },

  /**
   * 3. Worker process shuru karne se pehle lock karta hai
   */
  async markProcessing(id: string): Promise<void> {
    await localDb
      .update(syncQueue)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(syncQueue.id, id));
  },

  /**
   * 4. Mutation server par kamiyab hone par queue se delete karta hai
   */
  async markCompleted(id: string): Promise<void> {
    await localDb.delete(syncQueue).where(eq(syncQueue.id, id));
  },

  /**
   * 5. Failure hone par backoff calculate karta hai aur retry schedule karta hai
   */
  async markFailed(item: SyncQueueRow, errorMessage: string): Promise<void> {
    const nextAttempts = item.attempts + 1;
    const now = Date.now();

    // Exponential Backoff Intervals: 1s, 5s, 15s, 30s, 60s
    const delay =
      BACKOFF_DELAYS_MS[
        Math.min(nextAttempts - 1, BACKOFF_DELAYS_MS.length - 1)
      ];

    const isTerminal = nextAttempts >= item.maxAttempts;

    await localDb
      .update(syncQueue)
      .set({
        // Agar max attempts cross ho gaye toh 'failed' chhod dein, warna wapas 'pending' karein
        status: isTerminal ? "failed" : "pending",
        attempts: nextAttempts,
        lastError: errorMessage,
        nextRetryAt: new Date(now + delay),
        updatedAt: new Date(),
      })
      .where(
        and(eq(syncQueue.id, item.id), eq(syncQueue.status, "processing")),
      );
  },

  /**
   * 6. User logout hone par queue clean karne ke liye helper
   */
  /**
   * We don't need this method because if user logout before we sync there data syncQueue become empty and background sync will not work and we will also lost data.  
   */
  /**
   * // WARNING: Is method ko direct logout par mat chalana, pehle check karna ki data server par sync ho gaya ho, nahi to user ka workout data loss ho jayega.
   */
  async clearForUser(userId: string): Promise<void> {
    await localDb.delete(syncQueue).where(eq(syncQueue.userId, userId));
  },

  /**
   * 7. Saari failed mutations ko wapas 'pending' me shift karta hai
   * aur attempts count reset karta hai.
   */
  async resetFailedItems(userId: string): Promise<void> {
    const now = new Date();
    await localDb
      .update(syncQueue)
      .set({
        status: "pending",
        attempts: 0,
        nextRetryAt: now, // Turant retry ke liye ready
        updatedAt: now,
      })
      .where(and(eq(syncQueue.userId, userId), eq(syncQueue.status, "failed")));
  },
};
