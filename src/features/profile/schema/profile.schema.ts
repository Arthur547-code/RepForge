// src/features/profile/schema/profile.schema.ts

import { z } from "zod";

export const GENDER_VALUES = [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
] as const;
export const EXPERIENCE_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export const TRAINING_VALUES = [
  "muscle_gain",
  "strength",
  "fat_loss",
  "general_fitness",
] as const;
export const WEIGHT_VALUES = ["kg", "lb"] as const;

export const profileSchema = z.object({
  gender: z.enum(GENDER_VALUES, {
    error: "Please select your gender",
  }),
  experienceLevel: z.enum(EXPERIENCE_VALUES, {
    error: "Please select your experience level",
  }),
  trainingGoal: z.enum(TRAINING_VALUES, {
    error: "Please select your training goal",
  }),
  weightUnit: z.enum(WEIGHT_VALUES, {
    error: "Please select your preferred weight unit",
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
