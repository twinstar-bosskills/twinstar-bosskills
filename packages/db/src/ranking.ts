import {
  dpsEffectivity,
  METRIC_TYPE,
  type MetricType,
} from "@twinstar-bosskills/core/dist/metrics";
import {
  type BosskillCharacter,
  bosskillCharacterSchema,
} from "@twinstar-bosskills/api/dist/schema";
import { db } from ".";
import { sql } from "kysely";

export type GetRankingByRaidLockArgs = {
  realm: string;
  bossId: number;
  spec: number;
  difficulty: number;
  metric: MetricType;
  startsAt: Date;
  endsAt: Date;
  limit?: number;
};
type RankingItem = BosskillCharacter & {
  dpsEffectivity: number | null;
};
export type RankingByRaidLock = RankingItem[];

export const getRankingByRaidLock = async ({
  realm,
  bossId,
  spec,
  difficulty,
  metric,
  startsAt,
  endsAt,
  limit = 10,
}: GetRankingByRaidLockArgs): Promise<RankingByRaidLock> => {
  try {
    const rows = await db
      .selectFrom("ranking")
      .innerJoin("realm", "realm.id", "ranking.realm_id")
      .innerJoin("raid", "raid.id", "ranking.raid_id")
      .innerJoin("boss", "boss.id", "ranking.boss_id")
      .innerJoin("player", "player.id", "ranking.player_id")
      .innerJoin("boss_kill", "boss_kill.id", "ranking.boss_kill_id")
      .innerJoin("boss_kill_player", (join) =>
        join
          .onRef("boss_kill_player.boss_kill_id", "=", "ranking.boss_kill_id")
          .onRef("boss_kill_player.player_id", "=", "ranking.player_id"),
      )
      .leftJoin("boss_prop", (join) =>
        join
          .onRef("boss_prop.boss_id", "=", "ranking.boss_id")
          .onRef("boss_prop.mode", "=", "ranking.mode"),
      )
      .select([
        "raid.id as raid_id",
        "raid.name as raid_name",
        "raid.position as raid_position",
        "boss.id as boss_id",
        "boss.name as boss_name",
        "boss.remote_id as boss_remote_id",
        "boss.position as boss_position",
        "boss.raid_id as boss_raid_id",
        "boss_prop.health as boss_prop_health",
        "boss_prop.mode as boss_prop_mode",
        "boss_kill.id as boss_kill_id",
        "boss_kill.remote_id as boss_kill_remote_id",
        "boss_kill.mode as boss_kill_mode",
        "boss_kill.guild as boss_kill_guild",
        "boss_kill.time as boss_kill_time",
        "boss_kill.length as boss_kill_length",
        "boss_kill.wipes as boss_kill_wipes",
        "boss_kill.deaths as boss_kill_deaths",
        "boss_kill.ress_used as boss_kill_ress_used",
        "boss_kill_player.guid as bkp_guid",
        "boss_kill_player.talent_spec as bkp_talent_spec",
        "boss_kill_player.avg_item_lvl as bkp_avg_item_lvl",
        "boss_kill_player.dmg_done as bkp_dmg_done",
        "boss_kill_player.healing_done as bkp_healing_done",
        "boss_kill_player.overhealing_done as bkp_overhealing_done",
        "boss_kill_player.absorb_done as bkp_absorb_done",
        "boss_kill_player.dmg_taken as bkp_dmg_taken",
        "boss_kill_player.dmg_absorbed as bkp_dmg_absorbed",
        "boss_kill_player.healing_taken as bkp_healing_taken",
        "boss_kill_player.dispells as bkp_dispells",
        "boss_kill_player.interrupts as bkp_interrupts",
        "boss_kill_player.name as bkp_name",
        "boss_kill_player.race as bkp_race",
        "boss_kill_player.class as bkp_class",
        "boss_kill_player.gender as bkp_gender",
        "boss_kill_player.level as bkp_level",
        "player.name as player_name",
        "ranking.spec as ranking_spec",
        "ranking.rank as ranking_rank",
        "ranking.metric as ranking_metric",
      ])
      .where("realm.name", "=", realm)
      .where("ranking.boss_id", "=", bossId)
      .where("ranking.spec", "=", spec)
      .where("ranking.mode", "=", difficulty)
      .where("ranking.metric", "=", metric)
      .where("ranking.time", ">=", startsAt)
      .where("ranking.time", "<=", endsAt)
      .orderBy("ranking.rank", "asc")
      .groupBy("ranking.id")
      .limit(limit)
      .execute();
    const stats = [];
    const totalDmgByBkId = new Map<number, number>();
    for (const row of rows) {
      const bossHealth = row.boss_prop_health ?? 0;
      let raidDmgDone = totalDmgByBkId.get(row.boss_kill_id) ?? null;
      if (raidDmgDone === null) {
        const totals = await db
          .selectFrom("boss_kill_player")
          .select(sql<number>`SUM(dmg_done)`.as("total"))
          .where("boss_kill_id", "=", row.boss_kill_id)
          .execute();
        if (totals[0] && totals[0].total) {
          raidDmgDone = Number(totals[0].total);
          totalDmgByBkId.set(row.boss_kill_id, raidDmgDone);
        }
      }

      const value = {
        guid: row.bkp_guid,
        talent_spec: row.bkp_talent_spec,
        avg_item_lvl: row.bkp_avg_item_lvl,
        dmgDone: row.bkp_dmg_done,
        healingDone: row.bkp_healing_done,
        overhealingDone: row.bkp_overhealing_done,
        absorbDone: row.bkp_absorb_done,
        dmgTaken: row.bkp_dmg_taken,
        dmgAbsorbed: row.bkp_dmg_absorbed,
        healingTaken: row.bkp_healing_taken,
        dispels: row.bkp_dispells,
        interrupts: row.bkp_interrupts,
        name: row.bkp_name,
        race: row.bkp_race,
        class: row.bkp_class,
        gender: row.bkp_gender,
        level: row.bkp_level,

        boss_kills: {
          id: row.boss_kill_remote_id,
          entry: row.boss_remote_id,
          map: row.raid_name,
          mode: row.boss_kill_mode,
          guild: row.boss_kill_guild,
          time: row.boss_kill_time,
          realm,
          length: row.boss_kill_length,
          wipes: row.boss_kill_wipes,
          deaths: row.boss_kill_deaths,
          ressUsed: row.boss_kill_ress_used,
        },
      };

      const item = bosskillCharacterSchema.parse(value);
      if (
        metric === METRIC_TYPE.DPS &&
        bossHealth > 0 &&
        raidDmgDone !== null &&
        raidDmgDone > 0
      ) {
        (item as RankingItem).dpsEffectivity = dpsEffectivity({
          dmgDone: row.bkp_dmg_done,
          fightLength: row.boss_kill_length,
          bossHealth,
          raidDmgDone,
        });
      } else {
        (item as RankingItem).dpsEffectivity = null;
      }
      stats.push(item as RankingItem);
    }
    return stats;
  } catch (e) {
    console.error(e);
  }

  return [];
};
