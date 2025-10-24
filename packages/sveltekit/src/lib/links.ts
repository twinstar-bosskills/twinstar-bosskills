import { expansionIsCata, realmToExpansion, realmToId } from '@twinstar-bosskills/core/dist/realm';

type SearchParams = {
	difficulty?: number | string;
	spec?: number | string;
	raidlock?: number | string;
};
const withSearchParams = (url: string, query: SearchParams) => {
	const p = new URLSearchParams();
	if (query.difficulty) {
		p.append('difficulty', String(query.difficulty));
	}
	if (query.spec) {
		p.append('spec', String(query.spec));
	}
	if (query.raidlock) {
		p.append('raidlock', String(query.raidlock));
	}
	const ps = p.toString();
	return ps !== '' ? url + '?' + p.toString() : url;
};

const changelog = () => `/changelog`;
const home = (realm: string) => `/${realm}`;
const raids = (realm: string) => `/${realm}/raids`;
const ranks = (realm: string, params: SearchParams = {}) => {
	const url = `/${realm}/ranks`;
	return withSearchParams(url, params);
};
const bossKills = (realm: string) => `/${realm}/boss-kills`;
const character = (realm: string, name: string) =>
	`/${realm}/character/${encodeURIComponent(name)}`;
const characterPerformance = (realm: string, name: string) =>
	`/${realm}/character/${encodeURIComponent(name)}/performance`;
const boss = (realm: string, id: number, params: SearchParams = {}) => {
	const url = `/${realm}/boss/${id}`;
	return withSearchParams(url, params);
};
const bossHistory = (realm: string, id: number, params: SearchParams = {}) => {
	const url = `/${realm}/boss/${id}/history`;
	return withSearchParams(url, params);
};
const bossKill = (realm: string, id: string) => `/${realm}/boss-kills/${id}`;
const twinstarBossKill = (realm: string, id: string) => {
	const expansion = realmToExpansion(realm);
	const realmId = realmToId(realm);
	const bkid = id.replace(`${realmId}_`, '');

	return `https://${
		expansionIsCata(expansion) ? 'cata' : 'mop'
	}-twinhead.twinstar.cz/?boss-kill=${bkid}`;
};
export const twinstarArmory = (realm: string, name: string) =>
	`https://armory.twinstar-wow.com/character?name=${name}&realm=${realm}`;
export const twinstarNPC = (realm: string, id: number) => {
	const expansion = realmToExpansion(realm);
	return `https://${expansionIsCata(expansion) ? 'cata' : 'mop'}-twinhead.twinstar.cz/?npc=${id}`;
};
export const twinstarGuild = (realm: string, guild: string) => {
	const expansion = realmToExpansion(realm);
	return `https://${
		expansionIsCata(expansion) ? 'cata' : 'mop'
	}-twinhead.twinstar.cz/?guild=${encodeURIComponent(guild)}&realm=${realm}`;
};
export const guildToken = (realm: string) => `/${realm}/guild-token`;
export const links = {
	changelog,
	home,
	raids,
	ranks,
	bossKills,
	character,
	characterPerformance,
	boss,
	bossHistory,
	bossKill,
	twinstarBossKill,
	twinstarArmory,
	twinstarNPC,
	twinstarGuild,
	guildToken
};
