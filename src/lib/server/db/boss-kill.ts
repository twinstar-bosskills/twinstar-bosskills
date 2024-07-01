import type { BossKill } from '$lib/model/boss-kill.model';
import { and, eq, gte, lte } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillTable } from './schema/boss-kill.schema';
import { realmTable } from './schema/realm.schema';

type FindBossKillsArgs = {
	realm: string;
	bossId?: number;
	difficulty?: number;
	startsAt?: Date;
	endsAt?: Date;
};
export const findBossKills = async ({
	realm,
	bossId,
	difficulty,
	startsAt,
	endsAt
}: FindBossKillsArgs): Promise<BossKill[]> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				id: bosskillTable.id,
				remoteId: bosskillTable.remoteId,
				bossId: bosskillTable.bossId,
				mode: bosskillTable.mode,
				time: bosskillTable.time,
				wipes: bosskillTable.wipes
			})
			.from(bosskillTable)
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.where(
				and(
					eq(realmTable.name, realm),
					startsAt ? gte(bosskillTable.time, startsAt.toISOString()) : undefined,
					endsAt ? lte(bosskillTable.time, endsAt.toISOString()) : undefined,
					bossId ? eq(bosskillTable.bossId, bossId) : undefined,
					typeof difficulty !== 'undefined' ? eq(bosskillTable.mode, difficulty) : undefined
				)
			);

		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};
