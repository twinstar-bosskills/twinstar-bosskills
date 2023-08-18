export const valuePerSecond = (value: number, seconds: number) => {
	return seconds > 0 ? Math.round((1000 * value) / seconds) : 0;
};
