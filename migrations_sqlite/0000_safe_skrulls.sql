CREATE TABLE `boss_kill_death` (
	`id` integer PRIMARY KEY NOT NULL,
	`boss_kill_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`remote_id` integer NOT NULL,
	`time` integer NOT NULL,
	`is_ress` integer NOT NULL,
	FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss_kill_loot` (
	`id` integer PRIMARY KEY NOT NULL,
	`boss_kill_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`count` integer NOT NULL,
	FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss_kill_player` (
	`id` integer PRIMARY KEY NOT NULL,
	`boss_kill_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`talent_spec` integer NOT NULL,
	`avg_item_lvl` integer NOT NULL,
	`dmg_done` integer NOT NULL,
	`healing_done` integer NOT NULL,
	`overhealing_done` integer NOT NULL,
	`absorb_done` integer NOT NULL,
	`dmg_taken` integer NOT NULL,
	`dmg_absorbed` integer NOT NULL,
	`healing_taken` integer NOT NULL,
	`dispells` integer NOT NULL,
	`interrupts` integer NOT NULL,
	`name` text NOT NULL,
	`guid` integer NOT NULL,
	`race` integer NOT NULL,
	`class` integer NOT NULL,
	`gender` integer NOT NULL,
	`level` integer NOT NULL,
	FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss_kill_timeline` (
	`id` integer PRIMARY KEY NOT NULL,
	`boss_kill_id` integer NOT NULL,
	`encounterDamage` integer NOT NULL,
	`encounterHeal` integer NOT NULL,
	`raidDamage` integer NOT NULL,
	`raidHeal` integer NOT NULL,
	`time` integer NOT NULL,
	FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss_kill` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` text NOT NULL,
	`boss_id` integer NOT NULL,
	`raid_id` integer NOT NULL,
	`realm_id` integer NOT NULL,
	`mode` integer NOT NULL,
	`guild` text NOT NULL,
	`time` text NOT NULL,
	`length` integer NOT NULL,
	`wipes` integer NOT NULL,
	`deaths` integer NOT NULL,
	`ress_used` integer NOT NULL,
	FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` integer NOT NULL,
	`name` text NOT NULL
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
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `realm` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `boss_kill_death_remote_id_unique` ON `boss_kill_death` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boss_kill_remote_id_unique` ON `boss_kill` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boss_remote_id_unique` ON `boss` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `player_remote_id_unique` ON `player` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `raid_name_unique` ON `raid` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `realm_name_unique` ON `realm` (`name`);