export const getDifficulty = (v: string | number | null): number | undefined => {
	if (v === null) {
		return undefined;
	}

	let mode = Number(v);
	return isFinite(mode) && mode >= 0 ? mode : undefined;
};
export const getDifficultyFromUrl = (url: URL) => {
	return getDifficulty(url.searchParams.get('difficulty'));
};
export const getSpecFromUrl = (url: URL) => {
	let spec = Number(url.searchParams.get('spec'));
	return isFinite(spec) && spec > 0 ? spec : undefined;
};
export const getSpecsFromUrl = (url: URL, talentSpecs: number[]) => {
	let searchParams = new URLSearchParams(url.searchParams);
	const current = getSpecFromUrl(url);

	const items: { id: number; href: string; isActive: boolean }[] = [];
	for (const id of talentSpecs) {
		const isActive = current === id;
		searchParams.set('spec', String(id));
		items.push({
			id,
			href: `?${searchParams}`,
			isActive
		});
	}

	searchParams.delete('spec');
	const reset = `?${searchParams}`;

	return {
		current,
		items,
		reset
	};
};
