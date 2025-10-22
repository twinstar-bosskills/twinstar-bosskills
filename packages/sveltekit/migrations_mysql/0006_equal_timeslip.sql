USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
ALTER TABLE `boss` ADD `position` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `raid` ADD `position` int DEFAULT 1 NOT NULL;--> statement-breakpoint

UPDATE `boss` SET position = 1 WHERE `name` = 'Stone Guard';--> statement-breakpoint
UPDATE `boss` SET position = 2 WHERE `name` = 'Feng the Accursed';--> statement-breakpoint
UPDATE `boss` SET position = 3 WHERE `name` = "Gara'jal the Spiritbinder";--> statement-breakpoint
UPDATE `boss` SET position = 4 WHERE `name` = 'Spirit Kings';--> statement-breakpoint
UPDATE `boss` SET position = 5 WHERE `name` = 'Elegon';--> statement-breakpoint
UPDATE `boss` SET position = 6 WHERE `name` = 'Will of the Emperor';--> statement-breakpoint
UPDATE `boss` SET position = 1 WHERE `name` = "Imperial Vizier Zor'lok";--> statement-breakpoint
UPDATE `boss` SET position = 2 WHERE `name` = "Blade Lord Ta'yak";--> statement-breakpoint
UPDATE `boss` SET position = 3 WHERE `name` = "Garalon";--> statement-breakpoint
UPDATE `boss` SET position = 4 WHERE `name` = "Wind Lord Mel'jarak";--> statement-breakpoint
UPDATE `boss` SET position = 5 WHERE `name` = "Amber-Shaper Un'sok";--> statement-breakpoint
UPDATE `boss` SET position = 6 WHERE `name` = "Grand Empress Shek'zeer";--> statement-breakpoint
UPDATE `boss` SET position = 1 WHERE `name` = "Protectors of the Endless";--> statement-breakpoint
UPDATE `boss` SET position = 2 WHERE `name` = "Tsulong";--> statement-breakpoint
UPDATE `boss` SET position = 3 WHERE `name` = "Lei Shi";--> statement-breakpoint
UPDATE `boss` SET position = 4 WHERE `name` = "Sha of Fear";--> statement-breakpoint
UPDATE `boss` SET position = 1 WHERE `name` = "Jin'rokh the Breaker";--> statement-breakpoint
UPDATE `boss` SET position = 2 WHERE `name` = "Horridon";--> statement-breakpoint
UPDATE `boss` SET position = 3 WHERE `name` = "Council of Elders";--> statement-breakpoint
UPDATE `boss` SET position = 4 WHERE `name` = "Tortos";--> statement-breakpoint
UPDATE `boss` SET position = 5 WHERE `name` = "Megaera";--> statement-breakpoint
UPDATE `boss` SET position = 6 WHERE `name` = "Ji-Kun";--> statement-breakpoint
UPDATE `boss` SET position = 7 WHERE `name` = "Durumu the Forgotten";--> statement-breakpoint
UPDATE `boss` SET position = 8 WHERE `name` = "Primordius";--> statement-breakpoint
UPDATE `boss` SET position = 9 WHERE `name` = "Dark Animus";--> statement-breakpoint
UPDATE `boss` SET position = 10 WHERE `name` = "Iron Qon";--> statement-breakpoint
UPDATE `boss` SET position = 11 WHERE `name` = "Twin Consorts";--> statement-breakpoint
UPDATE `boss` SET position = 12 WHERE `name` = "Lei Shen";--> statement-breakpoint
UPDATE `boss` SET position = 13 WHERE `name` = "Ra-den";--> statement-breakpoint

UPDATE `raid` SET position = 1 WHERE `name` = "Mogu'shan Vaults";--> statement-breakpoint
UPDATE `raid` SET position = 2 WHERE `name` = "Heart of Fear";--> statement-breakpoint
UPDATE `raid` SET position = 3 WHERE `name` = "Terrace of Endless Spring";--> statement-breakpoint
UPDATE `raid` SET position = 4 WHERE `name` = "Throne of Thunder";--> statement-breakpoint

COMMIT;