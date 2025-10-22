import type { BossProp } from '$lib/model/boss-prop.model';
import { eq } from 'drizzle-orm';
import { createConnection } from '.';
import { bossPropTable } from './schema/mysql/boss-prop.schema';

export const getBossPropsByBossId = async (bossId: number): Promise<BossProp | null> => {
	try {
		const db = await createConnection();
		const qb = db.select().from(bossPropTable).where(eq(bossPropTable.bossId, bossId));
		const rows = await qb.execute();
		return rows[0] ?? null;
	} catch (e) {
		console.error(e);
	}

	return null;
};
