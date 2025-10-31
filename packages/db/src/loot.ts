import { db } from ".";
import { sql } from "kysely";

type GetLootChanceArgs = {
  itemId: number;
  bossRemoteId: number;
  mode: number;
};
export type LootChance = {
  count: number;
  total: number;
  chance: number;
};
export const getLootChance = async ({
  itemId,
  mode,
  bossRemoteId,
}: GetLootChanceArgs): Promise<LootChance | null> => {
  try {
    const currentRows = await db
      .selectFrom("boss_kill")
      .innerJoin(
        "boss_kill_loot",
        "boss_kill.id",
        "boss_kill_loot.boss_kill_id",
      )
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .select(sql<number>`count(*)`.as("count"))
      .where(({ and, eb }) =>
        and([
          eb("boss_kill.mode", "=", mode),
          eb("boss.remote_id", "=", bossRemoteId),
          eb("boss_kill_loot.item_id", "=", itemId),
        ]),
      )
      .execute();
    const current = currentRows[0] ?? null;

    const totalRows = await db
      .selectFrom("boss_kill")
      .innerJoin(
        "boss_kill_loot",
        "boss_kill.id",
        "boss_kill_loot.boss_kill_id",
      )
      .innerJoin("boss", "boss.id", "boss_kill.boss_id")
      .select(sql<number>`count(*)`.as("count"))
      .where(({ and, eb }) =>
        and([
          eb("boss_kill.mode", "=", mode),
          eb("boss.remote_id", "=", bossRemoteId),
        ]),
      )
      .execute();
    const total = totalRows[0] ?? null;

    if (!total || total.count === 0) {
      return null;
    }

    const currentCount = current?.count ?? 0;
    const totalCount = total.count;
    const chance = (current?.count ?? 0) / total.count;
    return {
      count: currentCount,
      total: totalCount,
      chance: 100 * (Math.round(10000 * chance) / 10000),
    };
  } catch (e) {
    console.error(e);
  }

  return null;
};
