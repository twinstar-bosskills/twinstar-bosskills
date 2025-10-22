import { relations } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';
import { bossTable } from './boss.schema';
import { bosskills } from './mysql.schema';

export const bossPropTable = bosskills.table('boss_prop', {
	id: int('id').primaryKey().autoincrement(),
	bossId: int('boss_id')
		.notNull()
		.references(() => bossTable.id),
	mode: int('mode').notNull(),
	health: int('health').notNull()
	// more props could go here...
});

export const bossRelations = relations(bossPropTable, ({ one }) => ({
	boss: one(bossTable)
}));
