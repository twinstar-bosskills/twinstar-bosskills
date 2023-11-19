import { TWINSTAR_API_URL } from '$env/static/private';
import type { Item, ItemTooltip } from '$lib/model';
import { realmToExpansion } from '$lib/realm';
import { withCache } from '../cache';

const API_ITEM = {
	item: {
		ID: 86166,
		Class: 4,
		SubClass: 0,
		SoundOverrideSubclass: -1,
		Material: 5,
		DisplayId: 117053,
		InventoryType: 2,
		Sheath: 0
	},
	itemSparse: {
		ID: 86166,
		Quality: 4,
		Flags: 0,
		Flags2: 1073766400,
		Flags3: 2,
		PriceRandomValue: 0.988,
		PriceVariance: 1,
		BuyCount: 1,
		BuyPrice: 683722,
		SellPrice: 170930,
		InventoryType: 2,
		AllowableClass: -1,
		AllowableRace: -1,
		ItemLevel: 496,
		RequiredLevel: 90,
		RequiredSkill: 0,
		RequiredSkillRank: 0,
		RequiredSpell: 0,
		RequiredHonorRank: 0,
		RequiredCityRank: 0,
		RequiredReputationFaction: 0,
		RequiredReputationRank: 0,
		MaxCount: 0,
		Stackable: 1,
		ContainerSlots: 0,
		ItemStatType_1: 3,
		ItemStatType_2: 7,
		ItemStatType_3: 32,
		ItemStatType_4: 49,
		ItemStatType_5: -1,
		ItemStatType_6: -1,
		ItemStatType_7: -1,
		ItemStatType_8: -1,
		ItemStatType_9: -1,
		ItemStatType_10: -1,
		ItemStatValue_1: 682,
		ItemStatValue_2: 1022,
		ItemStatValue_3: 500,
		ItemStatValue_4: 377,
		ItemStatValue_5: 0,
		ItemStatValue_6: 0,
		ItemStatValue_7: 0,
		ItemStatValue_8: 0,
		ItemStatValue_9: 0,
		ItemStatValue_10: 0,
		ItemStatUpgradeMod_1: 5259,
		ItemStatUpgradeMod_2: 7889,
		ItemStatUpgradeMod_3: 3858,
		ItemStatUpgradeMod_4: 2909,
		ItemStatUpgradeMod_5: 0,
		ItemStatUpgradeMod_6: 0,
		ItemStatUpgradeMod_7: 0,
		ItemStatUpgradeMod_8: 0,
		ItemStatUpgradeMod_9: 0,
		ItemStatUpgradeMod_10: 0,
		SocketCostRate_1: 0,
		SocketCostRate_2: 0,
		SocketCostRate_3: 0,
		SocketCostRate_4: 0,
		SocketCostRate_5: 0,
		SocketCostRate_6: 0,
		SocketCostRate_7: 0,
		SocketCostRate_8: 0,
		SocketCostRate_9: 0,
		SocketCostRate_10: 0,
		ScalingStatDistribution: 0,
		DamageType: 0,
		Delay: 0,
		RangedModRange: 0,
		SpellId_1: 0,
		SpellId_2: 0,
		SpellId_3: 0,
		SpellId_4: 0,
		SpellId_5: 0,
		SpellTrigger_1: 0,
		SpellTrigger_2: 0,
		SpellTrigger_3: 0,
		SpellTrigger_4: 0,
		SpellTrigger_5: 0,
		SpellCharges_1: 0,
		SpellCharges_2: 0,
		SpellCharges_3: 0,
		SpellCharges_4: 0,
		SpellCharges_5: 0,
		SpellCooldown_1: -1,
		SpellCooldown_2: -1,
		SpellCooldown_3: -1,
		SpellCooldown_4: -1,
		SpellCooldown_5: -1,
		SpellCategory_1: 0,
		SpellCategory_2: 0,
		SpellCategory_3: 0,
		SpellCategory_4: 0,
		SpellCategory_5: 0,
		SpellCategoryCooldown_1: -1,
		SpellCategoryCooldown_2: -1,
		SpellCategoryCooldown_3: -1,
		SpellCategoryCooldown_4: -1,
		SpellCategoryCooldown_5: -1,
		Bonding: 1,
		Name: 'Choker of the Unleashed Storm',
		Name2: '',
		Name3: '',
		Name4: '',
		Description: '',
		PageText: 0,
		LanguageID: 0,
		PageMaterial: 0,
		StartQuest: 0,
		LockID: 0,
		Material: 5,
		Sheath: 0,
		RandomProperty: 0,
		RandomSuffix: 0,
		ItemSet: 0,
		AreaId: 0,
		MapId: 0,
		BagFamily: 0,
		TotemCategory: 0,
		Color_1: 0,
		Color_2: 0,
		Color_3: 0,
		Content_1: 0,
		Content_2: 0,
		Content_3: 0,
		SocketBonusId: 0,
		GemPropertiesId: 0,
		ArmorDamageModifier: 0,
		Duration: 0,
		ItemLimitCategory: 0,
		HolidayId: 0,
		StatScalingFactor: 0,
		CurrencySubstitutionId: 0,
		CurrencySubstitutionCount: 0
	}
};

export const getItem = async (id: number): Promise<Item | null> => {
	const fallback = async () => {
		try {
			const r = await fetch(`${TWINSTAR_API_URL}/item/${id}`);
			const item: typeof API_ITEM = await r.json();
			return {
				id: item.item.ID,
				name: item.itemSparse.Name,
				iconUrl: getItemIconUrl(id),
				quality: item.itemSparse.Quality
			};
		} catch (e) {
			console.error(e);
		}

		return null;
	};
	return withCache({ deps: ['item', id], fallback, defaultValue: null });
};

export const getItemIconUrl = (id: number): string => {
	return `/img/icon?type=item&id=${id}`;
};
export const getRemoteItemIconUrl = (id: number) => `${TWINSTAR_API_URL}/item/icon/${id}`;

type GetItemTooltipArgs = { realm: string; id: number };
export const getItemTooltip = async ({
	realm,
	id
}: GetItemTooltipArgs): Promise<ItemTooltip | null> => {
	const expansion = realmToExpansion(realm);
	const fallback = async () => {
		try {
			// const r = await fetch(`https://mop-twinhead.twinstar.cz/?tooltip&type=item&id=${id}`);
			const r = await fetch(`${TWINSTAR_API_URL}/item/tooltip?id=${id}&expansion=${expansion}`);
			const json = await r.json();
			return json?.['data'] ?? null;
		} catch (e) {
			console.error(e);
			throw e;
		}

		// @ts-ignore
		return null;
	};
	return withCache({ deps: [`item-tooltip`, expansion, id], fallback, defaultValue: null });
};
