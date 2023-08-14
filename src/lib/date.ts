import { format, formatDistance, formatDuration, intervalToDuration, parseISO } from 'date-fns';

export const distanceNow = (ds: string): string => {
	try {
		return formatDistance(parseISO(ds), new Date());
	} catch (e) {}
	return '-';
};
export const formatLocalized = (ds: string): string => {
	try {
		return format(parseISO(ds), 'Pp');
	} catch (e) {}
	return '-';
};

export const formatSecondsInterval = (seconds: number): string => {
	return formatDuration(intervalToDuration({ start: 0, end: seconds }));
};
