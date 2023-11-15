import { migrate } from 'drizzle-orm/libsql/migrator';
import { createConnection } from '../db/index';

console.log('migrate - start');
const db = await createConnection();
try {
	await migrate(db, { migrationsFolder: 'migrations' });
	console.log('migrate - ok');
	process.exit(0);
} catch (e) {
	console.log('migrate - err');
	console.error(e);
	process.exit(1);
}
