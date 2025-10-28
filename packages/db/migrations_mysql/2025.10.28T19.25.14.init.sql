CREATE DATABASE IF NOT EXISTS `bosskills`;
USE `bosskills`;

CREATE TABLE `bosskills`.`boss_kill_death` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boss_kill_id` int NOT NULL,
	`player_id` int NOT NULL,
	`remote_id` int NOT NULL,
	`time` int NOT NULL,
	`is_ress` int NOT NULL,
	CONSTRAINT `boss_kill_death_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_kill_death_remote_id_unique` UNIQUE(`remote_id`)
);

CREATE TABLE `bosskills`.`boss_kill_loot` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boss_kill_id` int NOT NULL,
	`item_id` int NOT NULL,
	`count` int NOT NULL,
	CONSTRAINT `boss_kill_loot_id` PRIMARY KEY(`id`)
);

CREATE TABLE `bosskills`.`boss_kill_player` (
	`id` int AUTO_INCREMENT NOT NULL,
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

CREATE TABLE `bosskills`.`boss_kill_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boss_kill_id` int NOT NULL,
	`encounterDamage` int NOT NULL,
	`encounterHeal` int NOT NULL,
	`raidDamage` int NOT NULL,
	`raidHeal` int NOT NULL,
	`time` int NOT NULL,
	CONSTRAINT `boss_kill_timeline_id` PRIMARY KEY(`id`)
);

CREATE TABLE `bosskills`.`boss_kill` (
	`id` int AUTO_INCREMENT NOT NULL,
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

CREATE TABLE `bosskills`.`boss` (
	`id` int AUTO_INCREMENT NOT NULL,
	`remote_id` int NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `boss_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_remote_id_unique` UNIQUE(`remote_id`)
);

CREATE TABLE `bosskills`.`player` (
	`id` int AUTO_INCREMENT NOT NULL,
	`remote_id` int,
	`name` text,
	CONSTRAINT `player_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_remote_id_unique` UNIQUE(`remote_id`)
);

CREATE TABLE `bosskills`.`raid` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `raid_id` PRIMARY KEY(`id`),
	CONSTRAINT `raid_name_unique` UNIQUE(`name`)
);

CREATE TABLE `bosskills`.`realm` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	CONSTRAINT `realm_id` PRIMARY KEY(`id`),
	CONSTRAINT `realm_name_unique` UNIQUE(`name`)
);

ALTER TABLE `boss_kill_death` ADD CONSTRAINT `boss_kill_death_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill_death` ADD CONSTRAINT `boss_kill_death_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill_loot` ADD CONSTRAINT `boss_kill_loot_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill_player` ADD CONSTRAINT `boss_kill_player_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill_player` ADD CONSTRAINT `boss_kill_player_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill_timeline` ADD CONSTRAINT `boss_kill_timeline_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `boss_kill` ADD CONSTRAINT `boss_kill_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;

ALTER TABLE `realm` ADD COLUMN `expansion` int NULL;
UPDATE `realm` SET `expansion` = 4 WHERE name = 'Helios';
UPDATE `realm` SET `expansion` = 3 WHERE name != 'Helios';
ALTER TABLE `realm` MODIFY COLUMN `expansion` int NOT NULL;

ALTER TABLE `player` DROP CONSTRAINT `player_remote_id_unique`;
ALTER TABLE `player` ADD COLUMN `realm_id` int NULL;

UPDATE player
SET realm_id = (SELECT id FROM realm WHERE name = 'Helios')
WHERE id IN (SELECT bkp.player_id FROM boss_kill AS bk
INNER JOIN realm ON realm.id = bk.realm_id AND realm.name = 'Helios'
INNER JOIN boss_kill_player AS bkp ON bkp.boss_kill_id = bk.id);

UPDATE player
SET realm_id = (SELECT id FROM realm WHERE name = 'Athena')
WHERE id IN (SELECT bkp.player_id FROM boss_kill AS bk
INNER JOIN realm ON realm.id = bk.realm_id AND realm.name = 'Athena'
INNER JOIN boss_kill_player AS bkp ON bkp.boss_kill_id = bk.id);

