export type PaginatedResponse<T = unknown> = {
	data: T;
	total: number;
};

export const EMPTY_PAGINATED_RESPONSE: PaginatedResponse = { data: [], total: 0 };
