import { db } from ".";
import { Raid } from "./types";

export const findRaidsByRealm = async ({
  realm,
}: {
  realm: string;
}): Promise<Raid[]> => {
  try {
    const rows = await db
      .selectFrom("raid")
      .selectAll("raid")
      .innerJoin("realm_x_raid", "realm_x_raid.raid_id", "raid.id")
      .innerJoin("realm", "realm_x_raid.realm_id", "realm.id")
      .where("realm.name", "=", realm)
      .execute();
    return rows;
  } catch (e) {
    console.error(e);
  }

  return [];
};
