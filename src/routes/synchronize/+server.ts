import { raidLock } from '$lib/date';
import { synchronize } from '$lib/server/bin/synchronize-with-api';
import { format } from 'date-fns';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	let startAt: Date | undefined = undefined;
	let raidLockOffset = 0;
	if (url.searchParams.has('raidLockOffset')) {
		raidLockOffset = Math.abs(Number(url.searchParams.get('raidLockOffset')));
		raidLockOffset = isFinite(raidLockOffset) ? raidLockOffset : 0;

		const now = new Date();
		const { start } = raidLock(now, raidLockOffset);
		startAt = start;
	}
	let bosskillIds = url.searchParams.getAll('bosskillIds').map(Number);
	let bossIds = url.searchParams.getAll('bossIds').map(Number);
	let page = url.searchParams.has('page') ? Number(url.searchParams.get('page')) : undefined;
	let pageSize = url.searchParams.has('pageSize')
		? Number(url.searchParams.get('pageSize'))
		: undefined;

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(`raidLockOffset: ${raidLockOffset}` + '\n');
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
					bosskillIds,
					bossIds,
					page,
					pageSize
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
};
