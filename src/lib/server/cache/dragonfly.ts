import { DRAGONFLY_HOST, DRAGONFLY_PORT } from '$env/static/private';
import Redis from 'ioredis';

let globalDf: Redis | null = null;
export const createDragonflyClient = () => {
	if (globalDf === null) {
		globalDf = new Redis({
			host: DRAGONFLY_HOST,
			port: Number(DRAGONFLY_PORT)
		});
	}
	return globalDf!;
};
