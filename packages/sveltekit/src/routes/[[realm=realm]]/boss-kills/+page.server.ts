import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';
import type { LatestBossKillQueryArgs } from '$lib/server/api';
import * as api from '$lib/server/api';
import { FilterOperator } from '@twinstar-bosskills/api/dist/filter';
import type { Boss } from '@twinstar-bosskills/api/dist/schema';
import { getFilterFormData } from '$lib/server/form/filter-form';
import { verifyGuildToken } from '$lib/server/guild-token.service';
import { findBosses } from '$lib/server/model/boss.model';
import type { ART } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params, parent }) => {
	const { realmIsPrivate, guildName: guild, guildToken: token } = await parent();
	let tokenVerified = realmIsPrivate === false;
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url);
	const realm = params.realm ?? REALM_HELIOS;
	const form = await getFilterFormData({ realm, url });

	const filters: LatestBossKillQueryArgs['filters'] = [];
	const bosses = form.values.bosses;
	const raids = form.values.raids;
	const difficulties = form.values.difficulties;
	if (bosses.length > 0) {
		filters.push({
			column: 'entry',
			value: bosses,
			operator: FilterOperator.IN
		});
	}
	if (raids.length > 0) {
		filters.push({
			column: 'map',
			value: raids,
			operator: FilterOperator.IN
		});
	}
	if (difficulties.length > 0) {
		filters.push({
			column: 'mode',
			value: difficulties,
			operator: FilterOperator.IN
		});
	}

	if (realmIsPrivate) {
		tokenVerified = verifyGuildToken({ realm, guild, token });
		if (tokenVerified) {
			filters.push({
				column: 'guild',
				value: guild,
				operator: FilterOperator.EQUALS
			});
		}
	}

	const [latestData, bossesData] = await Promise.all([
		tokenVerified
			? api.getLatestBossKills({
					realm,
					page,
					pageSize,
					filters
			  })
			: ({ data: [], total: 0 } as ART<typeof api.getLatestBossKills>),
		findBosses({ realm })
	]);

	const bossNameByRemoteId: Record<Boss['entry'], string> = {};
	for (const boss of bossesData) {
		bossNameByRemoteId[boss.remoteId] = boss.name;
	}

	return {
		latest: latestData,
		bossNameByRemoteId,
		form
	};
};
