import { migrate as libsqlMigrate } from 'drizzle-orm/libsql/migrator';
import { createConnection } from '../db/index';

console.log('migrate - start');
const db = await createConnection();
try {
	await libsqlMigrate(db, { migrationsFolder: 'migrations' });
	if (process.env.DATABASE_DRIVER) console.log('migrate - ok');
	process.exit(0);
} catch (e) {
	console.log('migrate - err');
	console.error(e);
	process.exit(1);
}
