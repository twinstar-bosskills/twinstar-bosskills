import { fromServerTime, raidLock } from '@twinstar-bosskills/core/dist/date';
import { realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
import { difficultyToString } from '@twinstar-bosskills/core/dist/wow';
import { findBossKills } from '@twinstar-bosskills/db/dist/boss-kill';
import { findRaidsByRealm } from '@twinstar-bosskills/db/dist/raid';
import type { BossKill } from '@twinstar-bosskills/db/dist/types';
import { format } from 'date-fns';
import { EXPIRE_5_MIN, withCache } from '@twinstar-bosskills/cache';
import { findBosses } from './boss.model';

export const getRaids = async (args: { realm: string }) => {
	const fallback = () => findRaidsByRealm(args);

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
	bossRemoteId: number;
	mode: number;
	difficulty: string;
};
type KeyValue = {
	key: string;
	value: number;
};
type TopKeyValue = {
	byWeekDay: KeyValue[];
	topDay: KeyValue | null;
	byHour: KeyValue[];
	topHour: KeyValue | null;
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

	top: TopKeyValue;
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
	wipePercentage: 0,
	top: {
		byWeekDay: [],
		topDay: null,
		byHour: [],
		topHour: null
	}
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
		type BossById = Record<(typeof bosses)[0]['id'], (typeof bosses)[0]>;
		const bossById = bosses.reduce((acc, boss) => {
			acc[boss.id] = boss;
			return acc;
		}, {} as BossById);
		const topKeyValue = (item: RaidLockData): TopKeyValue => {
			const byWeekDay: KeyValue[] = [];
			for (const [key, value] of Object.entries(item.byWeekDay)) {
				byWeekDay.push({ key, value });
			}
			// byWeekDay.sort((a, b) => b.value - a.value);
			const topDay = byWeekDay.slice().sort((a, b) => b.value - a.value)[0] ?? null;

			const byHour: KeyValue[] = [];
			for (const [key, value] of Object.entries(item.byHour)) {
				byHour.push({ key, value });
			}
			// byHour.sort((a, b) => b.value - a.value);
			const topHour = byHour.slice().sort((a, b) => b.value - a.value)[0] ?? null;
			return {
				byWeekDay,
				topDay,
				byHour,
				topHour
			};
		};
		const toStats = (data: Awaited<ReturnType<typeof findBossKills>>): RaidLockData => {
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
			// sort in place
			data.sort((a, b) => {
				try {
					return new Date(b.time).getTime() - new Date(a.time).getTime();
				} catch (e) {}

				return 0;
			});
			const last = data[0] ?? null;
			const first = data[data.length - 1] ?? null;
			for (const bk of data) {
				const bossRemoteId = bossById[bk.boss_id]?.remote_id ?? 0;
				const bossName = bossById[bk.boss_id]?.name ?? 'N/A';
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

				const bkey = `${bk.boss_id}_${bk.mode}`;
				if (bk.wipes > 0) {
					wipes++;
					wipesByBoss[bkey] ??= {
						count: 1,
						bossRemoteId,
						bossName,
						mode: bk.mode,
						difficulty: difficultyToString(expansion, bk.mode)
					};
					wipesByBoss[bkey]!.count++;
				}

				kills++;
				killsByBoss[bkey] ??= {
					count: 1,
					bossRemoteId,
					bossName,
					mode: bk.mode,
					difficulty: difficultyToString(expansion, bk.mode)
				};
				killsByBoss[bkey]!.count++;
			}
			const wipePercentage = kills > 0 ? Math.round(10000 * (wipes / kills)) / 100 : 0;

			const item = {
				...EMPTY_RAID_LOCK_DATA,
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
			return {
				...item,
				top: topKeyValue(item)
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
		},
		expire: EXPIRE_5_MIN
	});
};
