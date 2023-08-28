export const getRaceIconUrl = ({ race, gender }: { race: number; gender: number }) => {
	return `/img/icon?type=race&id=${race}-${gender}`;
};
export const getRemoteRaceIconUrl = (id: string) => {
	// https://armory.twinstar-wow.com/img/Races/${race}-${gender}.webp
	return `https://armory.twinstar-wow.com/img/Races/${id}.webp`;
};
