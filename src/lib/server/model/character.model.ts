import type { MetricType } from '$lib/metrics';
import { withCache } from '../cache';
import {
	getCharacterPerformanceLines as lines,
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
		expire: 24 * 60 * 60,
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
		expire: 30 * 60
	});
};

export const getCharacterPerformanceLines = async (args: GetCharacterPerformanceLinesArgs) => {
	const fallback = () => lines(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceLines', args],
		fallback,
		defaultValue: [],
		expire: 30 * 60
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
