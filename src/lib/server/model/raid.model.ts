import { findByRealm } from '../db/raid';

export const getRaids = async ({ realm }: { realm: string }) => {
	return findByRealm({ realm });
};
