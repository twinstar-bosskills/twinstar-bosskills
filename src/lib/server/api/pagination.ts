import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '$lib/paginations';
import type { PaginatedResponse } from './response';

type Options = { page?: number; pageSize?: number };
type Fn<T extends unknown[]> = (options: Required<Options>) => Promise<PaginatedResponse<T>>;

export const listAll = async <T extends unknown[]>(
	fn: Fn<T>,
	{ page = DEFAULT_PAGE, pageSize: desiredPageSize = DEFAULT_PAGE_SIZE }: Options = {}
): Promise<T> => {
	if (desiredPageSize <= 0) {
		return [] as any as T;
	}

	const items = [];
	const queue = [];
	try {
		const { data, total } = await fn({ page, pageSize: desiredPageSize });
		const dataLength = data.length;
		// what if you want 1000 items but api will hard limit page size to 100?
		const pageSize = dataLength < desiredPageSize ? dataLength : desiredPageSize;
		items.push(...data);
		if (total > pageSize) {
			const totalPages = Math.ceil(total / pageSize);
			// we already have data of the first (0) page
			// so start at 1
			for (let i = 1; i <= totalPages; ++i) {
				queue.push(fn({ page: i, pageSize }));
			}
		}
	} catch (e) {
		console.error(e);
	}

	const parts = await Promise.all(queue);
	for (const part of parts) {
		items.push(...part.data);
	}

	return items as any as T;
};
