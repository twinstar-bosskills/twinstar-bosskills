import { isMysql } from '..';
import { bosskillTable as mysqlTable } from './mysql/boss-kill.schema';
import { bosskillTable as sqliteTable } from './sqlite/boss-kill.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bosskillTable = mysqlTable;
