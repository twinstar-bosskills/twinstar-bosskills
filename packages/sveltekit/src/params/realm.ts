import { REALMS_LOWER_CASE } from '$lib/realm';
import type { ParamMatcher } from '@sveltejs/kit';

const match: ParamMatcher = (param) => {
	const realm = REALMS_LOWER_CASE[param.toLowerCase()] ?? false;
	if (realm) {
		return true;
	}
	return false;
};
export { match };
