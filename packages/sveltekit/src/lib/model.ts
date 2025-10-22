import { expansionIsCata, expansionIsMoP } from './realm';

const DifficultyMoP = {
	DIFFICULTY_NONE: 0,

	DIFFICULTY_NORMAL: 1,
	DIFFICULTY_HEROIC: 2,
	DIFFICULTY_10_N: 3,
	DIFFICULTY_25_N: 4,
	DIFFICULTY_10_HC: 5,
	DIFFICULTY_25_HC: 6,
	DIFFICULTY_LFR: 7,
	DIFFICULTY_CHALLENGE: 8,
	DIFFICULTY_40: 9,
	DIFFICULTY_HC_SCENARIO: 11,
	DIFFICULTY_N_SCENARIO: 12,
	DIFFICULTY_FLEX: 14,

	MAX_DIFFICULTY: 15
};

const DifficultyCata = {
	// DIFFICULTY_REGULAR: 0,

	// DIFFICULTY_NORMAL: 0,
	// DIFFICULTY_HEROIC: 1,
	// DIFFICULTY_EPIC: 2,

	DIFFICULTY_10_N: 0,
	DIFFICULTY_25_N: 1,
	DIFFICULTY_10_HC: 2,
	DIFFICULTY_25_HC: 3
};

export const defaultDifficultyByExpansion = (expansion: number): number => {
	if (expansionIsMoP(expansion)) {
		return DifficultyMoP.DIFFICULTY_10_N;
	}

	if (expansionIsCata(expansion)) {
		return DifficultyCata.DIFFICULTY_10_N;
	}

	return 0;
};

export const difficultiesByExpansion = (
	expansion: number
): typeof DifficultyMoP | typeof DifficultyCata | null => {
	if (expansionIsMoP(expansion)) {
		return DifficultyMoP;
	}

	if (expansionIsCata(expansion)) {
		return DifficultyCata;
	}

	return null;
};

export const getPerformaceDifficultiesByExpansion = (expansion: number): number[] => {
	if (expansionIsMoP(expansion)) {
		return [
			DifficultyMoP.DIFFICULTY_10_N,
			DifficultyMoP.DIFFICULTY_10_HC,
			DifficultyMoP.DIFFICULTY_25_N,
			DifficultyMoP.DIFFICULTY_25_HC
		];
	}

	if (expansionIsCata(expansion)) {
		return [
			DifficultyCata.DIFFICULTY_10_N,
			DifficultyCata.DIFFICULTY_10_HC,
			DifficultyCata.DIFFICULTY_25_N,
			DifficultyCata.DIFFICULTY_25_HC
		];
	}

	return [];
};

const DIFFICULTY_MOP_TO_STRING = {
	[DifficultyMoP.DIFFICULTY_NONE]: 'None',
	[DifficultyMoP.DIFFICULTY_NORMAL]: 'N',
	[DifficultyMoP.DIFFICULTY_HEROIC]: 'HC',
	[DifficultyMoP.DIFFICULTY_10_N]: '10 N',
	[DifficultyMoP.DIFFICULTY_25_N]: '25 N',
	[DifficultyMoP.DIFFICULTY_10_HC]: '10 HC',
	[DifficultyMoP.DIFFICULTY_25_HC]: '25 HC',
	[DifficultyMoP.DIFFICULTY_LFR]: 'LFR',
	[DifficultyMoP.DIFFICULTY_CHALLENGE]: 'Challenge',
	[DifficultyMoP.DIFFICULTY_40]: '40',
	[DifficultyMoP.DIFFICULTY_HC_SCENARIO]: 'Scenario HC',
	[DifficultyMoP.DIFFICULTY_N_SCENARIO]: 'Scenario N',
	[DifficultyMoP.DIFFICULTY_FLEX]: 'Flex',
	[DifficultyMoP.MAX_DIFFICULTY]: 'Max'
};

