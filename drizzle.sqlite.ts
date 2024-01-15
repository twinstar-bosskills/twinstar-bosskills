import type { Config } from 'drizzle-kit';

export default {
	out: './migrations_sqlite',
	schema: './src/lib/server/db/schema/sqlite',
	breakpoints: true
} satisfies Config;
