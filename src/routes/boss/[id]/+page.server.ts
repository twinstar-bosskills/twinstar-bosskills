import { Difficulty, type Character } from '$lib/model';
import { DEFAULT_DIFFICULTY, getDifficultyFromUrl } from '$lib/search-params';
import * as api from '$lib/server/api';
import { getBossKillsWipesTimes } from '$lib/server/api';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
const LIMIT = 200;
export const load: PageServerLoad = async ({ url, params }) => {
	const id = Number(params.id);
	const boss = await api.getBoss(id);
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const mode = getDifficultyFromUrl(url) ?? DEFAULT_DIFFICULTY;
	const [kw, dpsPrepared, hpsPrepared] = await Promise.all([
		getBossKillsWipesTimes(id, mode),
		api.getBossAggregatedStats(id, 'dps', mode),
		api.getBossAggregatedStats(id, 'hps', mode)
	]);

	type Stats = {
		char: Character;
		amount: number;
	};
	let dmg: Stats[] = [];
	let heal: Stats[] = [];

	/*
	const stats = await api.getBossStats(id);
	for (const bySpec of Object.values(stats.bySpec)) {
		for (const player of bySpec) {
			const dmgDone = Number(player.dmgDone);
			if (isFinite(dmgDone)) {
				dmg.push({
					player,
					amount: dmgDone
				});
			}

			const healingDone = Number(player.healingDone);
			if (isFinite(healingDone)) {
				heal.push({
					player,
					amount: healingDone
				});
			}
		}
	}
	*/

	const difficultyStr = url.searchParams.get('difficulty');
	let difficulty: number | undefined = Difficulty.DIFFICULTY_10_N;
	if (difficultyStr !== null) {
		const v = Number(difficultyStr);
		difficulty = isFinite(v) ? v : difficulty;
	}

	const talentSpecStr = url.searchParams.get('spec');
	let talentSpec: number | undefined = undefined;
	if (talentSpecStr !== null) {
		const v = Number(talentSpecStr);
		talentSpec = isFinite(v) ? v : talentSpec;
	}

	const [byDPS, byHPS] = await Promise.all([
		api.getBossStatsV2(id, {
			difficulty,
			talentSpec,
			pageSize: LIMIT,
			sorter: {
				column: 'dps',
				order: 'desc'
			}
		}),
		api.getBossStatsV2(id, {
			difficulty,
			talentSpec,
			pageSize: LIMIT,
			sorter: {
				column: 'hps',
				order: 'desc'
			}
		})
	]);

	for (const bySpec of Object.values(byDPS.bySpec)) {
		for (const char of bySpec) {
			const amount = Number(char.dmgDone);
			if (isFinite(amount)) {
				dmg.push({
					char: char,
					amount: amount
				});
			}
		}
	}

	for (const bySpec of Object.values(byHPS.bySpec)) {
		for (const char of bySpec) {
			const amount = Number(char.healingDone);
			if (isFinite(amount)) {
				heal.push({
					char: char,
					amount: amount
				});
			}
		}
	}

	return {
		boss: { name: boss.name },
		stats: [
			{ type: STATS_TYPE_DMG, value: dmg.slice(0, LIMIT) },
			{ type: STATS_TYPE_HEAL, value: heal.slice(0, LIMIT) }
		],
		kw,
		aggregated: {
			dps: dpsPrepared,
			hps: hpsPrepared
		}
	};
};
