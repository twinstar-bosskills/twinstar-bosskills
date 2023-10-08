import { integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const bosskillLootTable = sqliteTable('boss_kill_loot', {
	id: integer('id').primaryKey(),
	bosskillId: integer('boss_kill_id').references(() => bosskillTable.id),

	itemId: integer('item_id').notNull(),
	count: integer('count').notNull()
});
