import { int } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
import { playerTable } from './player.schema';
export const bosskillDeathTable = bosskills.table('boss_kill_death', {
	id: int('id').primaryKey().autoincrement(),
	bosskillId: int('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),
	playerId: int('player_id')
		.notNull()
		.references(() => playerTable.id),
	remoteId: int('remote_id').notNull().unique(),

	time: int('time').notNull(),
	isRess: int('is_ress').notNull()
});
