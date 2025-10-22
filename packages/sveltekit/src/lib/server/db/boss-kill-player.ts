import type { BossKillPlayer } from '$lib/model/boss-kill-player.model';
import { eq } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillPlayerTable, dps, hps } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';

type FindBossKillPlayersArgs = {
	bossKillId: number;
};
export const findBossKillPlayers = async ({
	bossKillId
}: FindBossKillPlayersArgs): Promise<BossKillPlayer[]> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				guid: bosskillPlayerTable.guid,
				dps: dps,
				hps: hps,
				spec: bosskillPlayerTable.talentSpec
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.where(eq(bosskillPlayerTable.bosskillId, bossKillId));

		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};
