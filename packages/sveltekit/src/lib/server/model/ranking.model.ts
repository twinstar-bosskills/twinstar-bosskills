import { raidLock } from '@twinstar-bosskills/core/dist/date';
import {
	characterDps,
	characterHps,
	METRIC_TYPE,
	type MetricType
} from '@twinstar-bosskills/core/dist/metrics';
import { talentSpecsByExpansion } from '@twinstar-bosskills/core/dist/wow';
import type { Boss, Raid } from '@twinstar-bosskills/db/dist/types';

import { EXPIRE_30_MIN, EXPIRE_7_DAYS, withCache } from '@twinstar-bosskills/cache';
import type { RankingByRaidLock } from '@twinstar-bosskills/db/dist/ranking';
import { findBosses, getTopSpecsByRaidLock } from './boss.model';
import { getRaids } from './raid.model';

type GetRanksArgs = {
	realm: string;
	expansion: number;
	startsAt: Date;
	endsAt: Date;
	difficulty: number;
	metric: MetricType;
	cache?: boolean;
};
type Rank = {
	spec: number;
	characters: RankingByRaidLock;
};
export type GetRanksResult = {
	raids: (Raid & { bosses: Boss[] })[];
	ranks: Record<number, Record<number, Rank[]>>;
};
export const getRanks = async (args: GetRanksArgs): Promise<GetRanksResult> => {
	const fallback = async () => {
		const { realm, expansion, startsAt, endsAt, difficulty, metric } = args;
		const specs = talentSpecsByExpansion(expansion);
		if (specs === null) {
			return { raids: [], ranks: {} };
		}
		const bosses = await findBosses({ realm });
		const raids = (await getRaids({ realm })).reduce((acc, raid) => {
			acc[raid.id] = raid;
			return acc;
		}, {} as Record<number, Raid>);

		const data: {
			raids: Record<number, GetRanksResult['raids'][0]>;
			ranks: GetRanksResult['ranks'];
		} = {
			raids: {},
			ranks: {}
		};
		for (const boss of bosses) {
			const bossId = boss.id;
			const raid = raids[boss.raid_id];
			if (!raid) {
				continue;
			}
			data.raids[raid.id] ??= { ...raid, bosses: [] };
			data.raids[raid.id]!.bosses.push(boss);
			data.ranks[raid.id] ??= {
				[boss.id]: []
			};
			data.ranks[raid.id]![boss.id] ??= [];

			for (const spec of Object.values(specs)) {
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
					data.ranks[raid.id]![boss.id]!.push({
						spec,
						characters: ranks
					});
				}
			}
			data.ranks[raid.id]![boss.id]!.sort((a, b) => {
				if (metric === METRIC_TYPE.DPS) {
					return characterDps(a.characters[0]!) < characterDps(b.characters[0]!) ? 1 : -1;
				}
				return characterHps(a.characters[0]!) < characterHps(b.characters[0]!) ? 1 : -1;
			});
		}
		const result: GetRanksResult = {
			raids: Object.values(data.raids),
			ranks: data.ranks
		};
		result.raids.sort((a, b) => {
			return a.position < b.position ? 1 : -1;
		});
		for (const raid of result.raids) {
			raid.bosses.sort((a, b) => {
				return a.position > b.position ? 1 : -1;
			});
		}
		return result;
	};

	if (args.cache === false) {
		return fallback();
	}

	return withRanksCache(args, fallback);
};

export const refreshCurrentRanks = async (
	args: Omit<GetRanksArgs, 'startsAt' | 'endsAt' | 'cache'>
) => {
	const { start: startsAt, end: endsAt } = raidLock(new Date());

	const ranks = getRanks({
		...args,
		startsAt,
		endsAt,
		cache: false
	});

	return withRanksCache(
		{
			...args,
			startsAt,
			endsAt
		},
		() => ranks,
		true
	);
};

const withRanksCache = (
	args: GetRanksArgs,
	fallback: () => GetRanksResult | Promise<GetRanksResult>,
	force: boolean = false
) => {
	const isPrevious = args.startsAt <= raidLock(new Date(), 1).start;
	return withCache<GetRanksResult>({
		deps: [`model/ranking/getRanks`, args],
		fallback,
		defaultValue: { raids: [], ranks: {} },
		expire: isPrevious ? EXPIRE_7_DAYS : EXPIRE_30_MIN,
		force
	});
};
