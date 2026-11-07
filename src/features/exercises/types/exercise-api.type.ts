// src\features\exercises\types\exercise-api.type.ts

export type ExerciseApiItem = {
  id: string;
  sourceId: string | null;
  name: string;
  category: "strength" | "powerlifting" | "olympic weightlifting";
  force: "push" | "pull" | "static" | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  mechanic: "compound" | "isolation" | null;
  equipment:
    | "barbell"
    | "dumbbell"
    | "cable"
    | "machine"
    | "kettlebell"
    | "bodyweight"
    | "band"
    | "plate"
    | "smith_machine"
    | "ez_bar"
    | "other"
    | null;
  primaryMuscle: string | null;
  secondaryMuscles: string[] | null;
  instructions: string[] | null;
  images: string[] | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExerciseListResponse = {
  exercises: ExerciseApiItem[];
};
