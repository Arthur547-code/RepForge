// src\lib\auth\auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { remoteDb } from "@/db/server";
import { serverEnv } from "@/env/server";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  database: drizzleAdapter(remoteDb, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
    // later we add apple sign-in support, but for now we will leave it commented out
    // apple: {
    //   clientId: serverEnv.APPLE_CLIENT_ID,
    //   clientSecret: serverEnv.APPLE_CLIENT_SECRET,
    // },
  },
  // Mobile app deep link redirects ke liye

  plugins: [expo()],

  trustedOrigins: [
    "repforge://",

    ...(serverEnv.NODE_ENV === "development"
      ? [
          "exp://", // Trust any host of the exp:// scheme
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
});

export type Auth = typeof auth;
