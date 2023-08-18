import { TWINSTAR_API_URL } from '$env/static/private';
import { mutateCharacter, type Character } from '$lib/model';
import { withCache } from '../cache';
import { queryString, type QueryArgs } from './filter';

// /bosskills/player?map=<mapa>&mode=<obtiznost>&page=<stranka>&pageSize=<velikost>&(guid=<guid> or name=<name>)
type CharacterQueryArgs = Omit<QueryArgs, 'sorter' | 'filters' | 'talentSpec'>;
export const getCharacterBossKills = async (q: CharacterQueryArgs): Promise<Character[]> => {
	const url = `${TWINSTAR_API_URL}/bosskills/player?${queryString(q)}`;
	const fallback = async () => {
		try {
			const r = await fetch(url);
			const data: Character[] = await r.json();
			if (Array.isArray(data) === false) {
				throw new Error(`expected array, got: ${typeof data}`);
			}

			for (const item of data) {
				mutateCharacter(item);
			}

			return data;
		} catch (e) {
			console.error(e, url);
			throw e;
		}
	};

	return withCache<Character[]>({ deps: [`character`, q], fallback }) ?? [];
};