ALTER TABLE `player` MODIFY COLUMN `realm_id` int NOT NULL;
ALTER TABLE `player` ADD CONSTRAINT `player_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;


CREATE TABLE `realm_x_raid` (
	`realm_id` int NOT NULL,
	`raid_id` int NOT NULL
);

ALTER TABLE `realm_x_raid` ADD CONSTRAINT realm_x_raid_unique UNIQUE (`realm_id`, `raid_id`);
ALTER TABLE `realm_x_raid` ADD CONSTRAINT `realm_x_raid_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `realm_x_raid` ADD CONSTRAINT `realm_x_raid_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;


ALTER TABLE `boss` ADD `raid_id` int NULL;

UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Mogu'shan Vaults") WHERE remote_id IN (59915, 60009, 60143, 60701, 60410, 60399);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Heart of Fear") WHERE remote_id IN (62980, 62543, 62164, 62397, 62511, 62837);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Terrace of Endless Spring") WHERE remote_id IN (60583, 62442, 62983, 60999);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Baradin Hold") WHERE remote_id IN (47120, 52363, 55869);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "The Bastion of Twilight") WHERE remote_id IN (44600, 45992, 43735, 43324, 45213);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Blackwing Descent") WHERE remote_id IN (41570, 42179, 41378, 43296, 41442, 41376);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Throne of the Four Winds") WHERE remote_id IN (45871, 46753);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Firelands") WHERE remote_id IN (52498, 53691, 52558, 52530, 53494, 52571, 52409);
UPDATE `boss` SET `raid_id` = (SELECT `id` FROM `raid` WHERE `name` = "Dragon Soul") WHERE remote_id IN (55265, 55312, 55308, 55689, 55294, 56427, 53879, 56173);

ALTER TABLE `boss` MODIFY COLUMN `raid_id` int NOT NULL;
ALTER TABLE `boss` ADD CONSTRAINT `boss_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;





