import { TWINSTAR_API_URL } from '$env/static/private';
import type { Raid } from '$lib/model';
import { withCache } from '../cache';

export const getRaids = async (): Promise<Raid[]> => {
	const url = `${TWINSTAR_API_URL}/bosskills/raids?expansion=4`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			return r.json();
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({ deps: [`raids`], fallback }) ?? [];
};
