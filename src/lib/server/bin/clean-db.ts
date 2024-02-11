import { eq, inArray, lte, sql } from 'drizzle-orm';
import { createConnection } from '../db/index';
import { bosskillDeathTable } from '../db/schema/boss-kill-death.schema';
import { bosskillLootTable } from '../db/schema/boss-kill-loot.schema';
import { bosskillPlayerTable } from '../db/schema/boss-kill-player.schema';
import { bosskillTimelineTable } from '../db/schema/boss-kill-timeline.schema';
import { bosskillTable } from '../db/schema/boss-kill.schema';

try {
	const db = await createConnection();
	await db.transaction(async () => {
		console.log(`Deleting bosskill players with level <= 0`);
		const playersQb = db.delete(bosskillPlayerTable).where(lte(bosskillPlayerTable.level, 0));

		await playersQb.execute();
	});

	await db.transaction(async () => {
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
	});

	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
