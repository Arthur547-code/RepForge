// src/db/client/schema/sync-queue-schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const syncQueue = sqliteTable("sync_queue", {
  // 1. Identification & Idempotency
  id: text("id").primaryKey(), // Mutation/Sync operation UUID (Idempotency key)
  userId: text("user_id").notNull(),

  // 2. Target Entity & Mutation Type
  entity: text("entity", {
    enum: ["profile", "workout", "workout_set", "exercise"],
  }).notNull(),
  operation: text("operation", {
    enum: ["create", "update", "delete"],
  }).notNull(),
  entityId: text("entity_id").notNull(), // Target entity's UUID (e.g. profileId)

  // 3. Serialized Data Payload
  payload: text("payload").notNull(),

  // 4. Lifecycle & Retry Engine Tracking
  status: text("status", {
    enum: ["pending", "processing", "failed"],
  })
    .notNull()
    .default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  lastError: text("last_error"),

  // 5. FIFO Ordering & Timing
  createdAt: integer("created_at", {
    mode: "timestamp_ms",
  }).notNull(),
  nextRetryAt: integer("next_retry_at", {
    mode: "timestamp_ms",
  }).notNull(),
  updatedAt: integer("updated_at", {
    mode: "timestamp_ms",
  }).notNull(),
});

export type SyncQueueRow = typeof syncQueue.$inferSelect;
export type NewSyncQueueRow = typeof syncQueue.$inferInsert;
