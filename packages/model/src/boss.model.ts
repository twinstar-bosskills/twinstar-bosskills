import {
  EXPIRE_1_DAY,
  EXPIRE_1_HOUR,
  EXPIRE_30_MIN,
  EXPIRE_5_MIN,
  withCache,
} from "@twinstar-bosskills/cache";
import {
  METRIC_TYPE,
  type PlayerPercentile,
  type PlayerPercentiles,
} from "@twinstar-bosskills/core/dist/metrics";
import type { ART } from "@twinstar-bosskills/core/dist/types";
import {
  findBossesByRealm,
  getBossByRemoteIdAndRealm,
  getBossPercentiles,
  getBossTopSpecs,
  getBossStatsMedian as statsMedian,
  type GetBossPercentilesArgs,
  type GetBossStatsMedianArgs,
  type GetBossTopSpecsArgs,
} from "@twinstar-bosskills/db/dist/boss";
import {
  getRankingByRaidLock,
  type GetRankingByRaidLockArgs,
  type RankingByRaidLock,
} from "@twinstar-bosskills/db/dist/ranking";

export const findBosses = async (args: { realm: string }) => {
  const fallback = () => findBossesByRealm(args);
  return withCache<ART<typeof fallback>>({
    deps: ["model/boss/findBosses", args],
    fallback,
    defaultValue: [],
  });
};

export const getBoss = async (args: { remoteId: number; realm: string }) => {
  const fallback = () => getBossByRemoteIdAndRealm(args);
  return withCache<ART<typeof fallback>>({
    deps: ["model/boss/getBoss", args],
    fallback,
    defaultValue: null,
  });
};

export const getBossStatsMedian = (args: GetBossStatsMedianArgs) => {
  const fallback = async () => statsMedian(args);
  return withCache<ART<typeof fallback>>({
    deps: ["model/boss/getBossStatsMedian", args],
    fallback,
    defaultValue: [],
    expire: EXPIRE_1_HOUR,
  });
};

type GetBossKillPercentilesArgs = {
  bossKillRemoteId: string;
};
const KEY_BOSS_PERCENTILES_PER_PLAYER =
  "model/boss/getBossPercentilesPerPlayer";
const withBossPercentilesPerPlayerCache = (
  args: GetBossKillPercentilesArgs,
  fallback: () => PlayerPercentiles | Promise<PlayerPercentiles>,
  force: boolean = false,
) => {
  return withCache<PlayerPercentiles>({
    deps: [KEY_BOSS_PERCENTILES_PER_PLAYER, args],
    fallback,
    defaultValue: {
      [METRIC_TYPE.DPS]: {},
      [METRIC_TYPE.HPS]: {},
    },
    // 1 day
    expire: EXPIRE_1_DAY,
    force,
  });
};
export const getBossPercentilesPerPlayer = async (
  args: GetBossKillPercentilesArgs,
): Promise<PlayerPercentiles> => {
  const fallback = async () => {
    throw Error("wait until recache happens");
  };

  return withBossPercentilesPerPlayerCache(args, fallback);
};

