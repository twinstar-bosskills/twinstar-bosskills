import { METRIC_TYPE, type PlayerPercentile, type PlayerPercentiles } from '$lib/metrics';
import type { ART } from '$lib/types';
import { EXPIRE_1_DAY, EXPIRE_1_HOUR, withCache } from '../cache';
import {
	findByRealm,
	getBossPercentiles,
	getBossTopSpecs,
	getByRemoteIdAndRealm,
	getBossStatsMedian as statsMedian,
	type GetBossStatsMedianArgs,
	type GetBossTopSpecsArgs
} from '../db/boss';
export const findBosses = async (args: { realm: string }) => {
	const fallback = () => findByRealm(args);
	return withCache<ART<typeof fallback>>({
		deps: ['model/boss/findBosses', args],
		fallback,
		defaultValue: []
	});
};

export const getBoss = async (args: { remoteId: number; realm: string }) => {
	const fallback = () => getByRemoteIdAndRealm(args);
	return withCache<ART<typeof fallback>>({
		deps: ['model/boss/getBoss', args],
		fallback,
		defaultValue: null
	});
};

export const getBossStatsMedian = (args: GetBossStatsMedianArgs) => {
	const fallback = async () => statsMedian(args);
	return withCache<ART<typeof fallback>>({
		deps: ['model/boss/getBossStatsMedian', args],
		fallback,
		defaultValue: [],
		expire: EXPIRE_1_HOUR
	});
};

type GetBossPercentilesArgs = {
	bossKillRemoteId: string;
};
const KEY_BOSS_PERCENTILES_PER_PLAYER = 'model/boss/getBossPercentilesPerPlayer';
const withBossPercentilesPerPlayerCache = (
	args: GetBossPercentilesArgs,
	fallback: () => PlayerPercentiles | Promise<PlayerPercentiles>,
	force: boolean = false
) => {
	return withCache<PlayerPercentiles>({
		deps: [KEY_BOSS_PERCENTILES_PER_PLAYER, args],
		fallback,
		defaultValue: {
			[METRIC_TYPE.DPS]: {},
			[METRIC_TYPE.HPS]: {}
		},
		// 1 day
		expire: EXPIRE_1_DAY,
		force
	});
};
export const getBossPercentilesPerPlayer = async (
	args: GetBossPercentilesArgs
): Promise<PlayerPercentiles> => {
	const fallback = async () => {
		throw Error('wait until recache happens');
	};

	return withBossPercentilesPerPlayerCache(args, fallback);
};

type SetBossPercentilesArgs = GetBossPercentilesArgs & {
	realm: string;
	bossId: number;
	difficulty: number;
	players: { guid: number; dps: number; hps: number; spec: number }[];
};
export const setBossPercentilesPerPlayer = async (
	args: SetBossPercentilesArgs
): Promise<PlayerPercentiles> => {
	const fallback = async () => {
		const { realm, bossId, difficulty, players } = args;
		const percentiles = new Promise<PlayerPercentiles>(async (resolve) => {
			const promises = [];
			const dps: PlayerPercentile = {};
			const hps: PlayerPercentile = {};
			for (const bkp of players) {
				promises.push(
					getBossPercentiles({
						realm,
						bossId,
						difficulty,
						talentSpec: bkp.spec,
						metric: METRIC_TYPE.DPS,
						targetValue: bkp.dps
					}).then((value) => {
						dps[bkp.guid] = value;
					})
				);
				promises.push(
					getBossPercentiles({
						realm,
						bossId,
						difficulty,
						talentSpec: bkp.spec,
						metric: METRIC_TYPE.HPS,
						targetValue: bkp.hps
					}).then((value) => {
						hps[bkp.guid] = value;
					})
				);
			}
			await Promise.all(promises);
			resolve({ [METRIC_TYPE.DPS]: dps, [METRIC_TYPE.HPS]: hps });
		});
		return percentiles;
	};

	return withBossPercentilesPerPlayerCache(
		{ bossKillRemoteId: args.bossKillRemoteId },
		fallback,
		true
	);
};

type BossTopSpecs = ART<typeof getBossTopSpecs>;
const KEY_BOSS_TOP_SPECS = 'model/boss/getTopSpecs';
const withBossTopSpecsCache = (
	args: GetBossTopSpecsArgs,
	fallback: () => BossTopSpecs | Promise<BossTopSpecs>,
	force: boolean = false
) => {
	return withCache<BossTopSpecs>({
		deps: [KEY_BOSS_TOP_SPECS, args],
		fallback,
		defaultValue: {},
		// 1 day
		expire: EXPIRE_1_DAY,
		force
	});
};

export const getTopSpecs = (args: GetBossTopSpecsArgs): Promise<BossTopSpecs> => {
	const fallback = async () => {
		throw Error('wait until recache happens');
	};
	return withBossTopSpecsCache(args, fallback);
};

export const setBossTopSpecs = async (args: GetBossTopSpecsArgs, stats: BossTopSpecs) => {
	const fallback = () => stats;
	return withBossTopSpecsCache(args, fallback, true);
};
