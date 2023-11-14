import { raidLock } from '$lib/date';
import * as api from '$lib/server/api';
import { listAllLatestBossKills } from '$lib/server/api';
import { FilterOperator } from '$lib/server/api/filter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const now = new Date();
	const { start: thisRaidLockStart, end: thisRaidLockEnd } = raidLock(now);

	const [raids, bosskills] = await Promise.all([
		api.getRaids(),
		listAllLatestBossKills({
			pageSize: 10_000,
			filters: [
				{ column: 'time', operator: FilterOperator.GTE, value: thisRaidLockStart },
				{ column: 'time', operator: FilterOperator.LTE, value: thisRaidLockEnd }
			],
			cache: false
		})
	]);
	const bosskillsByBoss: Record<number, number> = {};
	const bosskillsByRaid: Record<string, number> = {};
	for (const bk of bosskills) {
		bosskillsByBoss[bk.entry] ??= 0;
		bosskillsByBoss[bk.entry]++;

		bosskillsByRaid[bk.map] ??= 0;
		bosskillsByRaid[bk.map]++;
	}

	return {
		raids,
		bosskillsByBoss,
		bosskillsByRaid
	};
};
