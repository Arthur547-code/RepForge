import { z } from "zod";

const clientEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});