const DIFFICULTY_CATA_TO_STRING = {
	// [DifficultyCata.DIFFICULTY_REGULAR]: 'Regular',
	// [DifficultyCata.DIFFICULTY_NORMAL]: 'N',
	// [DifficultyCata.DIFFICULTY_HEROIC]: 'HC',
	[DifficultyCata.DIFFICULTY_10_N]: '10 N',
	[DifficultyCata.DIFFICULTY_25_N]: '25 N',
	[DifficultyCata.DIFFICULTY_10_HC]: '10 HC',
	[DifficultyCata.DIFFICULTY_25_HC]: '25 HC'
};
export const difficultyToString = (expansion: number, diff: string | number): string => {
	if (expansionIsMoP(expansion)) {
		return DIFFICULTY_MOP_TO_STRING[diff as number] ?? 'None';
	}

	if (expansionIsCata(expansion)) {
		return DIFFICULTY_CATA_TO_STRING[diff as number] ?? 'None';
	}
	return 'None';
};

const isRaidDifficultyMoP = (diff: number) => {
	return (
		diff === DifficultyMoP.DIFFICULTY_10_N ||
		diff === DifficultyMoP.DIFFICULTY_10_HC ||
		diff === DifficultyMoP.DIFFICULTY_25_N ||
		diff === DifficultyMoP.DIFFICULTY_25_HC ||
		diff === DifficultyMoP.DIFFICULTY_LFR ||
		diff === DifficultyMoP.DIFFICULTY_FLEX
	);
};

const isRaidDifficultyCata = (diff: number) => {
	return (
		diff === DifficultyCata.DIFFICULTY_10_N ||
		diff === DifficultyCata.DIFFICULTY_10_HC ||
		diff === DifficultyCata.DIFFICULTY_25_N ||
		diff === DifficultyCata.DIFFICULTY_25_HC
	);
};
export const isRaidDifficulty = (expansion: number, diff: number) => {
	if (expansionIsMoP(expansion)) {
		return isRaidDifficultyMoP(diff);
	}

	if (expansionIsCata(expansion)) {
		return isRaidDifficultyCata(diff);
	}
	return false;
};
export const isRaidDifficultyWithLoot = (expansion: number, diff: number) => {
	if (expansionIsMoP(expansion)) {
		return isRaidDifficultyMoP(diff) && diff !== DifficultyMoP.DIFFICULTY_LFR;
	}

	if (expansionIsCata(expansion)) {
		return isRaidDifficultyCata(diff);
	}
	return false;
};
enum Class {
	WARRIOR = 1,
	PALADIN = 2,
	HUNTER = 3,
	ROGUE = 4,
	PRIEST = 5,
	DK = 6,
	SHAMAN = 7,
	MAGE = 8,
	WARLOCK = 9,
	MONK = 10,
	DRUID = 11
}

const CLASS_TO_STRING: Record<Class, string> = {
	[Class.MAGE]: 'Mage',
	[Class.WARRIOR]: 'Warrior',
	[Class.WARLOCK]: 'Warlock',
	[Class.PRIEST]: 'Priest',
	[Class.DRUID]: 'Druid',
	[Class.ROGUE]: 'Rogue',
	[Class.HUNTER]: 'Hunter',
	[Class.PALADIN]: 'Paladin',
	[Class.SHAMAN]: 'Shaman',
	[Class.DK]: 'Death Knight',
	[Class.MONK]: 'Monk'
};

export const classToString = (cls: number): string => {
	return CLASS_TO_STRING[cls as Class] ?? 'Unknown class';
};

enum Race {
	HUMAN = 1,
	ORC = 2,
	DWARF = 3,
	NELF = 4,
	UNDEAD = 5,
	TAUREN = 6,
	GNOME = 7,
	TROLL = 8,
	GOBLIN = 9,
	BELF = 10,
	DRAENEI = 11,
	PANDA_NEUTRAL = 24,
	PANDA_HORDE = 25,
	PANDA_ALI = 26
}

const RACE_TO_STRING: Record<Race, string> = {
	[Race.HUMAN]: 'Human',
	[Race.ORC]: 'Orc',
	[Race.DWARF]: 'Dwarf',
	[Race.NELF]: 'Night Elf',
	[Race.UNDEAD]: 'Undead',
	[Race.TAUREN]: 'Tauren',
	[Race.GNOME]: 'Gnome',
	[Race.TROLL]: 'Troll',
	[Race.GOBLIN]: 'Goblin',
	[Race.BELF]: 'Blood Elf',
	[Race.DRAENEI]: 'Draenei',
	[Race.PANDA_NEUTRAL]: 'Pandaren',
	[Race.PANDA_HORDE]: 'Pandaren',
	[Race.PANDA_ALI]: 'Pandaren'
};

