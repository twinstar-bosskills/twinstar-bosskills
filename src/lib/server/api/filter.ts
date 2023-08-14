import { REALM_HELIOS } from '../realm';

export interface Sorter {
	column: string;
	order: 'asc' | 'desc';
}

export enum FilterOperator {
	EQUAL = 'equal',
	ILIKE = 'ilike',
	IN = 'in'
}

export interface Filter {
	column: string;
	value: any;
	operator: FilterOperator;
}

export type QueryArgs = {
	realm?: string;
	page?: number;
	pageSize?: number;
	filters?: Filter[];
	sorter?: Sorter;
};

export const queryString = ({
	filters,
	sorter,
	realm = REALM_HELIOS,
	page = 0,
	pageSize = 100
}: QueryArgs) => {
	const q = new URLSearchParams();

	q.append('realm', realm);
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
