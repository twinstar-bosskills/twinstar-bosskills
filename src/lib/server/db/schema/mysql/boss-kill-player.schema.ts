import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
import { playerTable } from './player.schema';
export const bosskillPlayerTable = bosskills.table('boss_kill_player', {
	id: int('id').primaryKey(),
	bosskillId: int('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),
	playerId: int('player_id')
		.notNull()
		.references(() => playerTable.id),

	talentSpec: int('talent_spec').notNull(),
	avgItemLvl: int('avg_item_lvl').notNull(),
	dmgDone: int('dmg_done').notNull(),
	healingDone: int('healing_done').notNull(),
	overhealingDone: int('overhealing_done').notNull(),
	absorbDone: int('absorb_done').notNull(),
	dmgTaken: int('dmg_taken').notNull(),
	dmgAbsorbed: int('dmg_absorbed').notNull(),
	healingTaken: int('healing_taken').notNull(),
	dispells: int('dispells').notNull(),
	interrups: int('interrupts').notNull(),

	name: text('name').notNull(),
	guid: int('guid').notNull(),
	race: int('race').notNull(),
	class: int('class').notNull(),
	gender: int('gender').notNull(),
	level: int('level').notNull()
});
