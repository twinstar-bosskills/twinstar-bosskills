import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const realmTable = bosskills.table('realm', {
	id: int('id').primaryKey().autoincrement(),
	// remoteId: int('remote_id').unique(),
	name: text('name').notNull().unique()
});

export const raidRelations = relations(realmTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
