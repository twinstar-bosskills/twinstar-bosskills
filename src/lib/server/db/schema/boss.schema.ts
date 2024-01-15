import { isMysql } from '..';
import { bossTable as mysqlTable } from './mysql/boss.schema';
import { bossTable as sqliteTable } from './sqlite/boss.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bossTable = mysqlTable;
