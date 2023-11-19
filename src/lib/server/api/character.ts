import { TWINSTAR_API_URL } from '$env/static/private';
import { mutateCharacter, type Character } from '$lib/model';
import { withCache } from '../cache';
import { queryString, type QueryArgs } from './filter';
import { listAll } from './pagination';
import type { PaginatedResponse } from './response';

// /bosskills/player?map=<mapa>&mode=<obtiznost>&page=<stranka>&pageSize=<velikost>&(guid=<guid> or name=<name>)
type CharacterQueryArgs = Omit<QueryArgs, 'sorter' | 'filters' | 'talentSpec'> & { realm: string };
export const getCharacterBossKills = async (q: CharacterQueryArgs): Promise<Character[]> => {
	const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const items: PaginatedResponse<Character[]> = await r.json();
			if (Array.isArray(items?.data) === false) {
				throw new Error(`expected array, got: ${typeof items?.data}`);
			}

			const data = items.data;
			for (const item of items.data) {
				mutateCharacter(q.realm, item);
			}

			return data;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache<Character[]>({ deps: [`character`, q], fallback }) ?? [];
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
			const items: Character[] | PaginatedResponse<Character> = await r.json();

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

	return withCache<number>({ deps: [`character-total-bosskills`, q], fallback }) ?? 0;
};

// https://twinstar-api.twinstar-wow.com/characters?page=0&pageSize=25&name=gareo
