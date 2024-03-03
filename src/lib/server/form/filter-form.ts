import { toArrayOfInt, toArrayOfNonEmptyStrings, toIntOrUndefined } from '$lib/mapper';
import type { Boss } from '$lib/model/boss.model';
import type { Raid } from '$lib/model/raid.model';
import { getBosses } from '../model/boss.model';
import { getRaids } from '../model/raid.model';
export type Data = {
	raids: Raid[];
	bosses: Boss[];
	specs?: number[];
	ilvl?: boolean;
};
export type Values = {
	bosses: number[];
	raids: string[];
	difficulties: number[];
	specs?: number[];
	ilvlMin?: number;
	ilvlMax?: number;
};
type Args = { realm: string; url: URL; specs?: number[]; ilvl?: boolean };
export const getFilterFormData = async ({
	realm,
	url,
	specs: specsData,
	ilvl
}: Args): Promise<{ data: Data; values: Values }> => {
	const bosses = toArrayOfInt(url.searchParams.getAll('boss'));
	const raids = toArrayOfNonEmptyStrings(url.searchParams.getAll('raid'));
	const difficulties = toArrayOfInt(url.searchParams.getAll('difficulty'));
	const specs = toArrayOfInt(url.searchParams.getAll('spec'));
	const ilvlMin = toIntOrUndefined(url.searchParams.get('ilvl_min'));
	const ilvlMax = toIntOrUndefined(url.searchParams.get('ilvl_max'));
	const raidData = await getRaids({ realm });
	const bossData = await getBosses({ realm });

	return {
		data: {
			raids: raidData,
			bosses: bossData,
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
