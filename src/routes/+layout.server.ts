// TODO: enable when ready for deploy
export const prerender = false;
import { REALM_HELIOS } from '$lib/realm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, params }) => {
	const h = Number(cookies.get('wih'));
	const w = Number(cookies.get('wiw'));
	return {
		character: cookies.get('character') ?? '',
		realm: params.realm ?? REALM_HELIOS,
		windowInnerWidth: isFinite(w) && w > 0 ? w : undefined,
		windowInnerHeight: isFinite(h) && h > 0 ? h : undefined
	};
};
