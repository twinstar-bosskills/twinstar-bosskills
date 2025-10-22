import { formatNumber } from '$lib/number';
import type { CellContext } from '@tanstack/svelte-table';

export const formatCell = <TData = unknown, TValue = unknown>(info: CellContext<TData, TValue>) => {
	const value = info.getValue();
	if (typeof value === 'number') {
		return formatNumber(value);
	}
	return value;
};
