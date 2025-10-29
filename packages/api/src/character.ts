import {
  EXPIRE_1_HOUR,
  EXPIRE_5_MIN,
  withCache,
} from "@twinstar-bosskills/cache";
import { TWINSTAR_API_URL } from "./config";

import { queryString, type QueryArgs } from "./filter";
import { listAll } from "./pagination";
import {
  makePaginatedResponseSchema,
  type PaginatedResponse,
} from "./response";
import {
  bosskillCharactersPartialSchema,
  characterSchema,
  type BosskillCharacterPartial,
  type Character,
} from "./schema";

// /bosskills/player?map=<mapa>&mode=<obtiznost>&page=<stranka>&pageSize=<velikost>&(guid=<guid> or name=<name>)
type CharacterBosskillsArgs = Omit<
  QueryArgs,
  "sorter" | "filters" | "talentSpec"
> & {
  realm: string;
};
const getCharacterBossKillsRaw = async (
  q: CharacterBosskillsArgs,
): Promise<BosskillCharacterPartial[]> => {
  const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString(q)}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    const items = makePaginatedResponseSchema(
      bosskillCharactersPartialSchema,
    ).parse(json);
    const data = items.data;

    return data;
  } catch (e) {
    console.error(e, url);
    throw e;
  }
};

type CharacterTotalBossKillsArgs = { name: string; realm: string };
const getCharacterTotalBossKillsRaw = async (
  q: CharacterTotalBossKillsArgs,
): Promise<number> => {
  const fetchPlayer = async ({
    page,
    pageSize,
    ...rest
  }: Omit<QueryArgs, "sorter" | "filters" | "talentSpec">) => {
    const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString({
      ...rest,
      page,
      pageSize,
    })}`;
    try {
      const r = await fetch(url);
      const items:
        | BosskillCharacterPartial[]
        | PaginatedResponse<BosskillCharacterPartial> = await r.json();

      // TODO: this is wrong but we do not have items.total yet
      let total = 2000;
      let data = [];
      if (Array.isArray(items)) {
        data = items;
      } else if (Array.isArray(items.data) && typeof items.total === "number") {
        data = items.data;
        total = items.total;
      } else {
        throw new Error(
          `expected array or paginated response, got: ${typeof items}`,
        );
      }

      return {
        data,
        total,
      };
    } catch (e) {
      console.error(e, url);
      throw e;
    }
  };

  try {
    const all = await listAll(
      ({ page, pageSize }) =>
        fetchPlayer({
          ...q,
          page,
          pageSize,
        }),
      { pageSize: 100 },
    );
    return all.length;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

type CharacterByNameArgs = { realm: string; name: string };
const getCharacterByNameRaw = async (
  args: CharacterByNameArgs,
): Promise<Character | null> => {
  const url = `${TWINSTAR_API_URL}/character?${queryString(args)}`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const character = characterSchema.parse(json);

    return character;
  } catch (e) {
    console.error(e, url);
    throw e;
  }
};

export const getCharacterBossKills = async (
  args: CharacterBosskillsArgs,
): Promise<BosskillCharacterPartial[]> => {
  const fallback = async () => {
    return getCharacterBossKillsRaw(args);
  };

  return withCache<BosskillCharacterPartial[]>({
    deps: [`character-bosskills`, args],
    fallback,
    defaultValue: [],
    expire: EXPIRE_5_MIN,
  });
};

export const getCharacterTotalBossKills = async (
  args: CharacterTotalBossKillsArgs,
): Promise<number> => {
  const fallback = async () => {
    return getCharacterTotalBossKillsRaw(args);
  };

  return withCache<number>({
    deps: [`character-total-bosskills`, args],
    fallback,
    defaultValue: 0,
    expire: EXPIRE_5_MIN,
  });
};

export const getCharacterByName = async (
  args: CharacterByNameArgs,
): Promise<Character | null> => {
  const fallback = async () => {
    return getCharacterByNameRaw(args);
  };

  return withCache<Character | null>({
    deps: [`character`, args],
    fallback,
    defaultValue: null,
    expire: EXPIRE_1_HOUR,
  });
};
