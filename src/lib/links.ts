export const CHARACTERS = '/characters';
export const RAIDS = '/raids';
export const BOSS_KILLS = '/boss-kills';
export const character = (name: string) => `/character/${name}`;
export const boss = (id: number) => `/boss/${id}`;
export const bossKill = (id: string) => `/boss-kills/${id}`;

export const links = {
	CHARACTERS,
	RAIDS,
	BOSS_KILLS,
	character,
	boss,
	bossKill
};
