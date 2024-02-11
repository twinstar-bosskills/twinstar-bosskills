export const getRaidIconUrl = (name: string) => {
	return `/img/icon?type=raid&id=${encodeURIComponent(name).replace("'", '%27')}`;
};

export const getRemoteRaidIconUrl = (name: string) => {
	const lc = name.toLowerCase().replace("'", '').replace(/\s+/g, '-');
	// https://twinstar-api.twinstar-wow.com/img/raids/mogushan-vaults-small.avif
	return `https://twinstar-api.twinstar-wow.com/img/raids/${lc}-small.avif`;
};
