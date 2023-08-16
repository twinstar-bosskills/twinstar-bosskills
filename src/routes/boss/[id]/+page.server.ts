import { Difficulty, type Player } from '$lib/model';
import * as api from '$lib/server/api';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params }) => {
	const id = Number(params.id);
	const boss = await api.getBoss(id);
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	type Stats = {
		player: Player;
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
		difficulty = isFinite(v) ? v : Difficulty.DIFFICULTY_10_N;
	}

	const talentSpecStr = url.searchParams.get('spec');
	let talentSpec: number | undefined = undefined;
	if (talentSpecStr !== null) {
		const v = Number(talentSpecStr);
		talentSpec = isFinite(v) ? v : undefined;
	}

	const [byDamageDone, byHealingDone] = await Promise.all([
		api.getBossStatsV2(id, {
			difficulty,
			talentSpec,
			pageSize: 100,
			sorter: {
				column: 'dmgDone',
				order: 'desc'
			}
		}),
		api.getBossStatsV2(id, {
			difficulty,
			talentSpec,
			pageSize: 100,
			sorter: {
				column: 'healingDone',
				order: 'desc'
			}
		})
	]);

	for (const bySpec of Object.values(byDamageDone.bySpec)) {
		for (const player of bySpec) {
			const amount = Number(player.dmgDone);
			if (isFinite(amount)) {
				dmg.push({
					player,
					amount: amount
				});
			}
		}
	}

	for (const bySpec of Object.values(byHealingDone.bySpec)) {
		for (const player of bySpec) {
			const amount = Number(player.healingDone);
			if (isFinite(amount)) {
				heal.push({
					player,
					amount: amount
				});
			}
		}
	}

	// just to be sure, sometimes api can sort badly
	dmg = dmg.sort((a, b) => b.amount - a.amount);
	heal = heal.sort((a, b) => b.amount - a.amount);

	return {
		boss,
		stats: [
			{ type: STATS_TYPE_DMG, value: dmg },
			{ type: STATS_TYPE_HEAL, value: heal }
		]
	};
};
