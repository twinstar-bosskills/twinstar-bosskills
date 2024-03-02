import { toArrayOfInt, toArrayOfNonEmptyStrings, toIntOrUndefined } from '$lib/mapper';
import { getRaids } from '../api';

type Args = { realm: string; url: URL; specs?: number[]; ilvl?: boolean };
export const getFilterFormData = async ({ realm, url, specs: specsData, ilvl }: Args) => {
	const bosses = toArrayOfInt(url.searchParams.getAll('boss'));
	const raids = toArrayOfNonEmptyStrings(url.searchParams.getAll('raid'));
	const difficulties = toArrayOfInt(url.searchParams.getAll('difficulty'));
	const specs = toArrayOfInt(url.searchParams.getAll('spec'));
	const ilvlMin = toIntOrUndefined(url.searchParams.get('ilvl_min'));
	const ilvlMax = toIntOrUndefined(url.searchParams.get('ilvl_max'));
	const raidData = await getRaids({ realm });
	return {
		data: {
			raids: raidData,
			specs: specsData,
			ilvl
		},
		values: {
			bosses,
			raids,
			difficulties,
			specs,
			ilvlMin,
			ilvlMax
		}
	};
};
