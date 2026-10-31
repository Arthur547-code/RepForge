// src/db/server/schema/exercise-schema.ts

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "strength",
  "powerlifting",
  "olympic weightlifting",
]);

export const exerciseForceEnum = pgEnum("exercise_force", [
  "push",
  "pull",
  "static",
]);

export const exerciseLevelEnum = pgEnum("exercise_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const exerciseMechanicEnum = pgEnum("exercise_mechanic", [
  "compound",
  "isolation",
]);

export const exerciseEquipmentEnum = pgEnum("exercise_equipment", [
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
]);

/* -------------------------------------------------------------------------- */
/* Exercises                                                                  */
/* -------------------------------------------------------------------------- */

export const exercises = pgTable("exercises", {
  // RepForge's own unique ID
  id: uuid("id").primaryKey(), // Original ID from the external dataset

  sourceId: text("source_id").unique(),

  name: text("name").notNull(),

  category: exerciseCategoryEnum("category").notNull(),

  force: exerciseForceEnum("force"),

  level: exerciseLevelEnum("level"),

  mechanic: exerciseMechanicEnum("mechanic"),

  equipment: exerciseEquipmentEnum("equipment"), // Can be NULL if the source doesn't provide a primary muscle

  primaryMuscle: text("primary_muscle"), // Can be NULL if the source doesn't provide secondary muscles

  secondaryMuscles: text("secondary_muscles").array(), // Can be NULL if the source doesn't provide instructions

  instructions: text("instructions").array(), // Can be NULL if the exercise has no images

  images: text("images").array() /*
   * NULL  → global RepForge exercise
   * userId → custom exercise owned by a user
   */,

  userId: text("user_id"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ServerExercise = typeof exercises.$inferSelect;
export type NewServerExercise = typeof exercises.$inferInsert;
