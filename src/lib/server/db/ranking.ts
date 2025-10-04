import { MetricType } from '$lib/metrics';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { createConnection } from '.';
import { BosskillCharacter, bosskillCharacterSchema } from '../api/schema';
import { bosskillPlayerTable } from './schema/boss-kill-player.schema';
import { playerTable } from './schema/player.schema';
import { raidTable } from './schema/raid.schema';
import { rankingTable } from './schema/ranking.schema';
import { realmTable } from './schema/realm.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';

export type GetRankingByRaidLockArgs = {
	realm: string;
	bossId: number;
	spec: number;
	difficulty: number;
	metric: MetricType;
	startsAt: Date;
	endsAt: Date;
};
export type RankingByRaidLock = BosskillCharacter[];

export const getRankingByRaidLock = async ({
	realm,
	bossId,
	spec,
	difficulty,
	metric,
	startsAt,
	endsAt
}: GetRankingByRaidLockArgs): Promise<RankingByRaidLock> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				raid: raidTable,
				boss: bossTable,
				bosskill: bosskillTable,
				bosskillPlayer: bosskillPlayerTable,
				name: playerTable.name,
				spec: rankingTable.spec,
				rank: rankingTable.rank,
				metric: rankingTable.metric
			})
			.from(rankingTable)
			.innerJoin(realmTable, eq(realmTable.id, rankingTable.realmId))
			.innerJoin(raidTable, eq(raidTable.id, rankingTable.raidId))
			.innerJoin(bossTable, eq(bossTable.id, rankingTable.bossId))
			.innerJoin(playerTable, eq(playerTable.id, rankingTable.playerId))
			.innerJoin(bosskillTable, eq(bosskillTable.id, rankingTable.bosskillId))
			.innerJoin(
				bosskillPlayerTable,
				and(
					eq(bosskillPlayerTable.bosskillId, rankingTable.bosskillId),
					eq(bosskillPlayerTable.playerId, rankingTable.playerId)
				)
			)
			.where(
				and(
					eq(realmTable.name, realm),
					eq(rankingTable.bossId, bossId),
					eq(rankingTable.spec, spec),
					eq(rankingTable.mode, difficulty),
					eq(rankingTable.metric, metric),
					gte(rankingTable.time, startsAt),
					lte(rankingTable.time, endsAt)
				)
			)
			.orderBy(asc(rankingTable.rank));

		const stats = [];
		const rows = await qb.execute();

		for (const row of rows) {
			const bkp = row.bosskillPlayer;
			const bk = row.bosskill;
			const boss = row.boss;
			const raid = row.raid;

			const value = {
				guid: bkp.guid,
				talent_spec: bkp.talentSpec,
				avg_item_lvl: bkp.avgItemLvl,
				dmgDone: bkp.dmgDone,
				healingDone: bkp.healingDone,
				overhealingDone: bkp.overhealingDone,
				absorbDone: bkp.absorbDone,
				dmgTaken: bkp.dmgTaken,
				dmgAbsorbed: bkp.dmgAbsorbed,
				healingTaken: bkp.healingTaken,
				dispels: bkp.dispells,
				interrupts: bkp.interrups,
				name: bkp.name,
				race: bkp.race,
				class: bkp.class,
				gender: bkp.gender,
				level: bkp.level,

				boss_kills: {
					id: bk.remoteId,
					entry: boss.remoteId,
					map: raid.name,
					mode: bk.mode,
					guild: bk.guild,
					time: bk.time,
					realm,
					length: bk.length,
					wipes: bk.wipes,
					deaths: bk.deaths,
					ressUsed: bk.ressUsed
				}
			};
			const item = bosskillCharacterSchema.parse(value);
			stats.push(item);
		}
		return stats;
	} catch (e) {
		console.error(e);
	}

	return [];
};
