// TODO: enable when ready for deploy
export const prerender = false;
import {
	REALMS_LOWER_CASE,
	REALM_HELIOS,
	realmIsPublic,
	realmMergedTo,
	realmToExpansion
} from '@twinstar-bosskills/core/dist/realm';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { links } from '$lib/links';
import { getDifficultyFromUrl, getRaidLockOffsetFromUrl, getSpecFromUrl } from '$lib/search-params';
import { defaultDifficultyByExpansion } from '@twinstar-bosskills/core/dist/wow';

export const load: LayoutServerLoad = async ({ cookies, params, url }) => {
	const h = Number(cookies.get('wih'));
	const w = Number(cookies.get('wiw'));

	// @mutation: mutate realm in params
	// locals might be better?
	params.realm = REALMS_LOWER_CASE[params.realm?.toLowerCase() as string] ?? REALM_HELIOS;

	const mergedTo = realmMergedTo(params.realm);
	if (mergedTo) {
		redirect(302, links.home(mergedTo));
	}

	const expansion = realmToExpansion(params.realm!);
	const difficulty = getDifficultyFromUrl(url) ?? defaultDifficultyByExpansion(expansion);
	const talentSpec = getSpecFromUrl(url);
	const raidlock = getRaidLockOffsetFromUrl(url) ?? 0;
	return {
		selectedCharacter: cookies.get('character') ?? '',
		realm: params.realm,
		realmIsPrivate: realmIsPublic(params.realm) === false,
		expansion,
		difficulty,
		talentSpec,
		raidlock,
		windowInnerWidth: isFinite(w) && w > 0 ? w : undefined,
		windowInnerHeight: isFinite(h) && h > 0 ? h : undefined,
		guildToken: cookies.get('guild-token') ?? '',
		guildName: cookies.get('guild-name') ?? ''
	};
};
