import { CHARACTERS_DATABASE_URL } from '$env/static/private';
import mysql from 'mysql2/promise';
import { withCache } from '../cache';

export type Character = {
	guid: number;
	name: string;
};
export type CharacterByGUID = Record<Character['guid'], Character>;

const CHARACTERS = [
	{ guid: 1, name: 'dummy character 1' },
	{ guid: 2, name: 'dummy character 2' }
];

export const getCharacters = async (): Promise<Character[]> => {
	try {
		const c = await mysql.createConnection(CHARACTERS_DATABASE_URL);
		const [rows] = await c.query('SELECT * FROM characters LIMIT 100');
		return rows;
	} catch (e) {
		console.error(e);
	}

	return CHARACTERS;
};

export const findCharactersByGUIDs = async (guids: number[]): Promise<Character[]> => {
	const fallback = async () => {
		if (guids.length === 0) {
			return [];
		}

		try {
			const c = await mysql.createConnection(CHARACTERS_DATABASE_URL);
			const [rows] = await c.query('SELECT * FROM characters WHERE guid IN (?)', guids);
			return rows;
		} catch (e) {
			console.error(e);
		}

		return [];
	};
	return withCache({
		deps: [`characters-by-guids`, guids],
		fallback
	});
};

export const getCharacter = async (guid: number) => {
	const fallback = async () => {
		try {
			const c = await mysql.createConnection(CHARACTERS_DATABASE_URL);
			const [rows] = await c.query('SELECT * FROM characters WHERE guid = ?', guid);
			return rows?.[0];
		} catch (e) {
			console.error(e);
		}

		return CHARACTERS.find((c) => c.guid === guid);
	};
	return withCache({
		deps: [`character`, guid],
		fallback
	});
};
