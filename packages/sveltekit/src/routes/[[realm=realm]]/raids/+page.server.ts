import { listAllLatestBossKills } from '@twinstar-bosskills/api';
import { FilterOperator } from '@twinstar-bosskills/api/dist/filter';
import { raidLock } from '@twinstar-bosskills/core/src/date';
import type { Boss } from '@twinstar-bosskills/db/dist/types';
import { findBosses, getRaids } from '@twinstar-bosskills/model';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const now = new Date();
	const { realm, raidlock: raidlockOffset } = await parent();
	const { start: raidLockStart, end: raidLockEnd } = raidLock(now, raidlockOffset);

	const [raids, bosses, bosskills] = await Promise.all([
		getRaids({ realm }),
		findBosses({ realm }),
		listAllLatestBossKills({
			realm,
			pageSize: 10_000,
			filters: [
				{ column: 'time', operator: FilterOperator.GTE, value: raidLockStart },
				{ column: 'time', operator: FilterOperator.LTE, value: raidLockEnd }
			]
		})
	]);
	const bosskillsByBoss: Record<number, number> = {};
	const bosskillsByBossByDifficulty: Record<number, Record<number, number>> = {};
	const bosskillsByRaid: Record<string, number> = {};
	const bosskillsByRaidByDifficulty: Record<string, Record<number, number>> = {};
	for (const bk of bosskills) {
		bosskillsByBoss[bk.entry] ??= 0;
		bosskillsByBoss[bk.entry]!++;

		bosskillsByBossByDifficulty[bk.entry] ??= { [bk.mode]: 0 };
		if (typeof bosskillsByBossByDifficulty[bk.entry]?.[bk.mode] === 'undefined') {
			bosskillsByBossByDifficulty[bk.entry]![bk.mode] = 0;
		}
		bosskillsByBossByDifficulty[bk.entry]![bk.mode]!++;

		bosskillsByRaid[bk.map] ??= 0;
		bosskillsByRaid[bk.map]!++;
		bosskillsByRaidByDifficulty[bk.map] ??= { [bk.mode]: 0 };
		if (typeof bosskillsByRaidByDifficulty[bk.map]?.[bk.mode] === 'undefined') {
			bosskillsByRaidByDifficulty[bk.map]![bk.mode] = 0;
		}
		bosskillsByRaidByDifficulty[bk.map]![bk.mode]!++;
	}

	return {
		raids,
		bossesByRaidId: bosses.reduce((acc, item) => {
			acc[item.raid_id] ??= [];
			acc[item.raid_id]!.push(item);
			return acc;
		}, {} as Record<number, Boss[]>),
		bosskillsByBoss,
		bosskillsByBossByDifficulty,
		bosskillsByRaid,
		bosskillsByRaidByDifficulty,
		raidLockStart,
		raidLockEnd
	};
};
