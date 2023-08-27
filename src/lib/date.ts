import {
	addWeeks,
	format,
	formatDistance,
	formatDuration,
	intervalToDuration,
	parseISO,
	previousWednesday,
	setHours,
	setMilliseconds,
	setMinutes,
	setSeconds,
	subWeeks
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const raidLockStart = (date: Date) => {
	// Wednesday, probably at 6:00AM
	const wed = previousWednesday(date);
	const wed6h = setHours(wed, 6);
	const wed6h0m = setMinutes(wed6h, 0);
	const wed6h0m0s = setSeconds(wed6h0m, 0);
	return setMilliseconds(wed6h0m0s, 0);
};

export const raidLock = (date: Date, shift: number = 0) => {
	let start = raidLockStart(date);
	if (shift > 0) {
		start = subWeeks(start, shift);
	}
	const end = addWeeks(start, 1);
	return {
		start: toServerTime(start),
		end: toServerTime(end)
	};
};

export const toServerTime = (ds: string | Date) => {
	return zonedTimeToUtc(ds, 'UTC');
};

export const fromServerTime = (ds: string | Date) => utcToZonedTime(ds, 'UTC');
export const distanceNow = (ds: string): string => {
	try {
		return formatDistance(parseISO(ds), new Date());
	} catch (e) {}
	return '-';
};

export const distanceTzNow = (ds: string): string => {
	try {
		return formatDistance(fromServerTime(ds), new Date(), { addSuffix: true });
	} catch (e) {}
	return '-';
};

export const formatLocalized = (ds: string): string => {
	try {
		return format(parseISO(ds), 'Pp');
	} catch (e) {}
	return '-';
};

export const formatTzLocalized = (ds: string): string => {
	try {
		return format(fromServerTime(ds), 'Pp');
	} catch (e) {}
	return '-';
};

export const formatSecondsInterval = (seconds: number): string => {
	return formatDuration(intervalToDuration({ start: 0, end: seconds }));
};
