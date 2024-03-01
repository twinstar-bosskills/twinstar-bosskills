import { toArrayOfInt, toArrayOfNonEmptyStrings } from '$lib/mapper';
import { getRaids } from '../api';

type Args = { realm: string; url: URL; specs?: number[] };
export const getFilterFormData = async ({ realm, url, specs: specsData }: Args) => {
	const bosses = toArrayOfInt(url.searchParams.getAll('boss'));
	const raids = toArrayOfNonEmptyStrings(url.searchParams.getAll('raid'));
	const difficulties = toArrayOfInt(url.searchParams.getAll('difficulty'));
	const specs = toArrayOfInt(url.searchParams.getAll('spec'));
	const raidData = await getRaids({ realm });
	return {
		data: {
			raids: raidData,
			specs: specsData
		},
		values: {
			bosses,
			raids,
			difficulties,
			specs
		}
	};
};
