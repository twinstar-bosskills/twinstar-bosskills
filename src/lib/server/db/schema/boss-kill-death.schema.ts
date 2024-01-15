import { isMysql } from '..';
import { bosskillDeathTable as mysqlTable } from './mysql/boss-kill-death.schema';
import { bosskillDeathTable as sqliteTable } from './sqlite/boss-kill-death.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bosskillDeathTable = mysqlTable;
