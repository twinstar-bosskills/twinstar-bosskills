import { talentSpecsByClass } from '$lib/model';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import type { Boss } from '$lib/server/api/schema';
import { getBossStatsMedian } from '$lib/server/db/boss';
import {
	getCharacterPerformanceLinesGrouped,
	type CharacterPerformanceLine
} from '$lib/server/db/character';
import { getFilterFormData } from '$lib/server/form/filter-form';
import type { PageServerLoad } from './$types';

export const load = async ({ params, parent, url }: Parameters<PageServerLoad>[0]) => {
	const realm = params.realm ?? REALM_HELIOS;
	const expansion = realmToExpansion(realm);
	const { character } = await parent();
	const characterSpecs = talentSpecsByClass(expansion, character.class);
	const form = await getFilterFormData({ realm, url, specs: characterSpecs });
	const guid = character.guid;
	const performanceLines: Record<Boss['entry'], Record<number, CharacterPerformanceLine>> = {};

	await getCharacterPerformanceLinesGrouped({
		realm,
		guid,
		specs: form.values.specs,
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
			for (const [mode, line] of Object.entries(byMode)) {
				if (line.length <= 1) {
					// @ts-expect-error Element implicitly has an 'any' type because index expression is not of type 'number'.
					delete performanceLines[bossId][mode];
				}
			}
		}
	});

	let spec = null;
	if (form.values.specs?.length === 1) {
		spec = form.values.specs?.[0] ?? null;
	}

	const medianByBossId: Record<
		number,
		Record<number, Record<number, Record<'dps' | 'hps', number>>>
	> = {};
	if (spec !== null) {
		const medianPromises: Promise<void>[] = [];
		for (const [bossId, byMode] of Object.entries(performanceLines)) {
			const modes = Object.keys(byMode).map(Number);
			const remoteId = Number(bossId);
			for (const metric of ['dps', 'hps'] as const) {
				medianPromises.push(
					getBossStatsMedian({
						realm,
						remoteId,
						specs: form.values.specs,
						difficulties: modes,
						metric: metric
					})
						.then((medians) => {
							medianByBossId[remoteId] ??= {};
							for (const median of medians) {
								medianByBossId[remoteId]![median.mode] ??= {};
								medianByBossId[remoteId]![median.mode]![median.spec] ??= { dps: 0, hps: 0 };
								medianByBossId[remoteId]![median.mode]![median.spec]![metric] = median.value;
							}
						})
						.catch(console.error)
				);
			}
		}
		await Promise.all(medianPromises);
	}

	return {
		spec,
		medianByBossId,
		performanceLines,
		form
	};
};
