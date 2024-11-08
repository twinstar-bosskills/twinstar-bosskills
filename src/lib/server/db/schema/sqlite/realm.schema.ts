import { relations, sql } from 'drizzle-orm';
import { integer, SQLiteColumn, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillTable } from './boss-kill.schema';
export const realmTable = sqliteTable('realm', {
	id: integer('id').primaryKey(),
	// remoteId: integer('remote_id').unique(),
	name: text('name').notNull().unique(),
	expansion: integer('expansion').notNull(),
	mergedToId: integer('merged_to_id')
		.references((): SQLiteColumn => realmTable.id)
		.default(sql`null`)
});

export const realmRelations = relations(realmTable, ({ many, one }) => ({
	bosskills: many(bosskillTable),
	mergedTo: one(realmTable, {
		fields: [realmTable.mergedToId],
		references: [realmTable.id]
	})
}));
