import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { bosskillDeathTable } from './boss-kill-death.schema';
import { bosskillPlayerTable } from './boss-kill-player.schema';
import { realmTable } from './realm.schema';
export const playerTable = sqliteTable('player', {
	id: integer('id').primaryKey(),
	remoteId: integer('remote_id'),
	realmId: integer('realm_id')
		.notNull()
		.references(() => realmTable.id),
	name: text('name')
});

export const playerRelations = relations(playerTable, ({ many }) => ({
	bosskills: many(bosskillPlayerTable),
	deaths: many(bosskillDeathTable)
}));
