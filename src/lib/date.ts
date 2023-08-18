import { format, formatDistance, formatDuration, intervalToDuration, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
export const distanceNow = (ds: string): string => {
	try {
		return formatDistance(parseISO(ds), new Date());
	} catch (e) {}
	return '-';
};

export const distanceTzNow = (ds: string): string => {
	try {
		return formatDistance(utcToZonedTime(ds, 'UTC'), new Date());
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
		return format(utcToZonedTime(ds, 'UTC'), 'Pp');
	} catch (e) {}
	return '-';
};

export const formatSecondsInterval = (seconds: number): string => {
	return formatDuration(intervalToDuration({ start: 0, end: seconds }));
};
