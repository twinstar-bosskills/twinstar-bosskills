import { TWINSTAR_API_URL } from "./config";
import { queryString, type QueryArgs } from "./filter";
import { listAll } from "./pagination";
import {
  makePaginatedResponseSchema,
  type PaginatedResponse,
} from "./response";
import {
  bosskillDetailSchema,
  bosskillsSchema,
  type BossKill,
  type BossKillDetail,
} from "./schema";

export type BossKillQueryArgs = QueryArgs<keyof BossKill>;
type BossKillsData = PaginatedResponse<BossKill[]>;
export const getBossKills = async (
  q: BossKillQueryArgs,
): Promise<BossKillsData> => {
  const url = `${TWINSTAR_API_URL}/bosskills?${queryString(q)}`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const items = makePaginatedResponseSchema(bosskillsSchema).parse(json);
    return items;
  } catch (e) {
    console.error(e, url);
    throw e;
  }
};

export type LatestBossKillQueryArgs = Omit<BossKillQueryArgs, "sorter">;
export const getLatestBossKills = async (
  q: LatestBossKillQueryArgs = {},
): Promise<BossKillsData> => {
  return getBossKills({
    ...q,
    sorter: {
      column: "time",
      order: "desc",
    },
  });
};
export const listAllLatestBossKills = async (
  q: LatestBossKillQueryArgs = {},
): Promise<BossKill[]> => {
  try {
    return listAll(({ page, pageSize }) =>
      getLatestBossKills({
        ...q,
        page,
        pageSize,
      }),
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
};

type GetBosskillDetailArgs = { realm: string; id: string };
export const getBossKillDetail = async ({
  realm,
  id,
}: GetBosskillDetailArgs): Promise<BossKillDetail | null> => {
  const url = `${TWINSTAR_API_URL}/bosskills/${id}?${queryString({ realm })}`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const item = bosskillDetailSchema.parse(json);
    return item;
  } catch (e) {
    console.error(e, url);
    throw e;
  }
};
