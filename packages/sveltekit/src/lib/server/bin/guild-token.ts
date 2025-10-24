import { program } from 'commander';
import { accessSync, constants, readFileSync } from 'fs';
import { createGuildToken } from '../guild-token.service';
import { REALM_CATA_PROUDMOORE } from '@twinstar-bosskills/core/dist/realm';
try {
	program.requiredOption(
		'--input-file <path>',
		'Input .txt file with guild names separated by newline'
	);
	program.option('--realm <string>', 'Realm name, default Proudmoore', REALM_CATA_PROUDMOORE);
	program.parse();

	const { inputFile, realm } = program.opts();

	accessSync(inputFile, constants.R_OK);

	const contents = readFileSync(inputFile).toString().split('\n');
	console.log('Realm, Guild, Token');
	for (const line of contents) {
		const guild = line.replaceAll('"', '');
		const token = createGuildToken({ guild, realm });
		console.log(`${realm}, ${guild}, ${token}`);
	}

	console.log();
	console.log('Done');
	process.exit(0);
} catch (e) {
	console.error(e);
	process.exit(1);
}
