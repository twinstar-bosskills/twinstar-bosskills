import { getRaids } from '../api/raid';
import { db } from '../db/index';
import { bossTable } from '../db/schema/boss.schema';
import { raidTable } from '../db/schema/raid.schema';

const main = async () => {
	const raids = await getRaids();
	for (const raid of raids) {
		await db
			.insert(raidTable)
			.values([{ name: raid.map }])
			.execute();
		for (const boss of raid.bosses) {
			await db.insert(bossTable).values({ entry: boss.entry, name: boss.name }).execute();
		}
	}
};
main();
