import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const raidTable = sqliteTable('raid', {
	id: integer('id').primaryKey(),
	name: text('name').unique()
});
