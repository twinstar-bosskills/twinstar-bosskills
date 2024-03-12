import { REALMS_LOWECASE } from '$lib/realm';
import { InvalidArgumentError } from 'commander';
import { isValid, parse } from 'date-fns';

export const integer = (v: string): number => {
	const parsedValue = parseInt(v, 10);
	if (isNaN(parsedValue) || !isFinite(parsedValue)) {
		throw new InvalidArgumentError(`Value ${v} is not valid integer`);
	}
	return parsedValue;
};
export const realmString = (v: string): string => {
	const parsedValue = REALMS_LOWECASE[v.toLowerCase()];
	if (typeof parsedValue !== 'string') {
		throw new InvalidArgumentError(`Value ${v} is not valid realm`);
	}
	return parsedValue;
};

export const integerGte =
	(gt: number) =>
	(v: string): number => {
		const num = integer(v);
		if (num >= gt) {
			return num;
		}
		throw new InvalidArgumentError(`Value ${num} is not greater than ${gt}`);
	};

export const listOfIntegers = (v: string): number[] => {
	return v.split(',').map(integer);
};
export const listOfStrings = (v: string): string[] => {
	return v.split(',');
};

export const ymd = (v: string) => {
	const date = parse(v, 'yyyy-MM-dd', new Date());
	if (isValid(date)) {
		return date;
	} else {
		throw new InvalidArgumentError(`Value ${v} is not valid date in format yyyy-MM-dd`);
	}
};
