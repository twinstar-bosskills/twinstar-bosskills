import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
import { playerTable } from './player.schema';
export const bosskillPlayerTable = sqliteTable('boss_kill_player', {
	id: integer('id').primaryKey(),
	bosskillId: integer('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),
	playerId: integer('player_id')
		.notNull()
		.references(() => playerTable.id),

	talentSpec: integer('talent_spec').notNull(),
	avgItemLvl: integer('avg_item_lvl').notNull(),
	dmgDone: integer('dmg_done').notNull(),
	healingDone: integer('healing_done').notNull(),
	overhealingDone: integer('overhealing_done').notNull(),
	absorbDone: integer('absorb_done').notNull(),
	dmgTaken: integer('dmg_taken').notNull(),
	dmgAbsorbed: integer('dmg_absorbed').notNull(),
	healingTaken: integer('healing_taken').notNull(),
	dispells: integer('dispells').notNull(),
	interrups: integer('interrupts').notNull(),

	name: text('name').notNull(),
	guid: integer('guid').notNull(),
	race: integer('race').notNull(),
	class: integer('class').notNull(),
	gender: integer('gender').notNull(),
	level: integer('level').notNull()
});
