import { int, text } from 'drizzle-orm/mysql-core';
import { bossTable } from './boss.schema';
import { bosskills } from './mysql.schema';
import { raidTable } from './raid.schema';
import { realmTable } from './realm.schema';
export const bosskillTable = bosskills.table('boss_kill', {
	id: int('id').primaryKey().autoincrement(),
	remoteId: text('remote_id').notNull().unique(),
	bossId: int('boss_id')
		.notNull()
		.references(() => bossTable.id),
	raidId: int('raid_id')
		.notNull()
		.references(() => raidTable.id),
	realmId: int('realm_id')
		.notNull()
		.references(() => realmTable.id),
	mode: int('mode').notNull(),
	guild: text('guild').notNull(),
	time: text('time').notNull(),
	length: int('length').notNull(),
	wipes: int('wipes').notNull(),
	deaths: int('deaths').notNull(),
	ressUsed: int('ress_used').notNull()
});
