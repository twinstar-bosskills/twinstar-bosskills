import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';
import * as api from '$lib/server/api';
import { getLootChance, type LootChance } from '@twinstar-bosskills/db/dist/loot';
import { assertGuildTokenFromCookie } from '$lib/server/guild-token.service';
import { getBoss, getBossPercentilesPerPlayer } from '$lib/server/model/boss.model';
import { error } from '@sveltejs/kit';
import type { Item, ItemTooltip } from '@twinstar-bosskills/api/dist/schema';
import { getBossPropsByBossId } from '@twinstar-bosskills/db/dist/boss-prop';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const id = params.id;
	const realm = params.realm ?? REALM_HELIOS;
	const bosskill = await api.getBossKillDetail({ realm, id });
	if (!bosskill) {
		error(404, {
			message: 'Not found'
		});
	}

	assertGuildTokenFromCookie({ realm, guild: bosskill.guild, cookies });

	const boss = await getBoss({ realm, remoteId: bosskill.entry });
	if (!boss) {
		error(404, {
			message: `Boss ${id} not found`
		});
	}

	const loot = bosskill.boss_kills_loot;
	const queue = [];
	const items: Item[] = [];
	const lootChance: Record<Item['id'], LootChance | null> = {};
	const tooltips: Record<Item['id'], ItemTooltip> = {};
	for (const lootItem of loot) {
		const itemId = Number(lootItem.itemId);
		queue.push(
			api.getItem(itemId).then((item) => {
				if (item) {
					items.push(item);
				}
			})
		);
		queue.push(
			api.getItemTooltip({ realm, id: itemId }).then((tooltip) => {
				if (tooltip) {
					tooltips[itemId] = tooltip;
				}
			})
		);
		queue.push(
			getLootChance({ itemId, bossRemoteId: boss.remote_id, mode: bosskill.mode }).then((v) => {
				lootChance[itemId] = v;
			})
		);
	}

	await Promise.all(queue);

	let raidDmgDone = 0;
	let avgItemLvl = null;
	const playersCount = bosskill.boss_kills_players?.length ?? 0;
	if (playersCount > 0) {
		avgItemLvl = 0;
		for (const bkp of bosskill.boss_kills_players) {
			avgItemLvl += bkp.avg_item_lvl;
			raidDmgDone += bkp.dmgDone;
		}
		avgItemLvl = avgItemLvl / playersCount;
		avgItemLvl = Math.round(avgItemLvl * 100) / 100;
	}

	const percentiles = await getBossPercentilesPerPlayer({
		bossKillRemoteId: bosskill.id
	});

	const bossProps = await getBossPropsByBossId(boss.id);

	return {
		bosskill,
		bosskillAvgItemLvl: avgItemLvl,
		boss,
		loot,
		items,
		tooltips,
		lootChance,
		percentiles,
		raidDmgDone,
		bossProps
	};
};
