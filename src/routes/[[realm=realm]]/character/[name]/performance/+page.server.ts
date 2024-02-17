import { REALM_HELIOS } from '$lib/realm';
import type { Boss } from '$lib/server/api/schema';
import {
	getCharacterPerformanceLinesGrouped,
	type CharacterPerformanceLine
} from '$lib/server/db/character';
import { getFilterFormData } from '$lib/server/form/filter-form';
import type { PageServerLoad } from './$types';

export const load = async ({ params, parent, url }: Parameters<PageServerLoad>[0]) => {
	const realm = params.realm ?? REALM_HELIOS;
	const { character } = await parent();

	const form = await getFilterFormData({ realm, url });
	const guid = character.guid;
	const performanceLines: Record<Boss['entry'], Record<number, CharacterPerformanceLine>> = {};
	await getCharacterPerformanceLinesGrouped({
		realm,
		guid,
		raids: form.values.raids,
		bossIds: form.values.bosses,
		modes: form.values.difficulties
	}).then((rows) => {
		for (const row of rows) {
			const { bossId, mode } = row;
			performanceLines[bossId] ??= {};
			performanceLines[bossId]![mode] ??= [];
			performanceLines[bossId]![mode]!.push(row);
		}

		for (const [bossId, byMode] of Object.entries(performanceLines)) {
			let shoudBeRemoved = false;
			for (const [_, line] of Object.entries(byMode)) {
				if (line.length <= 1) {
					shoudBeRemoved = true;
				} else {
					shoudBeRemoved = false;
					break;
				}
			}
			if (shoudBeRemoved) {
				delete performanceLines[Number(bossId)];
			}
		}
	});
	return {
		performanceLines,
		form
	};
};
