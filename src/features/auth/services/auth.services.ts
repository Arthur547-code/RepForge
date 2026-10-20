// src/features/auth/services/auth.service.ts
import { authClient } from "@/lib/auth/auth-client";
import { SignInInput, SignUpInput } from "../schema/auth.schema";

export const getAuthErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  // 1. If there's no error at all, return the fallback
  if (!error) return fallback;

  // 2. Default empty values for message, code, and status
  let message = "";
  let code = "";
  let status: number | undefined = undefined;

  // 3. Check if 'error' is a real object that we can safely read properties from
  if (typeof error === "object" && error !== null) {
    // Cast it to a record of unknown properties so TypeScript lets us check keys safely
    const errObj = error as Record<string, unknown>;

    // Pull out the message if it exists and is a string
    if (typeof errObj.message === "string") {
      message = errObj.message;
    }

    // Pull out the code if it exists and is a string
    if (typeof errObj.code === "string") {
      code = errObj.code;
    }

    // Pull out the status if it exists and is a number
    if (typeof errObj.status === "number") {
      status = errObj.status;
    }
  }

  // 4. Your original logic now works perfectly and safely!
  if (
    message.includes("Network request failed") ||
    message.includes("timeout")
  ) {
    return "Connection failed. Please check your internet.";
  }

  if (code === "INVALID_EMAIL_OR_PASSWORD" || status === 401) {
    return "Invalid email or password.";
  }

  if (code === "USER_ALREADY_EXISTS") {
    return "This email is already registered.";
  }

  return message || fallback;
};

export const authService = {
  async signUp(data: SignUpInput) {
    const res = await authClient.signUp.email(data);
    if (res.error) {
      throw new Error(getAuthErrorMessage(res.error, "Failed to sign up"));
    }
    return res.data;
  },

  async signIn(data: SignInInput) {
    const res = await authClient.signIn.email(data);
    if (res.error) {
      throw new Error(
        getAuthErrorMessage(res.error, "Invalid email or password"),
      );
    }
    return res.data;
  },

  async signOut() {
    const res = await authClient.signOut();
    if (res.error) {
      throw new Error(getAuthErrorMessage(res.error, "Failed to sign out"));
    }
    return res.data;
  },

  async getSession() {
    const res = await authClient.getSession();
    if (res.error) {
      throw new Error(getAuthErrorMessage(res.error, "Failed to get session"));
    }
    return res.data;
  },

  async socialSignIn(provider: "google" | "apple" = "google") {
    const res = await authClient.signIn.social({
      provider,
      callbackURL: "repforge://", // 👈 Deep link scheme to bring user back to mobile app
    });
    if (res.error) {
      throw new Error(
        getAuthErrorMessage(res.error, `Failed to sign in with ${provider}`),
      );
    }
    return res.data;
  },
};
