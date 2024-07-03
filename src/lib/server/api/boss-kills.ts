import { TWINSTAR_API_URL } from '$env/static/private';
import { EXPIRE_30_MIN, EXPIRE_5_MIN, withCache } from '../cache';
import { queryString, type QueryArgs } from './filter';
import { listAll } from './pagination';
import {
	EMPTY_PAGINATED_RESPONSE,
	makePaginatedResponseSchema,
	type PaginatedResponse
} from './response';
import {
	bosskillDetailSchema,
	bosskillsSchema,
	type BossKill,
	type BossKillDetail
} from './schema';

export type BossKillQueryArgs = QueryArgs<keyof BossKill>;
type BossKillsData = PaginatedResponse<BossKill[]>;
export const getBossKills = async (q: BossKillQueryArgs): Promise<BossKillsData> => {
	const url = `${TWINSTAR_API_URL}/bosskills?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const json = await r.json();
			const items = makePaginatedResponseSchema(bosskillsSchema).parse(json);
			return items;
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

	return withCache({
		deps: [`boss-kills`, q],
		fallback,
		defaultValue: EMPTY_PAGINATED_RESPONSE as BossKillsData,
		sliding: false,
		expire: EXPIRE_5_MIN
	});
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

	return withCache({
		deps: ['list-all-lastest-boss-kills', q],
		fallback,
		defaultValue: [],
		sliding: false,
		expire: EXPIRE_5_MIN
	});
};

type GetBosskillDetailArgs = { realm: string; id: string };
export const getBossKillDetail = async ({
	realm,
	id
}: GetBosskillDetailArgs): Promise<BossKillDetail | null> => {
	const fallback = async () => {
		const url = `${TWINSTAR_API_URL}/bosskills/${id}?${queryString({ realm })}`;
		try {
			const r = await fetch(url);
			const json = await r.json();
			const item = bosskillDetailSchema.parse(json);
			return item;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache({
		deps: [`boss-kill-detail`, realm, id],
		fallback,
		defaultValue: null,
		sliding: false,
		expire: EXPIRE_30_MIN
	});
};
