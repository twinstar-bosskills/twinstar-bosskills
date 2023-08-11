import * as db from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const character = await db.getCharacter(Number(params.guid));
	if (!character) {
		throw error(404, {
			message: 'Not found'
		});
	}

	return {
		character
	};
};
