import type { Item, ItemTooltip } from '$lib/server/db';
import * as db from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const bosskill = await db.getBossKill(id);
	if (!bosskill) {
		throw error(404, {
			message: 'Not found'
		});
	}

	const loot = await db.getBossKillLoot(id);

	const queue = [];
	const items: Item[] = [];
	const tooltips: Record<Item['id'], ItemTooltip> = [];
	for (const lootItem of loot) {
		const { itemId } = lootItem;
		queue.push(
			db.getItem(itemId).then((item) => {
				if (item) {
					items.push(item);
				}
			})
		);
		queue.push(
			db.getItemTooltip(itemId).then((tooltip) => {
				if (tooltip) {
					tooltips[itemId] = tooltip;
				}
			})
		);
	}

	await Promise.all(queue);

	return {
		bosskill,
		loot,
		items,
		tooltips
	};
};
