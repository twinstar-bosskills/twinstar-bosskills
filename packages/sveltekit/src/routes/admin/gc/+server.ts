import { memoryUsage, safeGC } from '$lib/server/gc';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const before = memoryUsage();
	safeGC();
	const after = memoryUsage();
	return json({
		before,
		after
	});
};
