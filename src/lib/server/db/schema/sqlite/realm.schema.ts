import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const realmTable = sqliteTable('realm', {
	id: integer('id').primaryKey(),
	// remoteId: integer('remote_id').unique(),
	name: text('name').notNull().unique(),
	expansion: integer('expansion').notNull()
});

export const raidRelations = relations(realmTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
