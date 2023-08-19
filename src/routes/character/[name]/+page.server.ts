import type { Boss } from '$lib/model';
import * as api from '$lib/server/api';
import { getBoss } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const name = params.name.charAt(0).toUpperCase() + params.name.slice(1);
	const characterBossKills = await api.getCharacterBossKills({
		name,
		page: 0,
		pageSize: 1000
	});

	if (characterBossKills.length === 0) {
		throw error(404, { message: `Character ${name} was not found` });
	}

	// sort by time desc
	characterBossKills.sort((a, b) => {
		const timeA = a.boss_kills?.time;
		const timeB = b.boss_kills?.time;
		if (timeA && timeB) {
			try {
				return new Date(timeB).getTime() - new Date(timeA).getTime();
			} catch (e) {}
		}
		return 0;
	});

	const bossIds: Record<Boss['entry'], Boss['entry']> = {};
	for (const characterBk of characterBossKills) {
		if (characterBk.boss_kills) {
			const bossId = characterBk.boss_kills.entry;
			bossIds[bossId] = bossId;
		}
	}

	const bossById: Record<Boss['entry'], Boss> = {};
	await Promise.all(
		Object.values(bossIds).map((id) => {
			return getBoss(id).then((boss) => {
				if (boss) {
					bossById[boss.entry] = boss;
				}
			});
		})
	);

	return {
		bossById,
		bosskills: characterBossKills,
		name
	};
};
