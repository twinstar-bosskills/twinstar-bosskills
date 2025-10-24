import { sql } from "kysely";
import { db } from "./index";

export const dps = sql<number>`CAST(ROUND(IF(boss_kill.length = 0, 0, boss_kill_player.dmg_done/(boss_kill.length/1000))) AS UNSIGNED)`;

export const hps = sql<number>`CAST(ROUND(IF(boss_kill.length = 0, 0, (boss_kill_player.healing_done + boss_kill_player.absorb_done)/(boss_kill.length/1000))) AS UNSIGNED)`;

type FindBossKillPlayersArgs = {
  bossKillId: number;
};

export const findBossKillPlayers = async ({
  bossKillId,
}: FindBossKillPlayersArgs): Promise<
  {
    guid: number;
    dps: number;
    hps: number;
    spec: number;
  }[]
> => {
  try {
    const result = await db
      .selectFrom("boss_kill_player")
      .innerJoin("boss_kill", "boss_kill.id", "boss_kill_player.boss_kill_id")
      .select([
        "boss_kill_player.guid",
        "boss_kill_player.talent_spec as spec",
        dps.as("dps"),
        hps.as("hps"),
      ])
      .where("boss_kill_player.boss_kill_id", "=", bossKillId)
      .execute();

    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};
