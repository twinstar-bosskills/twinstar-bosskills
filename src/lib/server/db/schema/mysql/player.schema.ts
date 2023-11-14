import { relations } from 'drizzle-orm';
import { int, text } from 'drizzle-orm/mysql-core';
import { bosskillDeathTable } from './boss-kill-death.schema';
import { bosskillPlayerTable } from './boss-kill-player.schema';
import { bosskills } from './mysql.schema';
export const playerTable = bosskills.table('player', {
	id: int('id').primaryKey(),
	remoteId: int('remote_id').unique(),
	name: text('name')
});

export const playerRelations = relations(playerTable, ({ many }) => ({
	bosskills: many(bosskillPlayerTable),
	deaths: many(bosskillDeathTable)
}));
