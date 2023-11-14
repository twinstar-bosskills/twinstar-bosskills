import 'dotenv/config';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
const client = createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_AUTH_TOKEN
});
export const db = drizzle(client);

// import Database from 'better-sqlite3';
// import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
// import { drizzle } from 'drizzle-orm/better-sqlite3';

// const sqlite = new Database(process.env.DATABASE_FILE!);
// export const db: BetterSQLite3Database = drizzle(sqlite);
