import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const bossKillTable = sqliteTable('boss_kill', {
	id: integer('id').primaryKey(),
	remoteId: text('remote_id'),
	bossId: integer('boss_id'),
	raidId: integer('raid_id'),
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
