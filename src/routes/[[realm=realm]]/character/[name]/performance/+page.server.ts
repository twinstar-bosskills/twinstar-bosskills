import { REALM_HELIOS } from '$lib/realm';
import type { Boss } from '$lib/server/api/schema';
import {
	getCharacterPerformanceLineByBoss,
	type CharacterPerformanceLine
} from '$lib/server/db/character';
import type { PageServerLoad } from './$types';

export const load = async ({ params, parent }: Parameters<PageServerLoad>[0]) => {
	const realm = params.realm ?? REALM_HELIOS;
	const { character } = await parent();

	const guid = character.guid;
	const performanceLines: Record<Boss['entry'], Record<number, CharacterPerformanceLine>> = {};
	await getCharacterPerformanceLineByBoss({
		realm,
		guid
	}).then((rows) => {
		for (const row of rows) {
			const { bossId, mode } = row;
			performanceLines[bossId] ??= {};
			performanceLines[bossId]![mode] ??= [];
			performanceLines[bossId]![mode]!.push(row);
		}
	});

	return {
		performanceLines
	};
};
