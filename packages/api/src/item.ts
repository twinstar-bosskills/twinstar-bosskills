import { z } from "zod";

import { withCache } from "@twinstar-bosskills/cache";
import { realmToExpansion } from "@twinstar-bosskills/core/dist/realm";
import { TWINSTAR_API_URL } from "./config";
import {
  itemSchema,
  itemSparseSchema,
  itemTooltipSchema,
  type Item,
  type ItemTooltip,
} from "./schema";

const getItemRaw = async (id: number): Promise<Item | null> => {
  const url = `${TWINSTAR_API_URL}/item/${id}`;
  try {
    const r = await fetch(url);
    const json = await r.json();

    const item = z
      .object({
        item: z.object({ ID: z.number() }),
        itemSparse: itemSparseSchema,
      })
      .parse(json);

    return itemSchema.parse({
      id: item.item.ID,
      name: item.itemSparse.Name,
      iconUrl: getItemIconUrl(id),
      quality: item.itemSparse.Quality,
    });
  } catch (e) {
    console.error(e, url);
    throw e;
  }

  // @ts-ignore
  return null;
};

export const getItemIconUrl = (id: number): string => {
  return `/img/icon?type=item&id=${id}`;
};
export const getRemoteItemIconUrl = (id: number) =>
  `${TWINSTAR_API_URL}/item/icon/${id}`;

type GetItemTooltipArgs = { realm: string; id: number };
const getItemTooltipRaw = async ({
  realm,
  id,
}: GetItemTooltipArgs): Promise<ItemTooltip | null> => {
  const expansion = realmToExpansion(realm);

  const url = `${TWINSTAR_API_URL}/item/tooltip?id=${id}&expansion=${expansion}`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const item = json?.["data"] ?? null;
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

export const getItem = async (id: number): Promise<Item | null> => {
  const fallback = async () => {
    return getItemRaw(id);
  };
  return withCache({ deps: ["item", id], fallback, defaultValue: null });
};

export const getItemTooltip = async ({
  realm,
  id,
}: GetItemTooltipArgs): Promise<ItemTooltip | null> => {
  const fallback = async () => {
    return getItemTooltipRaw({ realm, id });
  };
  return withCache({
    deps: [`item-tooltip`, realm, id],
    fallback,
    defaultValue: null,
  });
};
