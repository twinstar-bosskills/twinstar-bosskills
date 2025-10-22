export const toArrayOfInt = (values: string[]): number[] => {
	const result = [];
	for (const raw of values) {
		const v = raw.trim();
		if (v !== '') {
			const n = Number(v);
			if (isFinite(n)) {
				result.push(n);
			}
		}
	}

	return result;
};
export const toArrayOfNonEmptyStrings = (values: string[]): string[] => {
	const result = [];
	for (const raw of values) {
		const v = raw.trim();
		if (v !== '') {
			result.push(v);
		}
	}

	return result;
};

export const toIntOrUndefined = (value: string | null | undefined): number | undefined => {
	if (typeof value !== 'string') {
		return undefined;
	}

	const v = value.trim();
	if (v !== '') {
		const n = Number(v);
		if (isFinite(n)) {
			return n;
		}
	}
	return undefined;
};
