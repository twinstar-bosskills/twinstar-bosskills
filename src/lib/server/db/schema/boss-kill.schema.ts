import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bossTable } from './boss.schema';
import { raidTable } from './raid.schema';
export const bosskillTable = sqliteTable('boss_kill', {
	id: integer('id').primaryKey(),
	remoteId: text('remote_id').unique(),
	bossId: integer('boss_id').references(() => bossTable.id),
	raidId: integer('raid_id').references(() => raidTable.id),
	mode: integer('mode'),
	guild: text('guild'),
	time: text('time'),
	realm: text('realm'),
	length: integer('length'),
	wipes: integer('wipes'),
	deaths: integer('deaths'),
	ressUsed: integer('ressUsed'),
	instanceId: integer('instance_id')
});