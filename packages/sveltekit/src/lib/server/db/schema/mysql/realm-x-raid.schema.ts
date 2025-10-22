import { int } from 'drizzle-orm/mysql-core';
import { bosskills } from './mysql.schema';
import { raidTable } from './raid.schema';
import { realmTable } from './realm.schema';
export const realmXRaidTable = bosskills.table('realm_x_raid', {
	realmId: int('realm_id')
		.notNull()
		.references(() => realmTable.id),
	raidId: int('raid_id')
		.notNull()
		.references(() => raidTable.id)
});
