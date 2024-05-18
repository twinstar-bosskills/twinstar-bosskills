// TODO: enable when ready for deploy
export const prerender = false;
import { REALMS_LOWECASE, REALM_HELIOS, realmToExpansion } from '$lib/realm';
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
		expansion: realmToExpansion(params.realm),
		windowInnerWidth: isFinite(w) && w > 0 ? w : undefined,
		windowInnerHeight: isFinite(h) && h > 0 ? h : undefined
	};
};
