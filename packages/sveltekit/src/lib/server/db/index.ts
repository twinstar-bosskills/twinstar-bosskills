import 'dotenv/config';

import { drizzle as mysqlDrizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export const isMysql = () => process.env.DATABASE_DRIVER === 'mysql';

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

export type DbConnection = NonNullable<typeof globalDb>;
let globalDb: ReturnType<typeof mysqlDrizzle> | null = null;
export const createConnection = async () => {
	if (globalDb) {
		return globalDb;
	}
	const database = await createMysqlConnection();
	globalDb = database;

	return globalDb!;
};
export const createMysqlConnection = async (client?: MysqlClient) =>
	mysqlDrizzle(client ?? (await makeMysqlClient()));
