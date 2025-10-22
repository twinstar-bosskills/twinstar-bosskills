import { dpsEffectivity, METRIC_TYPE, type MetricType } from '$lib/metrics';
import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';
import { createConnection } from '.';
import {
	type BosskillCharacter,
	bosskillCharacterSchema
} from '@twinstar-bosskills/api/dist/schema';
import { bosskillPlayerTable } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { bossPropTable } from './schema/mysql/boss-prop.schema';
import { playerTable } from './schema/player.schema';
import { raidTable } from './schema/raid.schema';
import { rankingTable } from './schema/ranking.schema';
import { realmTable } from './schema/realm.schema';

export type GetRankingByRaidLockArgs = {
	realm: string;
	bossId: number;
	spec: number;
	difficulty: number;
	metric: MetricType;
	startsAt: Date;
	endsAt: Date;
	limit?: number;
};
type RankingItem = BosskillCharacter & {
	dpsEffectivity: number | null;
};
export type RankingByRaidLock = RankingItem[];

export const getRankingByRaidLock = async ({
	realm,
	bossId,
	spec,
	difficulty,
	metric,
	startsAt,
	endsAt,
	limit = 10
}: GetRankingByRaidLockArgs): Promise<RankingByRaidLock> => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				raid: raidTable,
				boss: bossTable,
				bossProp: bossPropTable,
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
			.leftJoin(
				bossPropTable,
				and(
					eq(bossPropTable.bossId, rankingTable.bossId),
					eq(bossPropTable.mode, rankingTable.mode)
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
			.orderBy(asc(rankingTable.rank))
			.groupBy(rankingTable.id)
			.limit(limit);

		const rows = await qb.execute();
		const stats = [];
		const totalDmgByBkId = new Map<number, number>();
		for (const row of rows) {
			const bkp = row.bosskillPlayer;
			const bk = row.bosskill;
			const boss = row.boss;
			const raid = row.raid;

			const bossHealth = row.bossProp?.health ?? 0;
			let raidDmgDone = totalDmgByBkId.get(bk.id) ?? null;
			if (raidDmgDone === null) {
				const totals = await db
					.select({
						total: sql<number>`SUM(${bosskillPlayerTable.dmgDone})`.mapWith(Number).as('total')
					})
					.from(bosskillPlayerTable)
					.where(eq(bosskillPlayerTable.bosskillId, bk.id))
					.execute();
				if (totals[0]) {
					raidDmgDone = totals[0].total;
					totalDmgByBkId.set(bk.id, raidDmgDone);
				}
			}

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
			if (metric === METRIC_TYPE.DPS && bossHealth > 0 && raidDmgDone !== null && raidDmgDone > 0) {
				(item as RankingItem).dpsEffectivity =
					metric === METRIC_TYPE.DPS && bossHealth > 0 && raidDmgDone !== null && raidDmgDone > 0
						? dpsEffectivity({
								dmgDone: bkp.dmgDone,
								fightLength: bk.length,
								bossHealth,
								raidDmgDone
						  })
						: null;
			}
			stats.push(item as RankingItem);
		}
		return stats;
	} catch (e) {
		console.error(e);
	}

	return [];
};
