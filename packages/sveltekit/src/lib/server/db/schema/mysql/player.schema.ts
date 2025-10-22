import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillDeathTable } from './boss-kill-death.schema';
import { bosskillPlayerTable } from './boss-kill-player.schema';
import { bosskills } from './mysql.schema';
import { realmTable } from './realm.schema';
export const playerTable = bosskills.table('player', {
	id: int('id').primaryKey().autoincrement(),
	remoteId: int('remote_id'),
	realmId: int('realm_id')
		.notNull()
		.references(() => realmTable.id),
	name: text('name')
});

export const playerRelations = relations(playerTable, ({ many }) => ({
	bosskills: many(bosskillPlayerTable),
	deaths: many(bosskillDeathTable)
}));
