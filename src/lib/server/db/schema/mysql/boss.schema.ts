import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
import { raidTable } from './raid.schema';
export const bossTable = bosskills.table('boss', {
	id: int('id').primaryKey().autoincrement(),
	remoteId: int('remote_id').notNull().unique(),
	name: text('name').notNull(),
	raidId: int('raid_id')
		.notNull()
		.references(() => raidTable.id)
});

export const bossRelations = relations(bossTable, ({ many }) => ({
	bosskills: many(bosskillTable)
}));
