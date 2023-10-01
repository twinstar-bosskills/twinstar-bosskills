import type { Boss, Raid } from '$lib/model';
import { eq } from 'drizzle-orm';
import { listAllLatestBossKills } from '../api';
import { FilterOperator } from '../api/filter';
import { getRaids } from '../api/raid';
import { db } from '../db/index';
import { bosskillTable } from '../db/schema/boss-kill.schema';
import { bossTable } from '../db/schema/boss.schema';
import { raidTable } from '../db/schema/raid.schema';

export const synchronize = async () => {
	// TODO: better log
	// TODO: better transactions
	const log = [];
	log.push('start');
	const raids = await getRaids();
	for (const raid of raids) {
		log.push(`Processing raid: ${raid.map}`);
		const raidEnt = await getOrCreateRaid(raid);

		for (const boss of raid.bosses) {
			log.push(`Processing boss: ${boss.name}`);
			const bossEnt = await getOrCreateBoss(boss);

			const bosskills = await listAllLatestBossKills({
				filters: [{ column: 'entry', operator: FilterOperator.EQUALS, value: boss.entry }]
			});
			for (const bk of bosskills) {
				log.push(`Processing bosskill: ${bk.id}`);
				await db.transaction(async (tx) => {
					await tx
						.insert(bosskillTable)
						.values({
							remoteId: bk.id,
							bossId: bossEnt.id,
							raidId: raidEnt.id,
							mode: bk.mode,
							guild: bk.guild,
							time: bk.time,
							realm: bk.realm,
							length: bk.length,
							wipes: bk.wipes,
							deaths: bk.deaths,
							ressUsed: bk.ressUsed,
							instanceId: bk.instanceId
						})
						.onConflictDoNothing()
						.execute();
				});
			}
		}
	}
	log.push('done');
	return { log };
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
