import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/schema';
import { serverEnv } from '@/env/server';

const sqlClient = neon(serverEnv.DATABASE_URL!);
export const remoteDb = drizzle({ client: sqlClient, schema });
