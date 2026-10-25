// src/app/api/profile/index+api.ts
import { remoteDb } from "@/db/server";
import { profiles } from "@/db/server/schema/profile-schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // 1. Session verify karein Better Auth ke headers se
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authenticated user ka remote profile fetch karein
    const [remoteProfile] = await remoteDb
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!remoteProfile) {
      return Response.json({ profile: null }, { status: 404 });
    }

    return Response.json({ profile: remoteProfile });
  } catch (error) {
    console.error("[API_PROFILE_GET_ERROR]", error);
    return Response.json(
      { error: "Internal Server Error fetching profile" },
      { status: 500 }
    );
  }
}