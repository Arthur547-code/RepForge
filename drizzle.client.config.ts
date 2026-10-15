import { defineConfig } from "drizzle-kit";
// import { loadEnvFile } from "node:process";

// loadEnvFile(".env");

export default defineConfig({
  schema: "./src/db/client/schema/schema.ts",
  out: "./drizzle/client",
  dialect: "sqlite",
  driver: "expo",  // 🌟 Essential for React Native/Expo builds
});
