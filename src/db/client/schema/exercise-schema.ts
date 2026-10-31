// src/db/client/schema/exercise-schema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const exercises = sqliteTable("exercises", {
  // RepForge unique UUID (matching server DB id)
  id: text("id").primaryKey(),

  // Original ID from external source (e.g. "Barbell_Bench_Press")
  sourceId: text("source_id").unique(),

  name: text("name").notNull(),

  category: text("category", {
    enum: ["strength", "powerlifting", "olympic weightlifting"],
  }).notNull(),

  force: text("force", {
    enum: ["push", "pull", "static"],
  }),

  level: text("level", {
    enum: ["beginner", "intermediate", "advanced"],
  }),

  mechanic: text("mechanic", {
    enum: ["compound", "isolation"],
  }),

  equipment: text("equipment", {
    enum: [
      "barbell",
      "dumbbell",
      "cable",
      "machine",
      "kettlebell",
      "bodyweight",
      "band",
      "plate",
      "smith_machine",
      "ez_bar",
      "other",
    ],
  }),

  primaryMuscle: text("primary_muscle"),

  // SQLite me array fields ko JSON string format me store kiya jata hai
  secondaryMuscles: text("secondary_muscles"), // JSON: string[] | null
  instructions: text("instructions"), // JSON: string[] | null
  images: text("images"), // JSON: string[] | null

  // NULL -> Global System Exercise, userId -> Custom Exercise
  userId: text("user_id"),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export type LocalExercise = typeof exercises.$inferSelect;
export type NewLocalExercise = typeof exercises.$inferInsert;