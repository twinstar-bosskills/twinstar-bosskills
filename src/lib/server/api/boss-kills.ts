import { TWINSTAR_API_URL } from '$env/static/private';
import { mutateBossKill, type BossKill, type BossKillDetail } from '$lib/model';
import { withCache } from '../cache';
import { queryString, type QueryArgs } from './filter';
import { listAll } from './pagination';
import { EMPTY_PAGINATED_RESPONSE, type PaginatedResponse } from './response';

export type BossKillQueryArgs = QueryArgs<keyof BossKill>;
type BossKillsData = PaginatedResponse<BossKill[]>;
export const getBossKills = async (q: BossKillQueryArgs): Promise<BossKillsData> => {
	const url = `${TWINSTAR_API_URL}/bosskills?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const json: BossKillsData = await r.json();
			for (const item of json.data) {
				mutateBossKill(item);
			}
			return json;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	// do not cache
	if (q.cache === false || q.page === 0) {
		return fallback().catch((e) => {
			console.error(e);
			return EMPTY_PAGINATED_RESPONSE as BossKillsData;
		});
	}

	return (
		withCache({ deps: [`boss-kills`, q], fallback }) ?? (EMPTY_PAGINATED_RESPONSE as BossKillsData)
	);
};

export type LatestBossKillQueryArgs = Omit<BossKillQueryArgs, 'sorter'>;
export const getLatestBossKills = async (
	q: LatestBossKillQueryArgs = {}
): Promise<BossKillsData> => {
	return getBossKills({
		...q,
		sorter: {
			column: 'time',
			order: 'desc'
		}
	});
};
export const listAllLatestBossKills = async (
	q: LatestBossKillQueryArgs = {}
): Promise<BossKill[]> => {
	const fallback = async () => {
		try {
			return listAll(({ page, pageSize }) =>
				getLatestBossKills({
					...q,
					page,
					pageSize
				})
			);
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	if (q.cache === false) {
		return fallback().catch((e) => {
			console.error(e);
			return [];
		});
	}

	return (
		withCache({
			deps: ['list-all-lastest-boss-kills', q],
			fallback
		}) ?? []
	);
};

export const getBossKillDetail = async (id: string): Promise<BossKillDetail | null> => {
	const fallback = async () => {
		try {
			const r = await fetch(`${TWINSTAR_API_URL}/bosskills/${id}`);
			const item: BossKillDetail = await r.json();
			return mutateBossKill(item);
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	return withCache({ deps: [`boss-kill-detail`, id], fallback }) ?? null;
};
