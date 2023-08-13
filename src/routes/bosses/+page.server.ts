import * as db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const bosses = db.getBosses();
	return {
		bosses
	};
};
