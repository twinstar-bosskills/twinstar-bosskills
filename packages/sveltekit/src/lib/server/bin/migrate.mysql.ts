import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createMysqlConnection } from '../db/index';

console.log('migrate - start');
const db = await createMysqlConnection();
try {
	await migrate(db, { migrationsFolder: 'migrations_mysql' });
	if (process.env.DATABASE_DRIVER) console.log('migrate - ok');
	process.exit(0);
} catch (e) {
	console.log('migrate - err');
	console.error(e);
	process.exit(1);
}
