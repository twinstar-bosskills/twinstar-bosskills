import { TWINSTAR_API_URL } from '$env/static/private';

import { realmToExpansion, REALM_HELIOS } from '$lib/realm';
import { withCache } from '../cache';
import { raidsSchema, type Raid } from './schema';

type GetRaidsArgs = { realm?: string; cache?: boolean };
export const getRaids = async ({ realm = REALM_HELIOS, cache }: GetRaidsArgs): Promise<Raid[]> => {
	const expansion = realmToExpansion(realm);
	const url = `${TWINSTAR_API_URL}/bosskills/raids?expansion=${expansion}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const json = await r.json();
			const raids: Raid[] = raidsSchema.parse(json);
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
					// remove DS - Kohcrom
					if (boss.entry === 57773) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 57773);
						continue;
					}

					// remove FL - Rhyolith's duplicate?
					if (boss.entry === 54199) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 54199);
						continue;
					}

					// remove BoT - Theralion
					if (boss.entry === 45993) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 45993);
						continue;
					}

					// remove BWD - Arcanotron
					if (boss.entry === 42166) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 42166);
						continue;
					}

					// remove BWD - Toxitron
					if (boss.entry === 42180) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 42180);
						continue;
					}

					// remove BWD - Onyxia
					if (boss.entry === 41270) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 41270);
						continue;
					}

					// remove TotFW - Anshal
					if (boss.entry === 45870) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 45870);
						continue;
					}

					// remove TotFW - Rohash
					if (boss.entry === 45872) {
						raid.bosses = raid.bosses.filter((b) => b.entry !== 45872);
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

					// Cata - DS
					if (boss.entry === 53879) {
						raid.bosses[i]!.name = 'Spine of Deathwing';
					}

					if (boss.entry === 56173) {
						raid.bosses[i]!.name = 'Madness of Deathwing';
					}

					// Cata - BoT
					if (boss.entry === 45992) {
						raid.bosses[i]!.name = 'Theralion and Valiona';
					}

					if (boss.entry === 43735) {
						raid.bosses[i]!.name = 'Ascendant Council';
					}

					// Cata - BWD
					if (boss.entry === 42179) {
						raid.bosses[i]!.name = 'Omnotron Defense System';
					}

					// Cata - TotFW
					if (boss.entry === 45871) {
						raid.bosses[i]!.name = 'The Conclave of Wind';
					}
				}
			}

			return raids;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	if (cache === false) {
		return fallback().catch((e) => {
			console.error(e);
			return [];
		});
	}

	return withCache({ deps: [`raids`, realm], fallback, defaultValue: [] });
};
