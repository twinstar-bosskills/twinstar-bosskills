import { TWINSTAR_API_URL } from '$env/static/private';
import type { Raid } from '$lib/model';
import { withCache } from '../cache';

export const getRaids = async (): Promise<Raid[]> => {
	const fallback = async () => {
		try {
			const r = await fetch(`${TWINSTAR_API_URL}/bosskills/raids?expansion=4`);
			return r.json();
		} catch (e) {
			console.error(e);
		}

		return [];
	};

	return withCache({ deps: [`raids`], fallback });
};
