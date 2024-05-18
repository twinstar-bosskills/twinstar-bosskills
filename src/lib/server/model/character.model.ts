import { withCache } from '../cache';
import {
	getCharacterPerformanceLines as lines,
	getCharacterBossRankings as rankings,
	getCharacterPerformanceTrends as trends,
	type GetCharacterBossPerformanceRankingsArgs,
	type GetCharacterPerformanceLinesArgs,
	type GetCharacterPerformanceTrendsArgs
} from '../db/character';

export const getCharacterBossRankings = async (args: GetCharacterBossPerformanceRankingsArgs) => {
	const fallback = () => rankings(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterBossRankings', args],
		fallback,
		defaultValue: {}
	});
};

export const getCharacterPerformanceTrends = async (args: GetCharacterPerformanceTrendsArgs) => {
	const fallback = () => trends(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceTrends', args],
		fallback,
		defaultValue: {}
	});
};

export const getCharacterPerformanceLines = async (args: GetCharacterPerformanceLinesArgs) => {
	const fallback = () => lines(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/character/getCharacterPerformanceLines', args],
		fallback,
		defaultValue: []
	});
};