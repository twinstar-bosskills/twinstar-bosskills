import { db } from ".";
import type { Boss } from "./types";
import { dps, hps } from "./boss-kill-player";
import {
  METRIC_TYPE,
  type MetricType,
  dpsEffectivity,
} from "@twinstar-bosskills/core/dist/metrics";
import type { BosskillCharacter } from "@twinstar-bosskills/api/dist/schema";
import { bosskillCharacterSchema } from "@twinstar-bosskills/api/dist/schema";
import { sql } from "kysely";

// Local type definitions to avoid import issues during conversion
export type AggregatedBySpec = Record<number, number[]>;
export type AggregatedBySpecStats = {
  indexToSpecId: Record<number, number>;
  prepared: any;
};
export const aggregateBySpec = (
  aggregatedBySpec: AggregatedBySpec,
): AggregatedBySpecStats => {
  // Simple implementation for now - can be enhanced later
  const keys = Object.keys(aggregatedBySpec).map(Number);
  const values = Object.values(aggregatedBySpec);

  // Simple aggregation - just return the structure
  const indexToSpecId: Record<number, number> = {};
  keys.forEach((key, index) => {
    indexToSpecId[index] = key;
  });

  return {
    indexToSpecId,
    prepared: {
      axisData: keys.map(String),
      boxData: values.map((arr) => [
        Math.min(...arr),
        0,
        arr.reduce((a, b) => a + b) / arr.length,
        0,
        Math.max(...arr),
      ]),
      outliers: [],
    },
  };
};

type BuilderArgs = {
  realm: string;
  id?: number | undefined;
  remoteId?: number | undefined;
};

const builder = ({ realm, id, remoteId }: BuilderArgs) => {
  let query = db
    .selectFrom("boss")
    .innerJoin("raid", "raid.id", "boss.raid_id")
    .innerJoin("realm_x_raid", "realm_x_raid.raid_id", "raid.id")
    .innerJoin("realm", "realm.id", "realm_x_raid.realm_id")
    .select([
      "boss.id",
      "boss.remote_id",
      "boss.name",
      "boss.raid_id",
      "boss.position",
    ])
    .where("realm.name", "=", realm);

  if (typeof remoteId === "number") {
    query = query.where("boss.remote_id", "=", remoteId);
  }

  if (typeof id === "number") {
    query = query.where("boss.id", "=", id);
  }

  return query;
};

