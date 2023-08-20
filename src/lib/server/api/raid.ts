import { TWINSTAR_API_URL } from '$env/static/private';
import type { Raid } from '$lib/model';
import { withCache } from '../cache';

export const getRaids = async (): Promise<Raid[]> => {
	const url = `${TWINSTAR_API_URL}/bosskills/raids?expansion=4`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const raids: Raid[] = await r.json();
			for (const raid of raids) {
				// remove Elder Asani
				raid.bosses = raid.bosses.filter((b) => b.entry !== 60586);
			}

			return raids;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({ deps: [`raids`], fallback }) ?? [];
};
