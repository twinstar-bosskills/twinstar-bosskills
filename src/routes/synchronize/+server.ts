import { raidLock } from '$lib/date';
import { synchronize } from '$lib/server/bin/synchronize-with-api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const now = new Date();

	let offset = Math.abs(Number(url.searchParams.get('raidLockOffset') ?? 0));
	offset = isFinite(offset) ? offset : 0;

	const { start: startAt } = raidLock(now, offset);
	let bosskillIds = url.searchParams.getAll('bosskillIds').map(Number);

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			try {
				await synchronize({
					onLog: (line: string) => {
						controller.enqueue(encoder.encode(line + '\n'));
					},
					startAt,
					bosskillIds
				});
			} catch (e: any) {
				controller.enqueue(encoder.encode(`error: ${e.message}` + '\n'));
				console.error(e);
			}
			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream'
		}
	});

	// return json({
	// 	ok: true,
	// 	log
	// });
};
