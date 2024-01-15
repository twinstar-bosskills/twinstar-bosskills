import 'dotenv/config';

import { createClient, type Client } from '@libsql/client';
import { drizzle as libsqlDrizzle } from 'drizzle-orm/libsql';
import { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export const isMysql = () => process.env.DATABASE_DRIVER === 'mysql';
export const isSqlite = () => isMysql() === false;
export type LibSQLClient = Client;
const makeLibSQLClient = async (): Promise<LibSQLClient> => {
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

export type MysqlClient = mysql.Pool;
const makeMysqlClient = async (): Promise<MysqlClient> => {
	const poolConnection = mysql.createPool({
		host: process.env.MARIADB_HOST!,
		user: process.env.MARIADB_USER!,
		password: process.env.MARIADB_PASSWORD!,
		database: process.env.MARIADB_DATABASE!
	});

	return poolConnection;
};

// using mysql for now
// let globalDb: ReturnType<typeof libsqlDrizzle | typeof mysqlDrizzle> | null = null;
let globalDb: ReturnType<typeof mysqlDrizzle> | null = null;
export const createConnection = async () => {
	if (globalDb) {
		return globalDb;
	}

	// const client = await (isMysql() ? makeMysqlClient() : makeLibSQLClient());
	// const database = await (isMysql()
	// 	? createMysqlConnection(client as MysqlClient)
	// 	: createSQLiteConnection(client as LibSQLClient));
	const database = await createMysqlConnection();
	globalDb = database;

	return globalDb!;
};
export const createSQLiteConnection = async (client?: LibSQLClient) =>
	libsqlDrizzle(client ?? (await makeLibSQLClient()));
export const createMysqlConnection = async (client?: MysqlClient) =>
	mysqlDrizzle(client ?? (await makeMysqlClient()));
