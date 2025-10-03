import { datetime, int, text } from 'drizzle-orm/mysql-core';
import { bossTable } from './boss.schema';
import { bosskills } from './mysql.schema';
import { raidTable } from './raid.schema';
import { realmTable } from './realm.schema';
import { bosskillTable } from './boss-kill.schema';
import { playerTable } from './player.schema';
export const rankingTable = bosskills.table('ranking', {
	id: int('id').primaryKey().autoincrement(),
	realmId: int('realm_id')
		.notNull()
		.references(() => realmTable.id),
	raidId: int('raid_id')
		.notNull()
		.references(() => raidTable.id),
	bossId: int('boss_id')
		.notNull()
		.references(() => bossTable.id),
	bosskillId: int('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),
	playerId: int('player_id')
		.notNull()
		.references(() => playerTable.id),
	rank: int('rank').notNull(),
	time: datetime('time').notNull(),
	spec: int('spec').notNull(),
	mode: int('mode').notNull(),
	ilvl: int('ilvl').notNull(),
	dmgDone: int('dmg_done').notNull(),
	healingDone: int('healing_done').notNull(),
	length: int('length').notNull()
});
