export const getTalentSpecIconUrl = (id: number): string => {
	return `/img/icon?type=talent&id=${id}`;
};

export const getRemoteTalentSpecIconUrl = (id: number): string => {
	return `https://twinstar-api.twinstar-wow.com/talent/icon/4/${id}`;
};
