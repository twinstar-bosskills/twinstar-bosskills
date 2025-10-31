import { METRIC_TYPE } from "@twinstar-bosskills/core/dist/metrics";
import {
  realmIsPublic,
  realmToExpansion,
} from "@twinstar-bosskills/core/dist/realm";
import {
  difficultiesByExpansion,
  difficultyToString,
  isRaidDifficulty,
  talentSpecsByExpansion,
} from "@twinstar-bosskills/core/dist/wow";
import { raidLock } from "@twinstar-bosskills/core/src/date";
import { db } from "@twinstar-bosskills/db";
import { getBossTopSpecs } from "@twinstar-bosskills/db/dist/boss";
import { getBosskillByRemoteId } from "@twinstar-bosskills/db/dist/boss-kill";
import { getPlayerByGuid } from "@twinstar-bosskills/db/dist/player";
import type {
  BossKill,
  Player,
  RankingInsert,
} from "@twinstar-bosskills/db/dist/types";
import { program } from "commander";
import { findBosses } from "../boss.model";
import {
  integerGte,
  listOfStrings,
} from "@twinstar-bosskills/core/dist/cli/parse-args";

const gteZero = integerGte(0);
program.option(
  "--offset <number>",
  "Raid lock offset. Pass 0 or do not pass at all for current raid lock",
  gteZero,
);
program.option("--realms <items>", "Realms", listOfStrings);
program.parse();

const options: { offset?: number; realms?: string[] } = program.opts();

console.log("Start");
console.log({ options });

const now = new Date();
const { start: startsAt, end: endsAt } = raidLock(now, options.offset ?? 0);

try {
  let realmsQb = db.selectFrom("realm").selectAll();
  if (Array.isArray(options.realms) && options.realms.length > 0) {
    realmsQb = realmsQb.where("realm.name", "in", options.realms);
  }
  const realms = await realmsQb.execute();
  for (const realm of realms) {
    if (realmIsPublic(realm.name) === false) {
      continue;
    }
    const realmStart = performance.now();
    const expansion = realmToExpansion(realm.name);
    const diffs = Object.values<number>(
      difficultiesByExpansion(expansion) ?? {},
    ).filter((diff) => isRaidDifficulty(expansion, diff));
    const specs = talentSpecsByExpansion(expansion) ?? {};

    const playerCache = new Map<string, Player>();
    const getPlayer = async ({
      guid,
    }: {
      guid: number;
    }): Promise<Player | null> => {
      const k = `${realm.name}-${guid}`;

      const player =
        playerCache.get(k) ??
        (await getPlayerByGuid({ guid, realm: realm.name }));
      if (player === null) {
        return null;
      }
      playerCache.set(k, player);
      return player;
    };

    const bosskillCache = new Map<string, BossKill>();
    const getBosskill = async ({
      remoteId,
    }: {
      remoteId: string;
    }): Promise<BossKill | null> => {
      const k = `${realm.name}-${remoteId}`;
      const bk =
        bosskillCache.get(k) ??
        (await getBosskillByRemoteId({ remoteId, realm: realm.name }));
      if (bk === null) {
        return null;
      }
      bosskillCache.set(k, bk);
      return bk;
    };

    console.log(`Realm ${realm.name} started`);

    for (const metric of Object.values(METRIC_TYPE)) {
      for (const boss of await findBosses({ realm: realm.name })) {
        const bossStart = performance.now();
        console.log(`Boss ${boss.name} - ${metric} started`);

        for (const difficulty of diffs) {
          const diffStr = difficultyToString(expansion, difficulty);
          const diffStart = performance.now();
          console.log(`  difficulty: ${diffStr} started`);

          for (const talentSpec of Object.values<number>(specs)) {
            const topSpecs = await getBossTopSpecs({
              realm: realm.name,
              remoteId: boss.remote_id,
              difficulty,
              metric,
              talentSpec,
              startsAt,
              endsAt,
              limit: 10,
            });

            await db.transaction().execute(async (tx) => {
              return await tx
                .deleteFrom("ranking")
                .where(({ eb }) =>
                  eb.and([
                    eb("ranking.realm_id", "=", realm.id),
                    eb("ranking.raid_id", "=", boss.raid_id),
                    eb("ranking.boss_id", "=", boss.id),
                    eb("ranking.spec", "=", talentSpec),
                    eb("ranking.mode", "=", difficulty),
                    eb("ranking.metric", "=", metric),
                    eb("ranking.time", ">=", startsAt),
                    eb("ranking.time", "<=", endsAt),
                  ]),
                )
                .execute();
            });

            const values: RankingInsert[] = [];
            let rank = 1;
            for (const [specStr, items] of Object.entries(topSpecs)) {
              const spec = Number(specStr);
              const len = items.length;
              for (let i = 0; i < len; i++) {
                const item = items[i]!;
                const guid = item.guid;
                const bk = item.boss_kills;
                if (bk) {
                  const mode = bk.mode;

                  const player = await getPlayer({ guid });
                  if (player === null) {
                    console.error(
                      `Player not found by realm: ${realm.name} and guid: ${guid}`,
                    );
                    continue;
                  }

                  const bosskillId =
                    (await getBosskill({ remoteId: bk.id }))?.id ?? null;
                  if (bosskillId === null) {
                    console.error(
                      `Bosskill not found by realm: ${realm.name} and remoteId: ${bk.id}`,
                    );
                    continue;
                  }

                  values.push({
                    realm_id: realm.id,
                    raid_id: boss.raid_id,
                    boss_id: boss.id,
                    boss_kill_id: bosskillId,
                    player_id: player.id,
                    rank,
                    time: new Date(bk.time),
                    spec,
                    mode,
                    metric,
                  });

                  rank++;
                }
              }
            }

            if (values.length > 0) {
              await db.transaction().execute(async (tx) => {
                return await tx.insertInto("ranking").values(values).execute();
              });
            }
          }

          const diffEnd = performance.now() - diffStart;
          console.log(
            `  difficulty: ${diffStr} done, took ${diffEnd.toLocaleString()}ms`,
          );
        }
        const bossEnd = performance.now() - bossStart;
        console.log(
          `Boss ${boss.name} - ${metric} done, took ${bossEnd.toLocaleString()}ms`,
        );
      }
    }

    const realmEnd = performance.now() - realmStart;
    console.log(
      `Realm ${realm.name} done, took: ${realmEnd.toLocaleString()}ms`,
    );
  }

  console.log("Done");
  await db.destroy();
  process.exit(0);
} catch (e) {
  console.error(e);
  await db.destroy();
  process.exit(1);
}
