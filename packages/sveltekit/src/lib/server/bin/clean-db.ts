import { and, eq, getTableName, inArray, lte, not, sql } from 'drizzle-orm';
import { createConnection } from '../db/index';
import { bosskillDeathTable } from '../db/schema/boss-kill-death.schema';
import { bosskillLootTable } from '../db/schema/boss-kill-loot.schema';
import { bosskillPlayerTable } from '../db/schema/boss-kill-player.schema';
import { bosskillTimelineTable } from '../db/schema/boss-kill-timeline.schema';
import { bosskillTable } from '../db/schema/boss-kill.schema';
import { playerTable } from '../db/schema/player.schema';
import { realmTable } from '../db/schema/realm.schema';

try {
	const db = await createConnection();
	await db
		.transaction(async () => {
			console.log(`Deleting bosskill players with level <= 0`);
			const playersQb = db.delete(bosskillPlayerTable).where(lte(bosskillPlayerTable.level, 0));

			await playersQb.execute();
		})
		.catch(console.error);

	await db
		.transaction(async () => {
			const bosskillsWithoutPlayersQb = db
				.select({ id: bosskillTable.id })
				.from(bosskillTable)
				.leftJoin(bosskillPlayerTable, eq(bosskillPlayerTable.bosskillId, bosskillTable.id))
				.groupBy(bosskillTable.id)
				.having(sql`COUNT(${bosskillPlayerTable.id}) = 0`);

			const ids = (await bosskillsWithoutPlayersQb.execute()).map((row) => row.id);
			if (ids.length) {
				console.log(`Found bosskill ids: ${ids.join(',')} without any players`);
				console.log(`  Deleting bosskill loot`);
				await db
					.delete(bosskillLootTable)
					.where(inArray(bosskillLootTable.bosskillId, ids))
					.execute();

				console.log(`  Deleting bosskill deaths`);
				await db
					.delete(bosskillDeathTable)
					.where(inArray(bosskillDeathTable.bosskillId, ids))
					.execute();

				console.log(`  Deleting bosskill timeline`);
				await db
					.delete(bosskillTimelineTable)
					.where(inArray(bosskillTimelineTable.bosskillId, ids))
					.execute();

				console.log(`  Deleting bosskills`);
				await db.delete(bosskillTable).where(inArray(bosskillTable.id, ids)).execute();
			} else {
				console.log(`No bosskills without players found`);
			}
		})
		.catch(console.error);

	try {
		console.log('Updating player names according to latest bosskills');
		const realms = await db.select().from(realmTable);
		for (const realm of realms) {
			const result = await db.execute(sql`
		WITH ranked AS (
			SELECT ${bosskillPlayerTable.guid} AS guid,
						 ${bosskillPlayerTable.name} AS name,
						 RANK() OVER (PARTITION BY guid ORDER BY ${bosskillTable.time} DESC) AS rank
			FROM ${bosskillPlayerTable} INNER JOIN ${bosskillTable} ON ${bosskillTable.id} = ${bosskillPlayerTable.bosskillId}
			WHERE ${bosskillTable.realmId} = ${realm.id}
			GROUP BY guid, name
		)
		SELECT r2.guid, r2.name AS name_prev, r1.name AS name_next FROM ranked AS r2 
		INNER JOIN ranked AS r1 ON r1.guid = r2.guid AND r1.rank = 1
		WHERE r2.rank > 1`);

			const rows = result[0] ?? [];
			if (Array.isArray(rows)) {
				for (const row of rows) {
					const { guid, name_next: nameNext, name_prev: namePrev } = row;

					console.log(
						`Realm ${realm.name}, player GUID: ${guid} (${namePrev}) will be renamed to ${nameNext}`
					);
					console.log(`  Renaming rows in table ${getTableName(bosskillPlayerTable)}`);

					const bosskillsPlayers = await db
						.select({
							id: bosskillPlayerTable.id
						})
						.from(bosskillPlayerTable)
						.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
						.where(
							and(
								eq(bosskillTable.realmId, realm.id),
								eq(bosskillPlayerTable.guid, guid),
								not(eq(bosskillPlayerTable.name, nameNext))
							)
						);

					const bosskillsPlayersIds = bosskillsPlayers.map((v) => v.id);
					const bosskillsPlayersCount = bosskillsPlayersIds.length;
					console.log(`  Found ${bosskillsPlayersCount} rows`);
					if (bosskillsPlayersCount > 0) {
						await db
							.transaction(async () => {
								await db
									.update(bosskillPlayerTable)
									.set({ name: nameNext })
									.where(inArray(bosskillPlayerTable.id, bosskillsPlayersIds));
							})
							.catch(console.error);
					}

					console.log(`  Renaming rows in table ${getTableName(playerTable)}`);
					await db
						.transaction(async () => {
							await db
								.update(playerTable)
								.set({ name: nameNext })
								.where(
									and(
										eq(playerTable.remoteId, guid),
										eq(playerTable.realmId, realm.id),
										not(eq(playerTable.name, nameNext))
									)
								);
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

	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
