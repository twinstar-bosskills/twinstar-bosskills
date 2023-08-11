import { CHARACTERS_DATABASE_URL } from '$env/static/private';
import mysql from 'mysql2/promise';

export type Character = {
	guid: number;
	name: string;
};

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

export const getCharacter = async (guid: number) => {
	try {
		const c = await mysql.createConnection(CHARACTERS_DATABASE_URL);
		const [rows] = await c.query('SELECT * FROM characters WHERE guid = ?', guid);
		return rows?.[0];
	} catch (e) {
		console.error(e);
	}

	return CHARACTERS.find((c) => c.guid === guid);
};
