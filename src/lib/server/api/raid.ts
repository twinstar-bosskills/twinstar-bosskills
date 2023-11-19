import { TWINSTAR_API_URL } from '$env/static/private';
import type { Raid } from '$lib/model';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import { withCache } from '../cache';

type GetRaidsArgs = { realm?: string };
export const getRaids = async ({ realm = REALM_HELIOS }: GetRaidsArgs): Promise<Raid[]> => {
	const expansion = realmToExpansion(realm);
	const url = `${TWINSTAR_API_URL}/bosskills/raids?expansion=${expansion}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const raids: Raid[] = await r.json();
			for (const raid of raids) {
				for (let i = 0; i < raid.bosses.length; ++i) {
					const boss = raid.bosses[i]!;

					// MoP
					// remove Elder Asani
					if (boss.entry === 60586) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 60586);
						continue;
					}

					// Cata
					// remove Kohcrom
					if (boss.entry === 57773) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 57773);
						continue;
					}
				}

				for (let i = 0; i < raid.bosses.length; ++i) {
					const boss = raid.bosses[i]!;

					// MoP
					if (boss.entry === 60583) {
						raid.bosses[i]!.name = 'Protectors of the Endless';
					}

					if (boss.entry === 59915) {
						raid.bosses[i]!.name = 'Stone Guard';
					}

					if (boss.entry === 60701) {
						raid.bosses[i]!.name = 'Spirit Kings';
					}

					if (boss.entry === 60399) {
						raid.bosses[i]!.name = 'Will of the Emperor';
					}

					// Cata
					if (boss.entry === 53879) {
						raid.bosses[i]!.name = 'Spine of Deathwing';
					}

					if (boss.entry === 56173) {
						raid.bosses[i]!.name = 'Madness of Deathwing';
					}
				}
			}

			return raids;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({ deps: [`raids`, realm], fallback, defaultValue: [] });
};
