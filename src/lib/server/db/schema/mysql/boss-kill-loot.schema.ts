import { int } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const bosskillLootTable = bosskills.table('boss_kill_loot', {
	id: int('id').primaryKey(),
	bosskillId: int('boss_kill_id')
		.notNull()
		.references(() => bosskillTable.id),

	itemId: int('item_id').notNull(),
	count: int('count').notNull()
});
