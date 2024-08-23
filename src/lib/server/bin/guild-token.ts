import { program } from 'commander';
import { accessSync, constants, readFileSync } from 'fs';
import { createGuildToken } from '../guild-token.service';
try {
	program.requiredOption(
		'--input-file <path>',
		'Input .txt file with guild names separated by newline'
	);
	program.parse();

	const { inputFile } = program.opts();

	accessSync(inputFile, constants.R_OK);

	const contents = readFileSync(inputFile).toString().split('\n');
	console.log('Guild, Token');
	for (const line of contents) {
		const guild = line.replaceAll('"', '');
		const token = createGuildToken(guild);
		console.log(`${guild}, ${token}`);
	}

	console.log();
	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
