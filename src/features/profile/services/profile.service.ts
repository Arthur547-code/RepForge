// src\features\profile\service\profile.service.ts
import * as Crypto from "expo-crypto";
import { eq } from "drizzle-orm";
import { localDb } from "@/db/client";
import { profiles } from "@/db/client/schema/profile-schema";
import { ProfileInput } from "../schema/profile.schema";
import { authClient } from "@/lib/auth/auth-client";
import { clientEnv } from "@/env/client";

const BASE_URL = clientEnv.EXPO_PUBLIC_API_URL;

export const profileService = {
  async getByUserId(userId: string) {
    const result = await localDb
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  },

  async completeOnboarding(userId: string, data: ProfileInput) {
    const profileId = Crypto.randomUUID();
    const now = new Date();

    // 1. Local SQLite Persistence (Single Atomic Query)
    const localProfile = await localDb
      .insert(profiles)
      .values({
        id: profileId,
        userId,
        ...data,
        onboardingCompletedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: profiles.userId, // Explicit target for SQLite
        set: {
          ...data,
          onboardingCompletedAt: now,
          updatedAt: now,
        },
      })
      .returning()
      .get();

    // 2. Send to Remote Backend (Postgres) via Better Auth $fetch
    try {
      const response = await authClient.$fetch(
        `${BASE_URL}/api/profile/onboarding`,
        {
          method: "POST",
          body: {
            id: localProfile.id,
            gender: data.gender,
            experienceLevel: data.experienceLevel,
            trainingGoal: data.trainingGoal,
            weightUnit: data.weightUnit,
          },
        },
      );

      if (response.error) {
        console.warn(
          `Server profile sync failed (${response.error.status}), local SQLite is updated.`,
          response.error.message,
          response.error.statusText,
        );
      }
    } catch (networkError) {
      console.warn(
        "Offline: Remote sync skipped until reconnection.",
        networkError,
      );
    }

    return localProfile;
  },

  async rehydrateProfileFromServer() {
    try {
      type ServerProfileResponse = {
        profile: {
          id: string;
          userId: string;
          gender: "male" | "female" | "other" | "prefer_not_to_say";
          experienceLevel: "beginner" | "intermediate" | "advanced";
          trainingGoal:
            | "muscle_gain"
            | "strength"
            | "fat_loss"
            | "general_fitness";
          weightUnit: "kg" | "lb";
          onboardingCompletedAt: string | null;
          createdAt: string;
          updatedAt: string;
        } | null;
      };

      const response = await authClient.$fetch<ServerProfileResponse>(
        `${BASE_URL}/api/profile`,
      );

      if (response?.data?.profile) {
        console.log("Response is.");
        const p = response.data.profile;

        const formattedProfile = {
          ...p,
          onboardingCompletedAt: p.onboardingCompletedAt
            ? new Date(p.onboardingCompletedAt)
            : null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        };

        console.log(formattedProfile);

        await localDb
          .insert(profiles)
          .values(formattedProfile)
          .onConflictDoUpdate({
            target: profiles.userId,
            set: formattedProfile,
          });

        console.log("Profile Rehydrated.");

        return formattedProfile;
      }
    } catch (e) {
      console.warn("Profile rehydration failed or offline:", e);
    }
    return null;
  },
};