ALTER TABLE `realm` ADD `merged_to_id` int DEFAULT null;
ALTER TABLE `realm` ADD CONSTRAINT `realm_merged_to_id_realm_id_fk` FOREIGN KEY (`merged_to_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;

UPDATE `realm` SET merged_to_id = (SELECT id FROM realm WHERE name = 'Athena') WHERE name = 'Apollo';





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

ALTER TABLE `ranking` ADD CONSTRAINT `ranking_realm_id_realm_id_fk` FOREIGN KEY (`realm_id`) REFERENCES `realm`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_raid_id_raid_id_fk` FOREIGN KEY (`raid_id`) REFERENCES `raid`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_boss_kill_id_boss_kill_id_fk` FOREIGN KEY (`boss_kill_id`) REFERENCES `boss_kill`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ranking` ADD CONSTRAINT `ranking_player_id_player_id_fk` FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON DELETE no action ON UPDATE no action;





ALTER TABLE `boss` ADD `position` int DEFAULT 1 NOT NULL;
ALTER TABLE `raid` ADD `position` int DEFAULT 1 NOT NULL;

UPDATE `boss` SET position = 1 WHERE `name` = 'Stone Guard';
UPDATE `boss` SET position = 2 WHERE `name` = 'Feng the Accursed';
UPDATE `boss` SET position = 3 WHERE `name` = "Gara'jal the Spiritbinder";
UPDATE `boss` SET position = 4 WHERE `name` = 'Spirit Kings';
UPDATE `boss` SET position = 5 WHERE `name` = 'Elegon';
UPDATE `boss` SET position = 6 WHERE `name` = 'Will of the Emperor';
UPDATE `boss` SET position = 1 WHERE `name` = "Imperial Vizier Zor'lok";
UPDATE `boss` SET position = 2 WHERE `name` = "Blade Lord Ta'yak";
UPDATE `boss` SET position = 3 WHERE `name` = "Garalon";
UPDATE `boss` SET position = 4 WHERE `name` = "Wind Lord Mel'jarak";
UPDATE `boss` SET position = 5 WHERE `name` = "Amber-Shaper Un'sok";
UPDATE `boss` SET position = 6 WHERE `name` = "Grand Empress Shek'zeer";
UPDATE `boss` SET position = 1 WHERE `name` = "Protectors of the Endless";
UPDATE `boss` SET position = 2 WHERE `name` = "Tsulong";
UPDATE `boss` SET position = 3 WHERE `name` = "Lei Shi";
UPDATE `boss` SET position = 4 WHERE `name` = "Sha of Fear";
UPDATE `boss` SET position = 1 WHERE `name` = "Jin'rokh the Breaker";
UPDATE `boss` SET position = 2 WHERE `name` = "Horridon";
UPDATE `boss` SET position = 3 WHERE `name` = "Council of Elders";
UPDATE `boss` SET position = 4 WHERE `name` = "Tortos";
UPDATE `boss` SET position = 5 WHERE `name` = "Megaera";
UPDATE `boss` SET position = 6 WHERE `name` = "Ji-Kun";
UPDATE `boss` SET position = 7 WHERE `name` = "Durumu the Forgotten";
UPDATE `boss` SET position = 8 WHERE `name` = "Primordius";
UPDATE `boss` SET position = 9 WHERE `name` = "Dark Animus";
UPDATE `boss` SET position = 10 WHERE `name` = "Iron Qon";
UPDATE `boss` SET position = 11 WHERE `name` = "Twin Consorts";
UPDATE `boss` SET position = 12 WHERE `name` = "Lei Shen";
UPDATE `boss` SET position = 13 WHERE `name` = "Ra-den";

UPDATE `raid` SET position = 1 WHERE `name` = "Mogu'shan Vaults";
UPDATE `raid` SET position = 2 WHERE `name` = "Heart of Fear";
UPDATE `raid` SET position = 3 WHERE `name` = "Terrace of Endless Spring";
UPDATE `raid` SET position = 4 WHERE `name` = "Throne of Thunder";


CREATE TABLE `boss_prop` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boss_id` int NOT NULL,
	`mode` int NOT NULL,
	`health` int NOT NULL,
	CONSTRAINT `boss_prop_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_props_unique_boss_mode_health` UNIQUE(`boss_id`, `mode`, `health`)
);

ALTER TABLE `boss_prop` ADD CONSTRAINT `boss_prop_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;

SET @d10n=3;
SET @d25n=4;
SET @d10hc=5;
SET @d25hc=6;
SET @dlfr=7;
SET @boss=(SELECT id FROM boss WHERE remote_id = 59915);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  130841100),
(@boss, @d25n,  366355080),
(@boss, @d10hc, 235513980),
(@boss, @d25hc, 769345668),
(@boss, @dlfr,  212616787);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60009);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  130841100),
(@boss, @d25n,  457943850),
(@boss, @d10hc, 209345760),
(@boss, @d25hc, 628037280),
(@boss, @dlfr,  318380010);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60143);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  117756990),
(@boss, @d25n,  309657270),
(@boss, @d10hc, 179252307),
(@boss, @d25hc, 542990565),
(@boss, @dlfr,  218068500);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60399);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  157009320),
(@boss, @d25n,  471027960),
(@boss, @d10hc, 235513980),
(@boss, @d25hc, 706541940),
(@boss, @dlfr,  239875350);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60410);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  294392475),
(@boss, @d25n,  883177425),
(@boss, @d10hc, 388161930),
(@boss, @d25hc, 1164485790),
(@boss, @dlfr,  305295900);


SET @boss=(SELECT id FROM boss WHERE remote_id = 60583);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,   93071635 + 2 *  60448588),
(@boss, @d25n,  279214907 + 2 * 181345764),
(@boss, @d10hc, 160934553 + 2 *  91588770),
(@boss, @d25hc, 483239796 + 2 * 274766310),
(@boss, @dlfr,  157009320 + 2 * 102492195);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60701);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  4 *  43613700),
(@boss, @d25n,  4 * 130841100),
(@boss, @d10hc, 4 *  65420550),
(@boss, @d25hc, 4 * 196261650),
(@boss, @dlfr,  4 *  69781920);

