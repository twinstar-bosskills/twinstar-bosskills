import { raidLock } from '@twinstar-bosskills/core/src/date';

import { METRIC_TYPE } from '@twinstar-bosskills/core/dist/metrics';
import { realmIsPublic, realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
import {
	difficultiesByExpansion,
	difficultyToString,
	isRaidDifficulty,
	talentSpecsByExpansion
} from '@twinstar-bosskills/core/dist/wow';
import { getBosskillByRemoteId } from '@twinstar-bosskills/db/dist/boss-kill';
import { getPlayerByGuid } from '@twinstar-bosskills/db/dist/player';
import type { BossKill, Player } from '@twinstar-bosskills/db/dist/types';
import { program } from 'commander';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import type { MySqlInsertValue } from 'drizzle-orm/mysql-core';
import { getBossTopSpecs } from '../db/boss';
import { createConnection } from '../db/index';
import { rankingTable } from '../db/schema/ranking.schema';
import { realmTable } from '../db/schema/realm.schema';
import { findBosses } from '../model/boss.model';
import { integerGte, listOfStrings } from './parse-args';

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
		if (realmIsPublic(realm.name) === false) {
			continue;
		}
		const realmStart = performance.now();
		const expansion = realmToExpansion(realm.name);
		const diffs = Object.values<number>(difficultiesByExpansion(expansion) ?? {}).filter((diff) =>
			isRaidDifficulty(expansion, diff)
		);
		const specs = talentSpecsByExpansion(expansion) ?? {};

		const playerCache = new Map<string, Player>();
		const getPlayer = async ({ guid }: { guid: number }): Promise<Player | null> => {
			const k = `${realm.name}-${guid}`;

			const player = playerCache.get(k) ?? (await getPlayerByGuid({ guid, realm: realm.name }));
			if (player === null) {
				return null;
			}
			playerCache.set(k, player);
			return player;
		};

		const bosskillCache = new Map<string, BossKill>();
		const getBosskill = async ({ remoteId }: { remoteId: string }): Promise<BossKill | null> => {
			const k = `${realm.name}-${remoteId}`;
			const bk =
				bosskillCache.get(k) ?? (await getBosskillByRemoteId({ remoteId, realm: realm.name }));
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
							limit: 10
						});

						await db.transaction((tx) => {
							return tx
								.delete(rankingTable)
								.where(
									and(
										eq(rankingTable.realmId, realm.id),
										eq(rankingTable.raidId, boss.raid_id),
										eq(rankingTable.bossId, boss.id),
										eq(rankingTable.spec, talentSpec),
										eq(rankingTable.mode, difficulty),
										eq(rankingTable.metric, metric),
										gte(rankingTable.time, startsAt),
										lte(rankingTable.time, endsAt)
									)
								);
						});

						const values: MySqlInsertValue<typeof rankingTable>[] = [];
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
										console.error(`Player not found by realm: ${realm.name} and guid: ${guid}`);
										continue;
									}

									const bosskillId = (await getBosskill({ remoteId: bk.id }))?.id ?? null;
									if (bosskillId === null) {
										console.error(
											`Bosskill not found by realm: ${realm.name} and remoteId: ${bk.id}`
										);
										continue;
									}

									values.push({
										realmId: realm.id,
										raidId: boss.raid_id,
										bossId: boss.id,
										bosskillId: bosskillId,
										playerId: player.id,
										rank,
										time: new Date(bk.time),
										spec,
										mode,
										metric
									});

									rank++;
								}
							}
						}

						if (values.length > 0) {
							await db.transaction((tx) => {
								return tx.insert(rankingTable).values(values);
							});
						}
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
