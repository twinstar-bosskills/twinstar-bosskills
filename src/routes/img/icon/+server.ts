import { getRemoteClassIconUrl } from '$lib/class';
import { getRemoteRaceIconUrl } from '$lib/race';
import { getRemoteItemIconUrl } from '$lib/server/api';
import { withCache } from '$lib/server/cache';
import { getRemoteTalentSpecIconUrl } from '$lib/talent';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const getBlob = async (url: string): Promise<Blob | null> => {
	const fallback = async () => {
		try {
			const res = await fetch(url);
			const blob = await res.blob();
			return blob;
		} catch (e) {
			console.error(e);
			throw e;
		}
	};
	return (
		withCache({
			deps: [`img-icon-blob`, url],
			fallback
		}) ?? null
	);
};

export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type') ?? '';
	let id: string | number = url.searchParams.get('id') ?? '';
	if (type !== 'race') {
		id = Number(id);
		if (isFinite(id) === false || isNaN(id)) {
			throw error(400, 'id must be finite integer');
		}
	}

	let iconUrl = null;
	if (type === 'item') {
		iconUrl = getRemoteItemIconUrl(id as number);
	} else if (type === 'talent') {
		iconUrl = getRemoteTalentSpecIconUrl(id as number);
	} else if (type === 'class') {
		iconUrl = getRemoteClassIconUrl(id as number);
	} else if (type === 'race') {
		iconUrl = getRemoteRaceIconUrl(id as string);
	}
	if (iconUrl !== null) {
		const blob = await getBlob(iconUrl);
		if (blob !== null) {
			return new Response(blob, {
				headers: {
					// 14 days
					'Cache-Control': 'max-age=1209600, s-maxage=1209600'
				}
			});
		}
		// TODO: show placeholder image?
		throw error(404, `img not found by id ${id} and type ${type}`);
	}

	throw error(400, `unknown type ${type}`);
};
