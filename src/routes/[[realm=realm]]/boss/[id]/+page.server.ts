import { defaultDifficultyByExpansion } from '$lib/model';
import { realmToExpansion, REALM_HELIOS } from '$lib/realm';
import { getDifficultyFromUrl } from '$lib/search-params';
import * as api from '$lib/server/api';
import { getBossKillsWipesTimes } from '$lib/server/api';
import { getBossTopSpecs } from '$lib/server/db/boss';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params }) => {
	const id = Number(params.id);
	const boss = await api.getBoss({ realm: params.realm, id });
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const realm = params.realm ?? REALM_HELIOS;
	const expansion = realmToExpansion(realm);
	const mode = getDifficultyFromUrl(url) ?? defaultDifficultyByExpansion(expansion);
	const [kw, dpsPrepared, hpsPrepared] = await Promise.all([
		getBossKillsWipesTimes({ realm, id, mode }),
		api.getBossAggregatedStats({ realm, id, field: 'dps', mode }),
		api.getBossAggregatedStats({ realm, id, field: 'hps', mode })
	]);

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
	let difficulty: number | undefined = defaultDifficultyByExpansion(expansion);
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
		getBossTopSpecs({
			realm,
			difficulty,
			talentSpec,
			remoteId: id,
			metric: 'dps'
		}),
		getBossTopSpecs({
			realm,
			difficulty,
			talentSpec,
			remoteId: id,
			metric: 'hps'
		})
	]);

	// const [byDPS, byHPS] = await Promise.all([
	// 	api.getBossStatsV2(id, {
	// 		realm,
	// 		difficulty,
	// 		talentSpec,
	// 		pageSize: LIMIT,
	// 		sorter: {
	// 			column: 'dps',
	// 			order: 'desc'
	// 		}
	// 	}),
	// 	api.getBossStatsV2(id, {
	// 		realm,
	// 		difficulty,
	// 		talentSpec,
	// 		pageSize: LIMIT,
	// 		sorter: {
	// 			column: 'hps',
	// 			order: 'desc'
	// 		}
	// 	})
	// ]);

	type Stats = {
		char: (typeof byDPS)[number][0];
		amount: number;
	};
	let dmg: Stats[] = [];
	let heal: Stats[] = [];
	for (const bySpec of Object.values(byDPS)) {
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

	for (const bySpec of Object.values(byHPS)) {
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
			{ type: STATS_TYPE_DMG, value: dmg },
			{ type: STATS_TYPE_HEAL, value: heal }
		],
		kw,
		aggregated: {
			dps: dpsPrepared,
			hps: hpsPrepared
		}
	};
};
