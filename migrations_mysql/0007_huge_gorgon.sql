USE bosskills;--> statement-breakpoint
START TRANSACTION;--> statement-breakpoint
CREATE TABLE `boss_prop` (
	`id` int AUTO_INCREMENT NOT NULL,
	`boss_id` int NOT NULL,
	`mode` int NOT NULL,
	`health` int NOT NULL,
	CONSTRAINT `boss_prop_id` PRIMARY KEY(`id`),
	CONSTRAINT `boss_props_unique_boss_mode_health` UNIQUE(`boss_id`, `mode`, `health`)
);
--> statement-breakpoint
ALTER TABLE `boss_prop` ADD CONSTRAINT `boss_prop_boss_id_boss_id_fk` FOREIGN KEY (`boss_id`) REFERENCES `boss`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint

SET @d10n=3;--> statement-breakpoint
SET @d25n=4;--> statement-breakpoint
SET @d10hc=5;--> statement-breakpoint
SET @d25hc=6;--> statement-breakpoint
SET @dlfr=7;--> statement-breakpoint
SET @boss=(SELECT id FROM boss WHERE remote_id = 59915);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  130841100),
(@boss, @d25n,  366355080),
(@boss, @d10hc, 235513980),
(@boss, @d25hc, 769345668),
(@boss, @dlfr,  212616787);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60009);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  130841100),
(@boss, @d25n,  457943850),
(@boss, @d10hc, 209345760),
(@boss, @d25hc, 628037280),
(@boss, @dlfr,  318380010);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60143);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  117756990),
(@boss, @d25n,  309657270),
(@boss, @d10hc, 179252307),
(@boss, @d25hc, 542990565),
(@boss, @dlfr,  218068500);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60399);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  157009320),
(@boss, @d25n,  471027960),
(@boss, @d10hc, 235513980),
(@boss, @d25hc, 706541940),
(@boss, @dlfr,  239875350);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60410);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  294392475),
(@boss, @d25n,  883177425),
(@boss, @d10hc, 388161930),
(@boss, @d25hc, 1164485790),
(@boss, @dlfr,  305295900);--> statement-breakpoint


SET @boss=(SELECT id FROM boss WHERE remote_id = 60583);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,   93071635 + 2 *  60448588),
(@boss, @d25n,  279214907 + 2 * 181345764),
(@boss, @d10hc, 160934553 + 2 *  91588770),
(@boss, @d25hc, 483239796 + 2 * 274766310),
(@boss, @dlfr,  157009320 + 2 * 102492195);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60701);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  4 *  43613700),
(@boss, @d25n,  4 * 130841100),
(@boss, @d10hc, 4 *  65420550),
(@boss, @d25hc, 4 * 196261650),
(@boss, @dlfr,  4 *  69781920);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 60999);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  184704019),
(@boss, @d25n,  554112058),
(@boss, @d10hc, 544037293),
(@boss, @d25hc, 1632111881),
(@boss, @dlfr,  343806797);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62164);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 290759453),
(@boss, @d25hc, 872274000),
(@boss, @dlfr,  348909600);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62397);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  284797461),
(@boss, @d25n,  854392383),
(@boss, @d10hc, 588784950),
(@boss, @d25hc, 1766354850),
(@boss, @dlfr,  401246040);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62442);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  174454800),
(@boss, @d25n,  523364400),
(@boss, @d10hc, 279127680),
(@boss, @d25hc, 837383040),
(@boss, @dlfr,  285669735);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62511);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 340186860),
(@boss, @d25hc, 1020560580),
(@boss, @dlfr,  261682200);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62543);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  150467265),
(@boss, @d25n,  451401795),
(@boss, @d10hc, 196261650),
(@boss, @d25hc, 586604265),
(@boss, @dlfr,  294392475);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62837);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  109034250),
(@boss, @d25n,  610591800),
(@boss, @d10hc, 307476585),
(@boss, @d25hc, 940311372),
(@boss, @dlfr,  457943850);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62980);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  654205500),
(@boss, @d25n,  436137000),
(@boss, @d10hc, 218068500),
(@boss, @d25hc, 0),
(@boss, @dlfr,  305295900);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 62983);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  138168201),
(@boss, @d25n,  414504604),
(@boss, @d10hc, 301457894),
(@boss, @d25hc, 904373683),
(@boss, @dlfr,  257181266);--> statement-breakpoint


SET @boss=(SELECT id FROM boss WHERE remote_id = 67977);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  179999845),
(@boss, @d25n,  599998032),
(@boss, @d10hc, 319999822),
(@boss, @d25hc, 1000001081),
(@boss, @dlfr,  389998502);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68036);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  163799973),
(@boss, @d25n,  785046600),
(@boss, @d10hc, 392523300),
(@boss, @d25hc, 1177569900),
(@boss, @dlfr,  431775630);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68065);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  315981256),
(@boss, @d25n,  789953141),
(@boss, @d10hc, 413828592),
(@boss, @d25hc, 1026923818),
(@boss, @dlfr,  552951934);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68078);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  119937675),
(@boss, @d25n,  359813025),
(@boss, @d10hc, 155700909),
(@boss, @d25hc, 467102727),
(@boss, @dlfr,  175763211);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68397);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  329283435),
(@boss, @d25n,  990030990),
(@boss, @d10hc, 580498347),
(@boss, @d25hc, 1747600959),
(@boss, @dlfr,  608411115);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68476);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  357632340),
(@boss, @d25n,  1177569900),
(@boss, @d10hc, 654205500),
(@boss, @d25hc, 1962616500),
(@boss, @dlfr,  654205500);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 68905);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  2 * 219812670),
(@boss, @d25n,  2 * 659438010),
(@boss, @d10hc, 2 * 314018100),
(@boss, @d25hc, 2 * 800746155),
(@boss, @dlfr,  2 * 383799900);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 69017);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  218068500),
(@boss, @d25n,  654205500),
(@boss, @d10hc, 258193104),
(@boss, @d25hc, 774579312),
(@boss, @dlfr,  327102750);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 69132);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  4 * 74884722),
(@boss, @d25n,  4 * 224610555),
(@boss, @d10hc, 4 * 117582535),
(@boss, @d25hc, 4 * 352747605),
(@boss, @dlfr,  4 * 141308388);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 69427);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  80999799),
(@boss, @d25n,  270000204),
(@boss, @d10hc, 288000014),
(@boss, @d25hc, 899994867),
(@boss, @dlfr,  288286557);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 69465);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  207601212),
(@boss, @d25n,  622803636),
(@boss, @d10hc, 317507736),
(@boss, @d25hc, 952523208),
(@boss, @dlfr,  545171250);--> statement-breakpoint

SET @boss=(SELECT id FROM boss WHERE remote_id = 69712);--> statement-breakpoint
INSERT IGNORE INTO `boss_prop` (`boss_id`, `mode`, `health`) VALUES
(@boss, @d10n,  43613700),
(@boss, @d25n,  732710160),
(@boss, @d10hc, 366355080),
(@boss, @d25hc, 1099065240),
(@boss, @dlfr,  402990588);--> statement-breakpoint

COMMIT;