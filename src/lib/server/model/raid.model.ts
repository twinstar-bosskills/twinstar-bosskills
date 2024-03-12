import { fromServerTime, raidLock } from '$lib/date';
import { difficultyToString } from '$lib/model';
import type { BossKill } from '$lib/model/boss-kill.model';
import { realmToExpansion } from '$lib/realm';
import { format } from 'date-fns';
import { withCache } from '../cache';
import { findBossKills } from '../db/boss-kill';
import { findByRealm } from '../db/raid';
import { findBosses } from './boss.model';

export const getRaids = async (args: { realm: string }) => {
	const fallback = () => findByRealm(args);

	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/raid/getRaids', args],
		fallback,
		defaultValue: []
	});
};

type GetRaidLockStatsArgs = {
	realm: string;
};
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
const EMPTY_RAID_LOCK_DATA: RaidLockData = {
	first: null,
	last: null,
	byHour: {},
	byWeekDay: {},

	killsByBoss: [],
	wipesByBoss: [],
	kills: 0,
	wipes: 0,
	wipePercentage: 0
};
export type RaidLockStats = {
	previous: RaidLockData;
	current: RaidLockData;
};
export const getRaidLockStats = async (args: GetRaidLockStatsArgs): Promise<RaidLockStats> => {
	const fallback = async () => {
		const { realm } = args;
		const now = new Date();
		const currentLock = raidLock(now);
		const previousLock = raidLock(now, 1);
		const expansion = realmToExpansion(realm);

		const bosses = await findBosses({ realm });
		type BossNameById = Record<(typeof bosses)[0]['id'], (typeof bosses)[0]['name']>;
		const bossNameById = bosses.reduce((acc, boss) => {
			acc[boss.id] = boss.name;
			return acc;
		}, {} as BossNameById);
		const toStats = (data: BossKill[]): RaidLockData => {
			const byHour: Record<string, number> = {};
			for (let i = 0; i < 24; i++) {
				const key = `${String(i).padStart(2, '0')}:00`;
				byHour[key] = 0;
			}
			const byWeekDay: Record<string, number> = {
				Wednesday: 0,
				Thursday: 0,
				Friday: 0,
				Saturday: 0,
				Sunday: 0,
				Monday: 0,
				Tuesday: 0
			};

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
					const hourKey = format(date, 'HH:00');
					byHour[hourKey] ??= 0;
					byHour[hourKey]++;
				} catch (e) {}

				const bkey = `${bk.bossId}_${bk.mode}`;
				if (bk.wipes > 0) {
					wipes++;
					wipesByBoss[bkey] ??= {
						count: 1,
						bossId: bk.bossId,
						bossName: bossNameById[bk.bossId] ?? 'N/A',
						mode: bk.mode,
						difficulty: difficultyToString(expansion, bk.mode)
					};
					wipesByBoss[bkey]!.count++;
				}

				kills++;
				killsByBoss[bkey] ??= {
					count: 1,
					bossId: bk.bossId,
					bossName: bossNameById[bk.bossId] ?? 'N/A',
					mode: bk.mode,
					difficulty: difficultyToString(expansion, bk.mode)
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

		const [previousStats, currentStats] = await Promise.all([
			findBossKills({
				realm,
				startsAt: previousLock.start,
				endsAt: previousLock.end
			}).then(toStats),
			findBossKills({
				realm,
				startsAt: currentLock.start,
				endsAt: currentLock.end
			}).then(toStats)
		]);

		return {
			previous: previousStats,
			current: currentStats
		};
	};

	return withCache<RaidLockStats>({
		deps: [`model/raid/getRaidLockStats`, args],
		fallback,
		defaultValue: {
			previous: EMPTY_RAID_LOCK_DATA,
			current: EMPTY_RAID_LOCK_DATA
		}
	});
};
