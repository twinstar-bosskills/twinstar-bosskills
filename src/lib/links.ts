import { REALM_HELIOS, REALM_HELIOS_ID } from './realm';

const CHARACTERS = '/characters';
const RAIDS = '/raids';
const BOSS_KILLS = '/boss-kills';
const character = (name: string) => `/character/${name}`;
const boss = (id: number) => `/boss/${id}`;
const bossKill = (id: string) => `/boss-kills/${id}`;
const twinstarBossKill = (id: string) => {
	const bkid = id.replace(`${REALM_HELIOS_ID}_`, '');
	return `https://mop-twinhead.twinstar.cz/?boss-kill=${bkid}`;
};
export const twinstarArmory = (name: string) =>
	`https://armory.twinstar-wow.com/character?name=${name}&realm=${REALM_HELIOS}`;

export const links = {
	CHARACTERS,
	RAIDS,
	BOSS_KILLS,
	character,
	boss,
	bossKill,
	twinstarBossKill,
	twinstarArmory
};
