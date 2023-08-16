// TODO: enable when ready for deploy
export const prerender = false;
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return {
		character: cookies.get('character') ?? ''
	};
};
