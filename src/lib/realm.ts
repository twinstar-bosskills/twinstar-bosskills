export const REALM_HELIOS = 'Helios';
export const REALM_ATHENA = 'Athena';
export const REALM_APOLLO = 'Apollo';
export const REALM_HELIOS_ID = 18;

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
export const realmToExpansion = (realm: string): number => {
	return REALM_TO_EXPANSION[realm] ?? 4;
};
