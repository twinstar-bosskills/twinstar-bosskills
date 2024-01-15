import { migrate as libsqlMigrate } from 'drizzle-orm/libsql/migrator';
import { createSQLiteConnection } from '../db/index';

console.log('migrate - start');
const db = await createSQLiteConnection();
try {
	await libsqlMigrate(db, { migrationsFolder: 'migrations_sqlite' });
	if (process.env.DATABASE_DRIVER) console.log('migrate - ok');
	process.exit(0);
} catch (e) {
	console.log('migrate - err');
	console.error(e);
	process.exit(1);
}
