import {
	aggregateBySpec,
	type AggregatedBySpec,
	type AggregatedBySpecStats
} from '$lib/components/echart/boxplot';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillCharacterSchema, type BosskillCharacter } from '../api/schema';
import { withCache } from '../cache';
import { bosskillPlayerTable, dps, hps } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { raidTable } from './schema/raid.schema';
import { realmTable } from './schema/realm.schema';

type BossTopSpecs = Record<number, BosskillCharacter[]>;
type GetBossTopSpecsArgs = {
	remoteId: number;
	realm: string;
	talentSpec?: number;
	difficulty: number;
	metric: 'hps' | 'dps';
};
export const getBossTopSpecs = async ({
	remoteId,
	realm,
	talentSpec,
	difficulty,
	metric
}: GetBossTopSpecsArgs): Promise<BossTopSpecs> => {
	const stats: BossTopSpecs = {};

	try {
		const db = await createConnection();
		const partitionQb = db
			.select({
				id: bosskillPlayerTable.id,
				metric: sql`${metric === 'hps' ? hps : dps}`.as('metric'),
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
					talentSpec ? eq(bosskillPlayerTable.talentSpec, talentSpec) : undefined
				)
			);

		const sub = partitionQb.as('sub');
		const topIdsQb = db
			.select({ id: sub.id })
			.from(sub)
			.where(eq(sub.row_number, 1))
			.limit(200)
			.orderBy(desc(sub.metric));
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
				raid: raidTable
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.innerJoin(raidTable, eq(raidTable.id, bosskillTable.raidId))
			.where(and(inArray(bosskillPlayerTable.id, topIds)))
			.orderBy(desc(sql`${metric === 'hps' ? hps : dps}`));

		const rows = await qb.execute();
		for (const row of rows) {
			const bkp = row.bosskillPlayer;
			const bk = row.bosskill;
			const boss = row.boss;
			const raid = row.raid;
			const spec = bkp.talentSpec;

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
			stats[spec] ??= [];
			stats[spec]!.push(item);
		}
	} catch (e) {
		console.error(e);
	}
	return stats;
};

type GetBossAggregatedStatsArgs = {
	realm: string;
	remoteId: number;
	metric: 'dps' | 'hps';
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
					value: metric === 'hps' ? hps : dps
				})
				.from(bosskillPlayerTable)
				.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
				.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
				.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
				.where(
					and(
						eq(realmTable.name, realm),
						eq(bosskillTable.mode, difficulty),
						eq(bossTable.remoteId, remoteId)
					)
				);
			const rows = await qb.execute();
			const bySpec: AggregatedBySpec = {};
			for (const item of rows) {
				const value = item.value;
				if (isFinite(value)) {
					// do not care about 0 dps/hps/...
					if (value <= 0) {
						continue;
					}

					// safety borders, value this big is probably bug
					if (metric === 'dps' && value > 1_000_000) {
						continue;
					}

					// safety borders, value this big is probably bug
					if (metric === 'hps' && value > 5_000_000) {
						continue;
					}

					const spec = item.spec;
					// Unknown spec
					if (spec === 0) {
						continue;
					}

					bySpec[spec] ??= [];
					bySpec[spec]!.push(value);
				}
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
