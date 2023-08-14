export type Response<T = unknown> = {
	data: T;
	total: number;
};

export const EMPTY_RESPONSE: Response = { data: [], total: 0 };
