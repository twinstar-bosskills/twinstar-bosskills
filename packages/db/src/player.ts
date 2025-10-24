import { db } from ".";
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
