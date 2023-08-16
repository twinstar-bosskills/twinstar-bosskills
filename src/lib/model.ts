import { getClassIconUrl } from './class';
import { getRaceIconUrl } from './race';
import { getTalentSpecIconUrl } from './talent';

export type BossKill = {
	id: string;
	entry: number;
	map: string;
	mode: number;
	guild: string;
	time: string;
	realm: string;
	length: number;
	wipes: number;
	deaths: number;
	ressUsed: number;
	instanceId: number;
	creature_name: string;

	// extras
	difficulty: string;
};

export type Player = {
	id: number;
	guid: number;
	talent_spec: number;
	avg_item_lvl: number;
	dmgDone: string;
	healingDone: string;
	overhealingDone: string;
	absorbDone: string;
	dmgTaken: string;
	dmgAbsorbed: string;
	healingTaken: string;
	usefullTime: number;
	dispels: number;
	interrupts: number;
	hidden: boolean;
	name: string;
	race: number;
	class: number;
	gender: number;
	level: number;

	// extra
	classString: string;
	classIconUrl: string;

	raceIconUrl: string;
	raceString: string;

	talentSpecIconUrl: string;
};

export const mutatePlayer = (player: Player): Player => {
	player.classString = classToString(player.class);
	player.classIconUrl = getClassIconUrl(player.class);

	player.raceString = raceToString(player.race);
	player.raceIconUrl = getRaceIconUrl({ race: player.race, gender: player.gender });

	player.talentSpecIconUrl = getTalentSpecIconUrl(player.talent_spec);
	return player;
};
export type BossKillDetail = {
	id: string;
	map: string;
	entry: number;
	mode: number;
	progressLenght: number;
	guild: string;
	time: string;
	realm: number;
	length: number;
	wipes: number;
	deaths: number;
	ressUsed: number;
	boss_kills_deaths: {
		id: number;
		guid: number;
		/**
		 * Negative value = ress
		 */
		time: number;
	}[];
	boss_kills_maps: {
		id: number;
		time: number;
		encounterDamage: string;
		encounterHeal: string;
		raidDamage: string;
		raidHeal: string;
	}[];
	boss_kills_players: Player[];
	boss_kills_loot: {
		id: number;
		itemId: string;
		count: number;
		randomPropertyId: number;
		randomSuffixId: string;
	}[];

	// extras
	difficulty: string;
};

export type Item = {
	id: number;
	name: string;
	iconUrl: string | null;
	quality: number;
};

export type ItemTooltip = {
	quality: string;
	icon: string;
	/**
	 * HTML string
	 */
	tooltip: string;
};

export type Boss = {
	entry: number;
	name: string;
};

export type Raid = {
	map: string;
	bosses: Boss[];
};

export const Difficulty = {
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
const DIFFICULTY_TO_STRING = {
	[Difficulty.DIFFICULTY_NONE]: 'None',
	[Difficulty.DIFFICULTY_NORMAL]: 'N',
	[Difficulty.DIFFICULTY_HEROIC]: 'HC',
	[Difficulty.DIFFICULTY_10_N]: '10 N',
	[Difficulty.DIFFICULTY_25_N]: '25 N',
	[Difficulty.DIFFICULTY_10_HC]: '10 HC',
	[Difficulty.DIFFICULTY_25_HC]: '25 HC',
	[Difficulty.DIFFICULTY_LFR]: 'LFR',
	[Difficulty.DIFFICULTY_CHALLENGE]: 'Challenge',
	[Difficulty.DIFFICULTY_40]: '40',
	[Difficulty.DIFFICULTY_HC_SCENARIO]: 'Scenario HC',
	[Difficulty.DIFFICULTY_N_SCENARIO]: 'Scenario N',
	[Difficulty.DIFFICULTY_FLEX]: 'Flex',
	[Difficulty.MAX_DIFFICULTY]: 'Max'
};

export const difficultyToString = (diff: number): string => {
	return DIFFICULTY_TO_STRING[diff] ?? 'None';
};
export const isRaidDifficulty = (diff: number) => {
	return isRaidDifficultyWithLoot(diff) || diff === Difficulty.DIFFICULTY_LFR;
};
export const isRaidDifficultyWithLoot = (diff: number) => {
	return (
		diff === Difficulty.DIFFICULTY_10_N ||
		diff === Difficulty.DIFFICULTY_10_HC ||
		diff === Difficulty.DIFFICULTY_25_N ||
		diff === Difficulty.DIFFICULTY_25_HC ||
		diff === Difficulty.DIFFICULTY_FLEX
	);
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
	return CLASS_TO_STRING[cls as Class] ?? 'Unknown';
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
	return RACE_TO_STRING[race as Race] ?? 'Unknown';
};

export const TalentSpec = {
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
	MONK_BATTLEDANCER: 269,
	MONK_MISTWEAVER: 270

	// TODO: https://wow.tools/dbc/?dbc=chrspecialization&build=5.4.8.18273#page=1
};
