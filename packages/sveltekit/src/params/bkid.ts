import type { ParamMatcher } from '@sveltejs/kit';

const BKID_REGEXP = /^[0-9]+_[0-9]+$/;
const match: ParamMatcher = (param) => {
	return BKID_REGEXP.test(param);
};
export { match };
