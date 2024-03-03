import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
import { raidTable } from './raid.schema';
export const bossTable = sqliteTable('boss', {
	id: integer('id').primaryKey(),
	remoteId: integer('remote_id').notNull().unique(),
	name: text('name').notNull(),
	raidId: integer('raid_id')
		.notNull()
		.references(() => raidTable.id)
});

export const bossRelations = relations(bossTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
