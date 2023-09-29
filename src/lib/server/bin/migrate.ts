import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '../db/index';

console.log('migrate - start');
migrate(db, { migrationsFolder: 'migrations' })
	.then(() => {
		console.log('migrate - ok');
		process.exit(0);
	})
	.catch((e) => {
		console.log('migrate - err');
		console.error(e);
		process.exit(1);
	});
