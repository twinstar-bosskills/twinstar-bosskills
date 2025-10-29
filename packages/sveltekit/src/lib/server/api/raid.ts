import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';
import * as api from '@twinstar-bosskills/api';
import type { Raid } from '@twinstar-bosskills/api/dist/schema';
import { withCache } from '@twinstar-bosskills/cache';

type GetRaidsArgs = { realm?: string; cache?: boolean };
export const getRaids = async ({ realm = REALM_HELIOS, cache }: GetRaidsArgs): Promise<Raid[]> => {
	const fallback = async () => {
		return api.getRaids({ realm });
	};

	if (cache === false) {
		return fallback().catch((e) => {
			console.error(e);
			return [];
		});
	}

	return withCache({ deps: [`raids`, realm], fallback, defaultValue: [] });
};
