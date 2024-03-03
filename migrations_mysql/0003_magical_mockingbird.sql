USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
ALTER TABLE `boss` ADD `raid_id` int NULL;--> statement-breakpoint

UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Mogu'shan Vaults") WHERE remote_id IN (59915, 60009, 60143, 60701, 60410, 60399);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Heart of Fear") WHERE remote_id IN (62980, 62543, 62164, 62397, 62511, 62837);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Terrace of Endless Spring") WHERE remote_id IN (60583, 62442, 62983, 60999);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Baradin Hold") WHERE remote_id IN (47120, 52363, 55869);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "The Bastion of Twilight") WHERE remote_id IN (44600, 45992, 43735, 43324, 45213);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Blackwing Descent") WHERE remote_id IN (41570, 42179, 41378, 43296, 41442, 41376);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Throne of the Four Winds") WHERE remote_id IN (45871, 46753);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Firelands") WHERE remote_id IN (52498, 53691, 52558, 52530, 53494, 52571, 52409);--> statement-breakpoint
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Dragon Soul") WHERE remote_id IN (55265, 55312, 55308, 55689, 55294, 56427, 53879, 56173);--> statement-breakpoint

ALTER TABLE `boss` MODIFY COLUMN `raid_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `boss` ADD CONSTRAINT `boss_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
COMMIT;