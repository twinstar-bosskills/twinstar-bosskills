import { raidLock } from '$lib/date';
import { characterDps, characterHps, healingAndAbsorbDone, METRIC_TYPE } from '$lib/metrics';
import { getRaidLockOffsetFromUrl } from '$lib/search-params';
import type { BosskillCharacter } from '$lib/server/api/schema';
import { getTopSpecsByRaidLock } from '$lib/server/model/boss.model';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import assert from 'node:assert';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { realmIsPrivate, realm, boss, difficulty, talentSpec: spec } = await parent();
	assert(boss);

	if (!spec) {
		error(400, {
			message: 'No talent spec selected'
		});
	}
	const offset = getRaidLockOffsetFromUrl(url);
	const { start: startsAt, end: endsAt } = raidLock(new Date(), offset);

	const [byDPS, byHPS] = await Promise.all(
		realmIsPrivate
			? [[], []]
			: [
					getTopSpecsByRaidLock({
						realm,
						difficulty,
						spec,
						bossId: boss.id,
						metric: METRIC_TYPE.DPS,
						startsAt,
						endsAt
					}),
					getTopSpecsByRaidLock({
						realm,
						difficulty,
						spec,
						bossId: boss.id,
						metric: METRIC_TYPE.HPS,
						startsAt,
						endsAt
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

	for (const char of byDPS) {
		const amount = Number(char.dmgDone);
		if (isFinite(amount)) {
			dmg.push({
				char: char,
				valuePerSecond: characterDps(char),
				valueTotal: amount
			});
		}
	}

	for (const char of byHPS) {
		const amount = healingAndAbsorbDone(char);
		if (isFinite(amount)) {
			heal.push({
				char: char,
				valuePerSecond: characterHps(char),
				valueTotal: amount
			});
		}
	}
	dmg = dmg.sort((a, b) => b.valuePerSecond - a.valuePerSecond).slice(0, 200);
	heal = heal.sort((a, b) => b.valuePerSecond - a.valuePerSecond).slice(0, 200);

	return {
		raidLockStart: startsAt,
		raidLockEnd: endsAt,
		stats: [
			{ type: STATS_TYPE_DMG, value: dmg },
			{ type: STATS_TYPE_HEAL, value: heal }
		]
	};
};
