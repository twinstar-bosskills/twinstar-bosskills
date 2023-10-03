import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
import { playerTable } from './player.schema';
export const bosskillPlayerTable = sqliteTable('boss_kill_player', {
	id: integer('id').primaryKey(),
	bosskillId: integer('boss_kill_id').references(() => bosskillTable.id),
	playerId: integer('player_id').references(() => playerTable.id),
	remoteId: integer('remote_id').unique(),

	talentSpec: integer('talent_spec'),
	avgItemLvl: integer('avg_item_lvl'),
	dmgDone: integer('dmg_done'),
	healingDone: integer('healing_done'),
	overhealingDone: integer('overhealing_done'),
	absorbDone: integer('absorb_done'),
	dmgTaken: integer('dmg_taken'),
	dmgAbsorbed: integer('dmg_absorbed'),
	healingTaken: integer('healing_taken'),
	dispells: integer('dispells'),
	interrups: integer('interrupts'),

	name: text('name'),
	guid: integer('guid'),
	race: integer('race'),
	class: integer('class'),
	gender: integer('gender'),
	level: integer('level')
});
