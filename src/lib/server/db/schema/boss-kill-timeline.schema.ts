import { isMysql } from '..';
import { bosskillTimelineTable as mysqlTable } from './mysql/boss-kill-timeline.schema';
import { bosskillTimelineTable as sqliteTable } from './sqlite/boss-kill-timeline.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bosskillTimelineTable = mysqlTable;
