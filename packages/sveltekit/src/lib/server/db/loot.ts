import { and, eq, sql } from 'drizzle-orm';
import { createConnection } from '.';
import { bosskillLootTable } from './schema/boss-kill-loot.schema';
import { bosskillTable } from './schema/boss-kill.schema';
import { bossTable } from './schema/boss.schema';

type GetLootChanceArgs = {
	itemId: number;
	bossRemoteId: number;
	mode: number;
};
export type LootChance = {
	count: number;
	total: number;
	chance: number;
};
export const getLootChance = async ({
	itemId,
	mode,
	bossRemoteId
}: GetLootChanceArgs): Promise<LootChance | null> => {
	try {
		const db = await createConnection();
		const currentRows = await db
			.select({ count: sql<number>`count(*)` })
			.from(bosskillTable)
			.innerJoin(bosskillLootTable, eq(bosskillTable.id, bosskillLootTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.where(
				and(
					eq(bosskillTable.mode, mode),
					eq(bossTable.remoteId, bossRemoteId),
					eq(bosskillLootTable.itemId, itemId)
				)
			);
		const current = currentRows[0] ?? null;

		const totalRows = await db
			.select({ count: sql<number>`count(*)` })
			.from(bosskillTable)
			.innerJoin(bosskillLootTable, eq(bosskillTable.id, bosskillLootTable.bosskillId))
			.innerJoin(bossTable, eq(bossTable.id, bosskillTable.bossId))
			.where(and(eq(bosskillTable.mode, mode), eq(bossTable.remoteId, bossRemoteId)));
		const total = totalRows[0] ?? null;

		if (!total || total.count === 0) {
			return null;
		}

		const currentCount = current?.count ?? 0;
		const totalCount = total.count;
		const chance = (current?.count ?? 0) / total.count;
		return {
			count: currentCount,
			total: totalCount,
			chance: 100 * (Math.round(10000 * chance) / 10000)
		};
	} catch (e) {
		console.error(e);
	}

	return null;
};
