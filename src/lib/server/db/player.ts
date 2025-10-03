import { and, eq, isNotNull } from 'drizzle-orm';
import { createConnection } from '.';
import { raidTable } from './schema/raid.schema';
import { realmXRaidTable } from './schema/realm-x-raid.schema';
import { realmTable } from './schema/realm.schema';
import type { Raid } from '$lib/model/raid.model';
import { playerTable } from './schema/player.schema';
import { Player } from '$lib/model/player.model';

export const getPlayerByGuid = async ({
	realm,
	guid
}: {
	guid: number;
	realm: string;
}): Promise<Player | null> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				id: playerTable.id,
				name: playerTable.name,
				remoteId: playerTable.remoteId
			})
			.from(playerTable)
			.innerJoin(realmTable, eq(realmTable.id, playerTable.realmId))
			.where(
				and(
					eq(realmTable.name, realm),
					eq(playerTable.remoteId, guid),
					isNotNull(playerTable.remoteId),
					isNotNull(playerTable.name)
				)
			);

		const rows = await qb.execute();
		if (rows[0]) {
			return {
				id: rows[0].id,
				remoteId: rows[0].remoteId!,
				name: rows[0].name!
			};
		}
	} catch (e) {
		console.error(e);
	}

	return null;
};
