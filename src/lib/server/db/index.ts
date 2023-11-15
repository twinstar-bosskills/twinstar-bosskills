import 'dotenv/config';

import { createClient, type Client } from '@libsql/client';
import { drizzle as libsqlDrizzle } from 'drizzle-orm/libsql';
import { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export const isMysql = () => process.env.DATABASE_DRIVER === 'mysql';
export const isSqlite = () => isMysql() === false;
const makeLibsqlClient = async () => {
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

const makeMysqlClient = async () => {
	const poolConnection = mysql.createPool({
		host: process.env.MARIADB_HOST!,
		user: process.env.MARIADB_USER!,
		password: process.env.MARIADB_PASSWORD!,
		database: process.env.MARIADB_DATABASE!
	});

	return poolConnection;
};

let globalDb: ReturnType<typeof libsqlDrizzle | typeof mysqlDrizzle> | null = null;
export const createConnection = async () => {
	if (globalDb) {
		return globalDb;
	}

	const client = await (isMysql() ? makeMysqlClient() : makeLibsqlClient());
	const database = isMysql() ? mysqlDrizzle(client as mysql.Pool) : libsqlDrizzle(client as Client);
	globalDb = database;

	return globalDb;
};
