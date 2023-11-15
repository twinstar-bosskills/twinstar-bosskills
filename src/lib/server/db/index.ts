import 'dotenv/config';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const makeClient = async () => {
	const instance = createClient({
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN
	});
	try {
		await instance.execute('PRAGMA journal_mode=WAL');
	} catch (e) {
		console.error(e);
	}
	return instance;
};

let globalDb: ReturnType<typeof drizzle> | null = null;
export const createConnection = async () => {
	if (globalDb) {
		return globalDb;
	}

	const client = await makeClient();
	const database = drizzle(client);
	globalDb = database;

	return globalDb;
};

// import Database from 'better-sqlite3';
// import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
// import { drizzle } from 'drizzle-orm/better-sqlite3';

// const sqlite = new Database(process.env.DATABASE_FILE!);
// export const db: BetterSQLite3Database = drizzle(sqlite);
