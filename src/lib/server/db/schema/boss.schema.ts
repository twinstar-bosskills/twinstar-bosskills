import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const bossTable = sqliteTable('boss', {
	id: integer('id').primaryKey(),
	entry: integer('entry').unique(),
	name: text('name')
});
