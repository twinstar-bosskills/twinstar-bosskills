import { valuePerSecond } from '@twinstar-bosskills/core/dist/metrics';

const fmt = new Intl.NumberFormat();
export const formatNumber = (value: string | number): string => {
	return fmt.format(Number(value));
};

export const formatValuePerSecond = (
	value: number | string,
	seconds: number,
	def: string = '0'
): string => {
	const v = Number(value);
	if (isNaN(v) === false && isFinite(v)) {
		return formatNumber(valuePerSecond(v, seconds));
	}
	return def;
};
export const formatAvgItemLvl = (value: string | number | null | undefined) => {
	if (value === null || typeof value === undefined) {
		return 'N/A';
	}

	const v = Number(value);
	if (isNaN(v) === false && isFinite(v)) {
		return formatNumber(Math.round(v));
	}
	return 'N/A';
};
