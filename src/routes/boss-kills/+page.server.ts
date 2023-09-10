import { toArrayOfInf as toArrayOfInt, toArrayOfNonEmptyStrings } from '$lib/mapper';
import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import type { LatestBossKillQueryArgs } from '$lib/server/api';
import * as api from '$lib/server/api';
import { FilterOperator } from '$lib/server/api/filter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url);

	const filters: LatestBossKillQueryArgs['filters'] = [];
	const bosses = toArrayOfInt(url.searchParams.getAll('boss'));
	const raids = toArrayOfNonEmptyStrings(url.searchParams.getAll('raid'));
	const difficulties = toArrayOfInt(url.searchParams.getAll('difficulty'));
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

	const [latestData, raidData] = await Promise.all([
		api.getLatestBossKills({
			page,
			pageSize,
			filters
		}),
		api.getRaids()
	]);

	return {
		latest: latestData,
		form: {
			data: {
				raids: raidData
			},
			values: {
				bosses,
				raids,
				difficulties
			}
		}
	};
};
