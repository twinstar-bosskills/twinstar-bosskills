import type { Boss, BossKill, Character, Raid } from '$lib/model';
import { eq } from 'drizzle-orm';
import { getBossKillDetail, listAllLatestBossKills } from '../api';
import { FilterOperator } from '../api/filter';
import { getRaids } from '../api/raid';
import { db } from '../db/index';
import { bosskillPlayerTable } from '../db/schema/boss-kill-player.schema';
import { bosskillTable } from '../db/schema/boss-kill.schema';
import { bossTable } from '../db/schema/boss.schema';
import { playerTable } from '../db/schema/player.schema';
import { raidTable } from '../db/schema/raid.schema';
import { realmTable } from '../db/schema/realm.schema';

type Args = {
	onLog: (line: string) => void;
};
export const synchronize = async ({ onLog }: Args) => {
	// TODO: better log
	// TODO: better transactions

	onLog('start');

	const raids = await getRaids();
	for (const raid of raids) {
		onLog(`Processing raid: ${raid.map}`);
		const raidEnt = await getOrCreateRaid(raid);

		for (const boss of raid.bosses) {
			onLog(`Processing boss: ${boss.name}`);
			const bossEnt = await getOrCreateBoss(boss);

			const bosskills = await listAllLatestBossKills({
				filters: [{ column: 'entry', operator: FilterOperator.EQUALS, value: boss.entry }]
			});
			for (const bk of bosskills) {
				onLog(`Processing bosskill: ${bk.id}`);
				const realmEnt = await getOrCreateRealm(bk.realm);
				const bkEnt = await getOrCreateBosskill({
					bossId: bossEnt.id,
					realmId: realmEnt.id,
					raidId: raidEnt.id,
					bk
				});

				const detail = await getBossKillDetail(bk.id);
				if (detail) {
					onLog(`Processing bosskill detail ${detail.id}`);
					if (Array.isArray(detail.boss_kills_players)) {
						onLog(`Processing bosskill detail ${detail.id} - players`);
						for (const player of detail.boss_kills_players) {
							const playerEnt = await getOrCreatePlayer(player.guid, player.name);

							onLog(`Processing bosskill detail ${detail.id} players - ${player.name}`);
							await getOrCreateBossKillPlayer({
								playerId: playerEnt.id,
								bosskillId: bkEnt.id,
								player
							});
						}
					}

					// TODO: loot
					// TODO: timeline
				} else {
					onLog(`No bosskill detail found by ${bk.id}`);
				}
			}
		}
	}
	onLog('done');
};

const getOrCreateRealm = async (realmName: string) => {
	const realmSelect = await db
		.select()
		.from(realmTable)
		.where(eq(realmTable.name, realmName))
		.execute();
	let realmEnt = realmSelect[0] ?? null;
	if (realmEnt === null) {
		const [nextRealmEnt] = await db.transaction((tx) => {
			return tx
				.insert(realmTable)
				.values([{ name: realmName }])
				.onConflictDoNothing()
				.returning();
		});
		if (nextRealmEnt) {
			realmEnt = nextRealmEnt;
		}
	}
	if (realmEnt === null) {
		throw new Error(`Realm entity not found nor created`);
	}
	return realmEnt;
};

const getOrCreateRaid = async (raid: Raid) => {
	const raidSelect = await db
		.select()
		.from(raidTable)
		.where(eq(raidTable.name, raid.map))
		.execute();
	let raidEnt = raidSelect[0] ?? null;
	if (raidEnt === null) {
		const [nextRaidEnt] = await db.transaction((tx) => {
			return tx
				.insert(raidTable)
				.values([{ name: raid.map }])
				.onConflictDoNothing()
				.returning();
		});
		if (nextRaidEnt) {
			raidEnt = nextRaidEnt;
		}
	}
	if (raidEnt === null) {
		throw new Error(`Raid entity not found nor created`);
	}
	return raidEnt;
};

const getOrCreateBoss = async (boss: Boss) => {
	const bossSelect = await db
		.select()
		.from(bossTable)
		.where(eq(bossTable.remoteId, boss.entry))
		.execute();
	let bossEnt = bossSelect[0] ?? null;
	if (bossEnt === null) {
		const [nextBossEnt] = await db.transaction((tx) => {
			return tx
				.insert(bossTable)
				.values({ remoteId: boss.entry, name: boss.name })
				.onConflictDoNothing()
				.returning();
		});
		if (nextBossEnt) {
			bossEnt = nextBossEnt;
		}
	}

	if (bossEnt === null) {
		throw new Error(`Boss entity not found nor created`);
	}
	return bossEnt;
};

const getOrCreatePlayer = async (guid: number, name: string) => {
	const result = await db
		.select()
		.from(playerTable)
		.where(eq(playerTable.remoteId, guid))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx
				.insert(playerTable)
				.values({ remoteId: guid, name: name })
				.onConflictDoNothing()
				.returning();
		});
		ent = result[0] ?? null;
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
		.select()
		.from(bosskillTable)
		.where(eq(bosskillTable.remoteId, bk.id))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const bkResult = await db.transaction(async (tx) => {
			return tx
				.insert(bosskillTable)
				.values({
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
				})
				.onConflictDoNothing()
				.returning();
		});
		ent = bkResult[0] ?? null;
	}
	if (ent === null) {
		throw new Error(`Bosskill ${bk.id} entity not found nor created`);
	}

	return ent;
};

type BossKillPlayerArgs = {
	playerId: number;
	bosskillId: number;
	player: Character;
};
const getOrCreateBossKillPlayer = async ({ playerId, bosskillId, player }: BossKillPlayerArgs) => {
	const result = await db
		.select()
		.from(bosskillPlayerTable)
		.where(eq(bosskillPlayerTable.remoteId, player.id))
		.execute();
	let ent = result[0] ?? null;
	if (ent === null) {
		const result = await db.transaction((tx) => {
			return tx
				.insert(bosskillPlayerTable)
				.values({
					bosskillId,
					playerId,
					remoteId: player.id,

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
				})
				.onConflictDoNothing()
				.returning();
		});
		ent = result[0] ?? null;
	}

	if (ent === null) {
		throw new Error(`Player bosskill entity not found nor created`);
	}
	return ent;
};
