export const prerender = false;
import type { LayoutServerLoad } from './$types';

import { findBosses, getBoss } from '$lib/server/model/boss.model';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const realm = params.realm!;
	const boss = await getBoss({ realm, remoteId: id });
	if (!boss) {
		error(404, {
			message: `Boss not found by remote id: ${id}`
		});
	}

	const raidBosses = (await findBosses({ realm })).filter((b) => b.raid_id === boss.raid_id);

	return {
		boss,
		raidBosses
	};
};
