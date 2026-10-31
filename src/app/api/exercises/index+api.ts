// src/app/api/exercises/index+api.ts
import { remoteDb } from "@/db/server";
import { exercises, ServerExercise } from "@/db/server/schema/exercise-schema";
import { auth } from "@/lib/auth/auth";
import { or, eq, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Global exercises (userId is null) + User ki custom exercises
    const exerciseList: ServerExercise[] = await remoteDb
      .select()
      .from(exercises)
      .where(
        or(
          isNull(exercises.userId),
          eq(exercises.userId, session.user.id)
        )
      );

    return Response.json({ exercises: exerciseList });
  } catch (error) {
    console.error("[API_EXERCISES_GET_ERROR]", error);
    return Response.json(
      { error: "Failed to fetch exercise library" },
      { status: 500 }
    );
  }
}