export const findBossesByRealm = async ({
  realm,
}: {
  realm: string;
}): Promise<Boss[]> => {
  try {
    return await builder({ realm }).execute();
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const getBossByRemoteIdAndRealm = async ({
  remoteId,
  realm,
}: {
  remoteId: number;
  realm: string;
}): Promise<Boss | null> => {
  try {
    const result = await builder({ realm, remoteId }).execute();
    return result[0] ?? null;
  } catch (e) {
    console.error(e);
  }
  return null;
};

export type BossTopSpecItem = BosskillCharacter & {
  dpsEffectivity: number | null;
};
export type BossTopSpecs = Record<number, BossTopSpecItem[]>;
export type GetBossTopSpecsArgs = {
  remoteId: number;
  realm: string;
  talentSpec?: number;
  difficulty: number;
  metric: MetricType;
  limit?: number;
  startsAt?: Date;
  endsAt?: Date;
};
export const getBossTopSpecs = async ({
  remoteId,
  realm,
  talentSpec,
  difficulty,
  metric,
  limit = 200,
  startsAt,
  endsAt,
}: GetBossTopSpecsArgs): Promise<BossTopSpecs> => {
  const stats: BossTopSpecs = {};

  try {
    const partitionQb = db
      .selectFrom("boss_kill_player")
      .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .select(({ eb }) => [
        "boss_kill_player.id",
        sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.as("metric"),
        sql`ROW_NUMBER() OVER (PARTITION BY boss_kill_player.guid ORDER BY ${sql`${metric === METRIC_TYPE.HPS ? hps : dps}`} DESC)`.as(
          "row_number",
        ),
      ])
      .where(({ eb, and }) => {
        const conditions = [
          eb("realm.name", "=", realm),
          eb("boss_kill.mode", "=", difficulty),
          eb("boss.remote_id", "=", remoteId),
        ];

        if (talentSpec) {
          conditions.push(eb("boss_kill_player.talent_spec", "=", talentSpec));
        }

        if (startsAt) {
          conditions.push(eb("boss_kill.time", ">=", startsAt.toISOString()));
        }

        if (endsAt) {
          conditions.push(eb("boss_kill.time", "<=", endsAt.toISOString()));
        }

        return and(conditions);
      });

    const sub = partitionQb.as("sub");
    const topIdsQb = db
      .selectFrom(sub)
      .select("sub.id")
      .where("sub.row_number", "=", 1)
      .orderBy("sub.metric", "desc");
    if (limit) {
      topIdsQb.limit(limit);
    }
    const topRows = await topIdsQb.execute();
    const topIds = topRows.map((row) => row.id);

    if (topIds.length === 0) {
      return stats;
    }

    const qb = db
      .selectFrom("boss_kill_player")
      .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .innerJoin("raid", "raid.id", "boss_kill.raid_id")
      .leftJoin("boss_prop", (join) =>
        join
          .onRef("boss_prop.boss_id", "=", "boss.id")
          .onRef("boss_prop.mode", "=", "boss_kill.mode"),
      )
      .select([
        "boss_kill_player.id",
        "boss_kill_player.guid",
        "boss_kill_player.talent_spec",
        "boss_kill_player.avg_item_lvl",
        "boss_kill_player.dmg_done",
        "boss_kill_player.healing_done",
        "boss_kill_player.overhealing_done",
        "boss_kill_player.absorb_done",
        "boss_kill_player.dmg_taken",
        "boss_kill_player.dmg_absorbed",
        "boss_kill_player.healing_taken",
        "boss_kill_player.dispells",
        "boss_kill_player.interrupts",
        "boss_kill_player.name",
        "boss_kill_player.race",
        "boss_kill_player.class",
        "boss_kill_player.gender",
        "boss_kill_player.level",
        "boss_kill.id as boss_kill_id",
        "boss_kill.remote_id as boss_kill_remote_id",
        "boss_kill.mode",
        "boss_kill.time",
        "boss_kill.guild",
        "boss_kill.length",
        "boss_kill.wipes",
        "boss_kill.deaths",
        "boss_kill.ress_used",
        "boss.id as boss_id",
        "boss.remote_id as boss_remote_id",
        "boss.name as boss_name",
        "raid.name as raid_name",
        "boss_prop.health",
      ])
      .where("boss_kill_player.id", "in", topIds)
      .orderBy(sql`${metric === METRIC_TYPE.HPS ? hps : dps}`, "desc")
      .groupBy("boss_kill_player.id");

    const rows = await qb.execute();
    const totalDmgByBkId = new Map<number, number>();
    for (const row of rows) {
      const bkp = {
        id: row.id,
        guid: row.guid,
        talentSpec: row.talent_spec,
        avgItemLvl: row.avg_item_lvl,
        dmgDone: row.dmg_done,
        healingDone: row.healing_done,
        overhealingDone: row.overhealing_done,
        absorbDone: row.absorb_done,
        dmgTaken: row.dmg_taken,
        dmgAbsorbed: row.dmg_absorbed,
        healingTaken: row.healing_taken,
        dispells: row.dispells,
        interrupts: row.interrupts,
        name: row.name,
        race: row.race,
        class: row.class,
        gender: row.gender,
        level: row.level,
      };
      const bk = {
        id: row.boss_kill_id,
        remoteId: row.boss_kill_remote_id,
        mode: row.mode,
        time: row.time,
        guild: row.guild,
        length: row.length,
        wipes: row.wipes,
        deaths: row.deaths,
        ressUsed: row.ress_used,
      };
      const boss = {
        id: row.boss_id,
        remoteId: row.boss_remote_id,
        name: row.boss_name,
      };
      const raid = {
        name: row.raid_name,
      };
      const spec = bkp.talentSpec;
      const bossProp = row.health !== null ? { health: row.health } : null;
      const bossHealth = bossProp?.health ?? 0;
      let raidDmgDone = totalDmgByBkId.get(bk.id) ?? null;
      if (raidDmgDone === null) {
        const totals = await db
          .selectFrom("boss_kill_player")
          .select(sql`SUM(boss_kill_player.dmg_done)`.as("total"))
          .where("boss_kill_player.boss_kill_id", "=", bk.id)
          .execute();
        if (totals[0]) {
          raidDmgDone = Number(totals[0].total);
          totalDmgByBkId.set(bk.id, raidDmgDone);
        }
      }

      const value = {
        guid: bkp.guid,
        talent_spec: bkp.talentSpec,
        avg_item_lvl: bkp.avgItemLvl,
        dmgDone: bkp.dmgDone,
        healingDone: bkp.healingDone,
        overhealingDone: bkp.overhealingDone,
        absorbDone: bkp.absorbDone,
        dmgTaken: bkp.dmgTaken,
        dmgAbsorbed: bkp.dmgAbsorbed,
        healingTaken: bkp.healingTaken,
        dispels: bkp.dispells,
        interrupts: bkp.interrupts,
        name: bkp.name,
        race: bkp.race,
        class: bkp.class,
        gender: bkp.gender,
        level: bkp.level,

        boss_kills: {
          id: bk.remoteId,
          entry: boss.remoteId,
          map: raid.name,
          mode: bk.mode,
          guild: bk.guild,
          time: bk.time,
          realm,
          length: bk.length,
          wipes: bk.wipes,
          deaths: bk.deaths,
          ressUsed: bk.ressUsed,
        },
      };
      const item = bosskillCharacterSchema.parse(value);

      (item as BossTopSpecItem).dpsEffectivity =
        metric === METRIC_TYPE.DPS &&
        bossHealth > 0 &&
        raidDmgDone !== null &&
        raidDmgDone > 0
          ? dpsEffectivity({
              dmgDone: bkp.dmgDone,
              fightLength: bk.length,
              bossHealth,
              raidDmgDone,
            })
          : null;
      stats[spec] ??= [];
      stats[spec]!.push(item as BossTopSpecItem);
    }
  } catch (e) {
    console.error(e);
  }
  return stats;
};

export type GetBossAggregatedStatsArgs = {
  realm: string;
  remoteId: number;
  metric: MetricType;
  difficulty: number;
};
export const getBossAggregatedStats = async ({
  realm,
  remoteId,
  metric,
  difficulty,
}: GetBossAggregatedStatsArgs): Promise<AggregatedBySpecStats> => {
  const fallback = async () => {
    try {
      const qb = db
        .selectFrom("boss_kill_player")
        .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
        .innerJoin("boss", "boss.id", "boss_kill.boss_id")
        .innerJoin("realm", "realm.id", "boss_kill.realm_id")
        .select([
          "boss_kill_player.talent_spec as spec",
          sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.as("value"),
        ])
        .where(({ eb, and }) => {
          const conditions = [
            eb("realm.name", "=", realm),
            eb("boss_kill.mode", "=", difficulty),
            eb("boss.remote_id", "=", remoteId),
            eb("boss_kill_player.talent_spec", "!=", 0),
          ];

          return and(conditions);
        })
        .having(({ eb, and }) => {
          const conditions = [eb(sql`value`, ">=", 0)];
          if (metric === METRIC_TYPE.HPS) {
            conditions.push(eb(sql`value`, "<", 5000000));
          }
          return and(conditions);
        });

      const rows = await qb.execute();
      const bySpec: AggregatedBySpec = {};
      for (const item of rows) {
        const value = Number(item.value);
        const spec = item.spec;
        bySpec[spec] ??= [];
        bySpec[spec]!.push(value);
      }

      return aggregateBySpec(bySpec);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return fallback();
};

export type GetBossStatsMedianArgs = {
  realm: string;
  remoteId: number;
  metric: MetricType;
  difficulties: number[];
  specs?: number[];
  ilvlMin?: number;
  ilvlMax?: number;
};
type BossStatsMedian = {
  spec: number;
  mode: number;
  value: number;
};
export const getBossStatsMedian = async ({
  realm,
  remoteId,
  metric,
  difficulties,
  specs,
  ilvlMin = 0,
  ilvlMax = 0,
}: GetBossStatsMedianArgs): Promise<BossStatsMedian[]> => {
  try {
    const qb = db
      .selectFrom("boss_kill_player")
      .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .select([
        sql<number>`boss_kill_player.talent_spec`.as("spec"),
        sql<number>`boss_kill.mode`.as("mode"),
        sql<number>`MEDIAN(${metric === METRIC_TYPE.HPS ? hps : dps}) OVER (PARTITION BY boss_kill.mode, boss_kill_player.talent_spec)`.as(
          "value",
        ),
      ])
      .where(({ eb, and }) => {
        const conditions = [
          eb("realm.name", "=", realm),
          eb("boss.remote_id", "=", remoteId),
          eb("boss_kill_player.talent_spec", "!=", 0),
        ];

        if (difficulties && difficulties.length) {
          conditions.push(eb("boss_kill.mode", "in", difficulties));
        }

        if (specs && specs.length) {
          conditions.push(eb("boss_kill_player.talent_spec", "in", specs));
        }

        if (ilvlMin > 0) {
          conditions.push(eb("boss_kill_player.avg_item_lvl", ">=", ilvlMin));
        }

        if (ilvlMax > 0) {
          conditions.push(eb("boss_kill_player.avg_item_lvl", "<=", ilvlMax));
        }

        return and(conditions);
      });

    const qb2 = db
      .selectFrom(qb.as("sub"))
      .selectAll()
      .where(({ eb, and }) => {
        const conditions = [eb(sql`value`, ">=", 0)];
        if (metric === METRIC_TYPE.HPS) {
          conditions.push(eb(sql`value`, "<", 5000000));
        }
        return and(conditions);
      })
      .orderBy(sql`value`);

    const rows = await qb2.execute();
    return rows;
  } catch (e) {
    console.error(e);
  }
  return [];
};

type GetBossPercentilesArgs = {
  realm: string;
  bossId: Boss["id"];
  difficulty: number;
  talentSpec: number;
  metric: MetricType;
  targetValue: number;
};
export const getBossPercentiles = async ({
  realm,
  bossId,
  difficulty,
  talentSpec,
  metric,
  targetValue,
}: GetBossPercentilesArgs): Promise<number | null> => {
  try {
    const qb = db
      .selectFrom("boss_kill")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .innerJoin(
        "boss_kill_player",
        "boss_kill_player.boss_kill_id",
        "boss_kill.id",
      )
      .select([
        "boss_kill_player.talent_spec as spec",
        sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.as("value"),
        sql`100 * ROUND(PERCENT_RANK() OVER (PARTITION BY boss_kill_player.talent_spec ORDER BY ${sql`${metric === METRIC_TYPE.HPS ? hps : dps}`}), 2)`.as(
          "percentile_rank",
        ),
      ])
      .where(({ eb, and }) =>
        and([
          eb("realm.name", "=", realm),
          eb("boss.id", "=", bossId),
          eb("boss_kill.mode", "=", difficulty),
          eb("boss_kill_player.talent_spec", "=", talentSpec),
        ]),
      );

    const rows = await qb.execute();

    // Find the row with the closest value to targetValue
    let closest = rows[0] ?? null;
    if (closest === null) {
      return null;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const closestDiff = Math.abs(targetValue - Number(closest.value));
      const currentDiff = Math.abs(targetValue - Number(row.value));
      if (currentDiff < closestDiff) {
        closest = row;
      }
    }

    return Number(closest.percentile_rank);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const getBossPercentilesFast = async ({
  realm,
  bossId,
  difficulty,
  talentSpec,
  metric,
  targetValue,
}: GetBossPercentilesArgs): Promise<number | null> => {
  try {
    const qb = db
      .selectFrom("boss_kill")
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .innerJoin(
        "boss_kill_player",
        "boss_kill_player.boss_kill_id",
        "boss_kill.id",
      )
      .select([
        "boss_kill_player.talent_spec as spec",
        sql`${metric === METRIC_TYPE.HPS ? hps : dps}`.as("value"),
        sql`100 * ROUND(PERCENT_RANK() OVER (PARTITION BY boss_kill_player.talent_spec ORDER BY ${sql`${metric === METRIC_TYPE.HPS ? hps : dps}`}), 2)`.as(
          "percentile_rank",
        ),
      ])
      .where(({ eb, and }) =>
        and([
          eb("realm.name", "=", realm),
          eb("boss.id", "=", bossId),
          eb("boss_kill.mode", "=", difficulty),
          eb("boss_kill_player.talent_spec", "=", talentSpec),
        ]),
      );

    const rows = await qb.execute();

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
      const closestDiff = Math.abs(targetValue - Number(closest.value));
      const currentDiff = Math.abs(targetValue - Number(row.value));
      if (currentDiff < closestDiff) {
        closest = row;
      }
    }

    return Number(closest.percentile_rank);
  } catch (e) {
    console.error(e);
  }
  return null;
};
