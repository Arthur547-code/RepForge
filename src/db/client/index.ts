import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema/schema';

const expoSqlite = openDatabaseSync('repforge.db', { enableChangeListener: true });
export const localDb = drizzle(expoSqlite, { schema });
