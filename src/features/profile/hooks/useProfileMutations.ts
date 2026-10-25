// src/features/profile/hooks/useProfileMutations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import { ProfileInput } from "../schema/profile.schema";

export const PROFILE_KEY = "profile" as const;

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: [PROFILE_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;

      // 1. Immediate local read
      const local = await profileService.getByUserId(userId);

      // 2. Background check / fallback hydration
      // Agar local nahi hai toh wait karein, agar hai toh silent update trigger karein
      if (!local) {
        return await profileService.rehydrateProfileFromServer();
      }

      // Background reconciliation: doosre device ke updates sync karein bina UI roke
      profileService.rehydrateProfileFromServer().catch((e) => {
        console.log(`Profile Rehydration Failed ${e}`);
      });

      return local;
    },
    enabled: !!userId,
  });
}

export function useCompleteOnboarding(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileInput) =>
      profileService.completeOnboarding(userId, data),
    onSuccess: (updatedProfile) => {
      // ✅ Key exact match: [PROFILE_KEY, userId]
      queryClient.setQueryData([PROFILE_KEY, userId], updatedProfile);
    },
  });
}
