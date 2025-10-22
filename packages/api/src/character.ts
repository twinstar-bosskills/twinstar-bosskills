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
export const getCharacterBossKills = async (
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

type CharacterTotalBossKillsArgs = Omit<
  QueryArgs,
  "sorter" | "filters" | "talentSpec"
>;
export const getCharacterTotalBossKills = async (q: {
  realm: string;
  name: string;
}): Promise<number> => {
  const fetchPlayer = async ({
    page,
    pageSize,
    ...rest
  }: CharacterTotalBossKillsArgs) => {
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
export const getCharacterByName = async (
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
