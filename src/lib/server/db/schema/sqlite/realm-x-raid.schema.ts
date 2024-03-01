import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { raidTable } from './raid.schema';
import { realmTable } from './realm.schema';
export const realmXRaidTable = sqliteTable('realm_x_raid', {
	realmId: integer('realm_id')
		.notNull()
		.references(() => realmTable.id),
	raidId: integer('raid_id')
		.notNull()
		.references(() => raidTable.id)
});
