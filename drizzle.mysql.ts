import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
	out: './migrations_mysql',
	schema: './src/lib/server/db/schema/mysql',
	breakpoints: true,
	dbCredentials: {
		host: process.env.MARIADB_HOST!,
		user: process.env.MARIADB_USER!,
		password: process.env.MARIADB_PASSWORD!,
		port: Number(process.env.MARIADB_PORT ?? 3306),
		database: 'bosskills'
	}
} satisfies Config;
