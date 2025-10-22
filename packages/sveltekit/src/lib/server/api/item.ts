import * as api from '@twinstar-bosskills/api';
import { type Item, type ItemTooltip } from '@twinstar-bosskills/api/dist/schema';
import { withCache } from '../cache';
export const getItem = async (id: number): Promise<Item | null> => {
	const fallback = async () => {
		return api.getItem(id);
	};
	return withCache({ deps: ['item', id], fallback, defaultValue: null });
};

export const getItemIconUrl = api.getItemIconUrl;

export const getRemoteItemIconUrl = api.getRemoteItemIconUrl;

type GetItemTooltipArgs = { realm: string; id: number };
export const getItemTooltip = async ({
	realm,
	id
}: GetItemTooltipArgs): Promise<ItemTooltip | null> => {
	const fallback = async () => {
		return api.getItemTooltip({ realm, id });
	};
	return withCache({ deps: [`item-tooltip`, realm, id], fallback, defaultValue: null });
};
