export const REALM_HELIOS = 'Helios';
export const REALM_ATHENA = 'Athena';
export const REALM_APOLLO = 'Apollo';
export const REALM_HELIOS_ID = 18;
export const REALM_APOLLO_ID = 9;
export const REALM_ATHENA_ID = 19;

export const REALMS_LOWECASE = {
	[REALM_HELIOS.toLowerCase()]: REALM_HELIOS,
	[REALM_ATHENA.toLowerCase()]: REALM_ATHENA,
	[REALM_APOLLO.toLowerCase()]: REALM_APOLLO
};
const REALM_TO_EXPANSION: Record<string, number> = {
	[REALM_HELIOS]: 4,
	[REALM_ATHENA]: 3,
	[REALM_APOLLO]: 3
};
const REALM_TO_ID: Record<string, number> = {
	[REALM_HELIOS]: REALM_HELIOS_ID,
	[REALM_ATHENA]: REALM_ATHENA_ID,
	[REALM_APOLLO]: REALM_APOLLO_ID
};
export const realmIsKnown = (realm: string) =>
	typeof REALMS_LOWECASE[realm.toLowerCase()] !== 'undefined';
export const realmToExpansion = (realm: string): number => {
	const lc = REALMS_LOWECASE[realm.toLowerCase()] ?? REALM_HELIOS;
	return REALM_TO_EXPANSION[lc]!;
};

export const realmToId = (realm: string): number | null => {
	const lc = REALMS_LOWECASE[realm.toLowerCase()] ?? REALM_HELIOS;
	return REALM_TO_ID[lc]!;
};
export const expansionIsCata = (expansion: number) => expansion === 3;
export const expansionIsMoP = (expansion: number) => expansion === 4;
