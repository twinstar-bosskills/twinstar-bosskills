// TODO: enable when ready for deploy
export const prerender = false;
import { REALMS_LOWECASE, REALM_HELIOS, realmIsPublic, realmToExpansion } from '$lib/realm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, params }) => {
	const h = Number(cookies.get('wih'));
	const w = Number(cookies.get('wiw'));

	// @mutation: mutate realm in params
	// locals might be better?
	params.realm = REALMS_LOWECASE[params.realm?.toLowerCase() as string] ?? REALM_HELIOS;
	return {
		selectedCharacter: cookies.get('character') ?? '',
		realm: params.realm,
		realmIsPrivate: realmIsPublic(params.realm) === false,
		expansion: realmToExpansion(params.realm),
		windowInnerWidth: isFinite(w) && w > 0 ? w : undefined,
		windowInnerHeight: isFinite(h) && h > 0 ? h : undefined,
		guildToken: cookies.get('guild-token') ?? '',
		guildName: cookies.get('guild-name') ?? ''
	};
};
