import type { BosskillCharacterPartial } from './server/api/schema';
export type MetricType = 'dps' | 'hps';
export const METRIC_TYPE = {
	DPS: 'dps' as const,
	HPS: 'hps' as const
};

export type PlayerPercentile = Record<number, number | null>;
export type PlayerPercentiles = {
	[METRIC_TYPE.DPS]: PlayerPercentile;
	[METRIC_TYPE.HPS]: PlayerPercentile;
};

export const valuePerSecond = (value: number, seconds: number) => {
	//return seconds > 0 ? Math.round((1000 * value) / seconds) : 0;
	if (isFinite(value)) {
		return seconds > 0 ? Math.round(value / seconds) : 0;
	}
	return 0;
};
export const healingAndAbsorbDone = (character: BosskillCharacterPartial) => {
	const v = Number(character.healingDone) + Number(character.absorbDone);
	if (isFinite(v)) {
		return v;
	}
	return 0;
};
export const characterDps = (character: BosskillCharacterPartial, fightLength: number = 0) => {
	return valuePerSecond(
		Number(character.dmgDone),
		// character.usefullTime,
		(character.boss_kills?.length ?? fightLength) / 1000
	);
};
export const characterHps = (character: BosskillCharacterPartial, fightLength: number = 0) => {
	return valuePerSecond(
		Number(character.healingDone) + Number(character.absorbDone),
		// character.usefullTime,
		(character.boss_kills?.length ?? fightLength) / 1000
	);
};
