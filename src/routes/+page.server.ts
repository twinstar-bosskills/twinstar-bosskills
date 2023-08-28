import { fromServerTime, raidLock } from '$lib/date';
import type { BossKill } from '$lib/model';
import { listAllLatestBossKills } from '$lib/server/api';
import { FilterOperator } from '$lib/server/api/filter';
import { format } from 'date-fns';

import type { PageServerLoad } from './$types';
type ByTime = Record<string, number>;
type ByBoss = {
	count: number;
	bossName: string;
	bossId: number;
	mode: number;
	difficulty: string;
};
type RaidLockData = {
	first: BossKill | null;
	last: BossKill | null;
	byHour: ByTime;
	byWeekDay: ByTime;

	killsByBoss: ByBoss[];
	wipesByBoss: ByBoss[];
	kills: number;
	wipes: number;
	wipePercentage: number;
};

const toRaidLockData = (data: BossKill[]): RaidLockData => {
	const byHour: Record<string, number> = {};
	const byWeekDay: Record<string, number> = {};

	const wipesByBoss: Record<string, ByBoss> = {};
	const killsByBoss: Record<string, ByBoss> = {};
	let kills = 0;
	let wipes = 0;

	// because lastest bosskills are ordered by time DESC
	const last = data[0] ?? null;
	const first = data[data.length - 1] ?? null;
	for (const bk of data) {
		const date = fromServerTime(bk.time);
		try {
			const weekDayKey = format(date, 'EEEE');
			byWeekDay[weekDayKey] ??= 0;
			byWeekDay[weekDayKey]++;
		} catch (e) {}

		try {
			const hourKey = format(date, 'HH');
			byHour[hourKey] ??= 0;
			byHour[hourKey]++;
		} catch (e) {}

		const bkey = `${bk.entry}_${bk.mode}`;
		if (bk.wipes > 0) {
			wipes++;
			wipesByBoss[bkey] ??= {
				count: 1,
				bossId: bk.entry,
				bossName: bk.creature_name,
				mode: bk.mode,
				difficulty: bk.difficulty
			};
			wipesByBoss[bkey]!.count++;
		}

		kills++;
		killsByBoss[bkey] ??= {
			count: 1,
			bossId: bk.entry,
			bossName: bk.creature_name,
			mode: bk.mode,
			difficulty: bk.difficulty
		};
		killsByBoss[bkey]!.count++;
	}
	const wipePercentage = kills > 0 ? Math.round(10000 * (wipes / kills)) / 100 : 0;

	return {
		first,
		last,
		byHour,
		byWeekDay,

		killsByBoss: Object.values(killsByBoss).sort((a, b) => b.count - a.count),
		wipesByBoss: Object.values(wipesByBoss).sort((a, b) => b.count - a.count),
		kills,
		wipes,
		wipePercentage
	};
};
export const load: PageServerLoad = async () => {
	const now = new Date();
	const { start: thisRaidLockStart, end: thisRaidLockEnd } = raidLock(now);
	const { start: lastRaidLockStart, end: lastRaidLockEnd } = raidLock(now, 1);

	const [thisRaidLock, lastRaidLock] = await Promise.all([
		listAllLatestBossKills({
			pageSize: 10_000,
			filters: [
				{ column: 'time', operator: FilterOperator.GTE, value: thisRaidLockStart },
				{ column: 'time', operator: FilterOperator.LTE, value: thisRaidLockEnd }
			],
			cache: false
		}).then(toRaidLockData),
		listAllLatestBossKills({
			pageSize: 10_000,
			filters: [
				{ column: 'time', operator: FilterOperator.GTE, value: lastRaidLockStart },
				{ column: 'time', operator: FilterOperator.LTE, value: lastRaidLockEnd }
			]
		}).then(toRaidLockData)
	]);

	return {
		thisRaidLock,
		lastRaidLock
	};
};
