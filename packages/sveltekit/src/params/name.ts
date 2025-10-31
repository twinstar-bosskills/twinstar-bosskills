import type { ParamMatcher } from '@sveltejs/kit';

const NAME_REGEXP = /^[A-z0-9]{1,20}$/;
const match: ParamMatcher = (param) => {
	return NAME_REGEXP.test(param);
};
export { match };
