import type { ParamMatcher } from '@sveltejs/kit';

const match: ParamMatcher = (param) => {
	const v = Number(param);
	if (isFinite(v) && isNaN(v) === false) {
		return true;
	}
	return false;
};
export { match };
