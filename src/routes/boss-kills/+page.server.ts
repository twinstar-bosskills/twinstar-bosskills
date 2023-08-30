import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import * as api from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url);

	const latest = await api.getLatestBossKills({
		page,
		pageSize
	});
	return {
		latest
	};
};
