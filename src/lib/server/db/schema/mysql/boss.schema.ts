import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const bossTable = bosskills.table('boss', {
	id: int('id').primaryKey(),
	remoteId: int('remote_id').notNull().unique(),
	name: text('name').notNull()
});

export const bossRelations = relations(bossTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
