// src\features\profile\service\profile.service.ts
import * as Crypto from "expo-crypto";
import { eq } from "drizzle-orm";
import { localDb } from "@/db/client";
import { profiles } from "@/db/client/schema/profile-schema";
import { ProfileInput } from "../schema/profile.schema";
import { authClient } from "@/lib/auth/auth-client";
import { clientEnv } from "@/env/client";
import { syncQueueRepository } from "@/sync/queue/sync-queue.repository";
import { syncEngine } from "@/sync/sync-engine/sync-engine";
import { ServerProfileResponse } from "../types/profile.type";

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
    const existingProfile = await this.getByUserId(userId);
    const profileId = Crypto.randomUUID();
    const now = new Date();

    console.log("completeOnboarding Method Started.");

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
        target: profiles.userId,
        set: {
          ...data,
          onboardingCompletedAt: now,
          updatedAt: now,
        },
      })
      .returning()
      .get();

    console.log(`Saved to Local Db __ ${localProfile}`);

    // 2. Put into Persistent SQLite Sync Queue
    await syncQueueRepository.enqueue({
      userId,
      entity: "profile",
      operation: existingProfile ? "update" : "create",
      entityId: localProfile.id,
      payload: {
        id: localProfile.id,
        gender: data.gender,
        experienceLevel: data.experienceLevel,
        trainingGoal: data.trainingGoal,
        weightUnit: data.weightUnit,
      },
    });

    console.log(`Send to syncQueueRepository.enqueue.`);

    // 3. Fire-and-forget: Sync Engine ko kick karein
    // Agar internet hai toh turant chala jayega, nahi hai toh queue me safe rahega
    syncEngine.sync().catch((err) => {
      console.warn("Background sync failed to start:", err);
    });

    console.log(`syncEngine.sync() started.`);

    return localProfile;
  },

  async rehydrateProfileFromServer() {
    try {
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
