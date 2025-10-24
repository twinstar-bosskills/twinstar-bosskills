import {
	aggregateBySpec,
	type AggregatedBySpec,
	type AggregatedBySpecStats
} from '$lib/components/echart/boxplot';
import {
	dpsEffectivity,
	METRIC_TYPE,
	type MetricType
} from '@twinstar-bosskills/core/dist/metrics';
import type { Boss } from '$lib/model/boss.model';
import type { ART } from '$lib/types';
import { and, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import { createConnection, type DbConnection } from '.';
import {
	bosskillCharacterSchema,
	type BosskillCharacter
} from '@twinstar-bosskills/api/dist/schema';
import { EXPIRE_30_MIN, withCache } from '../cache';
import { bosskillPlayerTable, dps, hps } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { raidTable } from './schema/raid.schema';
import { realmXRaidTable } from './schema/realm-x-raid.schema';
import { realmTable } from './schema/realm.schema';
import { bossPropTable } from './schema/mysql/boss-prop.schema';

type BuilderArgs = { realm: string; id?: number | undefined; remoteId?: number | undefined };
const builder = (db: DbConnection, { realm, id, remoteId }: BuilderArgs) => {
	const qb = db
		.select({
			id: bossTable.id,
			remoteId: bossTable.remoteId,
			name: bossTable.name,
			raidId: raidTable.id,
			position: bossTable.position
		})
		.from(bossTable)
		.innerJoin(raidTable, eq(raidTable.id, bossTable.raidId))
		.innerJoin(realmXRaidTable, eq(realmXRaidTable.raidId, raidTable.id))
		.innerJoin(realmTable, eq(realmTable.id, realmXRaidTable.realmId))
		.where(
			and(
				eq(realmTable.name, realm),
				typeof remoteId === 'number' ? eq(bossTable.remoteId, remoteId) : undefined,
				typeof id === 'number' ? eq(bossTable.id, id) : undefined
			)
		);
	return qb;
};

export const findBossesByRealm = async ({ realm }: { realm: string }): Promise<Boss[]> => {
	try {
		const db = await createConnection();
		const qb = builder(db, { realm });
		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};

export const getBossByRemoteIdAndRealm = async ({
	remoteId,
	realm
}: {
	remoteId: number;
	realm: string;
}): Promise<Boss | null> => {
	try {
		const db = await createConnection();
		const qb = builder(db, { realm, remoteId });
		const rows = await qb.execute();
		return rows[0] ?? null;
	} catch (e) {
		console.error(e);
	}

	return null;
};

export type BossTopSpecItem = BosskillCharacter & { dpsEffectivity: number | null };
export type BossTopSpecs = Record<number, BossTopSpecItem[]>;
export type GetBossTopSpecsArgs = {
	remoteId: number;
	realm: string;
	talentSpec?: number;
	difficulty: number;
	metric: MetricType;
	limit?: number;
	startsAt?: Date;
	endsAt?: Date;
};
export const getBossTopSpecs = async ({
	remoteId,
	realm,
	talentSpec,
	difficulty,
	metric,
	limit = 200,
	startsAt,
	endsAt
}: GetBossTopSpecsArgs): Promise<BossTopSpecs> => {
	const stats: BossTopSpecs = {};

	try {
		const db = await createConnection();
		const partitionQb = db
			.select({
				id: bosskillPlayerTable.id,
				metric: sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.as('metric'),
				row_number:
					sql`ROW_NUMBER() OVER (PARTITION BY ${bosskillPlayerTable.guid} ORDER BY metric DESC)`.as(
						'row_number'
					)
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.where(
				and(
					eq(realmTable.name, realm),
					eq(bosskillTable.mode, difficulty),
					eq(bossTable.remoteId, remoteId),
					talentSpec ? eq(bosskillPlayerTable.talentSpec, talentSpec) : undefined,
					startsAt ? gte(bosskillTable.time, startsAt.toISOString()) : undefined,
					endsAt ? lte(bosskillTable.time, endsAt.toISOString()) : undefined
				)
			);

		const sub = partitionQb.as('sub');
		const topIdsQb = db
			.select({ id: sub.id })
			.from(sub)
			.where(eq(sub.row_number, 1))
			.orderBy(desc(sub.metric));
		if (limit) {
			topIdsQb.limit(limit);
		}
		const topRows = await topIdsQb.execute();
		const topIds = topRows.map((row) => row.id);

		if (topIds.length === 0) {
			return stats;
		}

		const qb = db
			.select({
				bosskillPlayer: bosskillPlayerTable,
				bosskill: bosskillTable,
				boss: bossTable,
				bossProp: bossPropTable,
				raid: raidTable
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.innerJoin(raidTable, eq(raidTable.id, bosskillTable.raidId))
			.leftJoin(
				bossPropTable,
				and(
					eq(bossPropTable.bossId, bosskillTable.bossId),
					eq(bossPropTable.mode, bosskillTable.mode)
				)
			)
			.where(and(inArray(bosskillPlayerTable.id, topIds)))
			.orderBy(desc(sql`${metric === METRIC_TYPE.HPS ? hps : dps}`))
			.groupBy(bosskillPlayerTable.id);

		const rows = await qb.execute();
		const totalDmgByBkId = new Map<number, number>();
		for (const row of rows) {
			const bkp = row.bosskillPlayer;
			const bk = row.bosskill;
			const boss = row.boss;
			const raid = row.raid;
			const spec = bkp.talentSpec;

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

			(item as BossTopSpecItem).dpsEffectivity =
				metric === METRIC_TYPE.DPS && bossHealth > 0 && raidDmgDone !== null && raidDmgDone > 0
					? dpsEffectivity({
							dmgDone: bkp.dmgDone,
							fightLength: bk.length,
							bossHealth,
							raidDmgDone
					  })
					: null;
			stats[spec] ??= [];
			stats[spec]!.push(item as BossTopSpecItem);
		}
	} catch (e) {
		console.error(e);
	}
	return stats;
};

export type GetBossAggregatedStatsArgs = {
	realm: string;
	remoteId: number;
	metric: MetricType;
	difficulty: number;
};
export const getBossAggregatedStats = async ({
	realm,
	remoteId,
	metric,
	difficulty
}: GetBossAggregatedStatsArgs): Promise<AggregatedBySpecStats> => {
	const fallback = async () => {
		try {
			const db = await createConnection();
			const qb = db
				.select({
					spec: bosskillPlayerTable.talentSpec,
					value: (metric === METRIC_TYPE.HPS ? hps : dps).as('value')
				})
				.from(bosskillPlayerTable)
				.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
				.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
				.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
				.where(
					and(
						eq(realmTable.name, realm),
						eq(bosskillTable.mode, difficulty),
						eq(bossTable.remoteId, remoteId),
						ne(bosskillPlayerTable.talentSpec, 0)
					)
				)
				.having(
					and(gte(sql`value`, 0), metric === METRIC_TYPE.HPS ? sql`value < 5000000` : undefined)
				);

			const rows = await qb.execute();
			const bySpec: AggregatedBySpec = {};
			for (const item of rows) {
				const value = item.value;
				const spec = item.spec;
				bySpec[spec] ??= [];
				bySpec[spec]!.push(value);
			}

			return aggregateBySpec(bySpec);
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	return withCache({
		deps: ['db:getBossAggregatedStats', realm, remoteId, metric, difficulty],
		fallback,
		sliding: false,
		defaultValue: { indexToSpecId: {}, prepared: { axisData: [], boxData: [], outliers: [] } }
	});
};

export type GetBossStatsMedianArgs = {
	realm: string;
	remoteId: number;
	metric: MetricType;
	difficulties: number[];
	specs?: number[];
	ilvlMin?: number;
	ilvlMax?: number;
};
export const getBossStatsMedian = async ({
	realm,
	remoteId,
	metric,
	difficulties,
	specs,
	ilvlMin = 0,
	ilvlMax = 0
}: GetBossStatsMedianArgs) => {
	try {
		const db = await createConnection();
		const qb = db
			.select({
				spec: sql`${bosskillPlayerTable.talentSpec}`.mapWith(Number).as('spec'),
				mode: sql`${bosskillTable.mode}`.mapWith(Number).as('mode'),
				value: sql`MEDIAN(${metric === METRIC_TYPE.HPS ? hps : dps}) OVER (PARTITION BY mode, spec)`
					.mapWith(Number)
					.as('value')
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.where(
				and(
					eq(realmTable.name, realm),
					eq(bossTable.remoteId, remoteId),
					ne(bosskillPlayerTable.talentSpec, 0),
					difficulties && difficulties.length
						? inArray(bosskillTable.mode, difficulties)
						: undefined,
					specs && specs.length ? inArray(bosskillPlayerTable.talentSpec, specs) : undefined,
					ilvlMin > 0 ? gte(bosskillPlayerTable.avgItemLvl, ilvlMin) : undefined,
					ilvlMax > 0 ? lte(bosskillPlayerTable.avgItemLvl, ilvlMax) : undefined
				)
			);

		const qb2 = db
			.select()
			.from(qb.as('sub'))
			.where(and(gte(sql`value`, 0), metric === METRIC_TYPE.HPS ? sql`value < 5000000` : undefined))
			.orderBy(sql`value`);

		const rows = await qb2.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}
	return [];
};

type GetBossPercentilesArgs = {
	realm: string;
	bossId: Boss['id'];
	difficulty: number;
	talentSpec: number;
	metric: MetricType;
	targetValue: number;
};
export const getBossPercentiles = async ({
	realm,
	bossId,
	difficulty,
	talentSpec,
	metric,
	targetValue
}: GetBossPercentilesArgs): Promise<number | null> => {
	try {
		const db = await createConnection();
		const rankedQb = db.$with('ranked').as(
			db
				.select({
					spec: bosskillPlayerTable.talentSpec,
					value: sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.mapWith(Number).as('value'),
					percentile_rank:
						sql`100 * ROUND(PERCENT_RANK() OVER (PARTITION BY ${bosskillPlayerTable.talentSpec} ORDER BY value), 2)`.as(
							'percentile_rank'
						)
				})
				.from(bosskillTable)
				.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
				.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
				.innerJoin(bosskillPlayerTable, eq(bosskillPlayerTable.bosskillId, bosskillTable.id))
				.where(
					and(
						eq(realmTable.name, realm),
						eq(bossTable.id, bossId),
						eq(bosskillTable.mode, difficulty),
						eq(bosskillPlayerTable.talentSpec, talentSpec)
					)
				)
		);

		// selects the entry whose DPS is closest to $targetValue
		// by minimizing the absolute difference between the DPS values and $targetValue.
		// if multiple entries are equally close, it orders by the smallest absolute difference
		const qb = db
			.with(rankedQb)
			.select({
				percentile_rank: rankedQb.percentile_rank
			})
			.from(rankedQb)
			.where(
				sql`ABS(value - ${targetValue}) = (SELECT MIN(ABS(value - ${targetValue})) FROM ranked)`
			)
			.orderBy(sql`ABS(value - ${targetValue}), percentile_rank DESC`)
			.limit(1);
		const rows = await qb.execute();
		const r1 = rows[0]?.percentile_rank ?? null;
		if (r1 !== null) {
			return Number(r1);
		}
		return null;
	} catch (e) {
		console.error(e);
	}
	return null;
};

export const getBossPercentilesFast = async ({
	realm,
	bossId,
	difficulty,
	talentSpec,
	metric,
	targetValue
}: GetBossPercentilesArgs): Promise<number | null> => {
	try {
		const fallback = async () => {
			const db = await createConnection();
			const qb = db
				.select({
					spec: bosskillPlayerTable.talentSpec,
					value: sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.mapWith(Number).as('value'),
					percentile_rank:
						sql`100 * ROUND(PERCENT_RANK() OVER (PARTITION BY ${bosskillPlayerTable.talentSpec} ORDER BY value), 2)`
							.mapWith(Number)
							.as('percentile_rank')
				})
				.from(bosskillTable)
				.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
				.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
				.innerJoin(bosskillPlayerTable, eq(bosskillPlayerTable.bosskillId, bosskillTable.id))
				.where(
					and(
						eq(realmTable.name, realm),
						eq(bossTable.id, bossId),
						eq(bosskillTable.mode, difficulty),
						eq(bosskillPlayerTable.talentSpec, talentSpec)
					)
				);
			return qb.execute();
		};

		const rows = await withCache<ART<typeof fallback>>({
			deps: [
				'db/boss/getBossPercentilesFast',
				// deps without targetValue on purpose
				realm,
				bossId,
				difficulty,
				talentSpec,
				metric
			],
			fallback,
			defaultValue: [],
			expire: EXPIRE_30_MIN
		});

		const rowsLen = rows.length;
		if (rowsLen === 0) {
			return null;
		}

		let closest = rows[0] ?? null;
		if (closest === null) {
			return null;
		}

		// binary search would probably be even faster
		// but this is enough for now
		for (let i = 0; i < rowsLen; i++) {
			const row = rows[i]!;
			const closestDiff = Math.abs(targetValue - closest.value);
			const currentDiff = Math.abs(targetValue - row.value);
			if (currentDiff < closestDiff) {
				closest = row;
			}
		}

		return closest.percentile_rank;
	} catch (e) {
		console.error(e);
	}
	return null;
};
