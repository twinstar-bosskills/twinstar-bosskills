import { synchronize } from '$lib/server/bin/synchronize-with-api';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let log = [];
	try {
		const result = await synchronize();
		log = result.log;
	} catch (e: any) {
		throw error(500, { message: e?.message ?? '' });
	}

	return json({
		ok: true,
		log
	});
};
