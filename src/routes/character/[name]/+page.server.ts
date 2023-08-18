import * as api from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const name = params.name.charAt(0).toUpperCase() + params.name.slice(1);
	const bosskills = await api.getCharacterBossKills({
		name,
		page: 0,
		pageSize: 1000
	});

	if (bosskills.length === 0) {
		throw error(404, { message: `Character ${name} was not found` });
	}

	// sort by time desc
	bosskills.sort((a, b) => {
		const timeA = a.boss_kills?.time;
		const timeB = b.boss_kills?.time;
		if (timeA && timeB) {
			try {
				return new Date(timeB).getTime() - new Date(timeA).getTime();
			} catch (e) {}
		}
		return 0;
	});

	return {
		bosskills,
		name
	};
};
