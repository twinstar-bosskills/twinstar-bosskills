import { getClassIconUrl } from '$lib/class';
import { classToString, difficultyToString, raceToString } from '$lib/model';
import { getRaceIconUrl } from '$lib/race';
import { realmToExpansion } from '$lib/realm';
import { z } from 'zod';

const bossIdSchema = z.number().gte(0);

export const bossSchema = z.object({
	entry: bossIdSchema,
	name: z.string()
});
export type Boss = z.infer<typeof bossSchema>;
export const bossesSchema = z.array(bossSchema);

const mapSchema = z.string();
export const raidSchema = z.object({
	map: mapSchema,
	bosses: z.array(bossSchema)
});
export type Raid = z.infer<typeof raidSchema>;
export const raidsSchema = z.array(raidSchema);

const modeSchema = z.number().gte(0);
const bosskillTransform = (item: z.infer<typeof bosskillSchemaBase>) => {
	const realm = item.realm;
	const expansion = realmToExpansion(realm);
	return { ...item, difficulty: difficultyToString(expansion, item.mode) };
};
const bosskillSchemaBase = z.object({
	id: z.string(),
	entry: bossIdSchema,
	map: mapSchema,
	mode: modeSchema,
	guild: z.string(),
	time: z.string(),
	realm: z.string(),
	length: z.number().gte(0),
	wipes: z.number().gte(0),
	deaths: z.number().gte(0),
	ressUsed: z.number().gte(0),
	creature_name: z.string()
});
export const bosskillSchema = bosskillSchemaBase.transform(bosskillTransform);
export type BossKill = z.infer<typeof bosskillSchema>;
export const bosskillsSchema = z.array(bosskillSchema);

const bosskillCharacterSchemaBase = z.object({
	id: z.number(),
	guid: z.number(),
	talent_spec: z.number(),
	avg_item_lvl: z.number(),
	dmgDone: z.coerce.number(),
	healingDone: z.coerce.number(),
	overhealingDone: z.coerce.number(),
	absorbDone: z.coerce.number(),
	dmgTaken: z.coerce.number(),
	dmgAbsorbed: z.coerce.number(),
	healingTaken: z.coerce.number(),
	usefullTime: z.coerce.number(),
	dispels: z.coerce.number(),
	interrupts: z.coerce.number(),
	name: z.string(),
	race: z.number(),
	class: z.number(),
	gender: z.number(),
	level: z.number(),
	boss_kills: z.union([bosskillSchema, z.undefined()])
});
const bosskillCharacterTransform = (item: z.infer<typeof bosskillCharacterSchemaBase>) => {
	const classString = classToString(item.class);
	const classIconUrl = getClassIconUrl(item.class);

	const raceString = raceToString(item.race);
	const raceIconUrl = getRaceIconUrl({ race: item.race, gender: item.gender });

	return {
		...item,
		classString,
		classIconUrl,
		raceString,
		raceIconUrl
	};
};
export const bosskillCharacterSchema = bosskillCharacterSchemaBase.transform((item) => {
	return bosskillCharacterTransform(item);
});
export type BosskillCharacter = z.infer<typeof bosskillCharacterSchema>;

export const bosskillLootSchema = z.object({
	id: z.number(),
	itemId: z.string(),
	count: z.number().gte(0)
});
export type BosskillLoot = z.infer<typeof bosskillLootSchema>;

export const bosskillDeathSchema = z.object({
	id: z.number(),
	guid: z.number(),
	/**
	 * Negative value = ress
	 */
	time: z.number()
});
export type BosskillDeath = z.infer<typeof bosskillDeathSchema>;

export const bosskillTimelineSchema = z.object({
	time: z.number(),
	encounterDamage: z.coerce.number().gte(0),
	encounterHeal: z.coerce.number().gte(0),
	raidDamage: z.coerce.number().gte(0),
	raidHeal: z.coerce.number().gte(0)
});
export type BosskillTimeline = z.infer<typeof bosskillTimelineSchema>;

const bosskillDetailTransform = (item: z.infer<typeof bosskillDetailSchemaBase>) => {
	const realm = item.realm;
	const expansion = realmToExpansion(realm);
	return { ...item, difficulty: difficultyToString(expansion, item.mode) };
};
const bosskillDetailSchemaBase = bosskillSchemaBase.omit({ creature_name: true }).extend({
	boss_kills_deaths: z.array(bosskillDeathSchema),
	boss_kills_maps: z.array(bosskillTimelineSchema),
	boss_kills_players: z.array(bosskillCharacterSchema),
	boss_kills_loot: z.array(bosskillLootSchema)
});
export const bosskillDetailSchema = bosskillDetailSchemaBase.transform(bosskillDetailTransform);
export type BossKillDetail = z.infer<typeof bosskillDetailSchema>;
