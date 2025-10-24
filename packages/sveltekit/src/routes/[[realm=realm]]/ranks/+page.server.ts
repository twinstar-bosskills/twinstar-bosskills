import { raidLock } from '$lib/date';
import { METRIC_TYPE } from '@twinstar-bosskills/core/dist/metrics';
import { difficultiesByExpansion } from '@twinstar-bosskills/core/dist/wow';
import { getRaidLockOffsetFromUrl } from '$lib/search-params';
import { getRanks } from '$lib/server/model/ranking.model';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { realmIsPrivate, realm, expansion } = await parent();

	if (realmIsPrivate) {
		error(403, { message: 'Realm is private' });
	}

	const difficulty = difficultiesByExpansion(expansion)?.DIFFICULTY_10_HC ?? null;
	if (difficulty === null) {
		error(404, { message: 'Difficulty 10 HC not found' });
	}
	const offset = getRaidLockOffsetFromUrl(url);
	const { start: startsAt, end: endsAt } = raidLock(new Date(), offset);
	const [byDPS, byHPS] = await Promise.all([
		getRanks({ realm, expansion, startsAt, endsAt, difficulty, metric: METRIC_TYPE.DPS }),
		getRanks({ realm, expansion, startsAt, endsAt, difficulty, metric: METRIC_TYPE.HPS })
	]);

	return {
		raidLockStart: startsAt,
		raidLockEnd: endsAt,
		byDPS,
		byHPS,
		difficulty
	};
};
