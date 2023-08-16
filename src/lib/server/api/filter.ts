import type { Difficulty } from '$lib/model';
import { REALM_HELIOS } from '../realm';

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
	difficulty?: Difficulty | undefined;
	talentSpec?: number | undefined;
	page?: number;
	pageSize?: number;
	filters?: Filter<TColumn>[];
	sorter?: Sorter<TColumn>;
};

export const queryString = ({
	realm = REALM_HELIOS,
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
