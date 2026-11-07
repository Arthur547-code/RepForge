// src/features/app/services/app-initialization.service.ts

import { localDb } from "@/db/client";
import { exercises } from "@/db/client/schema/exercise-schema";
import { exerciseSyncService } from "@/features/exercises/services/exercise.service";

export const appInitializationService = {
  async initialize() {
    const hasExercises = await localDb
      .select({ id: exercises.id })
      .from(exercises)
      .limit(1);

    if (hasExercises.length > 0) {
      return;
    }

    console.log("HasExercises ->" , hasExercises)

    await exerciseSyncService.syncExercisesToLocal();

    console.log("Sync Exercises Completed.")

    // future:
    // await syncPendingMutations();
    // await hydrateOtherData();
  },
};