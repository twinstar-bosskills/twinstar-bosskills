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
				for (let i = 0; i < raid.bosses.length; ++i) {
					const boss = raid.bosses[i]!;

					// remove Elder Asani
					if (boss.entry === 60586) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 60586);
						continue;
					}

					if (boss.name.toLowerCase() === 'protector kaolan') {
						raid.bosses[i]!.name = 'Protectors of the Endless (Protector Kaolan)';
					}

					if (boss.name.toLowerCase() === 'jasper guardian') {
						raid.bosses[i]!.name = 'Stone Guard (Jasper Guardian)';
					}
				}
			}

			return raids;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({ deps: [`raids`], fallback }) ?? [];
};
