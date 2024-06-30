import { METRIC_TYPE } from '$lib/metrics';
import { defaultDifficultyByExpansion } from '$lib/model';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import { getDifficultyFromUrl, getSpecFromUrl } from '$lib/search-params';
import { getBossKillsWipesTimes } from '$lib/server/api';
import { getBossAggregatedStats } from '$lib/server/db/boss';
import { getBoss, getTopSpecs } from '$lib/server/model/boss.model';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params }) => {
	const id = Number(params.id);
	const boss = await getBoss({ realm: params.realm!, remoteId: id });
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
		getBossAggregatedStats({ realm, remoteId: id, difficulty: mode, metric: METRIC_TYPE.DPS }),
		getBossAggregatedStats({ realm, remoteId: id, difficulty: mode, metric: METRIC_TYPE.HPS })
	]);

	const difficulty: number | undefined =
		getDifficultyFromUrl(url) ?? defaultDifficultyByExpansion(expansion);
	const talentSpec = getSpecFromUrl(url);

	const [byDPS, byHPS] = await Promise.all([
		getTopSpecs({
			realm,
			difficulty,
			talentSpec,
			remoteId: id,
			metric: METRIC_TYPE.DPS
		}),
		getTopSpecs({
			realm,
			difficulty,
			talentSpec,
			remoteId: id,
			metric: METRIC_TYPE.HPS
		})
	]);

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
	dmg = dmg.sort((a, b) => b.amount - a.amount).slice(0, 200);
	heal = heal.sort((a, b) => b.amount - a.amount).slice(0, 200);

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
