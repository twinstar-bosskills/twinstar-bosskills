import { getByRemoteIdAndRealm } from '../db/boss';
import { findByRealm } from '../db/raid';
export const getBosses = async ({ realm }: { realm: string }) => {
	return findByRealm({ realm });
};

export const getBoss = async ({ remoteId, realm }: { remoteId: number; realm: string }) => {
	return getByRemoteIdAndRealm({ remoteId, realm });
};
