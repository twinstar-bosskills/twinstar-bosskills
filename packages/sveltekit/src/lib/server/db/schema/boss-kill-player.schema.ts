import { sql } from 'drizzle-orm';
import { bosskillTable } from './boss-kill.schema';
import { bosskillPlayerTable as mysqlTable } from './mysql/boss-kill-player.schema';
export const bosskillPlayerTable = mysqlTable;
export const dps =
	sql<number>`ROUND(IF(${bosskillTable.length} = 0, 0, ${bosskillPlayerTable.dmgDone}/(${bosskillTable.length}/1000)))`.mapWith(
		Number
	);
export const hps =
	sql<number>`ROUND(IF(${bosskillTable.length} = 0, 0, (${bosskillPlayerTable.healingDone} + ${bosskillPlayerTable.absorbDone})/(${bosskillTable.length}/1000)))`.mapWith(
		Number
	);
