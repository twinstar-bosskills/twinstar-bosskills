export const prerender = false;
import type { LayoutServerLoad } from './$types';

import { getBoss } from '$lib/server/model/boss.model';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, url }) => {
	const id = Number(params.id);
	const boss = await getBoss({ realm: params.realm!, remoteId: id });
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	return {
		boss
	};
};