export const raceToString = (race: number): string => {
	return RACE_TO_STRING[race as Race] ?? 'Unknown race';
};

/**
 * @link https://wow.tools/dbc/?dbc=chrspecialization&build=5.4.8.18273#page=1
 */
export const TalentSpecMoP = {
	MAGE_ARCANE: 62,
	MAGE_FIRE: 63,
	MAGE_FROST: 64,

	PALADIN_HOLY: 65,
	PALADIN_PROT: 66,
	PALADIN_RET: 70,

	WARR_ARMS: 71,
	WARR_FURY: 72,
	WARR_PROT: 73,

	DRUID_BALA: 102,
	DRUID_CAT: 103,
	DRUID_BEAR: 104,
	DRUID_RESTO: 105,

	DK_BLOOD: 250,
	DK_FROST: 251,
	DK_UNHOLY: 252,

	HUNTER_BM: 253,
	HUNTER_MM: 254,
	HUNTER_SURV: 255,

	PRIEST_DISC: 256,
	PRIEST_HOLY: 257,
	PRIEST_SHADOW: 258,

	ROGUE_ASSA: 259,
	ROGUE_COMBAT: 260,
	ROGUE_SUB: 261,

	SHAMAN_ELE: 262,
	SHAMAN_ENHA: 263,
	SHAMAN_RESTO: 264,

	WARLOCK_AFFLI: 265,
	WARLOCK_DEMO: 266,
	WARLOCK_DESTO: 267,

	MONK_BREWMASTER: 268,
	MONK_WINDWALKER: 269,
	MONK_MISTWEAVER: 270
};

/**
 * @link https://wow.tools/dbc/?dbc=talenttab&build=4.3.4.15595#page=1
 */
export const TalentSpecCata = {
	MAGE_ARCANE: 799,
	MAGE_FIRE: 851,
	MAGE_FROST: 823,

	WARR_ARMS: 746,
	WARR_FURY: 815,
	WARR_PROT: 845,

	PALADIN_HOLY: 831,
	PALADIN_PROT: 839,
	PALADIN_RET: 855,

	DRUID_RESTO: 748,
	DRUID_BALA: 752,
	DRUID_FERAL: 750,

	DK_BLOOD: 398,
	DK_FROST: 399,
	DK_UNHOLY: 400,

	HUNTER_BM: 811,
	HUNTER_MM: 807,
	HUNTER_SURV: 809,

	PRIEST_DISC: 760,
	PRIEST_HOLY: 813,
	PRIEST_SHADOW: 795,

	ROGUE_ASSA: 181,
	ROGUE_COMBAT: 182,
	ROGUE_SUB: 183,

	SHAMAN_ELE: 261,
	SHAMAN_ENHA: 263,
	SHAMAN_RESTO: 262,

	WARLOCK_AFFLI: 871,
	WARLOCK_DEMO: 867,
	WARLOCK_DESTO: 865
};

export const talentSpecsByExpansion = (
	expansion: number
): typeof TalentSpecMoP | typeof TalentSpecCata | null => {
	if (expansionIsMoP(expansion)) {
		return TalentSpecMoP;
	}

	if (expansionIsCata(expansion)) {
		return TalentSpecCata;
	}

	return null;
};

