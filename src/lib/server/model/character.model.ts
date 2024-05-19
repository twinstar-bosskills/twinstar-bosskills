import { withCache } from '../cache';
import {
	getCharacterPerformanceLines as lines,
	getCharacterBossRankings as rankings,
	getCharacterPerformanceTrends as trends,
	type GetCharacterBossRankingsArgs,
	type GetCharacterPerformanceLinesArgs,
	type GetCharacterPerformanceTrendsArgs
} from '../db/character';

type Rankings = Awaited<ReturnType<typeof rankings>>;
const KEY_CHARACTER_BOSS_RANKINGS = 'model/character/getCharacterBossRankings';
export const getCharacterBossRankings = async (args: GetCharacterBossRankingsArgs) => {
	const fallback = () => rankings(args);
	return withCache<Rankings>({
		deps: [KEY_CHARACTER_BOSS_RANKINGS, args],
		fallback,
		defaultValue: {},
		expire: 30 * 60
	});
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
	item: Rankings
) => {
	const fallback = () => {
		return item;
	};
	return withCache<Rankings>({
		deps: [KEY_CHARACTER_BOSS_RANKINGS, args],
		fallback,
		defaultValue: {},
		expire: 30 * 60
	});
};
