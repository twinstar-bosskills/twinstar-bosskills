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
	`instance_id` integer,
	FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `boss` (
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
CREATE UNIQUE INDEX `boss_kill_remote_id_unique` ON `boss_kill` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boss_remote_id_unique` ON `boss` (`remote_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `raid_name_unique` ON `raid` (`name`);