const TALENT_SPEC_MOP_TO_STRING = {
	[TalentSpecMoP.MAGE_ARCANE]: 'Arcane',
	[TalentSpecMoP.MAGE_FIRE]: 'Fire',
	[TalentSpecMoP.MAGE_FROST]: 'Frost (Mage)',
	[TalentSpecMoP.PALADIN_HOLY]: 'Holy (Paladin)',
	[TalentSpecMoP.PALADIN_PROT]: 'Protection (Paladin)',
	[TalentSpecMoP.PALADIN_RET]: 'Retribution',
	[TalentSpecMoP.WARR_ARMS]: 'Arms',
	[TalentSpecMoP.WARR_FURY]: 'Fury',
	[TalentSpecMoP.WARR_PROT]: 'Protection (Warrior)',
	[TalentSpecMoP.DRUID_BALA]: 'Balance',
	[TalentSpecMoP.DRUID_CAT]: 'Feral',
	[TalentSpecMoP.DRUID_BEAR]: 'Guardian',
	[TalentSpecMoP.DRUID_RESTO]: 'Restoration (Druid)',
	[TalentSpecMoP.DK_BLOOD]: 'Blood',
	[TalentSpecMoP.DK_FROST]: 'Frost (Death Knight)',
	[TalentSpecMoP.DK_UNHOLY]: 'Unholy',
	[TalentSpecMoP.HUNTER_BM]: 'Beast Mastery',
	[TalentSpecMoP.HUNTER_MM]: 'Marksmanship',
	[TalentSpecMoP.HUNTER_SURV]: 'Survival',
	[TalentSpecMoP.PRIEST_DISC]: 'Discipline',
	[TalentSpecMoP.PRIEST_HOLY]: 'Holy (Priest)',
	[TalentSpecMoP.PRIEST_SHADOW]: 'Shadow',
	[TalentSpecMoP.ROGUE_ASSA]: 'Assasination',
	[TalentSpecMoP.ROGUE_COMBAT]: 'Combat',
	[TalentSpecMoP.ROGUE_SUB]: 'Subtlety',
	[TalentSpecMoP.SHAMAN_ELE]: 'Elemental',
	[TalentSpecMoP.SHAMAN_ENHA]: 'Enhancement',
	[TalentSpecMoP.SHAMAN_RESTO]: 'Restoration (Shaman)',
	[TalentSpecMoP.WARLOCK_AFFLI]: 'Affliction',
	[TalentSpecMoP.WARLOCK_DEMO]: 'Demonology',
	[TalentSpecMoP.WARLOCK_DESTO]: 'Destruction',
	[TalentSpecMoP.MONK_BREWMASTER]: 'Brewmaster',
	[TalentSpecMoP.MONK_WINDWALKER]: 'Windwalker',
	[TalentSpecMoP.MONK_MISTWEAVER]: 'Mistweaver'
};

const TALENT_SPEC_CATA_TO_STRING = {
	[TalentSpecCata.MAGE_ARCANE]: 'Arcane',
	[TalentSpecCata.MAGE_FIRE]: 'Fire',
	[TalentSpecCata.MAGE_FROST]: 'Frost (Mage)',
	[TalentSpecCata.PALADIN_HOLY]: 'Holy (Paladin)',
	[TalentSpecCata.PALADIN_PROT]: 'Protection (Paladin)',
	[TalentSpecCata.PALADIN_RET]: 'Retribution',
	[TalentSpecCata.WARR_ARMS]: 'Arms',
	[TalentSpecCata.WARR_FURY]: 'Fury',
	[TalentSpecCata.WARR_PROT]: 'Protection (Warrior)',
	[TalentSpecCata.DRUID_BALA]: 'Balance',
	[TalentSpecCata.DRUID_FERAL]: 'Feral',
	[TalentSpecCata.DRUID_RESTO]: 'Restoration (Druid)',
	[TalentSpecCata.DK_BLOOD]: 'Blood',
	[TalentSpecCata.DK_FROST]: 'Frost (Death Knight)',
	[TalentSpecCata.DK_UNHOLY]: 'Unholy',
	[TalentSpecCata.HUNTER_BM]: 'Beast Mastery',
	[TalentSpecCata.HUNTER_MM]: 'Marksmanship',
	[TalentSpecCata.HUNTER_SURV]: 'Survival',
	[TalentSpecCata.PRIEST_DISC]: 'Discipline',
	[TalentSpecCata.PRIEST_HOLY]: 'Holy (Priest)',
	[TalentSpecCata.PRIEST_SHADOW]: 'Shadow',
	[TalentSpecCata.ROGUE_ASSA]: 'Assasination',
	[TalentSpecCata.ROGUE_COMBAT]: 'Combat',
	[TalentSpecCata.ROGUE_SUB]: 'Subtlety',
	[TalentSpecCata.SHAMAN_ELE]: 'Elemental',
	[TalentSpecCata.SHAMAN_ENHA]: 'Enhancement',
	[TalentSpecCata.SHAMAN_RESTO]: 'Restoration (Shaman)',
	[TalentSpecCata.WARLOCK_AFFLI]: 'Affliction',
	[TalentSpecCata.WARLOCK_DEMO]: 'Demonology',
	[TalentSpecCata.WARLOCK_DESTO]: 'Destruction'
};

