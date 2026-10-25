// src/db/client/schema/profile-schema.ts

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),

  userId: text("user_id").notNull().unique(),

  gender: text("gender", {
    enum: ["male", "female", "other", "prefer_not_to_say"],
  }).notNull(),

  experienceLevel: text("experience_level", {
    enum: ["beginner", "intermediate", "advanced"],
  }).notNull(),

  trainingGoal: text("training_goal", {
    enum: ["muscle_gain", "strength", "fat_loss", "general_fitness"],
  }).notNull(),

  weightUnit: text("weight_unit", {
    enum: ["kg", "lb"],
  })
    .notNull()
    .default("kg"),

  onboardingCompletedAt: integer("onboarding_completed_at", {
    mode: "timestamp_ms",
  }),

  createdAt: integer("created_at", {
    mode: "timestamp_ms",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp_ms",
  }).notNull(),
});
