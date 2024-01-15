import { isMysql } from '..';
import { bosskillPlayerTable as mysqlTable } from './mysql/boss-kill-player.schema';
import { bosskillPlayerTable as sqliteTable } from './sqlite/boss-kill-player.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bosskillPlayerTable = mysqlTable;
