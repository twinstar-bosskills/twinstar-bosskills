import { raidLock } from '$lib/date';
import { getPerformaceDifficultiesByExpansion } from '$lib/model';
import { expansionIsMoP, realmToExpansion } from '$lib/realm';
import { and, asc, desc, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillPlayerTable } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';

type CharacterPerformanceTrendsArgs = {
	realm: string;
	guid: number;
	startDate?: Date;
	endDate?: Date;
};
export const getCharacterPerformanceTrends = async ({
	realm,
	guid,
	startDate,
	endDate
}: CharacterPerformanceTrendsArgs) => {
	const values: Record<string, { dps: number; hps: number }> = {};
	const now = new Date();
	const currentRaidLock = raidLock(now);

	const start = startDate;
	const end = endDate ?? currentRaidLock.end;

	const expansion = realmToExpansion(realm);
	const isMop = expansionIsMoP(expansion);
	if (isMop === false) {
		return { byRemoteId: {} };
	}

	const diffs = getPerformaceDifficultiesByExpansion(expansion);

	try {
		const db = await createConnection();
		const currentQb = db
			.select()
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.where(
				and(
					eq(bosskillPlayerTable.guid, guid),
					start ? gte(bosskillTable.time, start.toISOString()) : undefined,
					lte(bosskillTable.time, end.toISOString()),
					inArray(bosskillTable.mode, diffs)
				)
			)
			.groupBy(bosskillTable.mode, bosskillTable.bossId, bosskillTable.time)
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
				.groupBy(bosskillTable.mode, bosskillTable.bossId)
				.orderBy(desc(bosskillTable.time));
			const previous = previousRows[0] ?? null;

			if (previous) {
				const currentHps = current.boss_kill_player.healingDone / current.boss_kill.length;
				const baseHps = previous.boss_kill_player.healingDone / previous.boss_kill.length;

				const currentDps = current.boss_kill_player.dmgDone / current.boss_kill.length;
				const baseDps = previous.boss_kill_player.dmgDone / previous.boss_kill.length;

				values[current.boss_kill.remoteId] ??= {
					dps: baseDps <= 0 ? 0 : Math.round((10000 * (currentDps - baseDps)) / baseDps) / 100,
					hps: baseHps <= 0 ? 0 : Math.round((10000 * (currentHps - baseHps)) / baseHps) / 100
				};
			}
		}
	} catch (e) {
		console.error(e);
	}

	return { byRemoteId: values };
};
type GetCharacterPerformanceLineArgs = {
	realm: string;
	guid: number;
	mode: number;
	bossId: number;
	startDate?: Date;
	endDate?: Date;
};
export type CharacterPerformanceLine = { time: string; dps: number; hps: number }[];
export const getCharacterPerformanceLine = async ({
	realm,
	guid,
	mode,
	bossId,
	startDate,
	endDate
}: GetCharacterPerformanceLineArgs): Promise<CharacterPerformanceLine> => {
	const now = new Date();
	const currentRaidLock = raidLock(now);

	const start = startDate;
	const end = endDate ?? currentRaidLock.end;

	const expansion = realmToExpansion(realm);
	const isMop = expansionIsMoP(expansion);
	if (isMop === false) {
		return [];
	}

	try {
		const db = await createConnection();
		const qb = db
			.select({
				time: bosskillTable.time,
				dps: sql<number>`ROUND(IF(${bosskillTable.length} = 0, 0, ${bosskillPlayerTable.dmgDone}/(${bosskillTable.length}/1000)))`.mapWith(
					Number
				),
				hps: sql<number>`ROUND(IF(${bosskillTable.length} = 0, 0, (${bosskillPlayerTable.healingDone} + ${bosskillPlayerTable.absorbDone})/(${bosskillTable.length}/1000)))`.mapWith(
					Number
				)
			})
			.from(bosskillPlayerTable)
			.innerJoin(bosskillTable, eq(bosskillTable.id, bosskillPlayerTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.where(
				and(
					eq(bosskillPlayerTable.guid, guid),
					eq(bossTable.remoteId, bossId),
					start ? gte(bosskillTable.time, start.toISOString()) : undefined,
					lte(bosskillTable.time, end.toISOString()),
					eq(bosskillTable.mode, mode)
				)
			)
			.groupBy(bosskillTable.time)
			.orderBy(asc(bosskillTable.time));
		const rows = await qb.execute();
		return rows;
	} catch (e) {
		console.error(e);
	}

	return [];
};
