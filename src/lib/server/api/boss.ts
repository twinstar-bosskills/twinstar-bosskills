import type { Boss, BossKillDetail } from '$lib/model';
import { withCache } from '../cache';
import { getBossKillDetail, getBossKills, type BossKillQueryArgs } from './boss-kills';
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

export const getBossStats = async (id: number) => {
	const q: BossKillQueryArgs = {
		page: 0,
		pageSize: 100,
		filters: [
			// TODO: throws API error
			// {
			// 	column: 'entry',
			// 	operator: FilterOperator.EQUAL,
			// 	value: id
			// },
			{
				column: 'entry',
				operator: FilterOperator.IN,
				value: [id]
			}
		]
	};

	const fallback = async () => {
		try {
			const bosskills = await getBossKills(q);

			type Player = BossKillDetail['boss_kills_players'][0];
			const byClass: Record<number, Player[]> = {};
			const bySpec: Record<number, Player[]> = {};
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
		}

		return { byClass: {}, bySpec: {} };
	};

	return withCache({ deps: [`boss-stats`, q], fallback });
};
