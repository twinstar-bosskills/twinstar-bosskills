import { TWINSTAR_API_URL } from '$env/static/private';
import { mutateCharacter, type Boss, type Character } from '$lib/model';
import { withCache } from '../cache';
import { getBossKillDetail, getLatestBossKills, type BossKillQueryArgs } from './boss-kills';
import { FilterOperator, queryString, type QueryArgs } from './filter';
import { getRaids } from './raids';

export const getBoss = async (id: number): Promise<Boss | null> => {
	const fallback = async () => {
		try {
			const raids = await getRaids();
			for (const raid of raids) {
				for (const boss of raid.bosses) {
					if (boss.entry === id) {
						return boss;
					}
				}
			}
		} catch (e) {
			console.error(e);
		}

		return null;
	};

	return withCache({ deps: [`boss`, id], fallback });
};

type BossStats = {
	byClass: Record<number, Character[]>;
	bySpec: Record<number, Character[]>;
};
const EMPTY_STATS: BossStats = { byClass: {}, bySpec: {} };
export const getBossStats = async (id: number): Promise<BossStats> => {
	const q: BossKillQueryArgs = {
		page: 0,
		pageSize: 100,
		filters: [
			{
				column: 'entry',
				operator: FilterOperator.EQUALS,
				value: id
			}
			// this break API
			/*
			{
				column: 'difficulty',
				operator: FilterOperator.IN,
				value: [
					Difficulty.DIFFICULTY_10_N,
					Difficulty.DIFFICULTY_10_HC,
					Difficulty.DIFFICULTY_25_N,
					Difficulty.DIFFICULTY_25_HC
				]
			}
			*/
		]
	};

	const fallback = async (): Promise<BossStats> => {
		try {
			const bosskills = await getLatestBossKills(q);
			// TODO: byDifficulty
			const byClass: BossStats['byClass'] = {};
			const bySpec: BossStats['bySpec'] = {};
			const details = await Promise.all(bosskills.data.map((bk) => getBossKillDetail(bk.id)));
			for (const detail of details) {
				if (detail) {
					for (const character of detail.boss_kills_players) {
						// TODO: this eats memory
						byClass[character.class] ??= [];
						bySpec[character.talent_spec] ??= [];

						byClass[character.class]!.push(character);
						bySpec[character.talent_spec]!.push(character);
					}
				}
			}
			return { byClass, bySpec };
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	return withCache({ deps: [`boss-stats`, q], fallback }) ?? EMPTY_STATS;
};

type BossStatsQueryArgs = Pick<
	QueryArgs<'dmgDone' | 'healingDone'>,
	'sorter' | 'difficulty' | 'pageSize' | 'talentSpec'
>;
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
			const data: Character[] = await r.json();

			for (const character of data) {
				mutateCharacter(character);
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

	return withCache({ deps: [`boss-stats-v2`, id, q], fallback });
};
