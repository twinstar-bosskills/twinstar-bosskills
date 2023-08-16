import type { Player } from '$lib/model';
import * as api from '$lib/server/api';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const boss = await api.getBoss(id);
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const stats = await api.getBossStats(id);
	type Stats = {
		player: Player;
		amount: number;
	};
	let dmg: Stats[] = [];
	let heal: Stats[] = [];
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
	dmg = dmg.sort((a, b) => b.amount - a.amount).slice(0, 100);
	heal = heal.sort((a, b) => b.amount - a.amount).slice(0, 100);
	return {
		boss,
		stats: [
			{ type: STATS_TYPE_DMG, value: dmg },
			{ type: STATS_TYPE_HEAL, value: heal }
		]
	};
};
