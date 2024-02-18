import { toArrayOfInt, toArrayOfNonEmptyStrings } from '$lib/mapper';
import { getRaids } from '../api';

type Args = { realm: string; url: URL };
export const getFilterFormData = async ({ realm, url }: Args) => {
	const bosses = toArrayOfInt(url.searchParams.getAll('boss'));
	const raids = toArrayOfNonEmptyStrings(url.searchParams.getAll('raid'));
	const difficulties = toArrayOfInt(url.searchParams.getAll('difficulty'));
	const raidData = await getRaids({ realm });
	return {
		data: {
			raids: raidData
		},
		values: {
			bosses,
			raids,
			difficulties
		}
	};
};
