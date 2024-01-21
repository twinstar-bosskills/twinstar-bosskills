import { realmIsKnown, realmToExpansion, REALM_HELIOS } from '$lib/realm';
import type {
	Boss,
	BossKill,
	BosskillCharacter,
	BosskillDeath,
	BosskillLoot,
	BosskillTimeline,
	Raid
} from '$lib/server/api/schema';
import { and, eq } from 'drizzle-orm';
import {
	getBossKillDetail,
	getLatestBossKills,
	listAllLatestBossKills,
	type LatestBossKillQueryArgs
} from '../api';
import { FilterOperator } from '../api/filter';
import { getRaids } from '../api/raid';
import { safeGC } from '../gc';
import { createConnection } from './index';
import { bosskillDeathTable } from './schema/boss-kill-death.schema';
import { bosskillLootTable } from './schema/boss-kill-loot.schema';
import { bosskillPlayerTable } from './schema/boss-kill-player.schema';
import { bosskillTimelineTable } from './schema/boss-kill-timeline.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { playerTable } from './schema/player.schema';
import { raidTable } from './schema/raid.schema';
import { realmTable } from './schema/realm.schema';

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
		onLog(`unknown realm ${realm}`);
		return;
	}
	onLog('start');
	const expansion = realmToExpansion(realm);
	const realmEnt = await getOrCreateRealm({ name: realm, expansion });

	const playerIdByGUID: Record<number, number> = {};
	const raids = await getRaids({ realm });
	let isLimited = false;
	for (const raid of raids) {
		safeGC();
		onLog(`Processing raid: ${raid.map}`);
		const raidEnt = await getOrCreateRaid(raid);

		for (const boss of raid.bosses) {
			safeGC();
			onLog(`Processing boss: ${boss.name}`);
			const bossEnt = await getOrCreateBoss(boss);

			const query: LatestBossKillQueryArgs = {
				cache: false,
				realm,
				filters: [{ column: 'entry', operator: FilterOperator.EQUALS, value: boss.entry }]
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
				if (bossIds.includes(boss.entry) === false) {
					onLog(`Skipping boss ${boss.name}-${boss.entry}`);
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
			for (let i = 0; i < bkLength; ++i) {
				const start = performance.now();
				const bk = bosskills[i]!;
				const xOfY = `(${i}/${bkLength})`;

				onLog(
					`${xOfY} Avg bosskill processing time: ${
						i > 0 ? Math.round((100 * timeSum) / i) / 100 : 0
					}`
				);
				onLog(`${xOfY} Processing ${boss.name} bosskill: ${bk.id}`);
				const bkEnt = await getOrCreateBosskill({
					bossId: bossEnt.id,
					realmId: realmEnt.id,
					raidId: raidEnt.id,
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
								realmId: realmEnt.id
							});
							playerIdByGUID[player.guid] = playerEnt.id;
							players.push({ ...player, playerId: playerEnt.id });
						}
						await createBossKillPlayers({
							bosskillId,
							players
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
				onLog(`${xOfY} Processing ${boss.name} bosskill took ${took}`);
				timeSum += took;
			}
		}
	}
	onLog('done');
};

const getOrCreateRealm = async ({ name, expansion }: { name: string; expansion: number }) => {
	const db = await createConnection();
	const result = await db.select().from(realmTable).where(eq(realmTable.name, name)).execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx.insert(realmTable).ignore().values([{ name, expansion }]);
		});
		const id = result[0].insertId;
		const refetch = await db.select().from(realmTable).where(eq(realmTable.id, id));
		ent = refetch[0] ?? null;
	}
	if (ent === null) {
		throw new Error(`Realm entity not found nor created`);
	}
	return ent;
};

const getOrCreateRaid = async (raid: Raid) => {
	const db = await createConnection();
	const result = await db.select().from(raidTable).where(eq(raidTable.name, raid.map)).execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx.insert(raidTable).values([{ name: raid.map }]);
		});
		const id = result[0].insertId;
		const refetch = await db.select().from(raidTable).where(eq(raidTable.id, id));
		ent = refetch[0] ?? null;
	}
	if (ent === null) {
		throw new Error(`Raid entity not found nor created`);
	}
	return ent;
};

