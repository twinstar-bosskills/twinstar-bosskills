import { defaultDifficultyByExpansion } from '$lib/model';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import { getDifficultyFromUrl } from '$lib/search-params';
import { getBossKillsWipesTimes } from '$lib/server/api';
import { getBossAggregatedStats, getBossTopSpecs } from '$lib/server/db/boss';
import { getBoss } from '$lib/server/model/boss.model';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { METRIC_TYPE } from '$lib/metrics';

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
			metric: METRIC_TYPE.DPS
		}),
		getBossTopSpecs({
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
