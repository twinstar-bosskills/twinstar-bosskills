import { withCache } from '../cache';
import { findByRealm, getByRemoteIdAndRealm } from '../db/boss';
export const getBosses = async (args: { realm: string }) => {
	const fallback = () => findByRealm(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/boss/getBosses', args],
		fallback,
		defaultValue: []
	});
};

export const getBoss = async (args: { remoteId: number; realm: string }) => {
	const fallback = () => getByRemoteIdAndRealm(args);
	return withCache<Awaited<ReturnType<typeof fallback>>>({
		deps: ['model/boss/getBoss', args],
		fallback,
		defaultValue: null
	});
};
