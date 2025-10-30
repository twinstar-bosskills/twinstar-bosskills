import { getRaidLockStats } from '@twinstar-bosskills/model';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { previous, current } = await getRaidLockStats({
		realm: params.realm!
	});

	return {
		lastRaidLock: previous,
		thisRaidLock: current
	};
};
