import { characterDps, characterHps, METRIC_TYPE, type MetricType } from '$lib/metrics';
import { talentSpecsByExpansion } from '$lib/model';
import type { Boss } from '$lib/model/boss.model';
import type { Raid } from '$lib/model/raid.model';
import { EXPIRE_1_HOUR, withCache } from '../cache';
import type { RankingByRaidLock } from '../db/ranking';
import { findBosses, getTopSpecsByRaidLock } from './boss.model';
import { getRaids } from './raid.model';

type GetRanksArgs = {
	realm: string;
	expansion: number;
	startsAt: Date;
	endsAt: Date;
	difficulty: number;
	metric: MetricType;
};
type Rank = {
	raid: Raid;
	boss: Boss;
	spec: number;
	ranks: RankingByRaidLock;
};
export const getRanks = async (args: GetRanksArgs): Promise<Rank[]> => {
	const fallback = async () => {
		const { realm, expansion, startsAt, endsAt, difficulty, metric } = args;
		const specs = talentSpecsByExpansion(expansion);
		if (specs === null) {
			return [];
		}
		const bosses = await findBosses({ realm });
		const raids = (await getRaids({ realm })).reduce((acc, raid) => {
			acc[raid.id] = raid;
			return acc;
		}, {} as Record<number, Raid>);

		const data: Record<string, Rank> = {};
		for (const boss of bosses) {
			const bossId = boss.id;
			const raid = raids[boss.raidId];
			if (!raid) {
				continue;
			}
			for (const spec of Object.values(specs)) {
				const k = `${raid.id}-${bossId}-${spec}`;
				const ranks = await getTopSpecsByRaidLock({
					realm,
					bossId,
					spec,
					difficulty,
					metric,
					startsAt,
					endsAt,
					limit: 1
				});
				if (ranks.length > 0) {
					data[k] = {
						raid,
						boss,
						spec,
						ranks
					};
				}
			}
		}
		return Object.values(data).sort((a, b) => {
			if (a.raid.position === b.raid.position) {
				if (a.boss.position === b.boss.position) {
					if (metric === METRIC_TYPE.DPS) {
						return characterDps(a.ranks[0]!) < characterDps(b.ranks[0]!) ? 1 : -1;
					}
					return characterHps(a.ranks[0]!) < characterHps(b.ranks[0]!) ? 1 : -1;
				}
				return a.boss.position > b.boss.position ? 1 : -1;
			}
			return a.raid.position < b.raid.position ? 1 : -1;
		});
	};
	return withCache<Rank[]>({
		deps: [`model/ranking/getRanks`, args],
		fallback,
		defaultValue: [],
		expire: EXPIRE_1_HOUR,
		sliding: false
	});
};
