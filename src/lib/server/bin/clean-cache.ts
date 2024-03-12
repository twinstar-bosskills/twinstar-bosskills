import { createDragonflyClient } from '../cache/dragonfly';

try {
	const client = createDragonflyClient();
	await client.flushall();

	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
