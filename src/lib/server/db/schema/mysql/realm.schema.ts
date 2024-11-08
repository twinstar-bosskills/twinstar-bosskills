import { relations, sql } from 'drizzle-orm';
import { int, MySqlColumn, text } from 'drizzle-orm/mysql-core';
import { bosskillTable } from './boss-kill.schema';
import { bosskills } from './mysql.schema';
export const realmTable = bosskills.table('realm', {
	id: int('id').primaryKey().autoincrement(),
	// remoteId: int('remote_id').unique(),
	name: text('name').notNull().unique(),
	expansion: int('expansion').notNull(),
	mergedToId: int('merged_to_id')
		.references((): MySqlColumn => realmTable.id)
		.default(sql`null`)
});

export const realmRelations = relations(realmTable, ({ many, one }) => ({
	bosskills: many(bosskillTable),
	mergedTo: one(realmTable, {
		fields: [realmTable.mergedToId],
		references: [realmTable.id]
	})
}));
