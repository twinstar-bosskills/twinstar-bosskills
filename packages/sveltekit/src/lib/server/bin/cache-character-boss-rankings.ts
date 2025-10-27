import { METRIC_TYPE, characterDps, characterHps } from '@twinstar-bosskills/core/dist/metrics';
import { realmIsPublic, realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
import {
	difficultiesByExpansion,
	difficultyToString,
	isRaidDifficulty,
	talentSpecsByExpansion
} from '@twinstar-bosskills/core/dist/wow';
import { program } from 'commander';
import { getBossTopSpecs } from '@twinstar-bosskills/db/dist/boss';

import { inArray } from 'drizzle-orm';
import { createConnection } from '../db/index';
import { realmTable } from '../db/schema/realm.schema';
import { findBosses, setBossTopSpecs } from '../model/boss.model';
import { setCharacterBossRankings, type CharacterBossRankingStats } from '../model/character.model';
import { listOfIntegers, listOfStrings } from './parse-args';

program.option('--boss-ids <items>', 'comma separated list of boss ids', listOfIntegers);
program.option('--realms <items>', 'Realms', listOfStrings);
program.parse();

const options: { bossIds?: number[]; realms?: string[] } = program.opts();

console.log('Start');
console.log({ options });
try {
	const db = await createConnection();
	const realmsQb = db.select().from(realmTable);
	if (Array.isArray(options.realms) && options.realms.length > 0) {
		realmsQb.where(inArray(realmTable.name, options.realms));
	}
	const realms = await realmsQb.execute();
	for (const realm of realms) {
		if (realmIsPublic(realm.name) === false) {
			continue;
		}
		const realmStart = performance.now();
		const expansion = realmToExpansion(realm.name);
		const diffs = Object.values<number>(difficultiesByExpansion(expansion) ?? {}).filter((diff) =>
			isRaidDifficulty(expansion, diff)
		);
		const specs = talentSpecsByExpansion(expansion) ?? {};

		console.log(`Realm ${realm.name} started`);
		for (const metric of Object.values(METRIC_TYPE)) {
			const statsByGuid: { [guid in number]: CharacterBossRankingStats } = {};
			const statsByGuidBySpec: { [spec in number]: typeof statsByGuid } = {};
			for (const boss of await findBosses({ realm: realm.name })) {
				if (Array.isArray(options.bossIds) && options.bossIds.includes(boss.remote_id) === false) {
					continue;
				}
				const bossStart = performance.now();
				console.log(`Boss ${boss.name} - ${metric} started`);
				const bossRemoteId = boss.remote_id;
				for (const difficulty of diffs) {
					const diffStr = difficultyToString(expansion, difficulty);
					const diffStart = performance.now();
					console.log(`  difficulty: ${diffStr} started`);
					const topSpecs = await getBossTopSpecs({
						realm: realm.name,
						remoteId: boss.remote_id,
						difficulty,
						metric,
						limit: 0
					});

					try {
						await setBossTopSpecs(
							{
								realm: realm.name,
								remoteId: boss.remote_id,
								difficulty,
								metric
							},
							topSpecs
						);
					} catch (e) {
						console.error(e);
					}

					console.log(`    spec: overall`);
					const itemsOverall = [];
					for (const items of Object.values(topSpecs)) {
						for (const item of items) {
							const bk = item.boss_kills;
							if (bk) {
								itemsOverall.push({
									bossRemoteId,
									guid: item.guid,
									mode: bk.mode,
									bosskillRemoteId: bk.id,
									ilvl: item.avg_item_lvl,
									rank: 0,
									spec: item.talent_spec,
									value: metric == METRIC_TYPE.DPS ? characterDps(item) : characterHps(item)
								});
							}
						}
					}
					itemsOverall.sort((a, b) => {
						return a.value >= b.value ? -1 : 1;
					});

					let overallRank = 1;
					const len = itemsOverall.length;
					for (let i = 0; i < len; i++) {
						const item = itemsOverall[i]!;
						const guid = item.guid;
						const mode = item.mode;
						statsByGuid[guid] ??= {};
						statsByGuid[guid]![bossRemoteId] ??= {};
						statsByGuid[guid]![bossRemoteId]![mode] = { ...item, rank: overallRank };
						overallRank++;
					}

					console.log(`    spec: rest`);
					for (const talentSpec of Object.values<number>(specs)) {
						// const specStart = performance.now();
						// const specName = talentSpecToString(expansion, talentSpec);
						// console.log(`    spec: ${specName} started`);
						const topSpecs = await getBossTopSpecs({
							realm: realm.name,
							remoteId: boss.remote_id,
							// @ts-ignore
							difficulty,
							metric,
							talentSpec
						});

						try {
							await setBossTopSpecs(
								{
									realm: realm.name,
									remoteId: boss.remote_id,
									difficulty,
									metric,
									talentSpec
								},
								topSpecs
							);
						} catch (e) {
							console.error(e);
						}

						let specRank = 1;
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
										rank: specRank,
										spec,
										value: metric == METRIC_TYPE.DPS ? characterDps(item) : characterHps(item)
									};

									statsByGuidBySpec[spec] ??= {};
									statsByGuidBySpec[spec]![guid] ??= {};
									statsByGuidBySpec[spec]![guid]![bossRemoteId] ??= {};
									statsByGuidBySpec[spec]![guid]![bossRemoteId]![mode] = payload;

									specRank++;
								}
							}
						}
						// const specEnd = performance.now() - specStart;
						// console.log(`    spec: ${specName} done, took ${specEnd.toLocaleString()}ms`);
					}

					const diffEnd = performance.now() - diffStart;
					console.log(`  difficulty: ${diffStr} done, took ${diffEnd.toLocaleString()}ms`);
				}
				const bossEnd = performance.now() - bossStart;
				console.log(`Boss ${boss.name} - ${metric} done, took ${bossEnd.toLocaleString()}ms`);
			}

			console.log(`Realm ${realm.name} caching`);
			for (const [guidStr, stats] of Object.entries(statsByGuid)) {
				const guid = Number(guidStr);
				await setCharacterBossRankings(
					{
						realm: realm.name,
						metric,
						guid,
						spec: undefined
					},
					stats
				);
			}

			for (const [specStr, statsByGuid] of Object.entries(statsByGuidBySpec)) {
				const spec = Number(specStr);
				for (const [guidStr, stats] of Object.entries(statsByGuid)) {
					const guid = Number(guidStr);

					await setCharacterBossRankings(
						{
							realm: realm.name,
							metric,
							guid,
							spec
						},
						stats
					);
				}
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
