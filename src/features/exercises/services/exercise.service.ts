// src/features/exercises/services/exercise.service.ts
import { localDb } from "@/db/client";
import { sql } from "drizzle-orm";
import {
  exercises,
  LocalExercise,
  NewLocalExercise,
} from "@/db/client/schema/exercise-schema";
import { authClient } from "@/lib/auth/auth-client";
import { clientEnv } from "@/env/client";
import { ExerciseListResponse } from "../types/exercise-api.type";
import { exerciseRepository } from "../repositories/exercise.repository";

const BASE_URL = clientEnv.EXPO_PUBLIC_API_URL;

export interface ParsedExercise extends Omit<
  LocalExercise,
  "images" | "secondaryMuscles" | "instructions"
> {
  images: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function transformExercise(row: LocalExercise): ParsedExercise {
  return {
    ...row,
    images: parseJsonArray(row.images),
    secondaryMuscles: parseJsonArray(row.secondaryMuscles),
    instructions: parseJsonArray(row.instructions),
  };
}

export const exerciseService = {
  async syncExercisesToLocal(): Promise<void> {
    try {
      const response = await authClient.$fetch<ExerciseListResponse>(
        `${BASE_URL}/api/exercises`,
      );

      if (!response.data?.exercises || response.data.exercises.length === 0) {
        return;
      }

      const remoteList = response.data.exercises;

      // PostgreSQL array format ko SQLite ke compatible JSON text string me map karein
      const localRecords: NewLocalExercise[] = remoteList.map((item) => ({
        id: item.id,
        sourceId: item.sourceId,
        name: item.name,
        category: item.category,
        force: item.force,
        level: item.level,
        mechanic: item.mechanic,
        equipment: item.equipment,
        primaryMuscle: item.primaryMuscle,
        secondaryMuscles: item.secondaryMuscles
          ? JSON.stringify(item.secondaryMuscles)
          : null,
        instructions: item.instructions
          ? JSON.stringify(item.instructions)
          : null,
        images: item.images ? JSON.stringify(item.images) : null,
        userId: item.userId,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));

      // Chunks of 100 for SQLite batch insert
      const chunkSize = 100;
      for (let i = 0; i < localRecords.length; i += chunkSize) {
        const chunk = localRecords.slice(i, i + chunkSize);
        await localDb
          .insert(exercises)
          .values(chunk)
          .onConflictDoUpdate({
            target: exercises.id,
            set: {
              name: sql`excluded.name`,
              category: sql`excluded.category`,
              force: sql`excluded.force`,
              level: sql`excluded.level`,
              mechanic: sql`excluded.mechanic`,
              equipment: sql`excluded.equipment`,
              primaryMuscle: sql`excluded.primary_muscle`,
              secondaryMuscles: sql`excluded.secondary_muscles`,
              instructions: sql`excluded.instructions`,
              images: sql`excluded.images`,
              updatedAt: sql`excluded.updated_at`,
            },
          });
      }

      console.log(`Synced ${localRecords.length} exercises into SQLite.`);
    } catch (error) {
      console.warn(
        "Exercise synchronization failed (offline or network error):",
        error,
      );
    }
  },

  async getPaginatedExercises(params: {
    search?: string;
    muscle?: string;
    page: number;
    pageSize: number;
  }): Promise<ParsedExercise[]> {
    const offset = params.page * params.pageSize;
    const rawList = await exerciseRepository.findMany({
      search: params.search,
      muscle: params.muscle,
      limit: params.pageSize,
      offset,
    });

    return rawList.map(transformExercise);
  },

  async getAvailableMuscleFilters(): Promise<string[]> {
    const muscles = await exerciseRepository.findDistinctMuscles();
    return ["all", ...muscles];
  },
};
