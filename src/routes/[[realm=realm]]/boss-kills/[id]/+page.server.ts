import { REALM_HELIOS } from '$lib/realm';
import * as api from '$lib/server/api';
import type { Item, ItemTooltip } from '$lib/server/api/schema';
import { getLootChance, type LootChance } from '$lib/server/db/loot';
import { getBoss, getBossPercentilesPerPlayer } from '$lib/server/model/boss.model';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { characterDps, characterHps } from '$lib/metrics';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	const realm = params.realm ?? REALM_HELIOS;
	const bosskill = await api.getBossKillDetail({ realm, id });
	if (!bosskill) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const boss = await getBoss({ realm, remoteId: bosskill.entry });
	if (!boss) {
		throw error(404, {
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
			getLootChance({ itemId, bossRemoteId: boss.remoteId, mode: bosskill.mode }).then((v) => {
				lootChance[itemId] = v;
			})
		);
	}

	await Promise.all(queue);

	let avgItemLvl = null;
	const playersCount = bosskill.boss_kills_players?.length ?? 0;
	if (playersCount > 0) {
		avgItemLvl =
			bosskill.boss_kills_players.reduce((acc, p) => acc + p.avg_item_lvl, 0) / playersCount;
		avgItemLvl = Math.round(avgItemLvl * 100) / 100;
	}

	const percentiles = await getBossPercentilesPerPlayer({
		realm,
		bossId: boss.id,
		difficulty: bosskill.mode,
		players: (bosskill.boss_kills_players ?? []).map((bkp) => {
			return {
				guid: bkp.guid,
				dps: characterDps(bkp, bosskill.length),
				hps: characterHps(bkp, bosskill.length),
				spec: bkp.talent_spec
			};
		})
	});

	return {
		bosskill,
		bosskillAvgItemLvl: avgItemLvl,
		boss,
		loot,
		items,
		tooltips,
		lootChance,
		percentiles
	};
};
