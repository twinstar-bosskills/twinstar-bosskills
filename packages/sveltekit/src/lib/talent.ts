import { realmToExpansion } from './realm';

export const getTalentSpecIconUrl = (realm: string, id: number): string => {
	return `/img/icon?realm=${realm}&type=talent&id=${id}`;
};

export const getRemoteTalentSpecIconUrl = (realm: string, id: number): string => {
	const expansion = realmToExpansion(realm);
	return `https://twinstar-api.twinstar-wow.com/talent/icon/${expansion}/${id}`;
};
