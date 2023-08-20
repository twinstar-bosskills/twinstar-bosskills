import { format, formatDistance, formatDuration, intervalToDuration, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const parseZonedISO = (ds: string) => utcToZonedTime(ds, 'UTC');
export const distanceNow = (ds: string): string => {
	try {
		return formatDistance(parseISO(ds), new Date());
	} catch (e) {}
	return '-';
};

export const distanceTzNow = (ds: string): string => {
	try {
		return formatDistance(parseZonedISO(ds), new Date(), { addSuffix: true });
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
		return format(parseZonedISO(ds), 'Pp');
	} catch (e) {}
	return '-';
};

export const formatSecondsInterval = (seconds: number): string => {
	return formatDuration(intervalToDuration({ start: 0, end: seconds }));
};