SET @boss=(SELECT id FROM boss WHERE remote_id = 60999);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  184704019),
(@boss, @d25n,  554112058),
(@boss, @d10hc, 544037293),
(@boss, @d25hc, 1632111881),
(@boss, @dlfr,  343806797);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62164);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 290759453),
(@boss, @d25hc, 872274000),
(@boss, @dlfr,  348909600);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62397);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  284797461),
(@boss, @d25n,  854392383),
(@boss, @d10hc, 588784950),
(@boss, @d25hc, 1766354850),
(@boss, @dlfr,  401246040);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62442);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  174454800),
(@boss, @d25n,  523364400),
(@boss, @d10hc, 279127680),
(@boss, @d25hc, 837383040),
(@boss, @dlfr,  285669735);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62511);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 340186860),
(@boss, @d25hc, 1020560580),
(@boss, @dlfr,  261682200);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62543);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  150467265),
(@boss, @d25n,  451401795),
(@boss, @d10hc, 196261650),
(@boss, @d25hc, 586604265),
(@boss, @dlfr,  294392475);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62837);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  109034250),
(@boss, @d25n,  610591800),
(@boss, @d10hc, 307476585),
(@boss, @d25hc, 940311372),
(@boss, @dlfr,  457943850);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62980);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  654205500),
(@boss, @d25n,  436137000),
(@boss, @d10hc, 218068500),
(@boss, @d25hc, 0),
(@boss, @dlfr,  305295900);

SET @boss=(SELECT id FROM boss WHERE remote_id = 62983);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  138168201),
(@boss, @d25n,  414504604),
(@boss, @d10hc, 301457894),
(@boss, @d25hc, 904373683),
(@boss, @dlfr,  257181266);


SET @boss=(SELECT id FROM boss WHERE remote_id = 67977);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  179999845),
(@boss, @d25n,  599998032),
(@boss, @d10hc, 319999822),
(@boss, @d25hc, 1000001081),
(@boss, @dlfr,  389998502);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68036);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  163799973),
(@boss, @d25n,  785046600),
(@boss, @d10hc, 392523300),
(@boss, @d25hc, 1177569900),
(@boss, @dlfr,  431775630);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68065);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  315981256),
(@boss, @d25n,  789953141),
(@boss, @d10hc, 413828592),
(@boss, @d25hc, 1026923818),
(@boss, @dlfr,  552951934);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68078);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  119937675),
(@boss, @d25n,  359813025),
(@boss, @d10hc, 155700909),
(@boss, @d25hc, 467102727),
(@boss, @dlfr,  175763211);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68397);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  329283435),
(@boss, @d25n,  990030990),
(@boss, @d10hc, 580498347),
(@boss, @d25hc, 1747600959),
(@boss, @dlfr,  608411115);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68476);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  357632340),
(@boss, @d25n,  1177569900),
(@boss, @d10hc, 654205500),
(@boss, @d25hc, 1962616500),
(@boss, @dlfr,  654205500);

SET @boss=(SELECT id FROM boss WHERE remote_id = 68905);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  2 * 219812670),
(@boss, @d25n,  2 * 659438010),
(@boss, @d10hc, 2 * 314018100),
(@boss, @d25hc, 2 * 800746155),
(@boss, @dlfr,  2 * 383799900);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69017);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 258193104),
(@boss, @d25hc, 774579312),
(@boss, @dlfr,  327102750);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69132);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  4 * 74884722),
(@boss, @d25n,  4 * 224610555),
(@boss, @d10hc, 4 * 117582535),
(@boss, @d25hc, 4 * 352747605),
(@boss, @dlfr,  4 * 141308388);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69427);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  80999799),
(@boss, @d25n,  270000204),
(@boss, @d10hc, 288000014),
(@boss, @d25hc, 899994867),
(@boss, @dlfr,  288286557);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69465);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  207601212),
(@boss, @d25n,  622803636),
(@boss, @d10hc, 317507736),
(@boss, @d25hc, 952523208),
(@boss, @dlfr,  545171250);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69712);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  43613700),
(@boss, @d25n,  732710160),
(@boss, @d10hc, 366355080),
(@boss, @d25hc, 1099065240),
(@boss, @dlfr,  402990588);

SET @boss=(SELECT id FROM boss WHERE remote_id = 69473);
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10hc,  491090262),
(@boss, @d25hc, 1473270786);

