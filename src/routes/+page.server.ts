import { parseZonedISO } from '$lib/date';
import { getLatestBossKills } from '$lib/server/api';
import { format } from 'date-fns';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async () => {
	const { data } = await getLatestBossKills({ pageSize: 100_000 });
	const byHour: Record<string, number> = {};
	const byWeekDay: Record<string, number> = {};

	// because lastest bosskills are ordered by time DESC
	const last = data[0] ?? null;
	const first = data[data.length - 1] ?? null;
	for (const bk of data) {
		const date = parseZonedISO(bk.time);
		try {
			const weekDayKey = format(date, 'EEEE');
			byWeekDay[weekDayKey] ??= 0;
			byWeekDay[weekDayKey]++;
		} catch (e) {}
		try {
			const hourKey = format(date, 'HH');
			byHour[hourKey] ??= 0;
			byHour[hourKey]++;
		} catch (e) {}
	}

	return {
		first,
		last,
		byHour,
		byWeekDay
	};
};