export const talentSpecToString = (expansion: number, spec: number): string => {
	if (expansionIsMoP(expansion)) {
		return talentSpecMoPcToString(spec);
	}

	if (expansionIsCata(expansion)) {
		return talentSpecCataToString(spec);
	}

	return 'Unknown spec';
};

const talentSpecMoPcToString = (spec: number): string => {
	return TALENT_SPEC_MOP_TO_STRING[spec] ?? 'Unknown spec';
};

const talentSpecCataToString = (spec: number): string => {
	return TALENT_SPEC_CATA_TO_STRING[spec] ?? 'Unknown spec';
};

const TALENT_SPEC_MOP_TO_CLASS = {
	[TalentSpecMoP.MAGE_ARCANE]: Class.MAGE,
	[TalentSpecMoP.MAGE_FIRE]: Class.MAGE,
	[TalentSpecMoP.MAGE_FROST]: Class.MAGE,

	[TalentSpecMoP.PALADIN_HOLY]: Class.PALADIN,
	[TalentSpecMoP.PALADIN_PROT]: Class.PALADIN,
	[TalentSpecMoP.PALADIN_RET]: Class.PALADIN,

	[TalentSpecMoP.WARR_ARMS]: Class.WARRIOR,
	[TalentSpecMoP.WARR_FURY]: Class.WARRIOR,
	[TalentSpecMoP.WARR_PROT]: Class.WARRIOR,

	[TalentSpecMoP.DRUID_BALA]: Class.DRUID,
	[TalentSpecMoP.DRUID_CAT]: Class.DRUID,
	[TalentSpecMoP.DRUID_BEAR]: Class.DRUID,
	[TalentSpecMoP.DRUID_RESTO]: Class.DRUID,

	[TalentSpecMoP.DK_BLOOD]: Class.DK,
	[TalentSpecMoP.DK_FROST]: Class.DK,
	[TalentSpecMoP.DK_UNHOLY]: Class.DK,

	[TalentSpecMoP.HUNTER_BM]: Class.HUNTER,
	[TalentSpecMoP.HUNTER_MM]: Class.HUNTER,
	[TalentSpecMoP.HUNTER_SURV]: Class.HUNTER,

	[TalentSpecMoP.PRIEST_DISC]: Class.PRIEST,
	[TalentSpecMoP.PRIEST_HOLY]: Class.PRIEST,
	[TalentSpecMoP.PRIEST_SHADOW]: Class.PRIEST,

	[TalentSpecMoP.ROGUE_ASSA]: Class.ROGUE,
	[TalentSpecMoP.ROGUE_COMBAT]: Class.ROGUE,
	[TalentSpecMoP.ROGUE_SUB]: Class.ROGUE,

	[TalentSpecMoP.SHAMAN_ELE]: Class.SHAMAN,
	[TalentSpecMoP.SHAMAN_ENHA]: Class.SHAMAN,
	[TalentSpecMoP.SHAMAN_RESTO]: Class.SHAMAN,

	[TalentSpecMoP.WARLOCK_AFFLI]: Class.WARLOCK,
	[TalentSpecMoP.WARLOCK_DEMO]: Class.WARLOCK,
	[TalentSpecMoP.WARLOCK_DESTO]: Class.WARLOCK,

	[TalentSpecMoP.MONK_BREWMASTER]: Class.MONK,
	[TalentSpecMoP.MONK_WINDWALKER]: Class.MONK,
	[TalentSpecMoP.MONK_MISTWEAVER]: Class.MONK
};

