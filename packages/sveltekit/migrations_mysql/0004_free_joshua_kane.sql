USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint

ALTER TABLE `realm` ADD `merged_to_id` int DEFAULT null;--> statement-breakpoint
ALTER TABLE `realm` ADD CONSTRAINT `realm_merged_to_id_realm_id_fk` FOREIGN KEY (`merged_to_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint

UPDATE `realm` SET merged_to_id = (SELECT id FROM realm WHERE name = 'Athena') WHERE name = 'Apollo';--> statement-breakpoint

COMMIT;