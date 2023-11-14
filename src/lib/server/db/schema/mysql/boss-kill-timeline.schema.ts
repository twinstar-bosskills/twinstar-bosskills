import { relations } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const bosskillTimelineTable = bosskills.table('boss_kill_timeline', {
	id: int('id').primaryKey(),
	bosskillId: int('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),

	encounterDamage: int('encounterDamage').notNull(),
	encounterHeal: int('encounterHeal').notNull(),
	raidDamage: int('raidDamage').notNull(),
	raidHeal: int('raidHeal').notNull(),
	time: int('time').notNull()
});

export const bosskillTimelineRelations = relations(bosskillTimelineTable, ({ one }) => ({
	bosskill: one(bosskillTable)
}));
