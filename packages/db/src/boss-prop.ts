import { db } from ".";
import { BossProp } from "./types";

export const getBossPropsByBossId = async (
  bossId: number,
): Promise<BossProp | null> => {
  try {
    const prop = await db
      .selectFrom("boss_prop")
      .selectAll()
      .where("boss_id", "=", bossId)
      .executeTakeFirst();
    return prop ?? null;
  } catch (e) {
    console.error(e);
  }

  return null;
};
