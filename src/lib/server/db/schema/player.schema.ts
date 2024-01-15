import { isMysql } from '..';
import { playerTable as mysqlTable } from './mysql/player.schema';
import { playerTable as sqliteTable } from './sqlite/player.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const playerTable = mysqlTable;
