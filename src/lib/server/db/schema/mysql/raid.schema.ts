import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const raidTable = bosskills.table('raid', {
	id: int('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const raidRelations = relations(raidTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
