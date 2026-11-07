// src/features/exercises/repositories/exercise.repository.ts
import { localDb } from "@/db/client";
import { exercises, LocalExercise } from "@/db/client/schema/exercise-schema";
import { and, asc, eq, like, or, sql } from "drizzle-orm";

export interface ExerciseQueryFilters {
  search?: string;
  muscle?: string;
  limit: number;
  offset: number;
}

export const exerciseRepository = {
  async findMany({
    search = "",
    muscle = "all",
    limit,
    offset,
  }: ExerciseQueryFilters): Promise<LocalExercise[]> {
    const conditions = [];

    // Filter by muscle if not 'all'
    if (muscle && muscle.toLowerCase() !== "all") {
      conditions.push(eq(exercises.primaryMuscle, muscle.toLowerCase()));
    }

    // Multi-field search
    const cleanSearch = search.trim();
    if (cleanSearch.length > 0) {
      const searchPattern = `%${cleanSearch}%`;
      conditions.push(
        or(
          like(exercises.name, searchPattern),
          like(exercises.primaryMuscle, searchPattern),
          like(exercises.equipment, searchPattern),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return localDb
      .select()
      .from(exercises)
      .where(whereClause)
      .orderBy(asc(exercises.name))
      .limit(limit)
      .offset(offset);
  },

  async findDistinctMuscles(): Promise<string[]> {
    const results = await localDb
      .selectDistinct({ primaryMuscle: exercises.primaryMuscle })
      .from(exercises)
      .where(sql`${exercises.primaryMuscle} IS NOT NULL`)
      .orderBy(asc(exercises.primaryMuscle));

    return results
      .map((r) => r.primaryMuscle)
      .filter((m): m is string => Boolean(m));
  },
};
