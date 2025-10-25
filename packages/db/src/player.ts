import { db } from ".";
import { dps, hps } from "./boss-kill-player";
import { Player } from "./types";

export const getPlayerByGuid = async ({
  realm,
  guid,
}: {
  guid: number;
  realm: string;
}): Promise<Player | null> => {
  try {
    const player = await db
      .selectFrom("player")
      .selectAll("player")
      .innerJoin("realm", "realm.id", "player.realm_id")
      .where(({ and, eb }) => {
        return and([
          eb("realm.name", "=", realm),
          eb("player.remote_id", "=", guid),
          eb("player.remote_id", "is not", null),
          eb("player.name", "is not", null),
        ]);
      })
      .executeTakeFirst();

    return player ?? null;
  } catch (e) {
    console.error(e);
  }

  return null;
};

import { raidLock } from "@twinstar-bosskills/core/dist/date";
import { realmToExpansion } from "@twinstar-bosskills/core/dist/realm";
import { getPerformaceDifficultiesByExpansion } from "@twinstar-bosskills/core/dist/wow";

export type GetCharacterPerformanceTrendsArgs = {
  realm: string;
  guid: number;
  startDate?: Date;
  endDate?: Date;
};

type CharacterPerformanceTrends = Record<
  string,
  Record<number, { dps: number; hps: number }>
