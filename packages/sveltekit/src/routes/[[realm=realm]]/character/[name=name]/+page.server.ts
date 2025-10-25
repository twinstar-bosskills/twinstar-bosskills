import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import { getSpecFromUrl } from '$lib/search-params';
import * as api from '$lib/server/api';
import { findBosses } from '$lib/server/model/boss.model';
import {
	getCharacterBossRankings,
	getCharacterPerformanceLines,
	getCharacterPerformanceTrends
} from '$lib/server/model/character.model';
import type { Boss } from '@twinstar-bosskills/api/dist/schema';
import { METRIC_TYPE } from '@twinstar-bosskills/core/dist/metrics';
import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, parent }) => {
	const { character } = await parent();
	const realm = params.realm ?? REALM_HELIOS;
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url, 20);
	const spec = getSpecFromUrl(url);
	const { name, guid } = character;
	const totalPromise = api.getCharacterTotalBossKills({ realm, name });
	const data = await api.getCharacterBossKills({
		realm,
		name,
		page,
		pageSize
	});

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

	type PerfLine = Awaited<ReturnType<typeof getCharacterPerformanceLines>>;
	const performanceLines: Record<Boss['entry'], Record<number, PerfLine>> = {};
	const performanceLinesWaiting = [];
	const bossIds: Record<Boss['entry'], Boss['entry']> = {};
	for (const characterBk of data) {
		if (characterBk.boss_kills) {
			const bossId = characterBk.boss_kills.entry;
			const mode = characterBk.boss_kills.mode;
			bossIds[bossId] = bossId;

			performanceLinesWaiting.push(
				getCharacterPerformanceLines({
					realm,
					guid,
					modes: [mode],
					bossIds: [bossId]
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

	type BossNameByRemoteId = Record<Boss['entry'], string>;
	const bossNameById: BossNameByRemoteId = await findBosses({ realm })
		.then((bosses) => {
			return bosses.reduce((acc, boss) => {
				acc[boss.remote_id] = boss.name;
				return acc;
			}, {} as BossNameByRemoteId);
		})
		.catch(() => ({}));

	await Promise.all(performanceLinesWaiting);
	const performanceTrends = await getCharacterPerformanceTrends({
		realm,
		guid,
		startDate,
		endDate
	});

	const [bossRankingsDPS, bossRankingsHPS] = await Promise.all([
		getCharacterBossRankings({ guid, realm, metric: METRIC_TYPE.DPS, spec }),
		getCharacterBossRankings({ guid, realm, metric: METRIC_TYPE.HPS, spec })
	]);
	const bossRankings = { [METRIC_TYPE.DPS]: bossRankingsDPS, [METRIC_TYPE.HPS]: bossRankingsHPS };
	return {
		bossNameById,
		bosskills: {
			data: data,
			total: await totalPromise.catch(() => 0)
		},

		name,
		performanceTrends,
		performanceLines,

		bossRankings
	};
};
