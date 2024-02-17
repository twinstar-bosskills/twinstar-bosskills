import { expansionIsCata, realmToExpansion, realmToId } from './realm';

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

const raids = (realm: string) => `/${realm}/raids`;
const bossKills = (realm: string) => `/${realm}/boss-kills`;
const character = (realm: string, name: string) =>
	`/${realm}/character/${encodeURIComponent(name)}`;
const characterPerformance = (realm: string, name: string) =>
	`/${realm}/character/${encodeURIComponent(name)}/performance`;
const boss = (realm: string, id: number, params: SearchParams = {}) => {
	const url = `/${realm}/boss/${id}`;
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
export const links = {
	raids,
	bossKills,
	character,
	characterPerformance,
	boss,
	bossKill,
	twinstarBossKill,
	twinstarArmory,
	twinstarNPC,
	twinstarGuild
};
