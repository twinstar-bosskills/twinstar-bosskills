import { METRIC_TYPE } from '$lib/metrics';
import { getCharactersBossRankings, type CharacterBossRankingStats } from '../db/character';
import { createConnection } from '../db/index';
import { realmTable } from '../db/schema/realm.schema';
import { setCharacterBossRankings } from '../model/character.model';

try {
	console.log('Start');
	const db = await createConnection();
	const realms = await db.select().from(realmTable);
	for (const realm of realms) {
		for (const metric of Object.values(METRIC_TYPE)) {
			let itemsCount = 0;
			const statsByGuid: Record<number, CharacterBossRankingStats> = {};
			const byBoss = await getCharactersBossRankings({ realm: realm.name, metric });
			for (const [bossRemoteIdStr, byMode] of Object.entries(byBoss)) {
				const bossRemoteId = Number(bossRemoteIdStr);
				for (const [modeStr, byGuid] of Object.entries(byMode)) {
					const mode = Number(modeStr);
					for (const [guidStr, item] of Object.entries(byGuid)) {
						itemsCount++;

						const guid = Number(guidStr);
						statsByGuid[guid] ??= {};
						statsByGuid[guid]![bossRemoteId] ??= {};
						statsByGuid[guid]![bossRemoteId]![mode] = item;
					}
				}
			}

			console.log(`Realm: ${realm.name} - ${metric} - found ${itemsCount} items`);
			for (const [guidStr, stats] of Object.entries(statsByGuid)) {
				const guid = Number(guidStr);
				// console.log({
				// 	realm: realm.name,
				// 	metric,
				// 	guid
				// });
				await setCharacterBossRankings(
					{
						realm: realm.name,
						metric,
						guid
					},
					stats
				);
			}
		}
	}

	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
