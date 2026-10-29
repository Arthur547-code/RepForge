export type ServerProfileResponse = {
  profile: {
    id: string;
    userId: string;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
    experienceLevel: "beginner" | "intermediate" | "advanced";
    trainingGoal: "muscle_gain" | "strength" | "fat_loss" | "general_fitness";
    weightUnit: "kg" | "lb";
    onboardingCompletedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};
