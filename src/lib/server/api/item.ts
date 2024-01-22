import { TWINSTAR_API_URL } from '$env/static/private';
import { realmToExpansion } from '$lib/realm';
import { z } from 'zod';
import { withCache } from '../cache';
import {
	itemSchema,
	itemSparseSchema,
	itemTooltipSchema,
	type Item,
	type ItemTooltip
} from './schema';

export const getItem = async (id: number): Promise<Item | null> => {
	const fallback = async () => {
		const url = `${TWINSTAR_API_URL}/item/${id}`;
		try {
			const r = await fetch(url);
			const json = await r.json();

			const item = z
				.object({ item: z.object({ ID: z.number() }), itemSparse: itemSparseSchema })
				.parse(json);

			return itemSchema.parse({
				id: item.item.ID,
				name: item.itemSparse.Name,
				iconUrl: getItemIconUrl(id),
				quality: item.itemSparse.Quality
			});
		} catch (e) {
			console.error(e, url);
			throw e;
		}

		// @ts-ignore
		return null;
	};
	return withCache({ deps: ['item', id], fallback, defaultValue: null });
};

export const getItemIconUrl = (id: number): string => {
	return `/img/icon?type=item&id=${id}`;
};
export const getRemoteItemIconUrl = (id: number) => `${TWINSTAR_API_URL}/item/icon/${id}`;

type GetItemTooltipArgs = { realm: string; id: number };
export const getItemTooltip = async ({
	realm,
	id
}: GetItemTooltipArgs): Promise<ItemTooltip | null> => {
	const expansion = realmToExpansion(realm);
	const fallback = async () => {
		const url = `${TWINSTAR_API_URL}/item/tooltip?id=${id}&expansion=${expansion}`;
		try {
			const r = await fetch(url);
			const json = await r.json();
			const item = json?.['data'] ?? null;
			if (item) {
				return itemTooltipSchema.parse(item);
			}
			return null;
		} catch (e) {
			console.error(e, url);
			throw e;
		}

		// @ts-ignore
		return null;
	};
	return withCache({ deps: [`item-tooltip`, expansion, id], fallback, defaultValue: null });
};