const getOrCreateBoss = async (boss: Boss) => {
	const db = await createConnection();
	const result = await db
		.select()
		.from(bossTable)
		.where(eq(bossTable.remoteId, boss.entry))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx.insert(bossTable).ignore().values({ remoteId: boss.entry, name: boss.name });
		});
		const id = result[0].insertId;
		const refetch = await db.select().from(bossTable).where(eq(bossTable.id, id));
		ent = refetch[0] ?? null;
	} else {
		if (ent.name !== boss.name) {
			const entId = ent.id;
			await db.transaction((tx) => {
				return tx.update(bossTable).set({ name: boss.name }).where(eq(bossTable.id, entId));
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
	realmId
}: {
	guid: number;
	name: string;
	realmId: number;
}) => {
	const db = await createConnection();
	const result = await db
		.select()
		.from(playerTable)
		.where(and(eq(playerTable.remoteId, guid), eq(playerTable.realmId, realmId)))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx.insert(playerTable).ignore().values({ remoteId: guid, name, realmId });
		});
		const id = result[0].insertId;
		const refetch = await db.select().from(playerTable).where(eq(playerTable.id, id));
		ent = refetch[0] ?? null;
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
	const db = await createConnection();
	const result = await db
		.select()
		.from(bosskillTable)
		.where(eq(bosskillTable.remoteId, bk.id))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction(async (tx) => {
			return tx.insert(bosskillTable).values({
				remoteId: bk.id,
				bossId: bossId,
				raidId: raidId,
				realmId: realmId,
				mode: bk.mode,
				guild: bk.guild,
				time: bk.time,
				length: bk.length,
				wipes: bk.wipes,
				deaths: bk.deaths,
				ressUsed: bk.ressUsed
			});
		});
		const id = result[0].insertId;
		const refetch = await db.select().from(bosskillTable).where(eq(bosskillTable.id, id));
		ent = refetch[0] ?? null;
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
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.delete(bosskillPlayerTable)
			.where(eq(bosskillPlayerTable.bosskillId, bosskillId))
			.execute();
	});
};
type BossKillPlayerArgs = {
	bosskillId: number;
	players: (BosskillCharacter & { playerId: number })[];
};
const createBossKillPlayers = async ({ bosskillId, players }: BossKillPlayerArgs) => {
	if (players.length === 0) {
		return;
	}
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.insert(bosskillPlayerTable)
			.ignore()
			.values(
				players.map((player) => ({
					bosskillId,
					playerId: player.playerId,

					talentSpec: player.talent_spec,
					avgItemLvl: player.avg_item_lvl,
					dmgDone: player.dmgDone,
					healingDone: player.healingDone,
					overhealingDone: player.overhealingDone,
					absorbDone: player.absorbDone,
					dmgTaken: player.dmgTaken,
					dmgAbsorbed: player.dmgAbsorbed,
					healingTaken: player.healingTaken,
					dispells: player.dispels,
					interrups: player.interrupts,

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
};

const deleteBossKillLoot = async ({ bosskillId }: DeleteByBosskillId) => {
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.delete(bosskillLootTable)
			.where(eq(bosskillLootTable.bosskillId, bosskillId))
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
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.insert(bosskillLootTable)
			.ignore()
			.values(
				items.map((loot) => ({
					bosskillId,
					itemId: Number(loot.itemId),
					count: loot.count
				}))
			);
	});
};

const deleteBossKillDeaths = async ({ bosskillId }: DeleteByBosskillId) => {
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.delete(bosskillDeathTable)
			.where(eq(bosskillDeathTable.bosskillId, bosskillId))
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
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.insert(bosskillDeathTable)
			.ignore()
			.values(
				deaths.map((death) => ({
					bosskillId,
					remoteId: death.id,
					playerId: death.playerId,
					time: death.time,
					isRess: death.time < 0 ? 1 : 0
				}))
			)
			.execute();
	});
};

const deleteBossKillTimeline = async ({ bosskillId }: DeleteByBosskillId) => {
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.delete(bosskillTimelineTable)
			.where(eq(bosskillTimelineTable.bosskillId, bosskillId))
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
	const db = await createConnection();
	await db.transaction((tx) => {
		return tx
			.insert(bosskillTimelineTable)
			.ignore()
			.values(
				timeline.map((item) => ({
					bosskillId,

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
