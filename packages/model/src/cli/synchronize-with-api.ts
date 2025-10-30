import { raidLock } from "@twinstar-bosskills/core/src/date";
import { db } from "@twinstar-bosskills/db";
import { program } from "commander";
import { synchronize } from "../synchronize";
import {
  integerGte,
  listOfIntegers,
  listOfStrings,
  realmString,
  ymd,
} from "@twinstar-bosskills/core/src/cli/parse-args";

const gteZero = integerGte(0);
program.option(
  "--offset <number>",
  "Raid lock offset. Pass 0 or do not pass at all for current raid lock",
  gteZero,
);
program.option(
  "--bosskill-ids <items>",
  "comma separated list of bosskill ids",
  listOfIntegers,
);
program.option(
  "--boss-ids <items>",
  "comma separated list of boss ids",
  listOfIntegers,
);
program.option("--page <number>", "Page number", gteZero);
program.option("--page-size <number>", "Page size", gteZero);
program.option("--realm <string>", "Realm", realmString);
program.option("--realms <items>", "Realms", listOfStrings);
program.option(
  "--from-date <string>",
  "Starting date in YYYY-MM-DD format",
  ymd,
);
program.parse();

console.log(program.opts());
const {
  offset,
  bosskillIds,
  bossIds,
  page,
  pageSize,
  realm,
  realms,
  fromDate,
} = program.opts();

let startsAt: Date | undefined = undefined;
let endsAt: Date | undefined = undefined;
if (typeof offset !== "undefined") {
  const now = new Date();
  const { start, end } = raidLock(now, offset);
  startsAt = start;
  endsAt = end;
}

if (typeof fromDate !== "undefined") {
  console.log(`--from-date given, ignoring raid lock start and end`);
  startsAt = fromDate;
  endsAt = undefined;
}

console.log({ realm, realms, startsAt, endsAt });
try {
  const realmsToSync = Array.isArray(realms) ? realms : [realm];
  await Promise.all(
    realmsToSync.map((realm) => {
      return synchronize({
        onLog: console.log,
        realm,
        startsAt,
        endsAt,
        bosskillIds,
        bossIds,
        page,
        pageSize,
      });
    }),
  );

  console.log("Done");
  await db.destroy();
  process.exit(0);
} catch (e) {
  console.error(e);
  await db.destroy();
  process.exit(1);
}
