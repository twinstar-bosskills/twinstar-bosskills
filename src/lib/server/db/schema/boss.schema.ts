import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const bossTable = sqliteTable('boss', {
	id: integer('id').primaryKey(),
	remoteId: integer('remote_id').notNull().unique(),
	name: text('name').notNull()
});

export const bossRelations = relations(bossTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