const TALENT_SPEC_CATA_TO_CLASS = {
	[TalentSpecCata.MAGE_ARCANE]: Class.MAGE,
	[TalentSpecCata.MAGE_FIRE]: Class.MAGE,
	[TalentSpecCata.MAGE_FROST]: Class.MAGE,

	[TalentSpecCata.PALADIN_HOLY]: Class.PALADIN,
	[TalentSpecCata.PALADIN_PROT]: Class.PALADIN,
	[TalentSpecCata.PALADIN_RET]: Class.PALADIN,

	[TalentSpecCata.WARR_ARMS]: Class.WARRIOR,
	[TalentSpecCata.WARR_FURY]: Class.WARRIOR,
	[TalentSpecCata.WARR_PROT]: Class.WARRIOR,

	[TalentSpecCata.DRUID_BALA]: Class.DRUID,
	[TalentSpecCata.DRUID_FERAL]: Class.DRUID,
	[TalentSpecCata.DRUID_RESTO]: Class.DRUID,

	[TalentSpecCata.DK_BLOOD]: Class.DK,
	[TalentSpecCata.DK_FROST]: Class.DK,
	[TalentSpecCata.DK_UNHOLY]: Class.DK,

	[TalentSpecCata.HUNTER_BM]: Class.HUNTER,
	[TalentSpecCata.HUNTER_MM]: Class.HUNTER,
	[TalentSpecCata.HUNTER_SURV]: Class.HUNTER,

	[TalentSpecCata.PRIEST_DISC]: Class.PRIEST,
	[TalentSpecCata.PRIEST_HOLY]: Class.PRIEST,
	[TalentSpecCata.PRIEST_SHADOW]: Class.PRIEST,

	[TalentSpecCata.ROGUE_ASSA]: Class.ROGUE,
	[TalentSpecCata.ROGUE_COMBAT]: Class.ROGUE,
	[TalentSpecCata.ROGUE_SUB]: Class.ROGUE,

	[TalentSpecCata.SHAMAN_ELE]: Class.SHAMAN,
	[TalentSpecCata.SHAMAN_ENHA]: Class.SHAMAN,
	[TalentSpecCata.SHAMAN_RESTO]: Class.SHAMAN,

	[TalentSpecCata.WARLOCK_AFFLI]: Class.WARLOCK,
	[TalentSpecCata.WARLOCK_DEMO]: Class.WARLOCK,
	[TalentSpecCata.WARLOCK_DESTO]: Class.WARLOCK
};

export const talentSpecToClass = (expansion: number, spec: number): number | null => {
	if (expansionIsMoP(expansion)) {
		return talentSpecMoPToClass(spec);
	}

	if (expansionIsCata(expansion)) {
		return talentSpecCataToClass(spec);
	}

	return null;
};

const talentSpecMoPToClass = (spec: number): number | null => {
	return TALENT_SPEC_MOP_TO_CLASS[spec] ?? null;
};

const talentSpecCataToClass = (spec: number): number | null => {
	return TALENT_SPEC_CATA_TO_CLASS[spec] ?? null;
};

export const talentSpecToClassString = (expansion: number, spec: number): string => {
	const cls = talentSpecToClass(expansion, spec);
	if (cls === null) {
		return 'Unknown spec';
	}
	return classToString(cls);
};

const invert = (obj: typeof TALENT_SPEC_CATA_TO_CLASS | typeof TALENT_SPEC_MOP_TO_CLASS) =>
	Object.entries(obj).reduce((acc, [k, v]) => {
		acc[v] ??= [];
		acc[v]!.push(Number(k));
		return acc;
	}, {} as Record<number, number[]>);

const TALENT_SPEC_MOP_BY_CLASS = invert(TALENT_SPEC_MOP_TO_CLASS);
const TALENT_SPEC_CATA_BY_CLASS = invert(TALENT_SPEC_CATA_TO_CLASS);

export const talentSpecsByClass = (expansion: number, cls: number | null): number[] => {
	if (cls === null) {
		return [];
	}

	if (expansionIsMoP(expansion)) {
		return TALENT_SPEC_MOP_BY_CLASS[cls] ?? [];
	}

	if (expansionIsCata(expansion)) {
		return TALENT_SPEC_CATA_BY_CLASS[cls] ?? [];
	}

	return [];
};
