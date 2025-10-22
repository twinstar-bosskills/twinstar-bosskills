export const getClassIconUrl = (id: number) => {
	return `/img/icon?type=class&id=${id}`;
};

export const getRemoteClassIconUrl = (id: number) => {
	return `https://armory.twinstar-wow.com/img/Classes/${id}.webp`;
};
