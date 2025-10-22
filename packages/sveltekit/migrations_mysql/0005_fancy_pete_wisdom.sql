USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
CREATE TABLE .`ranking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`realm_id` int NOT NULL,
	`raid_id` int NOT NULL,
	`boss_id` int NOT NULL,
	`boss_kill_id` int NOT NULL,
	`player_id` int NOT NULL,
	`rank` int NOT NULL,
	`time` datetime NOT NULL,
	`spec` int NOT NULL,
	`mode` int NOT NULL,
	`metric` enum('dps','hps') NOT NULL,
	CONSTRAINT `ranking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint

COMMIT;