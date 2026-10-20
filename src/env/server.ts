import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(1),

  DATABASE_URL: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),

  GOOGLE_CLIENT_SECRET: z.string().min(1),

  // ImageKit is not used by the auth API yet, so keep it optional until image
  // upload functionality is added.
  IMAGEKIT_PRIVATE_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const serverEnv = serverEnvSchema.parse({
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

  DATABASE_URL: process.env.DATABASE_URL,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,

  NODE_ENV: process.env.NODE_ENV,
});
