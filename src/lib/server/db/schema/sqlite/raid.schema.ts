import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const raidTable = sqliteTable('raid', {
	id: integer('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const raidRelations = relations(raidTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
