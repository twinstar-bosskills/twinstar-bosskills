import { isMysql } from '..';
import { realmTable as mysqlTable } from './mysql/realm.schema';
import { realmTable as sqliteTable } from './sqlite/realm.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const realmTable = mysqlTable;
