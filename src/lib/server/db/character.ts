import { raidLock } from '$lib/date';
import { Difficulty } from '$lib/model';
import { and, desc, eq, gte, inArray, lt, lte } from 'drizzle-orm';
import { db } from '.';
import { bosskillPlayerTable } from './schema/boss-kill-player.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';

type CharacterPerformanceArgs = {
	guid: number;
	startDate?: Date;
	endDate?: Date;
};
export const getCharacterPerformance = async ({
	guid,
	startDate,
	endDate
}: CharacterPerformanceArgs) => {
	const values: Record<string, { dps: number; hps: number }> = {};
	const now = new Date();
	const currentRaidLock = raidLock(now);

	const start = startDate;
	const end = endDate ?? currentRaidLock.end;

	try {
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
					inArray(bosskillTable.mode, [Difficulty.DIFFICULTY_10_N, Difficulty.DIFFICULTY_10_HC])
				)
			)
			.groupBy(bosskillTable.mode, bosskillTable.bossId, bosskillTable.time)
			.orderBy(desc(bosskillTable.time));

		const bosskills = await currentQb.execute();

		for (const current of bosskills) {
			const previous = await db
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
				.orderBy(desc(bosskillTable.time))
				.get();

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
