import { FilterOperator } from '@twinstar-bosskills/api/dist/filter';
import type {
	Boss,
	BossKill,
	BossKillDetail,
	BosskillDeath,
	BosskillLoot,
	BosskillTimeline,
	Raid
} from '@twinstar-bosskills/api/dist/schema';
import { REALM_HELIOS, realmIsKnown, realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
import { db } from '@twinstar-bosskills/db';
import { findRaidsByRealm } from '@twinstar-bosskills/db/dist/raid';
import {
	getBossKillDetail,
	getLatestBossKills,
	listAllLatestBossKills,
	type LatestBossKillQueryArgs
} from '../api';
import { getRaids } from '../api/raid';
import { safeGC } from '../gc';
import { findBosses } from '../model/boss.model';

type Args = {
	onLog: (line: string) => void;
	realm?: string;
	startsAt?: Date;
	endsAt?: Date;
	bosskillIds?: number[];
	bossIds?: number[];
	pageSize?: number;
	page?: number;
};
export const synchronize = async ({
	onLog,
	realm = REALM_HELIOS,
	startsAt,
	endsAt,
	bosskillIds,
	bossIds,
	pageSize,
	page
}: Args) => {
	// TODO: better log

	if (realmIsKnown(realm) === false) {
		onLog(`Unknown realm ${realm}`);
		return;
	}
	onLog('start');
	const expansion = realmToExpansion(realm);
	const realmEnt = await getOrCreateRealm({ name: realm, expansion });

	const playerIdByGUID: Record<number, number> = {};
	const remoteRaids = await getRaids({ realm, cache: false });
	let isLimited = false;

	// fast create raids and bosses
	for (const raid of remoteRaids) {
		onLog(`Assert raid: ${raid.map}`);
		const raidEnt = await getOrCreateRaid({ raid, realmId: realmEnt.id });
		for (const boss of raid.bosses) {
			onLog(`  Assert boss: ${boss.name}`);
			await getOrCreateBoss({ boss, raidId: raidEnt.id });
		}
	}

	const bosses = await findBosses({ realm });
	const bossesByRaidId = bosses.reduce((acc, boss) => {
		acc[boss.raid_id] ??= [];
		acc[boss.raid_id]!.push(boss);
		return acc;
	}, {} as Record<number, typeof bosses>);
	const raids = await findRaidsByRealm({ realm });
	for (const raid of raids) {
		safeGC();
		onLog(`Processing raid: ${raid.name}`);
		for (const boss of bossesByRaidId[raid.id] ?? []) {
			safeGC();
			onLog(`Processing boss: ${boss.name}`);

			const query: LatestBossKillQueryArgs = {
				cache: false,
				realm,
				filters: [{ column: 'entry', operator: FilterOperator.EQUALS, value: boss.remote_id }]
			};

			if (startsAt) {
				query.filters?.push({ column: 'time', operator: FilterOperator.GTE, value: startsAt });
			}
			if (endsAt) {
				query.filters?.push({ column: 'time', operator: FilterOperator.LTE, value: endsAt });
			}
			if (Array.isArray(bosskillIds) && bosskillIds.length > 0) {
				query.filters?.push({ column: 'id', operator: FilterOperator.IN, value: bosskillIds });
			}
			if (Array.isArray(bossIds) && bossIds.length > 0) {
				if (bossIds.includes(boss.remote_id) === false) {
					onLog(`Skipping boss ${boss.name}-${boss.remote_id}`);
					continue;
				}
				query.filters?.push({ column: 'entry', operator: FilterOperator.IN, value: bossIds });
			}
			if (typeof page !== 'undefined') {
				query.page = Math.abs(page);
				isLimited = true;
			}
			if (typeof pageSize !== 'undefined') {
				query.pageSize = Math.abs(pageSize);
				isLimited = true;
			}
			let bosskills = [];
			if (isLimited) {
				bosskills = (await getLatestBossKills(query)).data;
			} else {
				bosskills = await listAllLatestBossKills(query);
			}

			const bkLength = bosskills.length;
			let timeSum = 0;

			const promises = bosskills.map((bk, i) => {
				const xOfY = `(${i}/${bkLength})`;
				const work = async () => {
					if (i % 100 === 0) {
						safeGC();
					}
					const start = performance.now();

					onLog(`${xOfY} Processing ${boss.name} bosskill: ${bk.id}`);
					const bkEnt = await getOrCreateBosskill({
						bossId: boss.id,
						realmId: realmEnt.id,
						raidId: raid.id,
						bk
					});
					const bosskillId = bkEnt.id;

					const detail = await getBossKillDetail({ realm: realmEnt.name, id: bk.id });
					if (detail) {
						onLog(`${xOfY} Processing ${boss.name} bosskill detail ${detail.id}`);

						if (Array.isArray(detail.boss_kills_players)) {
							onLog(`${xOfY} Processing ${boss.name} bosskill detail ${detail.id} - players`);
							await deleteBossKillPlayers({ bosskillId });
							const players = [];
							for (const player of detail.boss_kills_players) {
								const playerEnt = await getOrCreatePlayer({
									guid: player.guid,
									name: player.name,
									realmId: realmEnt.id,
									onLog
								});
								playerIdByGUID[player.guid] = playerEnt.id;
								players.push({ ...player, playerId: playerEnt.id });
							}
							await createBossKillPlayers({
								bosskillId,
								players,
								realmId: realmEnt.id,
								onLog
							});
						}

						if (Array.isArray(detail.boss_kills_loot)) {
							onLog(`${xOfY} Processing ${boss.name} bosskill detail ${detail.id} - loot`);
							await deleteBossKillLoot({ bosskillId });
							await createBossKillLoot({
								bosskillId,
								items: detail.boss_kills_loot
							});
						}

						if (Array.isArray(detail.boss_kills_deaths)) {
							onLog(`${xOfY} Processing ${boss.name} bosskill detail ${detail.id} - deaths`);
							await deleteBossKillDeaths({ bosskillId });

							const deaths: BossKillDeathsArgs['deaths'] = [];
							for (const death of detail.boss_kills_deaths) {
								const playerId = playerIdByGUID[death.guid] ?? null;
								if (playerId === null) {
									onLog(`${xOfY} Player not found by guid: ${death.guid}`);
									// TODO: error?
									continue;
								}
								deaths.push({ ...death, playerId });
							}
							await createBossKillDeaths({ bosskillId, deaths });
						}

						if (Array.isArray(detail.boss_kills_maps)) {
							onLog(`${xOfY} Processing ${boss.name} bosskill detail ${detail.id} - timeline`);
							await deleteBossKillTimeline({ bosskillId });
							await createBossKillTimeline({
								bosskillId,
								timeline: detail.boss_kills_maps
							});
						}
					} else {
						onLog(`${xOfY} No bosskill detail found by ${bk.id}`);
					}

					const took = performance.now() - start;
					onLog(`${xOfY} Processing ${boss.name} bosskill: ${bk.id} took ${took}`);
					timeSum += took;
				};
				return work()
					.then(() => {
						onLog(
							`${xOfY} Avg bosskill processing time: ${
								i > 0 ? Math.round((100 * timeSum) / i) / 100 : 0
							}`
						);
					})
					.catch((e) => {
						const msg = `${xOfY} Processing ${boss.name} bosskill ${
							bk.id
						} has failed. Error: ${String(e)}`;
						onLog(msg);
						console.error(msg);
						console.error(e);
					});
			});
			await Promise.all(promises);
		}
	}
	onLog('done');
};
const getOrCreateRealm = async ({ name, expansion }: { name: string; expansion: number }) => {
	const result = await db
		.selectFrom('realm')
		.selectAll()
		.where('realm.name', '=', name)
		.executeTakeFirst();
	let ent = result ?? null;
	if (ent === null) {
		const result = await db.transaction().execute(async (tx) => {
			return tx
				.insertInto('realm')
				.ignore()
				.values([{ name, expansion }])
				.executeTakeFirstOrThrow();
		});
		const id = Number(result.insertId);
		const refetch = await db
			.selectFrom('realm')
			.selectAll()
			.where('realm.id', '=', id)
			.executeTakeFirst();
		ent = refetch ?? null;
	}
	if (ent === null) {
		throw new Error(`Realm entity not found nor created`);
	}
	return ent;
};

const getOrCreateRaid = async ({ raid, realmId }: { raid: Raid; realmId: number }) => {
	const result = await db
		.selectFrom('raid')
		.selectAll()
		.where('raid.name', '=', raid.map)
		.executeTakeFirst();
	let ent = result ?? null;
	if (ent === null) {
		const result = await db.transaction().execute(async (tx) => {
			return await tx
				.insertInto('raid')
				.ignore()
				.values([{ name: raid.map }])
				.executeTakeFirstOrThrow();
		});
		const id = Number(result.insertId);
		const refetch = await db
			.selectFrom('raid')
			.selectAll()
			.where('raid.id', '=', id)
			.executeTakeFirst();
		ent = refetch ?? null;
	}
	if (ent === null) {
		throw new Error(`Raid entity not found nor created`);
	}
	await db.transaction().execute(async (tx) => {
		return await tx
			.insertInto('realm_x_raid')
			.ignore()
			.values([{ realm_id: realmId, raid_id: ent!.id }])
			.execute();
	});
	return ent;
};

const getOrCreateBoss = async ({ boss, raidId }: { boss: Boss; raidId: number }) => {
	const result = await db
		.selectFrom('boss')
		.selectAll()
		.where(({ eb }) => {
			return eb.and([eb('boss.remote_id', '=', boss.entry), eb('boss.raid_id', '=', raidId)]);
		})
		.executeTakeFirst();
	let ent = result ?? null;
	if (ent === null) {
		const result = await db.transaction().execute(async (tx) => {
			return await tx
				.insertInto('boss')
				.ignore()
				.values({ remote_id: boss.entry, name: boss.name, raid_id: raidId })
				.executeTakeFirstOrThrow();
		});
		const id = Number(result.insertId);
		const refetch = await db
			.selectFrom('boss')
			.selectAll()
			.where('boss.id', '=', id)
			.executeTakeFirst();
		ent = refetch ?? null;
	} else {
		if (ent.name !== boss.name) {
			const entId = ent.id;
			await db.transaction().execute(async (tx) => {
				return await tx
					.updateTable('boss')
					.set({ name: boss.name })
					.where('boss.id', '=', entId)
					.execute();
			});
		}
	}

	if (ent === null) {
		throw new Error(`Boss entity not found nor created`);
	}
	return ent;
};

const getOrCreatePlayer = async ({
	guid,
	name,
	realmId,
	onLog
}: {
	guid: number;
	name: string;
	realmId: number;
	onLog: Args['onLog'];
}) => {
	const result = await db
		.selectFrom('player')
		.selectAll()
		.where(({ eb }) => {
			return eb.and([eb('player.remote_id', '=', guid), eb('player.realm_id', '=', realmId)]);
		})
		.executeTakeFirst();
	let ent = result ?? null;
	if (ent === null) {
		const result = await db.transaction().execute(async (tx) => {
			return await tx
				.insertInto('player')
				.ignore()
				.values({ remote_id: guid, name, realm_id: realmId })
				.executeTakeFirstOrThrow();
		});
		const id = Number(result.insertId);
		const refetch = await db
			.selectFrom('player')
			.selectAll()
			.where('player.id', '=', id)
			.executeTakeFirst();
		ent = refetch ?? null;
	} else {
		// player might be renamed, update name according to the last known one
		if (ent.name !== name) {
			onLog(`Renaming player (realm: ${realmId}) from ${ent.name} to ${name}`);
			const id = ent.id;
			await db.transaction().execute(async (tx) => {
				return await tx
					.updateTable('player')
					.set({ name: name })
					.where('player.id', '=', id)
					.execute();
			});
			const refetch = await db
				.selectFrom('player')
				.selectAll()
				.where('player.id', '=', id)
				.executeTakeFirst();
			ent = refetch ?? null;
		}
	}

	if (ent === null) {
		throw new Error(`Player entity not found nor created`);
	}
	return ent;
};

type CreateBosskillArgs = {
	bossId: number;
	realmId: number;
	raidId: number;
	bk: BossKill;
};
const getOrCreateBosskill = async ({ bossId, realmId, raidId, bk }: CreateBosskillArgs) => {
	const result = await db
		.selectFrom('boss_kill')
		.selectAll()
		.where('boss_kill.remote_id', '=', bk.id)
		.executeTakeFirst();
	let ent = result ?? null;
	if (ent === null) {
		const result = await db.transaction().execute(async (tx) => {
			return await tx
				.insertInto('boss_kill')
				.values({
					remote_id: bk.id,
					boss_id: bossId,
					raid_id: raidId,
					realm_id: realmId,
					mode: bk.mode,
					guild: bk.guild,
					time: bk.time,
					length: bk.length,
					wipes: bk.wipes,
					deaths: bk.deaths,
					ress_used: bk.ressUsed
				})
				.executeTakeFirstOrThrow();
		});
		const id = Number(result.insertId);
		const refetch = await db
			.selectFrom('boss_kill')
			.selectAll()
			.where('boss_kill.id', '=', id)
			.executeTakeFirst();
		ent = refetch ?? null;
	}
	if (ent === null) {
		throw new Error(`Bosskill ${bk.id} entity not found nor created`);
	}

	return ent;
};
type DeleteByBosskillId = {
	bosskillId: number;
};
const deleteBossKillPlayers = async ({ bosskillId }: DeleteByBosskillId) => {
	await db.transaction().execute(async (tx) => {
		return await tx
			.deleteFrom('boss_kill_player')
			.where('boss_kill_player.boss_kill_id', '=', bosskillId)
			.execute();
	});
};
type BossKillPlayerArgs = {
	bosskillId: number;
	players: (BossKillDetail['boss_kills_players'][0] & { playerId: number })[];
	onLog: Args['onLog'];
	realmId: number;
};
const createBossKillPlayers = async ({
	bosskillId,
	players,
	realmId,
	onLog
}: BossKillPlayerArgs) => {
	if (players.length === 0) {
		return;
	}

	await db.transaction().execute(async (tx) => {
		return await tx
			.insertInto('boss_kill_player')
			.ignore()
			.values(
				players.map((player) => ({
					boss_kill_id: bosskillId,
					player_id: player.playerId,

					talent_spec: player.talent_spec,
					avg_item_lvl: player.avg_item_lvl,
					dmg_done: player.dmgDone,
					healing_done: player.healingDone,
					overhealing_done: player.overhealingDone,
					absorb_done: player.absorbDone,
					dmg_taken: player.dmgTaken,
					dmg_absorbed: player.dmgAbsorbed,
					healing_taken: player.healingTaken,
					dispells: player.dispels,
					interrupts: player.interrupts,

					name: player.name,
					guid: player.guid,
					race: player.race,
					class: player.class,
					gender: player.gender,
					level: player.level
				}))
			)
			.execute();
	});

	// also update bosskills where name differs (because thery were synchronized before the player rename)
	// WARNING: caused performance problems, skip
	/*
	for (const player of players) {
		const nameNext = player.name;
		const bosskillsPlayers = await db
			.select({
				id: bosskillPlayerTable.id
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.where(
				and(
					eq(bosskillTable.realmId, realmId),
					eq(bosskillPlayerTable.guid, player.guid),
					not(eq(bosskillPlayerTable.name, nameNext))
				)
			);

		const bosskillsPlayersIds = bosskillsPlayers.map((v) => v.id);
		const bosskillsPlayersCount = bosskillsPlayersIds.length;
		if (bosskillsPlayersCount > 0) {
			onLog(`Found ${bosskillsPlayersCount} rows to be renamed to ${nameNext}`);
			await db.transaction(async () => {
				await db
					.update(bosskillPlayerTable)
					.set({ name: nameNext })
					.where(inArray(bosskillPlayerTable.id, bosskillsPlayersIds));
			});
		}
	
	}
	*/
};

const deleteBossKillLoot = async ({ bosskillId }: DeleteByBosskillId) => {
	await db.transaction().execute(async (tx) => {
		return await tx
			.deleteFrom('boss_kill_loot')
			.where('boss_kill_loot.boss_kill_id', '=', bosskillId)
			.execute();
	});
};
type BossKillLootArgs = {
	bosskillId: number;
	items: BosskillLoot[];
};
const createBossKillLoot = async ({ bosskillId, items }: BossKillLootArgs) => {
	if (items.length === 0) {
		return;
	}

	await db.transaction().execute(async (tx) => {
		return await tx
			.insertInto('boss_kill_loot')
			.ignore()
			.values(
				items.map((loot) => ({
					boss_kill_id: bosskillId,
					item_id: Number(loot.itemId),
					count: loot.count
				}))
			)
			.execute();
	});
};

const deleteBossKillDeaths = async ({ bosskillId }: DeleteByBosskillId) => {
	await db.transaction().execute(async (tx) => {
		return await tx
			.deleteFrom('boss_kill_death')
			.where('boss_kill_death.boss_kill_id', '=', bosskillId)
			.execute();
	});
};
type BossKillDeathsArgs = {
	bosskillId: number;
	deaths: (BosskillDeath & { playerId: number })[];
};
const createBossKillDeaths = async ({ bosskillId, deaths }: BossKillDeathsArgs) => {
	if (deaths.length === 0) {
		return;
	}
	await db.transaction().execute(async (tx) => {
		return await tx
			.insertInto('boss_kill_death')
			.ignore()
			.values(
				deaths.map((death) => ({
					boss_kill_id: bosskillId,
					remote_id: death.id,
					player_id: death.playerId,
					time: death.time,
					is_ress: death.time < 0 ? 1 : 0
				}))
			)
			.execute();
	});
};

const deleteBossKillTimeline = async ({ bosskillId }: DeleteByBosskillId) => {
	await db.transaction().execute(async (tx) => {
		return await tx
			.deleteFrom('boss_kill_timeline')
			.where('boss_kill_timeline.boss_kill_id', '=', bosskillId)
			.execute();
	});
};
type BossKillTimelineArgs = {
	bosskillId: number;
	timeline: BosskillTimeline[];
};
const createBossKillTimeline = async ({ bosskillId, timeline }: BossKillTimelineArgs) => {
	if (timeline.length === 0) {
		return;
	}
	await db.transaction().execute(async (tx) => {
		return await tx
			.insertInto('boss_kill_timeline')
			.ignore()
			.values(
				timeline.map((item) => ({
					boss_kill_id: bosskillId,

					encounterDamage: Number(item.encounterDamage),
					encounterHeal: Number(item.encounterHeal),
					raidDamage: Number(item.raidDamage),
					raidHeal: Number(item.raidHeal),
					time: item.time
				}))
			)
			.execute();
	});
};
