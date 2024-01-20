import type { Boss } from '$lib/model';
import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import { REALM_HELIOS } from '$lib/realm';
import * as api from '$lib/server/api';
import { getBoss } from '$lib/server/api';
import {
	getCharacterPerformanceLine,
	getCharacterPerformanceTrends,
	type CharacterPerformanceLine
} from '$lib/server/db/character';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, parent }) => {
	const { character } = await parent();
	const realm = params.realm ?? REALM_HELIOS;
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url, 20);
	const { name, guid } = character;
	const [data, total] = await Promise.all([
		api.getCharacterBossKills({
			realm,
			name,
			page,
			pageSize
		}),
		api.getCharacterTotalBossKills({ realm, name })
	]);

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

	const performanceLines: Record<Boss['entry'], Record<number, CharacterPerformanceLine>> = {};
	const performanceLinesWaiting = [];
	const bossIds: Record<Boss['entry'], Boss['entry']> = {};
	for (const characterBk of data) {
		if (characterBk.boss_kills) {
			const bossId = characterBk.boss_kills.entry;
			const mode = characterBk.boss_kills.mode;
			bossIds[bossId] = bossId;

			performanceLinesWaiting.push(
				getCharacterPerformanceLine({
					realm,
					guid,
					mode,
					bossId
				})
					.then((rows) => {
						// show al least 2 points
						if (rows.length > 1) {
							performanceLines[bossId] ??= {};
							performanceLines[bossId]![mode] = rows;
						}
					})
					.catch(console.error)
			);
		}
	}

	const bossNameById: Record<Boss['entry'], string> = {};
	await Promise.all(
		Object.values(bossIds).map((id) => {
			return getBoss({ realm, id }).then((boss) => {
				if (boss) {
					bossNameById[boss.entry] = boss.name;
				}
			});
		})
	);

	await Promise.all(performanceLinesWaiting);
	const performanceTrends = await getCharacterPerformanceTrends({
		realm,
		guid,
		startDate,
		endDate
	});

	return {
		bossNameById,
		bosskills: {
			data: data,
			total
		},

		name,
		performanceTrends,
		performanceLines
	};
};
