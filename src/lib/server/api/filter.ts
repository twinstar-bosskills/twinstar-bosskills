import { REALM_HELIOS } from '../../realm';

export interface Sorter<TColumn = string> {
	column: TColumn;
	order: 'asc' | 'desc';
}

export enum FilterOperator {
	EQUALS = 'equals',
	ILIKE = 'ilike',
	IN = 'in'
}

export interface Filter<TColumn = string> {
	column: TColumn;
	value: any;
	operator: FilterOperator;
}

export type QueryArgs<TColumn = string> = {
	realm?: string;
	map?: string;
	guid?: number;
	name?: string;
	difficulty?: number | undefined;
	talentSpec?: number | undefined;
	page?: number;
	pageSize?: number;
	filters?: Filter<TColumn>[];
	sorter?: Sorter<TColumn>;
};

export const queryString = ({
	realm = REALM_HELIOS,
	map,
	guid,
	name,
	difficulty,
	talentSpec,
	page = 0,
	pageSize = 100,
	filters,
	sorter
}: QueryArgs) => {
	const q = new URLSearchParams();

	q.append('realm', realm);
	if (typeof difficulty !== 'undefined') {
		q.append('mode', String(difficulty));
	}
	if (typeof map !== 'undefined') {
		q.append('map', map);
	}
	if (typeof guid !== 'undefined') {
		q.append('guid', String(guid));
	}
	if (typeof name !== 'undefined') {
		q.append('name', name);
	}
	if (typeof talentSpec !== 'undefined') {
		q.append('talent_spec', String(talentSpec));
	}
	q.append('page', String(page));
	q.append('pageSize', String(pageSize));
	if (filters && filters.length > 0) {
		q.append('filters', JSON.stringify(filters));
	}
	if (sorter) {
		q.append('sorter', JSON.stringify(sorter));
	}

	return q.toString();
};
