import * as api from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const raids = await api.getRaids();

	return {
		raids
	};
};
