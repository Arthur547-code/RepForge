// src/db/server/schema/profile-schema.ts

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const trainingGoalEnum = pgEnum("training_goal", [
  "muscle_gain",
  "strength",
  "fat_loss",
  "general_fitness",
]);

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "lb"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  gender: genderEnum("gender").notNull(),

  experienceLevel: experienceLevelEnum("experience_level").notNull(),

  trainingGoal: trainingGoalEnum("training_goal").notNull(),

  weightUnit: weightUnitEnum("weight_unit").notNull().default("kg"),

  onboardingCompletedAt: timestamp("onboarding_completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// profile-schema.ts

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(user, {
    fields: [profiles.userId],
    references: [user.id],
  }),
}));