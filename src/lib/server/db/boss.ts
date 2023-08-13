import { BOSSKILLS_DATABASE_URL } from '$env/static/private';
import { STATS_TYPE_DMG, STATS_TYPE_HEAL, type StatsType } from '$lib/stats-type';
import mysql from 'mysql2/promise';
import { withCache } from '../cache';
export type Boss = {
	id: number;
	name: string;
};

const REGEXP_H1 = /<h1>(.*)<\/h1>/;
export const getBoss = async (id: number): Promise<Boss | null> => {
	const fallback = async () => {
		try {
			const r = await fetch(`https://mop-twinhead.twinstar.cz/?npc=${id}`);
			const text = await r.text();
			const m = text.match(REGEXP_H1);
			if (m !== null) {
				return {
					id,
					name: m[1]?.trim() ?? 'Unknown'
				};
			}
		} catch (e) {
			console.error(e);
		}

		return null;
	};

	return withCache({
		deps: [`boss`, id],
		fallback
	});
};

export const getBosses = async (): Promise<Boss[]> => {
	const bosses: Boss[] = [];
	try {
		type Row = { entry: number };
		const c = await mysql.createConnection(BOSSKILLS_DATABASE_URL);
		const [rows] = await c.query('SELECT entry FROM boss_kills WHERE hidden = 0 GROUP BY entry');
		const queue = (rows as Row[]).map((item) => {
			return getBoss(item.entry).then((boss) => {
				if (boss) {
					bosses.push(boss);
				}
			});
		});
		await Promise.all(queue);
	} catch (e) {
		console.error(e);
	}

	return bosses.sort((a, b) => a.name.localeCompare(b.name));
};

export type BossStats = {
	guid: number;
	talentSpec: number;
	amount: number;
};

const statsTypeToColumn = (type: StatsType) => {
	if (type === STATS_TYPE_DMG) {
		return 'dmgDone';
	}
	if (type === STATS_TYPE_HEAL) {
		return 'healingDone';
	}

	return null;
};
type StatsArgs = {
	id: number;
	statsType: StatsType;
};
export const getBossStatsByTalentSpec = async ({
	id,
	statsType
}: StatsArgs): Promise<BossStats[]> => {
	const column = statsTypeToColumn(statsType);
	if (column === null) {
		console.error(`unsupported statsType ${statsType}`);
		return [];
	}

	// TODO: make sure to take top 100 for each spec
	// TODO: remove guid GROUP BY
	try {
		const c = await mysql.createConnection(BOSSKILLS_DATABASE_URL);
		const [rows] = await c.query(
			`SELECT id, guid, talent_spec AS talentSpec, MAX(??) AS amount FROM boss_kills_players bkp 
WHERE bkp.id IN (SELECT id FROM boss_kills bk WHERE bk.entry = ?)
GROUP BY talent_spec, guid
ORDER BY amount DESC`,
			[column, id]
		);
		return rows as BossStats[];
	} catch (e) {
		console.error(e);
	}
	return [];
};
