import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const bossTable = sqliteTable('boss', {
	id: integer('id').primaryKey(),
	remoteId: integer('remote_id').unique(),
	name: text('name')
});

export const bossRelations = relations(bossTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
