import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import { REALM_HELIOS } from '$lib/realm';
import type { LatestBossKillQueryArgs } from '$lib/server/api';
import * as api from '$lib/server/api';
import { FilterOperator } from '$lib/server/api/filter';
import type { Boss } from '$lib/server/api/schema';
import { getFilterFormData } from '$lib/server/form/filter-form';
import { getBosses } from '$lib/server/model/boss.model';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params }) => {
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url);
	const realm = params.realm ?? REALM_HELIOS;
	const form = await getFilterFormData({ realm, url });

	const filters: LatestBossKillQueryArgs['filters'] = [];
	const bosses = form.values.bosses;
	const raids = form.values.raids;
	const difficulties = form.values.difficulties;
	if (bosses.length > 0) {
		filters.push({
			column: 'entry',
			value: bosses,
			operator: FilterOperator.IN
		});
	}
	if (raids.length > 0) {
		filters.push({
			column: 'map',
			value: raids,
			operator: FilterOperator.IN
		});
	}
	if (difficulties.length > 0) {
		filters.push({
			column: 'mode',
			value: difficulties,
			operator: FilterOperator.IN
		});
	}

	const [latestData, bossesData] = await Promise.all([
		api.getLatestBossKills({
			realm,
			page,
			pageSize,
			filters
		}),
		getBosses({ realm })
	]);

	const bossNameByRemoteId: Record<Boss['entry'], string> = {};
	for (const boss of bossesData) {
		bossNameByRemoteId[boss.remoteId] = boss.name;
	}

	return {
		latest: latestData,
		bossNameByRemoteId,
		form
	};
};
