import type { MetricType } from '$lib/metrics';
import { EXPIRE_1_DAY, EXPIRE_1_HOUR, withCache } from '../cache';
import {
	getCharacterPerformanceLines as lines,
	getCharacterPerformanceLinesGrouped as linesGrouped,
	getCharacterPerformanceTrends as trends,
	type GetCharacterPerformanceLinesArgs,
	type GetCharacterPerformanceTrendsArgs
} from '../db/character';

export type CharacterRankingStats = {
	value: number;
	rank: number;
	spec: number;
	ilvl: number;
	guid: number;
	mode: number;
	bossRemoteId: number;
	bosskillRemoteId: string;
};

export type CharacterBossRankingStats = {
	[bosskillRemoteId in string]: {
		[mode in number]: CharacterRankingStats;
	};
};

const KEY_CHARACTER_BOSS_RANKINGS = 'model/character/getCharacterBossRankings';
const withBossRankingsCache = (
	args: GetCharacterBossRankingsArgs,
	fallback: () => CharacterBossRankingStats | Promise<CharacterBossRankingStats>,
	force: boolean = false
) => {
	return withCache<CharacterBossRankingStats>({
		deps: [KEY_CHARACTER_BOSS_RANKINGS, args],
		fallback,
		defaultValue: {},
		// 1 day
		expire: EXPIRE_1_DAY,
		force
	});
};

type GetCharacterBossRankingsArgs = {
	realm: string;
	metric: MetricType;
	guid?: number;
	spec?: number;
};
export const getCharacterBossRankings = async (args: GetCharacterBossRankingsArgs) => {
	const fallback = () => {
		throw Error('wait until recache happens');
	};
	return withBossRankingsCache(args, fallback);
};

export const getCharacterPerformanceTrends = async (args: GetCharacterPerformanceTrendsArgs) => {
	const fallback = () => trends(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceTrends', args],
		fallback,
		defaultValue: {},
		expire: EXPIRE_1_HOUR
	});
};

export const getCharacterPerformanceLines = async (args: GetCharacterPerformanceLinesArgs) => {
	const fallback = () => lines(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceLines', args],
		fallback,
		defaultValue: [],
		expire: EXPIRE_1_HOUR
	});
};
export const getCharacterPerformanceLinesGrouped = async (
	args: GetCharacterPerformanceLinesArgs
) => {
	const fallback = () => linesGrouped(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceLinesGrouped', args],
		fallback,
		defaultValue: [],
		expire: EXPIRE_1_HOUR
	});
};

export const setCharacterBossRankings = async (
	args: GetCharacterBossRankingsArgs,
	item: CharacterBossRankingStats
) => {
	const fallback = () => {
		return item;
	};
	return withBossRankingsCache(args, fallback, true);
};
