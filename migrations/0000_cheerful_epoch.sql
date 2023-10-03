CREATE TABLE `boss_kill_player` (
	`id` integer PRIMARY KEY NOT NULL,
	`boss_kill_id` integer,
	`player_id` integer,
	`remote_id` integer,
	`talent_spec` integer,
	`avg_item_lvl` integer,
	`dmg_done` integer,
	`healing_done` integer,
	`overhealing_done` integer,
	`absorb_done` integer,
	`dmg_taken` integer,
	`dmg_absorbed` integer,
	`healing_taken` integer,
	`dispells` integer,
	`interrupts` integer,
	`name` text,
	`guid` integer,
	`race` integer,
	`class` integer,
	`gender` integer,
	`level` integer,
	FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss_kill` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` text,
	`boss_id` integer,
	`raid_id` integer,
	`realm_id` integer,
	`mode` integer,
	`guild` text,
	`time` text,
	`length` integer,
	`wipes` integer,
	`deaths` integer,
	`ress_used` integer,
	FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` integer,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `player` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` integer,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `raid` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `realm` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `boss_kill_player_remote_id_unique` ON `boss_kill_player` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boss_kill_remote_id_unique` ON `boss_kill` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boss_remote_id_unique` ON `boss` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `player_remote_id_unique` ON `player` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `raid_name_unique` ON `raid` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `realm_name_unique` ON `realm` (`name`);