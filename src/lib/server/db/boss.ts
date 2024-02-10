import { and, desc, eq } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillCharacterSchema, type BosskillCharacter } from '../api/schema';
import { bosskillPlayerTable, dps, hps } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { raidTable } from './schema/raid.schema';
import { realmTable } from './schema/realm.schema';

type BossTopSpecs = Record<number, BosskillCharacter[]>;

type GetBossTopSpecsArgs = {
	remoteId: number;
	realm: string;
	difficulty: number;
	metric: 'hps' | 'dps';
};
export const getBossTopSpecs = async ({
	remoteId,
	realm,
	difficulty,
	metric
}: GetBossTopSpecsArgs): Promise<BossTopSpecs> => {
	const stats: BossTopSpecs = {};

	try {
		const db = await createConnection();
		const qb = db
			.select({
				bosskillPlayer: bosskillPlayerTable,
				bosskill: bosskillTable,
				boss: bossTable,
				raid: raidTable
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.innerJoin(raidTable, eq(raidTable.id, bosskillTable.raidId))
			.where(
				and(
					eq(realmTable.name, realm),
					eq(bosskillTable.mode, difficulty),
					eq(bossTable.remoteId, remoteId)
				)
			)
			.groupBy(bosskillTable.mode, bosskillTable.bossId, bosskillPlayerTable.talentSpec)
			.orderBy(desc(metric === 'hps' ? hps : dps))
			.limit(200);

		const rows = await qb.execute();
		for (const row of rows) {
			const bkp = row.bosskillPlayer;
			const bk = row.bosskill;
			const boss = row.boss;
			const raid = row.raid;
			const spec = bkp.talentSpec;

			const value = {
				id: 1,
				guid: bkp.guid,
				talent_spec: bkp.talentSpec,
				avg_item_lvl: bkp.avgItemLvl,
				dmgDone: bkp.dmgDone,
				healingDone: bkp.healingDone,
				overhealingDone: bkp.overhealingDone,
				absorbDone: bkp.absorbDone,
				dmgTaken: bkp.dmgTaken,
				dmgAbsorbed: bkp.dmgAbsorbed,
				healingTaken: bkp.healingTaken,
				dispels: bkp.dispells,
				interrupts: bkp.interrups,
				name: bkp.name,
				race: bkp.race,
				class: bkp.class,
				gender: bkp.gender,
				level: bkp.level,

				boss_kills: {
					id: bk.remoteId,
					entry: boss.remoteId,
					map: raid.name,
					mode: bk.mode,
					guild: bk.guild,
					time: bk.time,
					realm,
					length: bk.length,
					wipes: bk.wipes,
					deaths: bk.deaths,
					ressUsed: bk.ressUsed
				}
			};
			const item = bosskillCharacterSchema.parse(value);
			stats[spec] ??= [];
			stats[spec]!.push(item);
		}
	} catch (e) {
		console.error(e);
	}
	return stats;
};
