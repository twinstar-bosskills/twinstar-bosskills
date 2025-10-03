import { METRIC_TYPE, characterDps, characterHps } from '$lib/metrics';
import {
	difficultiesByExpansion,
	difficultyToString,
	isRaidDifficulty,
	talentSpecsByExpansion,
	talentSpecToString
} from '$lib/model';
import { realmToExpansion } from '$lib/realm';
import { program } from 'commander';
import { getBossTopSpecs } from '../db/boss';

import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { createConnection } from '../db/index';
import { realmTable } from '../db/schema/realm.schema';
import { findBosses, setBossTopSpecs } from '../model/boss.model';
import { setCharacterBossRankings, type CharacterBossRankingStats } from '../model/character.model';
import { integerGte, listOfIntegers, listOfStrings } from './parse-args';
import { raidLock } from '$lib/date';
import { rankingTable } from '../db/schema/mysql/ranking.schema';
import { getPlayerByGuid } from '../db/player';
import { getBosskillByRemoteId } from '../db/boss-kill';

const gteZero = integerGte(0);
program.option(
	'--offset <number>',
	'Raid lock offset. Pass 0 or do not pass at all for current raid lock',
	gteZero
);
program.option('--realms <items>', 'Realms', listOfStrings);
program.parse();

const options: { offset?: number; realms?: string[] } = program.opts();

console.log('Start');
console.log({ options });

const now = new Date();
const { start: startsAt, end: endsAt } = raidLock(now, options.offset ?? 0);

try {
	const db = await createConnection();
	const realmsQb = db.select().from(realmTable);
	if (Array.isArray(options.realms) && options.realms.length > 0) {
		realmsQb.where(inArray(realmTable.name, options.realms));
	}
	const realms = await realmsQb.execute();
	for (const realm of realms) {
		const realmStart = performance.now();
		const expansion = realmToExpansion(realm.name);
		const diffs = Object.values<number>(difficultiesByExpansion(expansion) ?? {}).filter((diff) =>
			isRaidDifficulty(expansion, diff)
		);
		const specs = talentSpecsByExpansion(expansion) ?? {};

		console.log(`Realm ${realm.name} started`);
		for (const metric of Object.values(METRIC_TYPE)) {
			for (const boss of await findBosses({ realm: realm.name })) {
				const bossStart = performance.now();
				console.log(`Boss ${boss.name} - ${metric} started`);
				const bossRemoteId = boss.remoteId;
				for (const difficulty of diffs) {
					const diffStr = difficultyToString(expansion, difficulty);
					const diffStart = performance.now();
					console.log(`  difficulty: ${diffStr} started`);
					for (const talentSpec of Object.values<number>(specs)) {
						const specStart = performance.now();
						const specName = talentSpecToString(expansion, talentSpec);
						console.log(`    spec: ${specName} started`);
						const topSpecs = await getBossTopSpecs({
							realm: realm.name,
							remoteId: boss.remoteId,
							// @ts-ignore
							difficulty,
							metric,
							talentSpec,
							limit: 10,
							startsAt,
							endsAt
						});

						await db.transaction((tx) => {
							return tx
								.delete(rankingTable)
								.where(
									and(
										eq(rankingTable.realmId, realm.id),
										eq(rankingTable.raidId, boss.raidId),
										eq(rankingTable.bossId, boss.id),
										eq(rankingTable.spec, talentSpec),
										eq(rankingTable.mode, difficulty),
										gte(rankingTable.time, startsAt),
										lte(rankingTable.time, endsAt)
									)
								);
						});

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

									const payload = {
										bossRemoteId,
										guid,
										mode,
										bosskillRemoteId: bk.id,
										ilvl: item.avg_item_lvl,
										rank: rank,
										spec,
										value: metric == METRIC_TYPE.DPS ? characterDps(item) : characterHps(item)
									};

									const player = await getPlayerByGuid({ guid, realm: realm.name });
									if (player === null) {
										console.error(`Player not found by realm: ${realm.name} and guid: ${guid}`);
										continue;
									}
									const bosskillId = (
										await getBosskillByRemoteId({ remoteId: bk.id, realm: realm.name })
									)?.id;

									if (bosskillId === null) {
										console.error(
											`Bosskill not found by realm: ${realm.name} and remoteId: ${bk.id}`
										);
										continue;
									}

									const result = await db.transaction((tx) => {
										return tx.insert(rankingTable).values({
											realmId: realm.id,
											raidId: boss.raidId,
											bossId: boss.id,
											bosskillId,
											playerId: player.id,
											rank,
											time: new Date(bk.time),
											spec,
											mode,
											ilvl: item.avg_item_lvl,
											dmgDone: item.dmgDone,
											healingDone: item.healingDone,
											length: bk.length
										});
									});

									rank++;
								}
							}
						}

						const specEnd = performance.now() - specStart;
						console.log(`    spec: ${specName} done, took ${specEnd.toLocaleString()}ms`);
					}

					const diffEnd = performance.now() - diffStart;
					console.log(`  difficulty: ${diffStr} done, took ${diffEnd.toLocaleString()}ms`);
				}
				const bossEnd = performance.now() - bossStart;
				console.log(`Boss ${boss.name} - ${metric} done, took ${bossEnd.toLocaleString()}ms`);
			}
		}
		const realmEnd = performance.now() - realmStart;
		console.log(`Realm ${realm.name} done, took: ${realmEnd.toLocaleString()}ms`);
	}

	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
