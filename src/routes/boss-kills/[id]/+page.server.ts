import type { Item, ItemTooltip } from '$lib/model';
import * as api from '$lib/server/api';
import { getBoss } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;

	const bosskill = await api.getBossKillDetail(id);
	if (!bosskill) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const boss = await getBoss(bosskill.entry);
	if (!boss) {
		throw error(404, {
			message: `Boss ${id} not found`
		});
	}

	const loot = bosskill.boss_kills_loot;
	const queue = [];
	const items: Item[] = [];
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
			api.getItemTooltip(itemId).then((tooltip) => {
				if (tooltip) {
					tooltips[itemId] = tooltip;
				}
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

	return {
		bosskill,
		bosskillAvgItemLvl: avgItemLvl,
		boss,
		loot,
		items,
		tooltips
	};
};
