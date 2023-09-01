// TODO: enable when ready for deploy
export const prerender = false;
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const h = Number(cookies.get('wih'));
	const w = Number(cookies.get('wiw'));
	return {
		character: cookies.get('character') ?? '',
		windowInnerWidth: isFinite(w) && w > 0 ? w : undefined,
		windowInnerHeight: isFinite(h) && h > 0 ? h : undefined
	};
};
