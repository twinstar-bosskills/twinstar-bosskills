import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
import { playerTable } from './player.schema';
export const bosskillDeathTable = sqliteTable('boss_kill_death', {
	id: integer('id').primaryKey(),
	bosskillId: integer('boss_kill_id').references(() => bosskillTable.id),
	playerId: integer('player_id').references(() => playerTable.id),
	remoteId: integer('remote_id').notNull().unique(),

	time: integer('time').notNull(),
	isRess: integer('is_ress').notNull()
});
