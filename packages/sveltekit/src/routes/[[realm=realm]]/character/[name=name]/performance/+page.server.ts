import { METRIC_TYPE, type MetricType } from '$lib/metrics';
import { talentSpecsByClass } from '$lib/model';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import type { Boss } from '@twinstar-bosskills/api/dist/schema';
import { getBossStatsMedian } from '$lib/server/model/boss.model';
import { getFilterFormData } from '$lib/server/form/filter-form';
import { getCharacterPerformanceLinesGrouped } from '$lib/server/model/character.model';
import type { PageServerLoad } from './$types';

type Lines = Awaited<ReturnType<typeof getCharacterPerformanceLinesGrouped>>;
export const load = async ({ params, parent, url }: Parameters<PageServerLoad>[0]) => {
	const realm = params.realm ?? REALM_HELIOS;
	const expansion = realmToExpansion(realm);
	const { character } = await parent();
	const characterSpecs = talentSpecsByClass(expansion, character.class);
	const form = await getFilterFormData({ realm, url, specs: characterSpecs, ilvl: true });
	const guid = character.guid;

	const performanceLines: Record<Boss['entry'], Record<number, Lines>> = {};
	await getCharacterPerformanceLinesGrouped({
		realm,
		guid,
		specs: form.values.specs,
		raids: form.values.raids,
		bossIds: form.values.bosses,
		modes: form.values.difficulties,
		ilvlMin: form.values.ilvlMin,
		ilvlMax: form.values.ilvlMax
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

	type Medians = Awaited<ReturnType<typeof getBossStatsMedian>>;

	const medianByBossId: Record<
		number,
		Record<number, Record<number, { dps?: number; hps?: number }>>
	> = {};
	const mediansByMetricAndBoss = {
		dps: {} as Record<number, Medians>,
		hps: {} as Record<number, Medians>
	};
	if (spec !== null) {
		const medianPromises: Promise<void>[] = [];
		for (const [bossId, byMode] of Object.entries(performanceLines)) {
			const modes = Object.keys(byMode).map(Number);
			const remoteId = Number(bossId);
			for (const metric of [METRIC_TYPE.DPS, METRIC_TYPE.HPS] as const) {
				medianPromises.push(
					getBossStatsMedian({
						realm,
						remoteId,
						specs: form.values.specs,
						difficulties: modes,
						metric: metric,
						ilvlMin: form.values.ilvlMin,
						ilvlMax: form.values.ilvlMax
					})
						.then((medians) => {
							mediansByMetricAndBoss[metric][remoteId] = medians;
						})
						.catch(console.error)
				);
			}
		}
		await Promise.all(medianPromises);

		for (const [metric, byRemoteId] of Object.entries(mediansByMetricAndBoss)) {
			for (const [remoteId, medians] of Object.entries(byRemoteId)) {
				const id = Number(remoteId);
				medianByBossId[id] ??= {};
				for (const median of medians) {
					medianByBossId[id]![median.mode] ??= {};
					medianByBossId[id]![median.mode]![median.spec] ??= {};
					medianByBossId[id]![median.mode]![median.spec]![metric as MetricType] = median.value;
				}
			}
		}
	}

	return {
		spec,
		medianByBossId,
		performanceLines,
		form
	};
};
