import {
  classToString,
  difficultyToString,
  raceToString,
} from "@twinstar-bosskills/core/dist/wow";

import { realmToExpansion } from "@twinstar-bosskills/core/dist/realm";
import { z } from "zod";
import { getClassIconUrl } from "./class";
import { getRaceIconUrl } from "./race";

const bossIdSchema = z.number().gte(0);
export const bossSchema = z.object({
  entry: bossIdSchema,
  name: z.string(),
});
export type Boss = z.infer<typeof bossSchema>;
export const bossesSchema = z.array(bossSchema);

const mapSchema = z.string();
export const raidSchema = z.object({
  map: mapSchema,
  bosses: z.array(bossSchema),
});
export type Raid = z.infer<typeof raidSchema>;
export const raidsSchema = z.array(raidSchema);

const modeSchema = z.number().gte(0);
const bosskillTransform = <T extends { realm: string; mode: number }>(
  item: T
) => {
  const realm = item.realm;
  const expansion = realmToExpansion(realm);
  return { ...item, difficulty: difficultyToString(expansion, item.mode) };
};
const bosskillSchemaBase = z.looseObject({
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
  creature_name: z.string(),
});
export const bosskillSchema = bosskillSchemaBase.transform(bosskillTransform);
export type BossKill = z.infer<typeof bosskillSchema>;
export const bosskillsSchema = z.array(bosskillSchema);

const raceSchema = z.number();
const classSchema = z.number();
const genderSchema = z.number();
const levelSchema = z.number().gt(0);
const bosskillCharacterSchemaBase = z.object({
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
  dispels: z.coerce.number(),
  interrupts: z.coerce.number(),
  name: z.string(),
  race: raceSchema,
  class: classSchema,
  gender: genderSchema,
  level: levelSchema,
  boss_kills: z.union([
    bosskillSchemaBase
      .omit({ creature_name: true })
      .transform(bosskillTransform),
    z.undefined(),
  ]),
});
const bosskillCharacterTransform = <
  T extends { class: number; race: number; gender: number },
>(
  item: T
) => {
  const classString = classToString(item.class);
  const classIconUrl = getClassIconUrl(item.class);

  const raceString = raceToString(item.race);
  const raceIconUrl = getRaceIconUrl({ race: item.race, gender: item.gender });

  return {
    ...item,
    classString,
    classIconUrl,
    raceString,
    raceIconUrl,
  };
};
export const bosskillCharacterSchema = bosskillCharacterSchemaBase.transform(
  (item) => {
    return bosskillCharacterTransform(item);
  }
);
export const bosskillCharactersSchema = z.array(bosskillCharacterSchema);
export type BosskillCharacter = z.infer<typeof bosskillCharacterSchema>;

export const bosskillCharacterPartialSchema = bosskillCharacterSchemaBase.omit({
  name: true,
  level: true,
  race: true,
  class: true,
  gender: true,
});

export const bosskillCharactersPartialSchema = z.array(
  bosskillCharacterPartialSchema
);
export type BosskillCharacterPartial = z.infer<
  typeof bosskillCharacterPartialSchema
>;

export const bosskillLootSchema = z.object({
  id: z.number(),
  itemId: z.string(),
  count: z.number().gte(0),
});
export type BosskillLoot = z.infer<typeof bosskillLootSchema>;

export const bosskillDeathSchema = z.object({
  id: z.number(),
  guid: z.number(),
  /**
   * Negative value = ress
   */
  time: z.number(),
});
export type BosskillDeath = z.infer<typeof bosskillDeathSchema>;

export const bosskillTimelineSchema = z.object({
  time: z.number(),
  encounterDamage: z.coerce.number().gte(0),
  encounterHeal: z.coerce.number().gte(0),
  raidDamage: z.coerce.number().gte(0),
  raidHeal: z.coerce.number().gte(0),
});
export type BosskillTimeline = z.infer<typeof bosskillTimelineSchema>;

const bosskillDetailTransform = (
  item: z.infer<typeof bosskillDetailSchemaBase>
) => {
  const realm = item.realm;
  const expansion = realmToExpansion(realm);
  return { ...item, difficulty: difficultyToString(expansion, item.mode) };
};
const bosskillDetailSchemaBase = bosskillSchemaBase
  .omit({ creature_name: true })
  .extend({
    boss_kills_deaths: z.array(bosskillDeathSchema),
    boss_kills_maps: z.array(bosskillTimelineSchema),
    boss_kills_players: z.array(bosskillCharacterSchema),
    boss_kills_loot: z.array(bosskillLootSchema),
  });
export const bosskillDetailSchema = bosskillDetailSchemaBase.transform(
  bosskillDetailTransform
);
export type BossKillDetail = z.infer<typeof bosskillDetailSchema>;

const characterTransform = <T extends { id: string }>(
  item: T,
  ctx: z.RefinementCtx
) => {
  const guid = Number(item.id.replace(/^[0-9]+_/, ""));
  if (isFinite(guid) === false) {
    ctx.addIssue({
      fatal: true,
      code: z.ZodIssueCode.custom,
      message: `Unable to parse guid from id ${item.id}`,
    });
  }
  return {
    ...item,
    guid,
  };
};
export const characterSchema = z
  .object({
    /**
     * In format <REALM_ID>_<GUID>
     */
    id: z.string().regex(/^[1-9]+[0-9]*_[1-9]+[0-9]*/),
    name: z.string(),
    race: raceSchema,
    class: classSchema,
    gender: genderSchema,
    level: levelSchema,
    realm: z.string(),
    guildName: z.string(),
    talents: z.object({
      talentTree: z.array(z.object({ id: z.number() })),
      activeTalentGroup: z.number(),
    }),
  })
  .transform(characterTransform);
export const charactersSchema = z.array(characterSchema);
export type Character = z.infer<typeof characterSchema>;

export const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  iconUrl: z.string().nullable(),
  quality: z.number(),
});
export type Item = z.infer<typeof itemSchema>;
export const itemSparseSchema = z.object({
  Name: z.string(),
  Quality: z.number(),
});
export type ItemSparse = z.infer<typeof itemSparseSchema>;

export const itemTooltipSchema = z.object({
  /**
   * HTML string
   */
  tooltip: z.string(),
});
export type ItemTooltip = z.infer<typeof itemTooltipSchema>;
