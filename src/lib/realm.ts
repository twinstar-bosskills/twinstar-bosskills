export const REALM_HELIOS = 'Helios';
export const REALM_ATHENA = 'Athena';
export const REALM_APOLLO = 'Apollo';
export const REALM_CATA_PRIVATE_PVE = 'CataPPvE';
export const REALM_HELIOS_ID = 18;
export const REALM_APOLLO_ID = 9;
export const REALM_ATHENA_ID = 19;
export const REALM_CATA_PRIVATE_PVE_ID = 21;

export const REALMS_LOWECASE = {
	[REALM_HELIOS.toLowerCase()]: REALM_HELIOS,
	[REALM_ATHENA.toLowerCase()]: REALM_ATHENA,
	[REALM_APOLLO.toLowerCase()]: REALM_APOLLO,
	[REALM_CATA_PRIVATE_PVE.toLowerCase()]: REALM_CATA_PRIVATE_PVE
};

const REALM_TO_EXPANSION: Record<string, number> = {
	[REALM_HELIOS]: 4,
	[REALM_ATHENA]: 3,
	[REALM_APOLLO]: 3,
	[REALM_CATA_PRIVATE_PVE]: 3
};

const REALM_TO_ID: Record<string, number> = {
	[REALM_HELIOS]: REALM_HELIOS_ID,
	[REALM_ATHENA]: REALM_ATHENA_ID,
	[REALM_APOLLO]: REALM_APOLLO_ID,
	[REALM_CATA_PRIVATE_PVE]: REALM_CATA_PRIVATE_PVE_ID
};

const REALM_MERGED_TO: Record<string, string> = {
	[REALM_APOLLO]: REALM_ATHENA
};

const normalizeRealm = (realm: string) => REALMS_LOWECASE[realm.toLowerCase()] ?? REALM_HELIOS;
export const realmMergedTo = (realm: string): string | undefined => {
	return REALM_MERGED_TO[normalizeRealm(realm)] ?? undefined;
};

export const realmIsPublic = (realm: string) =>
	realm.toLowerCase() !== REALM_CATA_PRIVATE_PVE.toLowerCase();

export const realmIsKnown = (realm: string) =>
	typeof REALMS_LOWECASE[realm.toLowerCase()] !== 'undefined';

export const realmToExpansion = (realm: string): number => {
	return REALM_TO_EXPANSION[normalizeRealm(realm)]!;
};

export const realmToId = (realm: string): number | null => {
	return REALM_TO_ID[normalizeRealm(realm)]!;
};

export const expansionIsCata = (expansion: number) => expansion === 3;

export const expansionIsMoP = (expansion: number) => expansion === 4;
