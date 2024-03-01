CREATE TABLE `realm_x_raid` (
	`realm_id` integer NOT NULL,
	`raid_id` integer NOT NULL,
	FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON UPDATE no action ON DELETE no action
);--> statement-breakpoint
CREATE UNIQUE INDEX realm_x_raid_unique ON `realm_x_raid` (`realm_id`, `raid_id`);