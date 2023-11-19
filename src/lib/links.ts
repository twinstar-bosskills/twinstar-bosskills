import { REALM_HELIOS, REALM_HELIOS_ID } from './realm';

type SearchParams = {
	difficulty?: number | string;
	spec?: number | string;
};
const withSearchParams = (url: string, query: SearchParams) => {
	const p = new URLSearchParams();
	if (query.difficulty) {
		p.append('difficulty', String(query.difficulty));
	}
	if (query.spec) {
		p.append('spec', String(query.spec));
	}
	const ps = p.toString();
	return ps !== '' ? url + '?' + p.toString() : url;
};
const CHARACTERS = '/characters';
const raids = (realm: string) => `/${realm}/raids`;
const bossKills = (realm: string) => `/${realm}/boss-kills`;
const character = (realm: string, name: string) => `/${realm}/character/${name}`;
const boss = (realm: string, id: number, params: SearchParams = {}) => {
	const url = `/${realm}/boss/${id}`;
	return withSearchParams(url, params);
};
const bossKill = (realm: string, id: string) => `/${realm}/boss-kills/${id}`;
const twinstarBossKill = (id: string) => {
	const bkid = id.replace(`${REALM_HELIOS_ID}_`, '');
	return `https://mop-twinhead.twinstar.cz/?boss-kill=${bkid}`;
};
export const twinstarArmory = (name: string) =>
	`https://armory.twinstar-wow.com/character?name=${name}&realm=${REALM_HELIOS}`;
export const twinstarNPC = (id: number) => `https://mop-twinhead.twinstar.cz/?npc=${id}`;
export const twinstarGuild = (guild: string) =>
	`https://mop-twinhead.twinstar.cz/?guild=${encodeURIComponent(guild)}&realm=${REALM_HELIOS}`;
export const links = {
	CHARACTERS,
	raids,
	bossKills,
	character,
	boss,
	bossKill,
	twinstarBossKill,
	twinstarArmory,
	twinstarNPC,
	twinstarGuild
};
