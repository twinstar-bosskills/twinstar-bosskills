import { relations } from 'drizzle-orm';
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const bosskillTimelineTable = sqliteTable('boss_kill_timeline', {
	id: integer('id').primaryKey(),
	bosskillId: integer('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),

	encounterDamage: integer('encounterDamage').notNull(),
	encounterHeal: integer('encounterHeal').notNull(),
	raidDamage: integer('raidDamage').notNull(),
	raidHeal: integer('raidHeal').notNull(),
	time: integer('time').notNull()
});

export const bosskillTimelineRelations = relations(bosskillTimelineTable, ({ one }) => ({
	bosskill: one(bosskillTable)
}));
