import { TWINSTAR_API_URL } from '$env/static/private';

import { realmToId } from '$lib/realm';
import { withCache } from '../cache';
import { queryString, type QueryArgs } from './filter';
import { listAll } from './pagination';
import { makePaginatedResponseSchema, type PaginatedResponse } from './response';
import {
	bosskillCharactersPartialSchema,
	charactersSchema,
	type BosskillCharacterPartial,
	type Character
} from './schema';

// /bosskills/player?map=<mapa>&mode=<obtiznost>&page=<stranka>&pageSize=<velikost>&(guid=<guid> or name=<name>)
type CharacterBosskillsArgs = Omit<QueryArgs, 'sorter' | 'filters' | 'talentSpec'> & {
	realm: string;
};
export const getCharacterBossKills = async (
	q: CharacterBosskillsArgs
): Promise<BosskillCharacterPartial[]> => {
	const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const json = await r.json();
			const items = makePaginatedResponseSchema(bosskillCharactersPartialSchema).parse(json);
			const data = items.data;

			return data;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache<BosskillCharacterPartial[]>({
		deps: [`character-bosskills`, q],
		fallback,
		defaultValue: []
	});
};

type CharacterTotalBossKillsArgs = Omit<QueryArgs, 'sorter' | 'filters' | 'talentSpec'>;
export const getCharacterTotalBossKills = async (q: {
	realm: string;
	name: string;
}): Promise<number> => {
	const fetchPlayer = async ({ page, pageSize, ...rest }: CharacterTotalBossKillsArgs) => {
		const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString({ ...rest, page, pageSize })}`;
		try {
			const r = await fetch(url);
			const items: BosskillCharacterPartial[] | PaginatedResponse<BosskillCharacterPartial> =
				await r.json();

			// TODO: this is wrong but we do not have items.total yet
			let total = 2000;
			let data = [];
			if (Array.isArray(items)) {
				data = items;
			} else if (Array.isArray(items.data) && typeof items.total === 'number') {
				data = items.data;
				total = items.total;
			} else {
				throw new Error(`expected array or paginated response, got: ${typeof items}`);
			}

			return {
				data,
				total
			};
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	const fallback = async () => {
		try {
			const all = await listAll(
				({ page, pageSize }) =>
					fetchPlayer({
						...q,
						page,
						pageSize
					}),
				{ pageSize: 100 }
			);
			return all.length;
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	return withCache<number>({ deps: [`character-total-bosskills`, q], fallback, defaultValue: 0 });
};
type CharacterByNameArgs = Pick<QueryArgs, 'page' | 'pageSize'> &
	Required<Pick<QueryArgs, 'name' | 'realm'>>;
export const getCharacterByName = async (q: CharacterByNameArgs): Promise<Character | null> => {
	const fetchCharacter = async ({ page, pageSize, ...rest }: CharacterByNameArgs) => {
		const url = `${TWINSTAR_API_URL}/characters?${queryString({ ...rest, page, pageSize })}`;
		try {
			const r = await fetch(url);
			const json = await r.json();
			const items = makePaginatedResponseSchema(charactersSchema).parse(json);

			const char =
				items.data.find(
					(char) => char.name === q.name && char.realm.toLowerCase() === q.realm.toLowerCase()
				) ?? null;
			if (char) {
				const realmId = realmToId(q.realm);
				char.guid = Number(char.id.replace(`${realmId}_`, ''));
			}

			return char;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	const fallback = async () => {
		try {
			const char = await fetchCharacter(q);
			if (char) {
				return char;
			}
		} catch (e) {
			console.error(e);
			throw e;
		}
		return null;
	};

	return withCache<Character | null>({ deps: [`character`, q], fallback, defaultValue: null });
};
