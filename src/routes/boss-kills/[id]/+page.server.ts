import * as db from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const bosskill = await db.getBosskill(Number(params.id));
	if (!bosskill) {
		throw error(404, {
			message: 'Not found'
		});
	}

	return {
		bosskill
	};
};
