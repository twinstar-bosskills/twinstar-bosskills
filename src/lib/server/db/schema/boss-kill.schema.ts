import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bossTable } from './boss.schema';
import { raidTable } from './raid.schema';
import { realmTable } from './realm.schema';
export const bosskillTable = sqliteTable('boss_kill', {
	id: integer('id').primaryKey(),
	remoteId: text('remote_id').notNull().unique(),
	bossId: integer('boss_id')
		.notNull()
		.references(() => bossTable.id),
	raidId: integer('raid_id')
		.notNull()
		.references(() => raidTable.id),
	realmId: integer('realm_id')
		.notNull()
		.references(() => realmTable.id),
	mode: integer('mode').notNull(),
	guild: text('guild').notNull(),
	time: text('time').notNull(),
	length: integer('length').notNull(),
	wipes: integer('wipes').notNull(),
	deaths: integer('deaths').notNull(),
	ressUsed: integer('ress_used').notNull()
});
