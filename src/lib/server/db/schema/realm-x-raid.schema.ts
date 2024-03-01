import { isMysql } from '..';
import { realmXRaidTable as mysqlTable } from './mysql/realm-x-raid.schema';
import { realmXRaidTable as sqliteTable } from './sqlite/realm-x-raid.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const realmXRaidTable = mysqlTable;