>;
export const getCharacterPerformanceTrends = async ({
  realm,
  guid,
  startDate,
  endDate,
}: GetCharacterPerformanceTrendsArgs) => {
  const trends: CharacterPerformanceTrends = {};
  const now = new Date();
  const currentRaidLock = raidLock(now);

  const start = startDate;
  const end = endDate ?? currentRaidLock.end;

  const expansion = realmToExpansion(realm);
  const diffs = getPerformaceDifficultiesByExpansion(expansion);

  try {
    const currentQb = db
      .selectFrom("boss_kill_player")
      .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .select([
        "boss_kill_player.dmg_done",
        "boss_kill_player.healing_done",
        "boss_kill.length",
        "boss_kill_player.player_id",
        "boss_kill_player.talent_spec",
        "boss_kill.remote_id",
        "boss_kill.mode",
        "boss_kill.boss_id",
        "boss_kill.time",
      ])
      .where(({ eb, and }) => {
        const conditions = [
          eb("realm.name", "=", realm),
          eb("boss_kill_player.guid", "=", guid),
        ];

        if (start) {
          conditions.push(eb("boss_kill.time", ">=", start.toISOString()));
        }

        conditions.push(eb("boss_kill.time", "<=", end.toISOString()));
        conditions.push(eb("boss_kill.mode", "in", diffs));

        return and(conditions);
      })
      .groupBy([
        "boss_kill.mode",
        "boss_kill.boss_id",
        "boss_kill_player.talent_spec",
        "boss_kill.time",
      ])
      .orderBy("boss_kill.time", "desc");

    const bosskills = await currentQb.execute();

    for (const current of bosskills) {
      const previousRows = await db
        .selectFrom("boss_kill_player")
        .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
        .select([
          "boss_kill_player.dmg_done",
          "boss_kill_player.healing_done",
          "boss_kill.length",
          "boss_kill_player.player_id",
          "boss_kill_player.talent_spec",
        ])
        .where(({ eb, and }) => {
          const conditions = [
            eb("boss_kill.time", "<", current.time),
            eb("boss_kill.boss_id", "=", current.boss_id),
            eb("boss_kill.mode", "=", current.mode),
            eb("boss_kill_player.player_id", "=", current.player_id),
            eb("boss_kill_player.talent_spec", "=", current.talent_spec),
          ];
          return and(conditions);
        })
        .orderBy("boss_kill.time", "desc")
        .limit(1)
        .executeTakeFirst();
      const previous = previousRows ?? null;

      if (previous) {
        const currentHps = current.healing_done / current.length;
        const baseHps = previous.healing_done / previous.length;

        const currentDps = current.dmg_done / current.length;
        const baseDps = previous.dmg_done / previous.length;

        const remoteId = current.remote_id;
        const mode = current.mode;
        trends[remoteId] ??= {};
        trends[remoteId]![mode] ??= {
          dps:
            baseDps <= 0
              ? 0
              : Math.round((10000 * (currentDps - baseDps)) / baseDps) / 100,
          hps:
            baseHps <= 0
              ? 0
              : Math.round((10000 * (currentHps - baseHps)) / baseHps) / 100,
          // currentId: current.boss_kill.remote_id,
          // baseId: previous.boss_kill.remote_id
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  return trends;
};
export type GetCharacterPerformanceLinesArgs = CharacterPerformanceArgs &
  Required<Pick<CharacterPerformanceArgs, "bossIds" | "modes">>;
export type CharacterPerformanceLines = {
  time: string;
  dps: number;
  hps: number;
  bossId: number;
  bossName: string;
  talentSpec: number;
  avgItemLvl: number;
  mode: number;
}[];
export const getCharacterPerformanceLines = async (
  args: GetCharacterPerformanceLinesArgs,
): Promise<CharacterPerformanceLines> => {
  try {
    const qb = characterPerformanceQb(args);
    const rows = await qb.execute();
    return rows;
  } catch (e) {
    console.error(e);
  }

  return [];
};

export const getCharacterPerformanceLinesGrouped = async (
  args: CharacterPerformanceArgs,
): Promise<CharacterPerformanceLines> => {
  try {
    const qb = characterPerformanceQb({
      ...args,
      groupByBossAndDiff: true,
    });
    const rows = await qb.execute();
    return rows;
  } catch (e) {
    console.error(e);
  }

  return [];
};

type CharacterPerformanceArgs = {
  realm: string;
  guid: number;
  specs?: number[];
  raids?: string[];
  modes?: number[];
  bossIds?: number[];
  startDate?: Date;
  endDate?: Date;
  ilvlMin?: number;
  ilvlMax?: number;
};
const characterPerformanceQb = ({
  realm,
  guid,
  modes,
  specs,
  raids,
  bossIds,
  startDate,
  endDate,
  ilvlMin = 0,
  ilvlMax = 0,
  groupByBossAndDiff = false,
}: CharacterPerformanceArgs & { groupByBossAndDiff?: boolean }) => {
  const now = new Date();
  const currentRaidLock = raidLock(now);

  const start = startDate;
  const end = endDate ?? currentRaidLock.end;
  const qb = db
    .selectFrom("boss_kill_player")
    .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
    .innerJoin("boss", "boss.id", "boss_kill.boss_id")
    .innerJoin("realm", "realm.id", "boss_kill.realm_id")
    .innerJoin("raid", "raid.id", "boss_kill.raid_id")
    .select([
      "boss_kill.time",
      dps.as("dps"),
      hps.as("hps"),
      "boss_kill.mode",
      "boss.remote_id as bossId",
      "boss.name as bossName",
      "boss_kill_player.talent_spec as talentSpec",
      "boss_kill_player.avg_item_lvl as avgItemLvl",
    ])
    .where(({ eb, and }) => {
      const conditions = [
        eb("realm.name", "=", realm),
        eb("boss_kill_player.guid", "=", guid),
      ];

      if (start) {
        conditions.push(eb("boss_kill.time", ">=", start.toISOString()));
      }

      conditions.push(eb("boss_kill.time", "<=", end.toISOString()));

      if (specs && specs.length > 0) {
        conditions.push(eb("boss_kill_player.talent_spec", "in", specs));
      }

      if (raids && raids.length > 0) {
        conditions.push(eb("raid.name", "in", raids));
      }

      if (bossIds && bossIds.length > 0) {
        conditions.push(eb("boss.remote_id", "in", bossIds));
      }

      if (modes && modes.length > 0) {
        conditions.push(eb("boss_kill.mode", "in", modes));
      }

      if (ilvlMin > 0) {
        conditions.push(eb("boss_kill_player.avg_item_lvl", ">=", ilvlMin));
      }

      if (ilvlMax > 0) {
        conditions.push(eb("boss_kill_player.avg_item_lvl", "<=", ilvlMax));
      }

      return and(conditions);
    })
    .groupBy("boss_kill.time")
    .orderBy("boss_kill.time", "asc");

  if (groupByBossAndDiff) {
    qb.groupBy(["boss_kill.time", "boss_kill.boss_id", "boss_kill.mode"]);
  }
  return qb;
};
