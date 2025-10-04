// TODO: enable when ready for deploy
export const prerender = false;
import type { LayoutServerLoad } from './$types';

import { getBoss } from '$lib/server/model/boss.model';
import { error } from '@sveltejs/kit';
import { realmToExpansion } from '$lib/realm';
import { getDifficultyFromUrl, getSpecFromUrl } from '$lib/search-params';
import { defaultDifficultyByExpansion } from '$lib/model';

export const load: LayoutServerLoad = async ({ params, url }) => {
	const id = Number(params.id);
	const boss = await getBoss({ realm: params.realm!, remoteId: id });
	if (!boss) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const expansion = realmToExpansion(params.realm!);
	const difficulty = getDifficultyFromUrl(url) ?? defaultDifficultyByExpansion(expansion);
	const talentSpec = getSpecFromUrl(url);
	return {
		boss,
		expansion,
		difficulty,
		talentSpec
	};
};
