const fmt = new Intl.NumberFormat();
export const formatNumber = (value: string | number): string => {
	return fmt.format(Number(value));
};
