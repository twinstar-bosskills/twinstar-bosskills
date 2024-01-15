import { isMysql } from '..';
import { bosskillLootTable as mysqlTable } from './mysql/boss-kill-loot.schema';
import { bosskillLootTable as sqliteTable } from './sqlite/boss-kill-loot.schema';
const _keepMe = isMysql() ? mysqlTable : sqliteTable;
export const bosskillLootTable = mysqlTable;
