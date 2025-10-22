import { REALM_HELIOS } from '$lib/realm';
import * as api from '@twinstar-bosskills/api';
import type { Boss } from '@twinstar-bosskills/api/dist/schema';
import { withCache } from '../cache';

type GetBossArgs = { realm?: string; id: number };
export const getBoss = async ({ id, realm = REALM_HELIOS }: GetBossArgs): Promise<Boss | null> => {
	const fallback = async () => {
		return api.getBoss({ realm, id });
	};

	return withCache({ deps: [`boss`, realm, id], fallback, defaultValue: null });
};

type GetBossKillsWipesTimesArgs = {
	realm: string;
	id: number;
	mode: number | null;
};
export const getBossKillsWipesTimes = async ({ realm, id, mode }: GetBossKillsWipesTimesArgs) => {
	const fallback = async () => {
		return api.getBossKillsWipesTimes({ realm, id, mode });
	};
	return withCache({
		deps: ['boss-kwt', realm, id, mode],
		fallback,
		sliding: false,
		defaultValue: null
	});
};
