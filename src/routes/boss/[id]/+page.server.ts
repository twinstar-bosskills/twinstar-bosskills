import * as db from '$lib/server/db';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL } from '$lib/stats-type';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const boss = await db.getBoss(id);
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}
	const [dmg, heal] = await Promise.all([
		db.getBossStatsByTalentSpec({ id, statsType: STATS_TYPE_DMG }),
		db.getBossStatsByTalentSpec({ id, statsType: STATS_TYPE_HEAL })
	]);

	const guids: Record<number, number> = {};
	for (const item of [...dmg, ...heal]) {
		guids[item.guid] = item.guid;
	}

	return {
		boss,
		stats: [
			{ type: STATS_TYPE_DMG, value: dmg },
			{ type: STATS_TYPE_HEAL, value: heal }
		]
	};
};
