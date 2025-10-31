import { db } from ".";
import { BossKill } from "./types";

type FindBossKillsArgs = {
  realm: string;
  bossId?: number;
  difficulty?: number;
  startsAt?: Date;
  endsAt?: Date;
};
export const findBossKills = async ({
  realm,
  bossId,
  difficulty,
  startsAt,
  endsAt,
}: FindBossKillsArgs): Promise<BossKill[]> => {
  try {
    const query = db
      .selectFrom("boss_kill")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .select([
        "boss_kill.id",
        "boss_kill.remote_id",
        "boss_kill.boss_id",
        "boss_kill.mode",
        "boss_kill.time",
        "boss_kill.wipes",
        "boss_kill.deaths",
        "boss_kill.guild",
        "boss_kill.length",
        "boss_kill.raid_id",
        "boss_kill.realm_id",
        "boss_kill.ress_used",
      ])
      .where(({ eb, and }) => {
        const conditions = [eb("realm.name", "=", realm)];

        if (startsAt) {
          conditions.push(eb("boss_kill.time", ">=", startsAt.toISOString()));
        }

        if (endsAt) {
          conditions.push(eb("boss_kill.time", "<=", endsAt.toISOString()));
        }

        if (bossId) {
          conditions.push(eb("boss_kill.boss_id", "=", bossId));
        }

        if (typeof difficulty !== "undefined") {
          conditions.push(eb("boss_kill.mode", "=", difficulty));
        }

        return and(conditions);
      });

    return await query.execute();
  } catch (e) {
    console.error(e);
    return [];
  }
};
export const getBosskillByRemoteId = async ({
  remoteId,
  realm,
}: {
  remoteId: string;
  realm: string;
}): Promise<BossKill | null> => {
  try {
    const query = db
      .selectFrom("boss_kill")
      .innerJoin("realm", "realm.id", "boss_kill.realm_id")
      .select([
        "boss_kill.id",
        "boss_kill.remote_id",
        "boss_kill.boss_id",
        "boss_kill.mode",
        "boss_kill.time",
        "boss_kill.wipes",
        "boss_kill.deaths",
        "boss_kill.guild",
        "boss_kill.length",
        "boss_kill.raid_id",
        "boss_kill.realm_id",
        "boss_kill.ress_used",
      ])
      .where(({ eb, and }) =>
        and([
          eb("realm.name", "=", realm),
          eb("boss_kill.remote_id", "=", remoteId),
        ]),
      );

    const rows = await query.execute();
    return rows[0] ?? null;
  } catch (e) {
    console.error(e);
    return null;
  }
};
