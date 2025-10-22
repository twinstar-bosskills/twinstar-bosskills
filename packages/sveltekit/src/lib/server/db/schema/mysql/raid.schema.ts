import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bossTable } from './boss.schema';
import { bosskills } from './mysql.schema';
export const raidTable = bosskills.table('raid', {
	id: int('id').primaryKey().autoincrement(),
	name: text('name').notNull().unique(),
	position: int('position').notNull().default(0)
});

export const raidRelations = relations(raidTable, ({ many }) => ({
	bosskills: many(bosskillTable),
	bosses: many(bossTable)
}));
