USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
CREATE TABLE `realm_x_raid` (
	`realm_id` int NOT NULL,
	`raid_id` int NOT NULL
);
--> statement-breakpoint
ALTER TABLE `realm_x_raid` ADD CONSTRAINT realm_x_raid_unique UNIQUE (`realm_id`, `raid_id`);--> statement-breakpoint
ALTER TABLE `realm_x_raid` ADD CONSTRAINT `realm_x_raid_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `realm_x_raid` ADD CONSTRAINT `realm_x_raid_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
COMMIT;