// src/app/api/profile/onboarding+api.ts
import { remoteDb } from "@/db/server";
import { profiles } from "@/db/server/schema/profile-schema";
import { profileSchema } from "@/features/profile/schema/profile.schema";
import { auth } from "@/lib/auth/auth"; // Aapka Better Auth server instance
import { z } from "zod";

const serverOnboardingSchema = profileSchema.extend({
  id: z.uuid("Invalid client profile ID"),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session headers/cookies
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Validate payload boundary with Zod
    const body = await request.json();
    const parsed = serverOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.message },
        { status: 400 },
      );
    }

    const { id, gender, experienceLevel, trainingGoal, weightUnit } = parsed.data;
    const now = new Date();

    // 3. Atomic Upsert into Postgres
    await remoteDb
      .insert(profiles)
      .values({
        id,
        userId,
        gender,
        experienceLevel,
        trainingGoal,
        weightUnit,
        onboardingCompletedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          gender,
          experienceLevel,
          trainingGoal,
          weightUnit,
          onboardingCompletedAt: now,
          updatedAt: now,
        },
      });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[API_PROFILE_ONBOARDING_ERROR]", error);
    return Response.json(
      { error: "Internal Server Error persisting profile" },
      { status: 500 },
    );
  }
}