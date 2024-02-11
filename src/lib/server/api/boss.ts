import { TWINSTAR_API_URL } from '$env/static/private';
import {
	aggregateBySpec,
	type AggregatedBySpec,
	type AggregatedBySpecStats
} from '$lib/components/echart/boxplot';

import { REALM_HELIOS } from '$lib/realm';
import { withCache } from '../cache';
import { listAllLatestBossKills, type LatestBossKillQueryArgs } from './boss-kills';
import { FilterOperator, queryString, type QueryArgs } from './filter';
import { getRaids } from './raid';
import { bosskillCharactersSchema, type Boss, type BosskillCharacter } from './schema';

type GetBossArgs = { realm?: string; id: number };
export const getBoss = async ({ id, realm = REALM_HELIOS }: GetBossArgs): Promise<Boss | null> => {
	const fallback = async () => {
		try {
			const raids = await getRaids({ realm });
			for (const raid of raids) {
				for (const boss of raid.bosses) {
					if (boss.entry === id) {
						return boss;
					}
				}
			}
		} catch (e) {
			console.error(e);
			throw e;
		}

		return null;
	};

	return withCache({ deps: [`boss`, realm, id], fallback, defaultValue: null });
};

type BossStats = {
	byClass: Record<number, BosskillCharacter[]>;
	bySpec: Record<number, BosskillCharacter[]>;
};
const EMPTY_STATS: BossStats = { byClass: {}, bySpec: {} };
type BossStatsQueryArgs = Pick<
	QueryArgs<'dmgDone' | 'healingDone' | 'dps' | 'hps'>,
	'sorter' | 'difficulty' | 'pageSize' | 'talentSpec'
> & { realm: string };
export const getBossStatsV2 = async (id: number, qa: BossStatsQueryArgs): Promise<BossStats> => {
	const q: BossStatsQueryArgs = {
		sorter: {
			column: 'dmgDone',
			order: 'desc'
		},
		...qa
	};

	const fallback = async (): Promise<BossStats> => {
		// https://twinstar-api.twinstar-wow.com/bosskills/top/59915?realm=Helios&pageSize=10&mode=4&sorter={%22column%22:%22dmgDone%22,%22order%22:%22desc%22}
		const url = `${TWINSTAR_API_URL}/bosskills/top/${id}?${queryString(q)}`;
		const byClass: BossStats['byClass'] = {};
		const bySpec: BossStats['bySpec'] = {};
		try {
			const r = await fetch(url);
			const json = await r.json();
			const data = bosskillCharactersSchema.parse(json);

			for (const character of data) {
				// TODO: this eats memory
				byClass[character.class] ??= [];
				bySpec[character.talent_spec] ??= [];

				byClass[character.class]!.push(character);
				bySpec[character.talent_spec]!.push(character);
			}
			return { byClass, bySpec };
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({ deps: [`boss-stats-v2`, id, q], fallback, defaultValue: EMPTY_STATS });
};

type GetBossKillsWipesTimesArgs = {
	realm: string;
	id: number;
	mode: number | null;
};
export const getBossKillsWipesTimes = async ({ realm, id, mode }: GetBossKillsWipesTimesArgs) => {
	const fallback = async () => {
		const filters: LatestBossKillQueryArgs['filters'] = [
			{
				column: 'entry',
				operator: FilterOperator.EQUALS,
				value: id
			}
		];

		if (mode !== null) {
			filters.push({ column: 'mode', operator: FilterOperator.EQUALS, value: mode });
		}
		const bosskills = await listAllLatestBossKills({
			realm,
			filters
		});

		const killsCount = bosskills.length;
		let wipesCount = 0;
		let minWipes = Infinity;
		let maxWipes = 0;
		let totalDuration = 0;
		let minFightDuration = Infinity;
		let maxFightDuration = 0;
		for (const bk of bosskills) {
			wipesCount += bk.wipes;
			if (bk.wipes <= minWipes) {
				minWipes = bk.wipes;
			}

			if (bk.wipes >= maxWipes) {
				maxWipes = bk.wipes;
			}

			totalDuration += bk.length;
			if (bk.length <= minFightDuration) {
				minFightDuration = bk.length;
			}

			if (bk.length >= maxFightDuration) {
				maxFightDuration = bk.length;
			}
		}
		const pullsCount = killsCount + wipesCount;
		const avgFightDuration = killsCount > 0 ? Math.ceil(totalDuration / killsCount) : 0;
		const avgWipes = killsCount > 0 ? Math.round((100 * wipesCount) / killsCount) / 100 : 0;
		const wipeChance = pullsCount === 0 ? 0 : Math.ceil(10000 * (wipesCount / pullsCount)) / 100;
		const killChance = pullsCount === 0 ? 0 : Math.ceil(10000 * (killsCount / pullsCount)) / 100;

		return {
			kills: {
				chance: killChance,
				total: killsCount
			},
			wipes: {
				min: isFinite(minWipes) ? minWipes : 0,
				avg: avgWipes,
				total: wipesCount,
				chance: wipeChance
			},
			fightDuration: {
				min: isFinite(minFightDuration) ? minFightDuration : 0,
				max: maxFightDuration,
				avg: avgFightDuration,
				total: totalDuration
			}
		};
	};
	return withCache({
		deps: ['boss-kwt', realm, id, mode],
		fallback,
		defaultValue: null
	});
};

type GetBossAggregatedStatsArgs = { realm: string; id: number; field: 'dps' | 'hps'; mode: number };
export const getBossAggregatedStats = async ({
	realm,
	id,
	field,
	mode
}: GetBossAggregatedStatsArgs): Promise<AggregatedBySpecStats> => {
	const fallback = async () => {
		// const items: { value: number; spec: number; label: string }[] = [];
		type Item = { spec: number; talent_spec: number; dps?: string; hps?: string };
		const qs = queryString({
			realm,
			difficulty: mode
		});
		const url = `${TWINSTAR_API_URL}/bosskills/aggreggate?${qs}&entry=${id}&field=${field}`;
		try {
			const r = await fetch(url);
			const data: Item[] = await r.json();
			if (Array.isArray(data) === false) {
				throw new Error(`data is not an array`);
			}

			const bySpec: AggregatedBySpec = {};
			for (const item of data) {
				const value = Number(item?.[field]);
				if (isFinite(value)) {
					// do not care about 0 dps/hps/...
					if (value <= 0) {
						continue;
					}

					// safety borders, value this big is probably bug
					if (field === 'dps' && value > 1_000_000) {
						continue;
					}

					// safety borders, value this big is probably bug
					if (field === 'hps' && value > 5_000_000) {
						continue;
					}

					const spec = item.spec ?? item.talent_spec ?? 0;
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
			console.error(e, url);
			throw e;
		}
	};
	return await withCache({
		deps: ['boss-aggregated', realm, id, field, mode],
		fallback,
		sliding: false,
		defaultValue: { indexToSpecId: {}, prepared: { axisData: [], boxData: [], outliers: [] } }
	});
};
