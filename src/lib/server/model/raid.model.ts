import { withCache } from '../cache';
import { findByRealm } from '../db/raid';

export const getRaids = async (args: { realm: string }) => {
	const fallback = () => findByRealm(args);

	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/raid/getRaids', args],
		fallback,
		defaultValue: []
	});
};
