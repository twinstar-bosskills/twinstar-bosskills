import { realmToExpansion } from "@twinstar-bosskills/core/dist/realm";
import {
  difficultiesByExpansion,
  difficultyToString,
  isRaidDifficulty,
} from "@twinstar-bosskills/core/dist/wow";
import { db } from "@twinstar-bosskills/db";
import { findBossKills } from "@twinstar-bosskills/db/dist/boss-kill";
import { findBossKillPlayers } from "@twinstar-bosskills/db/dist/boss-kill-player";
import { findBosses, setBossPercentilesPerPlayer } from "../boss.model";

try {
  console.log("Start");

  const realms = await db.selectFrom("realm").selectAll().execute();
  for (const realm of realms) {
    const realmStart = performance.now();
    const expansion = realmToExpansion(realm.name);
    const diffs = Object.values<number>(
      difficultiesByExpansion(expansion) ?? {},
    ).filter((diff) => isRaidDifficulty(expansion, diff));

    console.log(`Realm ${realm.name} started`);

    for (const boss of await findBosses({ realm: realm.name })) {
      const bossStart = performance.now();
      console.log(`Boss ${boss.name} - started`);

      for (const difficulty of diffs) {
        const diffStr = difficultyToString(expansion, difficulty);
        const diffStart = performance.now();
        console.log(`  difficulty: ${diffStr} started`);

        const bosskills = await findBossKills({
          realm: realm.name,
          bossId: boss.id,
          difficulty,
        });

        console.log(`    found: ${bosskills.length} bosskills`);
        let bkSum = 0;
        let bkCount = 0;
        for (const bk of bosskills) {
          const players = await findBossKillPlayers({ bossKillId: bk.id });
          if (players.length > 0) {
            const bkStart = performance.now();
            await setBossPercentilesPerPlayer({
              bossKillRemoteId: bk.remote_id,
              realm: realm.name,
              bossId: boss.id,
              difficulty,
              players,
            });
            const bkEnd = performance.now() - bkStart;
            bkSum += bkEnd;
            bkCount++;
          }
        }

        const bkAvg = bkCount > 0 ? bkSum / bkCount : 0;
        console.log(`    bosskill avg: ${bkAvg.toLocaleString()}ms`);
        console.log(`    bosskill total: ${bkSum.toLocaleString()}ms`);

        const diffEnd = performance.now() - diffStart;
        console.log(
          `  difficulty: ${diffStr} done, took ${diffEnd.toLocaleString()}ms`,
        );
      }
      const bossEnd = performance.now() - bossStart;
      console.log(
        `Boss ${boss.name} - done, took ${bossEnd.toLocaleString()}ms`,
      );
    }

    console.log(`Realm ${realm.name} caching`);

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
