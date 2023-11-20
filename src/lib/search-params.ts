export const getDifficulty = (v: string | number | null): number | null => {
	if (v === null) {
		return v;
	}

	let mode = Number(v);
	return isFinite(mode) && mode >= 0 ? mode : null;
};
export const getDifficultyFromUrl = (url: URL) => {
	return getDifficulty(url.searchParams.get('difficulty'));
};
