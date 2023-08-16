import type { Boss, Player } from '$lib/model';
import { withCache } from '../cache';
import { getBossKillDetail, getLatestBossKills, type BossKillQueryArgs } from './boss-kills';
import { FilterOperator } from './filter';
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
	byClass: Record<number, Player[]>;
	bySpec: Record<number, Player[]>;
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
					for (const player of detail.boss_kills_players) {
						// TODO: this eats memory
						byClass[player.class] ??= [];
						bySpec[player.talent_spec] ??= [];

						byClass[player.class]!.push(player);
						bySpec[player.talent_spec]!.push(player);
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
