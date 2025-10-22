import * as api from '@twinstar-bosskills/api';
import type { QueryArgs } from '@twinstar-bosskills/api/dist/filter';
import { listAll } from '@twinstar-bosskills/api/dist/pagination';
import {
	EMPTY_PAGINATED_RESPONSE,
	type PaginatedResponse
} from '@twinstar-bosskills/api/dist/response';
import { type BossKill, type BossKillDetail } from '@twinstar-bosskills/api/dist/schema';
import { EXPIRE_30_MIN, EXPIRE_5_MIN, withCache } from '../cache';
export type BossKillQueryArgs = QueryArgs<keyof BossKill>;
type BossKillsData = PaginatedResponse<BossKill[]>;
export const getBossKills = async (q: BossKillQueryArgs): Promise<BossKillsData> => {
	const fallback = async () => {
		return api.getBossKills(q);
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
		return api.getBossKillDetail({ realm, id });
	};

	return withCache({
		deps: [`boss-kill-detail`, realm, id],
		fallback,
		defaultValue: null,
		sliding: false,
		expire: EXPIRE_30_MIN
	});
};
