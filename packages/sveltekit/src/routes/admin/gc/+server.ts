import { json } from '@sveltejs/kit';
import { memoryUsage, safeGC } from '@twinstar-bosskills/core/dist/gc';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const before = memoryUsage();
	safeGC();
	const after = memoryUsage();
	return json({
		before,
		after
	});
};
