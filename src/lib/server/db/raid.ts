import { and, eq } from 'drizzle-orm';
import { createConnection } from '.';
import { raidTable } from './schema/raid.schema';
import { realmXRaidTable } from './schema/realm-x-raid.schema';
import { realmTable } from './schema/realm.schema';
import type { Raid } from '$lib/model/raid.model';

export const findRaidsByRealm = async ({ realm }: { realm: string }): Promise<Raid[]> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				id: raidTable.id,
				name: raidTable.name,
				remoteId: raidTable.name,
				position: raidTable.position
			})
			.from(raidTable)
			.innerJoin(realmXRaidTable, eq(realmXRaidTable.raidId, raidTable.id))
			.innerJoin(realmTable, eq(realmTable.id, realmXRaidTable.realmId))
			.where(and(eq(realmTable.name, realm)));

		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};
