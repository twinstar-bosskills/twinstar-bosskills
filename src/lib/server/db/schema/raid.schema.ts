import { isMysql } from '..';
import { raidTable as mysqlTable } from './mysql/raid.schema';
import { raidTable as sqliteTable } from './sqlite/raid.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const raidTable = mysqlTable;
