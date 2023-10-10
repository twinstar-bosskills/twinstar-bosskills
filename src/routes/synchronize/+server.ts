import { raidLock } from '$lib/date';
import { synchronize } from '$lib/server/bin/synchronize-with-api';
import { format } from 'date-fns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let startAt: Date | undefined = undefined;
	let offset = 0;
	if (url.searchParams.has('raidLockOffset')) {
		offset = Math.abs(Number(url.searchParams.get('raidLockOffset')));
		offset = isFinite(offset) ? offset : 0;

		const now = new Date();
		const { start } = raidLock(now, offset);
		startAt = start;
	}
	let bosskillIds = url.searchParams.getAll('bosskillIds').map(Number);

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(`raidLockOffset: ${offset}` + '\n');
			controller.enqueue(
				`startAt: ${startAt ? format(startAt, 'yyyy-MM-dd HH:mm:ss') : 'N/A'}` + '\n'
			);
			controller.enqueue(`bosskillIds: ${bosskillIds.join(',')}` + '\n');
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
