import { BOSSKILLS_DATABASE_URL } from '$env/static/private';
import mysql from 'mysql2/promise';

export type BossKill = {
	id: number;
	entry: number;
	map: string;
	mode: number;
	guild: string;
	time: string;
	realm: number;
	length: number;
	wipes: number;
	deaths: number;
	ressUsed: number;
	instanceId: number;
};

const BOSS_KILLS: BossKill[] = [
	{
		id: 1,
		entry: 62543,
		map: 'Map',
		mode: 1,
		guild: 'Guild',
		time: '2023-06-23 06:57:03',
		realm: 18,
		length: 360586,
		wipes: 1,
		deaths: 10,
		ressUsed: 1,
		instanceId: 560992
	}
];

export const getLatestBossKills = async (): Promise<BossKill[]> => {
	try {
		const c = await mysql.createConnection(BOSSKILLS_DATABASE_URL);
		const [rows] = await c.query(
			'SELECT * FROM boss_kills WHERE hidden = 0 ORDER BY time DESC LIMIT 50'
		);
		return rows;
	} catch (e) {
		console.error(e);
	}

	return BOSS_KILLS;
};

export const getBossKill = async (id: number): Promise<BossKill | null> => {
	try {
		const c = await mysql.createConnection(BOSSKILLS_DATABASE_URL);
		const [rows] = await c.query('SELECT * FROM boss_kills WHERE id = ? AND hidden = 0', id);
		return rows?.[0];
	} catch (e) {
		console.error(e);
	}

	return BOSS_KILLS.find((c) => c.id === id) ?? null;
};

type BossKillLoot = {
	/**
	 * boss_kill id
	 */
	id: number;
	itemId: number;
	count: number;
};

export const getBossKillLoot = async (id: number): Promise<BossKillLoot[]> => {
	try {
		const c = await mysql.createConnection(BOSSKILLS_DATABASE_URL);
		const [rows] = await c.query('SELECT * FROM boss_kills_loot WHERE id = ?', id);
		return rows;
	} catch (e) {
		console.error(e);
	}
	// https://twinstar-api.twinstar-wow.com/item
	return [];
};
