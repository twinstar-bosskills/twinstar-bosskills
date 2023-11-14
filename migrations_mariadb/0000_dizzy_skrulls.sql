CREATE DATABASE `bosskills`;
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss_kill_death` (
	`id` int NOT NULL,
	`boss_kill_id` int NOT NULL,
	`player_id` int NOT NULL,
	`remote_id` int NOT NULL,
	`time` int NOT NULL,
	`is_ress` int NOT NULL,
	CONSTRAINT `boss_kill_death_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_kill_death_remote_id_unique` UNIQUE(`remote_id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss_kill_loot` (
	`id` int NOT NULL,
	`boss_kill_id` int NOT NULL,
	`item_id` int NOT NULL,
	`count` int NOT NULL,
	CONSTRAINT `boss_kill_loot_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss_kill_player` (
	`id` int NOT NULL,
	`boss_kill_id` int NOT NULL,
	`player_id` int NOT NULL,
	`talent_spec` int NOT NULL,
	`avg_item_lvl` int NOT NULL,
	`dmg_done` int NOT NULL,
	`healing_done` int NOT NULL,
	`overhealing_done` int NOT NULL,
	`absorb_done` int NOT NULL,
	`dmg_taken` int NOT NULL,
	`dmg_absorbed` int NOT NULL,
	`healing_taken` int NOT NULL,
	`dispells` int NOT NULL,
	`interrupts` int NOT NULL,
	`name` text NOT NULL,
	`guid` int NOT NULL,
	`race` int NOT NULL,
	`class` int NOT NULL,
	`gender` int NOT NULL,
	`level` int NOT NULL,
	CONSTRAINT `boss_kill_player_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss_kill_timeline` (
	`id` int NOT NULL,
	`boss_kill_id` int NOT NULL,
	`encounterDamage` int NOT NULL,
	`encounterHeal` int NOT NULL,
	`raidDamage` int NOT NULL,
	`raidHeal` int NOT NULL,
	`time` int NOT NULL,
	CONSTRAINT `boss_kill_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss_kill` (
	`id` int NOT NULL,
	`remote_id` text NOT NULL,
	`boss_id` int NOT NULL,
	`raid_id` int NOT NULL,
	`realm_id` int NOT NULL,
	`mode` int NOT NULL,
	`guild` text NOT NULL,
	`time` text NOT NULL,
	`length` int NOT NULL,
	`wipes` int NOT NULL,
	`deaths` int NOT NULL,
	`ress_used` int NOT NULL,
	CONSTRAINT `boss_kill_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_kill_remote_id_unique` UNIQUE(`remote_id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`boss` (
	`id` int NOT NULL,
	`remote_id` int NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `boss_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_remote_id_unique` UNIQUE(`remote_id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`player` (
	`id` int NOT NULL,
	`remote_id` int,
	`name` text,
	CONSTRAINT `player_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_remote_id_unique` UNIQUE(`remote_id`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`raid` (
	`id` int NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `raid_id` PRIMARY KEY(`id`),
	CONSTRAINT `raid_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `bosskills`.`realm` (
	`id` int NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `realm_id` PRIMARY KEY(`id`),
	CONSTRAINT `realm_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `boss_kill_death` ADD CONSTRAINT `boss_kill_death_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill_death` ADD CONSTRAINT `boss_kill_death_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill_loot` ADD CONSTRAINT `boss_kill_loot_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill_player` ADD CONSTRAINT `boss_kill_player_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill_player` ADD CONSTRAINT `boss_kill_player_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill_timeline` ADD CONSTRAINT `boss_kill_timeline_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;