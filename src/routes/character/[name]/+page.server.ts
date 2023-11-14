import type { Boss } from '$lib/model';
import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import * as api from '$lib/server/api';
import { getBoss } from '$lib/server/api';
import { getCharacterPerformance } from '$lib/server/db/character';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url, 20);
	const name = params.name.charAt(0).toUpperCase() + params.name.slice(1);
	const [data, total] = await Promise.all([
		api.getCharacterBossKills({
			name,
			page,
			pageSize
		}),
		api.getCharacterTotalBossKills({ name })
	]);

	if (data.length === 0) {
		throw error(404, { message: `Character ${name} was not found` });
	}

	const guid = data[0]?.guid ?? null;
	if (guid === null) {
		throw error(404, { message: `Character ${name} was not found` });
	}

	// sort by time desc
	data.sort((a, b) => {
		const timeA = a.boss_kills?.time;
		const timeB = b.boss_kills?.time;
		if (timeA && timeB) {
			try {
				return new Date(timeB).getTime() - new Date(timeA).getTime();
			} catch (e) {}
		}
		return 0;
	});

	let startDate = undefined;
	let endDate = undefined;
	try {
		let startTime = data[data.length - 1]?.boss_kills?.time;
		startDate = startTime ? new Date(startTime) : undefined;

		let endTime = data[0]?.boss_kills?.time;
		endDate = endTime ? new Date(endTime) : undefined;
	} catch (e) {}

	const bossIds: Record<Boss['entry'], Boss['entry']> = {};
	for (const characterBk of data) {
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

	const performance = getCharacterPerformance({
		guid,
		startDate,
		endDate
	});

	return {
		bossById,
		bosskills: {
			data: data,
			total
		},

		name,
		performance
	};
};
