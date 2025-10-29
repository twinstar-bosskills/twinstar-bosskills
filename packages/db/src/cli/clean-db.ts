import { db, sql } from "../";

try {
  await db
    .transaction()
    .execute(async (tx) => {
      console.log(`Deleting bosskill players with level <= 0`);
      await tx
        .deleteFrom("boss_kill_player")
        .where("boss_kill_player.level", "=", 0)
        .execute();
    })
    .catch(console.error);

  const bosskillsWithoutPlayers = await db
    .selectFrom("boss_kill")
    .select("boss_kill.id as id")
    .leftJoin(
      "boss_kill_player",
      "boss_kill_player.boss_kill_id",
      "boss_kill.id",
    )
    .groupBy("boss_kill.id")
    .having(sql<boolean>`COUNT(boss_kill_player.id) = 0`)
    .execute();

  const bosskillsWithoutPlayersIds = bosskillsWithoutPlayers.map(
    (row) => row.id,
  );

  await db
    .transaction()
    .execute(async (tx) => {
      const ids = bosskillsWithoutPlayersIds;
      if (ids.length) {
        console.log(`Found bosskill ids: ${ids.join(",")} without any players`);
        console.log(`  Deleting bosskill loot`);
        await tx
          .deleteFrom("boss_kill_loot")
          .where("boss_kill_loot.boss_kill_id", "in", ids)
          .execute();

        console.log(`  Deleting bosskill deaths`);
        await tx
          .deleteFrom("boss_kill_death")
          .where("boss_kill_death.boss_kill_id", "in", ids)
          .execute();

        console.log(`  Deleting bosskill timeline`);
        await tx
          .deleteFrom("boss_kill_timeline")
          .where("boss_kill_timeline.boss_kill_id", "in", ids)
          .execute();

        console.log(`  Deleting bosskills`);
        await tx
          .deleteFrom("boss_kill")
          .where("boss_kill.id", "in", ids)
          .execute();
      } else {
        console.log(`No bosskills without players found`);
      }
    })
    .catch(console.error);

  try {
    console.log("Updating player names according to latest bosskills");
    const realms = await db.selectFrom("realm").selectAll().execute();
    for (const realm of realms) {
      const result = await sql<{
        guid: number;
        name_next: string;
        name_prev: string;
      }>`
		WITH ranked AS (
			SELECT boss_kill_player.guid AS guid,
					 boss_kill_player.name AS name,
					 RANK() OVER (PARTITION BY guid ORDER BY boss_kill.time DESC) AS rank
			FROM boss_kill_player INNER JOIN boss_kill ON boss_kill.id = boss_kill_player.boss_kill_id
			WHERE boss_kill.realm_id = ${realm.id}
			GROUP BY guid, name
		)
		SELECT r2.guid, r2.name AS name_prev, r1.name AS name_next FROM ranked AS r2 
		INNER JOIN ranked AS r1 ON r1.guid = r2.guid AND r1.rank = 1
		WHERE r2.rank > 1`.execute(db);

      const rows = result.rows ?? [];
      if (Array.isArray(rows)) {
        for (const row of rows) {
          const { guid, name_next: nameNext, name_prev: namePrev } = row;

          console.log(
            `Realm ${realm.name}, player GUID: ${guid} (${namePrev}) will be renamed to ${nameNext}`,
          );
          console.log(`  Renaming rows in table boss_kill_player`);
          const bosskillsPlayers = await db
            .selectFrom("boss_kill_player")
            .select("boss_kill_player.id as id")
            .innerJoin(
              "boss_kill",
              "boss_kill.id",
              "boss_kill_player.boss_kill_id",
            )
            .where(({ eb }) =>
              eb.and([
                eb("boss_kill.realm_id", "=", realm.id),
                eb("boss_kill_player.guid", "=", guid),
                eb("boss_kill_player.name", "!=", nameNext),
              ]),
            )
            .execute();

          const bosskillsPlayersIds = bosskillsPlayers.map((v) => v.id);
          const bosskillsPlayersCount = bosskillsPlayersIds.length;
          console.log(`  Found ${bosskillsPlayersCount} rows`);
          if (bosskillsPlayersCount > 0) {
            await db
              .transaction()
              .execute(async (tx) => {
                return await tx
                  .updateTable("boss_kill_player")
                  .set({ name: nameNext })
                  .where("boss_kill_player.id", "in", bosskillsPlayersIds)
                  .execute();
              })
              .catch(console.error);
          }

          console.log(`  Renaming rows in table player`);
          await db
            .transaction()
            .execute(async (tx) => {
              return await tx
                .updateTable("player")
                .set({ name: nameNext })
                .where(({ eb }) =>
                  eb.and([
                    eb("player.remote_id", "=", guid),
                    eb("player.realm_id", "=", realm.id),
                    eb("player.name", "!=", nameNext),
                  ]),
                )
                .execute();
            })
            .catch(console.error);
        }
      }
    }

    /* find multiple names for one guid
		WITH ranked AS (
			SELECT guid, name, RANK() OVER (PARTITION BY guid ORDER BY bk.time DESC) AS rank
			FROM boss_kill_player AS bkp INNER JOIN boss_kill bk ON bk.id = bkp.boss_kill_id
			GROUP BY guid, name
		)
		SELECT r2.guid, r2.name AS name_prev, r1.name AS name_next FROM ranked AS r2 
		INNER JOIN ranked AS r1 ON r1.guid = r2.guid AND r1.rank = 1
		WHERE r2.rank > 1
	*/
  } catch (e) {
    console.error(e);
  }

  console.log("Done");

  await db.destroy();
  process.exit(0);
} catch (e) {
  console.error(e);

  await db.destroy();
  process.exit(1);
}
