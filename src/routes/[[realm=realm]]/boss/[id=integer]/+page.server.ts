import { characterDps, characterHps, healingAndAbsorbDone, METRIC_TYPE } from '$lib/metrics';
import { getBossKillsWipesTimes } from '$lib/server/api';
import type { BosskillCharacter } from '$lib/server/api/schema';
import { getBossAggregatedStats } from '$lib/server/db/boss';
import { getTopSpecs } from '$lib/server/model/boss.model';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params, parent }) => {
	const { realmIsPrivate, realm, difficulty, talentSpec, boss } = await parent();
	const remoteId = boss.remoteId;
	const [kw, dpsPrepared, hpsPrepared] = await Promise.all([
		getBossKillsWipesTimes({ realm, id: remoteId, mode: difficulty }),
		getBossAggregatedStats({ realm, remoteId, difficulty, metric: METRIC_TYPE.DPS }),
		getBossAggregatedStats({ realm, remoteId, difficulty, metric: METRIC_TYPE.HPS })
	]);

	const [byDPS, byHPS] = await Promise.all(
		realmIsPrivate
			? [{}, {}]
			: [
					getTopSpecs({
						realm,
						difficulty,
						talentSpec,
						remoteId,
						metric: METRIC_TYPE.DPS
					}),
					getTopSpecs({
						realm,
						difficulty,
						talentSpec,
						remoteId,
						metric: METRIC_TYPE.HPS
					})
			  ]
	);

	type Stats = {
		char: BosskillCharacter;
		valuePerSecond: number;
		valueTotal: number;
	};
	let dmg: Stats[] = [];
	let heal: Stats[] = [];

	for (const bySpec of Object.values(byDPS)) {
		for (const char of bySpec) {
			const amount = Number(char.dmgDone);
			if (isFinite(amount)) {
				dmg.push({
					char: char,
					valuePerSecond: characterDps(char),
					valueTotal: amount
				});
			}
		}
	}

	for (const bySpec of Object.values(byHPS)) {
		for (const char of bySpec) {
			const amount = healingAndAbsorbDone(char);
			if (isFinite(amount)) {
				heal.push({
					char: char,
					valuePerSecond: characterHps(char),
					valueTotal: amount
				});
			}
		}
	}
	dmg = dmg.sort((a, b) => b.valuePerSecond - a.valuePerSecond).slice(0, 200);
	heal = heal.sort((a, b) => b.valuePerSecond - a.valuePerSecond).slice(0, 200);

	return {
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
