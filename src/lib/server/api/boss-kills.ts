import { TWINSTAR_API_URL } from '$env/static/private';
import {
	classToString,
	modeToString,
	raceToString,
	type BossKill,
	type BossKillDetail
} from '$lib/model';
import { withCache } from '../cache';
import { getClassIconUrl } from './class';
import { queryString, type QueryArgs } from './filter';
import { getRaceIconUrl } from './race';
import { EMPTY_RESPONSE, type Response } from './response';
import { getTalentSpecIconUrl } from './talent';

const mutateItem = <T extends BossKillDetail | BossKill>(item: T): T => {
	item.difficulty = modeToString(item.mode);

	// @ts-ignore
	if (Array.isArray(item.boss_kills_players)) {
		for (const player of (item as BossKillDetail).boss_kills_players) {
			player.classString = classToString(player.class);
			player.classIconUrl = getClassIconUrl(player.class);

			player.raceString = raceToString(player.race);
			player.raceIconUrl = getRaceIconUrl({ race: player.race, gender: player.gender });

			player.talentSpecIconUrl = getTalentSpecIconUrl(player.talent_spec);
		}
	}

	return item;
};

export type BossKillQueryArgs = QueryArgs<keyof BossKill>;
type BossKillsData = Response<BossKill[]>;
export const getBossKills = async (q: BossKillQueryArgs): Promise<BossKillsData> => {
	const url = `${TWINSTAR_API_URL}/bosskills?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const json: BossKillsData = await r.json();
			for (const item of json.data) {
				mutateItem(item);
			}
			return json;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};
	return withCache({ deps: [`boss-kills`, q], fallback }) ?? (EMPTY_RESPONSE as BossKillsData);
};

export const getLatestBossKills = async (
	q: Omit<BossKillQueryArgs, 'sorter'> = {}
): Promise<BossKillsData> => {
	return getBossKills({
		...q,
		sorter: {
			column: 'time',
			order: 'desc'
		}
	});
};

export const getBossKillDetail = async (id: string): Promise<BossKillDetail | null> => {
	const fallback = async () => {
		try {
			const r = await fetch(`${TWINSTAR_API_URL}/bosskills/${id}`);
			const item: BossKillDetail = await r.json();
			return mutateItem(item);
		} catch (e) {
			console.error(e);
		}

		return null;
	};

	return withCache({ deps: [`boss-kill-detail`, id], fallback });
};
