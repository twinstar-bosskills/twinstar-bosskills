import { raidLock } from '$lib/date';
import { program } from 'commander';
import { synchronize } from '../db/synchronize';

import { integerGte, listOfIntegers } from './parse-args';

const gteZero = integerGte(0);
program.option(
	'--offset <number>',
	'Raid lock offset. Pass 0 or do not pass at all for current raid lock',
	gteZero
);
program.option('--bosskill-ids <items>', 'comma separated list of bosskill ids', listOfIntegers);
program.option('--boss-ids <items>', 'comma separated list of boss ids', listOfIntegers);
program.option('--page <number>', 'Page number', gteZero);
program.option('--page-size <number>', 'Page size', gteZero);
program.parse();

console.log(program.opts());
const { offset, bosskillIds, bossIds, page, pageSize } = program.opts();

let startAt: Date | undefined = undefined;
if (typeof offset !== 'undefined') {
	const now = new Date();
	const { start } = raidLock(now, offset);
	startAt = start;
}

await synchronize({
	onLog: console.log,
	startAt,
	bosskillIds,
	bossIds,
	page,
	pageSize
});
process.exit(0);
