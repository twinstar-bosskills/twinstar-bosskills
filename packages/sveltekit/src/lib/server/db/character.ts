import { raidLock } from '$lib/date';
import { getPerformaceDifficultiesByExpansion } from '@twinstar-bosskills/core/dist/wow';
import { realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
import { and, asc, desc, eq, gte, inArray, lt, lte } from 'drizzle-orm';
import { createConnection, type DbConnection } from '.';
import { bosskillPlayerTable, dps, hps } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';
import { raidTable } from './schema/raid.schema';
import { realmTable } from './schema/realm.schema';

export type GetCharacterPerformanceTrendsArgs = {
	realm: string;
	guid: number;
	startDate?: Date;
	endDate?: Date;
};

type CharacterPerformanceTrends = Record<string, Record<number, { dps: number; hps: number }>>;
export const getCharacterPerformanceTrends = async ({
	realm,
	guid,
	startDate,
	endDate
}: GetCharacterPerformanceTrendsArgs) => {
	const trends: CharacterPerformanceTrends = {};
	const now = new Date();
	const currentRaidLock = raidLock(now);

	const start = startDate;
	const end = endDate ?? currentRaidLock.end;

	const expansion = realmToExpansion(realm);
	const diffs = getPerformaceDifficultiesByExpansion(expansion);

	try {
		const db = await createConnection();
		const currentQb = db
			.select()
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
			.where(
				and(
					eq(realmTable.name, realm),
					eq(bosskillPlayerTable.guid, guid),
					start ? gte(bosskillTable.time, start.toISOString()) : undefined,
					lte(bosskillTable.time, end.toISOString()),
					inArray(bosskillTable.mode, diffs)
				)
			)
			.groupBy(
				bosskillTable.mode,
				bosskillTable.bossId,
				bosskillPlayerTable.talentSpec,
				bosskillTable.time
			)
			.orderBy(desc(bosskillTable.time));

		const bosskills = await currentQb.execute();

		for (const current of bosskills) {
			const previousRows = await db
				.select()
				.from(bosskillPlayerTable)
				.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
				.where(
					and(
						// lt(bosskillTable.time, previousRaidLock.end.toISOString()),
						lt(bosskillTable.time, current.boss_kill.time),
						eq(bosskillTable.bossId, current.boss_kill.bossId),
						eq(bosskillTable.mode, current.boss_kill.mode),
						eq(bosskillPlayerTable.playerId, current.boss_kill_player.playerId),
						eq(bosskillPlayerTable.talentSpec, current.boss_kill_player.talentSpec)
					)
				)
				.orderBy(desc(bosskillTable.time));
			const previous = previousRows[0] ?? null;

			if (previous) {
				const currentHps = current.boss_kill_player.healingDone / current.boss_kill.length;
				const baseHps = previous.boss_kill_player.healingDone / previous.boss_kill.length;

				const currentDps = current.boss_kill_player.dmgDone / current.boss_kill.length;
				const baseDps = previous.boss_kill_player.dmgDone / previous.boss_kill.length;

				const remoteId = current.boss_kill.remoteId;
				const mode = current.boss_kill.mode;
				trends[remoteId] ??= {};
				trends[remoteId]![mode] ??= {
					dps: baseDps <= 0 ? 0 : Math.round((10000 * (currentDps - baseDps)) / baseDps) / 100,
					hps: baseHps <= 0 ? 0 : Math.round((10000 * (currentHps - baseHps)) / baseHps) / 100
					// currentId: current.boss_kill.remoteId,
					// baseId: previous.boss_kill.remoteId
				};
			}
		}
	} catch (e) {
		console.error(e);
	}

	return trends;
};
export type GetCharacterPerformanceLinesArgs = CharacterPerformanceArgs &
	Required<Pick<CharacterPerformanceArgs, 'bossIds' | 'modes'>>;
export type CharacterPerformanceLines = {
	time: string;
	dps: number;
	hps: number;
	bossId: number;
	bossName: string;
	talentSpec: number;
	avgItemLvl: number;
	mode: number;
}[];
export const getCharacterPerformanceLines = async (
	args: GetCharacterPerformanceLinesArgs
): Promise<CharacterPerformanceLines> => {
	try {
		const db = await createConnection();
		const qb = characterPerformanceQb(db, args);
		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};

export const getCharacterPerformanceLinesGrouped = async (
	args: CharacterPerformanceArgs
): Promise<CharacterPerformanceLines> => {
	try {
		const db = await createConnection();
		const qb = characterPerformanceQb(db, { ...args, groupByBossAndDiff: true });
		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};

type CharacterPerformanceArgs = {
	realm: string;
	guid: number;
	specs?: number[];
	raids?: string[];
	modes?: number[];
	bossIds?: number[];
	startDate?: Date;
	endDate?: Date;
	ilvlMin?: number;
	ilvlMax?: number;
};
const characterPerformanceQb = (
	db: DbConnection,
	{
		realm,
		guid,
		modes,
		specs,
		raids,
		bossIds,
		startDate,
		endDate,
		ilvlMin = 0,
		ilvlMax = 0,
		groupByBossAndDiff = false
	}: CharacterPerformanceArgs & { groupByBossAndDiff?: boolean }
) => {
	const now = new Date();
	const currentRaidLock = raidLock(now);

	const start = startDate;
	const end = endDate ?? currentRaidLock.end;
	const qb = db
		.select({
			time: bosskillTable.time,
			dps: dps,
			hps: hps,
			mode: bosskillTable.mode,
			bossId: bossTable.remoteId,
			bossName: bossTable.name,
			talentSpec: bosskillPlayerTable.talentSpec,
			avgItemLvl: bosskillPlayerTable.avgItemLvl
		})
		.from(bosskillPlayerTable)
		.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
		.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
		.innerJoin(realmTable, eq(realmTable.id, bosskillTable.realmId))
		.innerJoin(raidTable, eq(raidTable.id, bosskillTable.raidId))
		.where(
			and(
				eq(realmTable.name, realm),
				eq(bosskillPlayerTable.guid, guid),
				start ? gte(bosskillTable.time, start.toISOString()) : undefined,
				lte(bosskillTable.time, end.toISOString()),
				specs && specs.length > 0 ? inArray(bosskillPlayerTable.talentSpec, specs) : undefined,
				raids && raids.length > 0 ? inArray(raidTable.name, raids) : undefined,
				bossIds && bossIds.length > 0 ? inArray(bossTable.remoteId, bossIds) : undefined,
				modes && modes.length > 0 ? inArray(bosskillTable.mode, modes) : undefined,
				ilvlMin > 0 ? gte(bosskillPlayerTable.avgItemLvl, ilvlMin) : undefined,
				ilvlMax > 0 ? lte(bosskillPlayerTable.avgItemLvl, ilvlMax) : undefined
			)
		)
		.groupBy(bosskillTable.time)
		.orderBy(asc(bosskillTable.time));

	if (groupByBossAndDiff) {
		qb.groupBy(bosskillTable.time, bosskillTable.bossId, bosskillTable.mode);
	}
	return qb;
};
