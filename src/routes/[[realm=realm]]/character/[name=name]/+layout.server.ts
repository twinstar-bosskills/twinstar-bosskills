import { REALM_HELIOS } from '$lib/realm';
import * as api from '$lib/server/api';
import { assertGuildTokenFromCookie } from '$lib/server/guild-token.service';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ cookies, params, url }) => {
	const realm = params.realm ?? REALM_HELIOS;
	const name = params.name.charAt(0).toUpperCase() + params.name.slice(1);

	const character = await api.getCharacterByName({ name, realm });

	if (character === null) {
		throw error(404, { message: `Character ${name} was not found` });
	}

	assertGuildTokenFromCookie({ guild: character.guildName, cookies, realm });

	const talents = character.talents;
	return {
		character: {
			name,
			guid: character.guid,
			class: character.class,
			spec: talents.talentTree[talents.activeTalentGroup] ?? 0
		}
	};
};
