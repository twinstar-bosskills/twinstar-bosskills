import { synchronize } from '$lib/server/bin/synchronize-with-api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			try {
				await synchronize({
					onLog: (line: string) => {
						controller.enqueue(encoder.encode(line + '\n'));
					}
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
