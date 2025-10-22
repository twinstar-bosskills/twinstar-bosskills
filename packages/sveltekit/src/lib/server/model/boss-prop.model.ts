import type { ART } from '$lib/types';
import { withCache } from '../cache';
import { getBossPropsByBossId } from '../db/boss-prop';

export const getBossProps = async (bossId: number) => {
	const fallback = () => getBossPropsByBossId(bossId);
	return withCache<ART<typeof fallback>>({
		deps: ['model/boss-props/getBossProps', bossId],
		fallback,
		defaultValue: null
	});
};
