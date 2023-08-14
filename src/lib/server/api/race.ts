export const getRaceIconUrl = ({ race, gender }: { race: number; gender: number }) => {
	return `https://armory.twinstar-wow.com/img/Races/${race}-${gender}.webp`;
};