type GetBossPercentilesFastArgs = GetBossPercentilesArgs & {
  targetValue: number;
};
const getBossPercentilesFast = async ({
  realm,
  bossId,
  difficulty,
  talentSpec,
  metric,
  targetValue,
}: GetBossPercentilesFastArgs): Promise<number | null> => {
  try {
    const fallback = async () =>
      getBossPercentiles({ realm, bossId, difficulty, talentSpec, metric });
    const rows = await withCache<ART<typeof fallback>>({
      deps: [
        "model/boss/getBossPercentilesFast",
        // deps without targetValue on purpose
        realm,
        bossId,
        difficulty,
        talentSpec,
        metric,
      ],
      fallback,
      defaultValue: [],
      expire: EXPIRE_30_MIN,
    });

    const rowsLen = rows.length;
    if (rowsLen === 0) {
      return null;
    }

    let closest = rows[0] ?? null;
    if (closest === null) {
      return null;
    }

    // binary search would probably be even faster
    // but this is enough for now
    for (let i = 0; i < rowsLen; i++) {
      const row = rows[i]!;
      const closestDiff = Math.abs(targetValue - closest.value);
      const currentDiff = Math.abs(targetValue - row.value);
      if (currentDiff < closestDiff) {
        closest = row;
      }
    }

    return closest.percentile_rank;
  } catch (e) {
    console.error(e);
  }
  return null;
};
type SetBossPercentilesArgs = GetBossKillPercentilesArgs & {
  realm: string;
  bossId: number;
  difficulty: number;
  players: { guid: number; dps: number; hps: number; spec: number }[];
};
export const setBossPercentilesPerPlayer = async (
  args: SetBossPercentilesArgs,
): Promise<PlayerPercentiles> => {
  const fallback = async () => {
    const { realm, bossId, difficulty, players } = args;
    const percentiles = new Promise<PlayerPercentiles>(async (resolve) => {
      const promises = [];
      const dps: PlayerPercentile = {};
      const hps: PlayerPercentile = {};
      for (const bkp of players) {
        promises.push(
          getBossPercentilesFast({
            realm,
            bossId,
            difficulty,
            talentSpec: bkp.spec,
            metric: METRIC_TYPE.DPS,
            targetValue: bkp.dps,
          }).then((value) => {
            dps[bkp.guid] = value;
          }),
        );
        promises.push(
          getBossPercentilesFast({
            realm,
            bossId,
            difficulty,
            talentSpec: bkp.spec,
            metric: METRIC_TYPE.HPS,
            targetValue: bkp.hps,
          }).then((value) => {
            hps[bkp.guid] = value;
          }),
        );
      }
      await Promise.all(promises);
      resolve({ [METRIC_TYPE.DPS]: dps, [METRIC_TYPE.HPS]: hps });
    });
    return percentiles;
  };

  return withBossPercentilesPerPlayerCache(
    { bossKillRemoteId: args.bossKillRemoteId },
    fallback,
    true,
  );
};

type BossTopSpecs = ART<typeof getBossTopSpecs>;
const KEY_BOSS_TOP_SPECS = "model/boss/getTopSpecs";
const withBossTopSpecsCache = (
  args: GetBossTopSpecsArgs,
  fallback: () => BossTopSpecs | Promise<BossTopSpecs>,
  force: boolean = false,
) => {
  return withCache<BossTopSpecs>({
    deps: [KEY_BOSS_TOP_SPECS, args],
    fallback,
    defaultValue: {},
    // 1 day
    expire: EXPIRE_1_DAY,
    force,
  });
};

export const getTopSpecs = (
  args: GetBossTopSpecsArgs,
): Promise<BossTopSpecs> => {
  const fallback = async () => {
    throw Error("wait until recache happens");
  };
  return withBossTopSpecsCache(args, fallback);
};

export const setBossTopSpecs = async (
  args: GetBossTopSpecsArgs,
  stats: BossTopSpecs,
) => {
  const fallback = () => stats;
  return withBossTopSpecsCache(args, fallback, true);
};

const KEY_BOSS_TOP_SPECS_BY_RAID_LOCK = "model/boss/getTopSpecsByRaidLock";
const withBossTopSpecsByRaidLockCache = (
  args: GetRankingByRaidLockArgs,
  fallback: () => Promise<RankingByRaidLock>,
  force: boolean = false,
) => {
  return withCache<RankingByRaidLock>({
    deps: [KEY_BOSS_TOP_SPECS_BY_RAID_LOCK, args],
    fallback,
    defaultValue: [],
    // already "cached" in database
    expire: EXPIRE_5_MIN,
    force,
  });
};

export const getTopSpecsByRaidLock = (
  args: GetRankingByRaidLockArgs,
): Promise<RankingByRaidLock> => {
  const fallback = async () => {
    return getRankingByRaidLock(args);
  };

  return withBossTopSpecsByRaidLockCache(args, fallback);
};
