// src/features/auth/hooks/useAuthMutations.ts
import { useMutation } from "@tanstack/react-query";

import { SignInInput, SignUpInput } from "../schema/auth.schema";
import { authService } from "../services/auth.services";

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (data: SignUpInput) => authService.signUp(data),
  });
}

export function useSignInMutation() {
  return useMutation({
    mutationFn: (data: SignInInput) => authService.signIn(data),
  });
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: () => authService.signOut(),
  });
}

export function useSocialSignInMutation() {
  return useMutation({
    mutationFn: (provider: "google" | "apple" = "google") =>
      authService.socialSignIn(provider),
  });
}
