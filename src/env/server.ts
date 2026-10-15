import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(1),

  DATABASE_URL: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),

  GOOGLE_CLIENT_SECRET: z.string().min(1),

  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
});

export const serverEnv = serverEnvSchema.parse({
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

  DATABASE_URL: process.env.DATABASE_URL,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
});
