import { METRIC_TYPE, type PlayerPercentile, type PlayerPercentiles } from '$lib/metrics';
import { withCache } from '../cache';
import { findByRealm, getBossPercentiles, getByRemoteIdAndRealm } from '../db/boss';
export const getBosses = async (args: { realm: string }) => {
	const fallback = () => findByRealm(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/boss/getBosses', args],
		fallback,
		defaultValue: []
	});
};

export const getBoss = async (args: { remoteId: number; realm: string }) => {
	const fallback = () => getByRemoteIdAndRealm(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/boss/getBoss', args],
		fallback,
		defaultValue: null
	});
};

type GetBossPercentilesArgs = {
	realm: string;
	bossId: number;
	difficulty: number;
	players: { guid: number; dps: number; hps: number; spec: number }[];
};
export const getBossPercentilesPerPlayer = async (
	args: GetBossPercentilesArgs
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

	return withCache<PlayerPercentiles>({
		deps: [args],
		fallback,
		defaultValue: {
			[METRIC_TYPE.DPS]: {},
			[METRIC_TYPE.HPS]: {}
		}
	});
};
