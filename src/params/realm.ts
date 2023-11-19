import { REALMS_LOWECASE } from '$lib/realm';
import type { ParamMatcher } from '@sveltejs/kit';

const match: ParamMatcher = (param) => {
	const realm = REALMS_LOWECASE[param.toLowerCase()] ?? false;
	if (realm) {
		return true;
	}
	return false;
};
export { match };
