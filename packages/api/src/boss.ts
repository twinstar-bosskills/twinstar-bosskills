import {
  listAllLatestBossKills,
  type LatestBossKillQueryArgs,
} from "./boss-kills";
import { FilterOperator } from "./filter";
import { getRaids } from "./raid";
import type { Boss } from "./schema";

type GetBossArgs = { realm: string; id: number };
export const getBoss = async ({
  id,
  realm,
}: GetBossArgs): Promise<Boss | null> => {
  try {
    const raids = await getRaids({ realm });
    for (const raid of raids) {
      for (const boss of raid.bosses) {
        if (boss.entry === id) {
          return boss;
        }
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  return null;
};

type GetBossKillsWipesTimesArgs = {
  realm: string;
  id: number;
  mode: number | null;
};
export const getBossKillsWipesTimes = async ({
  realm,
  id,
  mode,
}: GetBossKillsWipesTimesArgs) => {
  const filters: LatestBossKillQueryArgs["filters"] = [
    {
      column: "entry",
      operator: FilterOperator.EQUALS,
      value: id,
    },
  ];

  if (mode !== null) {
    filters.push({
      column: "mode",
      operator: FilterOperator.EQUALS,
      value: mode,
    });
  }
  const bosskills = await listAllLatestBossKills({
    realm,
    filters,
  });

  const killsCount = bosskills.length;
  let wipesCount = 0;
  let minWipes = Infinity;
  let maxWipes = 0;
  let totalDuration = 0;
  let minFightDuration = Infinity;
  let maxFightDuration = 0;
  for (const bk of bosskills) {
    wipesCount += bk.wipes;
    if (bk.wipes <= minWipes) {
      minWipes = bk.wipes;
    }

    if (bk.wipes >= maxWipes) {
      maxWipes = bk.wipes;
    }

    totalDuration += bk.length;
    if (bk.length <= minFightDuration) {
      minFightDuration = bk.length;
    }

    if (bk.length >= maxFightDuration) {
      maxFightDuration = bk.length;
    }
  }
  const pullsCount = killsCount + wipesCount;
  const avgFightDuration =
    killsCount > 0 ? Math.ceil(totalDuration / killsCount) : 0;
  const avgWipes =
    killsCount > 0 ? Math.round((100 * wipesCount) / killsCount) / 100 : 0;
  const wipeChance =
    pullsCount === 0 ? 0 : Math.ceil(10000 * (wipesCount / pullsCount)) / 100;
  const killChance =
    pullsCount === 0 ? 0 : Math.ceil(10000 * (killsCount / pullsCount)) / 100;

  return {
    kills: {
      chance: killChance,
      total: killsCount,
    },
    wipes: {
      min: isFinite(minWipes) ? minWipes : 0,
      avg: avgWipes,
      total: wipesCount,
      chance: wipeChance,
    },
    fightDuration: {
      min: isFinite(minFightDuration) ? minFightDuration : 0,
      max: maxFightDuration,
      avg: avgFightDuration,
      total: totalDuration,
    },
  };
};
