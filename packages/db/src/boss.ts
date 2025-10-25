import { db } from "./index";
import type { Boss } from "./types";

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
    return builder({ realm }).execute();
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
