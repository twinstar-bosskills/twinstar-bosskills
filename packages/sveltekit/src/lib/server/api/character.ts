import * as api from '@twinstar-bosskills/api';
import type { QueryArgs } from '@twinstar-bosskills/api/dist/filter';
import { type BosskillCharacterPartial, type Character } from '@twinstar-bosskills/api/dist/schema';
import { EXPIRE_1_HOUR, EXPIRE_5_MIN, withCache } from '../cache';

// /bosskills/player?map=<mapa>&mode=<obtiznost>&page=<stranka>&pageSize=<velikost>&(guid=<guid> or name=<name>)
type CharacterBosskillsArgs = Omit<QueryArgs, 'sorter' | 'filters' | 'talentSpec'> & {
	realm: string;
};
export const getCharacterBossKills = async (
	q: CharacterBosskillsArgs
): Promise<BosskillCharacterPartial[]> => {
	const fallback = async () => {
		return api.getCharacterBossKills(q);
	};

	return withCache<BosskillCharacterPartial[]>({
		deps: [`character-bosskills`, q],
		fallback,
		defaultValue: [],
		expire: EXPIRE_5_MIN
	});
};

export const getCharacterTotalBossKills = async (q: {
	realm: string;
	name: string;
}): Promise<number> => {
	const fallback = async () => {
		return api.getCharacterTotalBossKills(q);
	};

	return withCache<number>({
		deps: [`character-total-bosskills`, q],
		fallback,
		defaultValue: 0,
		expire: EXPIRE_5_MIN
	});
};

type CharacterByNameArgs = { realm: string; name: string };
export const getCharacterByName = async (args: CharacterByNameArgs): Promise<Character | null> => {
	const fallback = async () => {
		return api.getCharacterByName(args);
	};

	return withCache<Character | null>({
		deps: [`character`, args],
		fallback,
		defaultValue: null,
		expire: EXPIRE_1_HOUR
	});
};
