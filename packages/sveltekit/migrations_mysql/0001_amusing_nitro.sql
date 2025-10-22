USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
ALTER TABLE `realm` ADD COLUMN `expansion` int NULL;--> statement-breakpoint
UPDATE `realm` SET `expansion` = 4 WHERE name = 'Helios';--> statement-breakpoint
UPDATE `realm` SET `expansion` = 3 WHERE name != 'Helios';--> statement-breakpoint
ALTER TABLE `realm` MODIFY COLUMN `expansion` int NOT NULL;--> statement-breakpoint

ALTER TABLE `player` DROP CONSTRAINT `player_remote_id_unique`;--> statement-breakpoint
ALTER TABLE `player` ADD COLUMN `realm_id` int NULL;--> statement-breakpoint

UPDATE player
SET realm_id = (SELECT id FROM realm WHERE name = 'Helios')
WHERE id IN (SELECT bkp.player_id FROM boss_kill AS bk
INNER JOIN realm ON realm.id = bk.realm_id AND realm.name = 'Helios'
INNER JOIN boss_kill_player AS bkp ON bkp.boss_kill_id = bk.id);--> statement-breakpoint

UPDATE player
SET realm_id = (SELECT id FROM realm WHERE name = 'Athena')
WHERE id IN (SELECT bkp.player_id FROM boss_kill AS bk
INNER JOIN realm ON realm.id = bk.realm_id AND realm.name = 'Athena'
INNER JOIN boss_kill_player AS bkp ON bkp.boss_kill_id = bk.id);--> statement-breakpoint

ALTER TABLE `player` MODIFY COLUMN `realm_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `player` ADD CONSTRAINT `player_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
COMMIT;
