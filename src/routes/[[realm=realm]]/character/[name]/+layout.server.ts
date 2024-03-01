import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
import { REALM_HELIOS, realmToExpansion } from '$lib/realm';
import * as api from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { talentSpecToClass } from '$lib/model';
export const load: LayoutServerLoad = async ({ params, url }) => {
	const realm = params.realm ?? REALM_HELIOS;
	const name = params.name.charAt(0).toUpperCase() + params.name.slice(1);
	const page = getPageFromURL(url);
	const pageSize = getPageSizeFromURL(url, 20);
	// TODO: this API is incredibly slow
	// const character = await api.getCharacterByName({ name, realm });

	const data = await api.getCharacterBossKills({
		realm,
		name,
		page,
		pageSize
	});

	if (data.length === 0) {
		throw error(404, { message: `No bosskills for character ${name} were found` });
	}

	const character = data[0] ?? null;
	const guid = character?.guid ?? null;
	if (character === null || guid === null) {
		throw error(404, { message: `No bosskills for character ${name} were found` });
	}

	return {
		character: {
			name,
			guid: character.guid,
			class: talentSpecToClass(realmToExpansion(realm), character.talent_spec),
			spec: character.talent_spec
		}
	};
};
