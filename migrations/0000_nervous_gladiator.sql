CREATE TABLE `boss_kill` (
	`id` integer PRIMARY KEY NOT NULL,
	`remote_id` text,
	`boss_id` integer,
	`raid_id` integer,
	`mode` integer,
	`guild` text,
	`time` text,
	`realm` text,
	`length` integer,
	`wipes` integer,
	`deaths` integer,
	`ressUsed` integer,
	`instance_id` integer
);
--> statement-breakpoint
CREATE TABLE `boss` (
	`id` integer PRIMARY KEY NOT NULL,
	`entry` integer,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `raid` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `boss_entry_unique` ON `boss` (`entry`);--> statement-breakpoint
CREATE UNIQUE INDEX `raid_name_unique` ON `raid` (`name`);