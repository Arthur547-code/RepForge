import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';

loadEnvFile(".env");

export default defineConfig({
  out: './drizzle/server',
  schema: './src/db/server/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});




