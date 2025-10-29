import { getRemoteClassIconUrl } from '@twinstar-bosskills/api/dist/class';
import { getRemoteRaceIconUrl } from '@twinstar-bosskills/api/dist/race';
import { getRemoteRaidIconUrl } from '@twinstar-bosskills/api/dist/raid';
import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';
import { getRemoteItemIconUrl } from '$lib/server/api';
import { blobCacheGet, blobCacheSet } from '@twinstar-bosskills/cache';
import { getRemoteTalentSpecIconUrl } from '@twinstar-bosskills/api/dist/talent';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
const getBlob = async (url: string): Promise<Blob | null> => {
	const fallback = async () => {
		try {
			const res = await fetch(url);
			const blob = await res.blob();
			if (
				blob.type === 'image/png' ||
				blob.type === 'image/jpeg' ||
				blob.type === 'image/webp' ||
				blob.type === 'application/octet-stream'
			) {
				return blob;
			}

			throw new Error(`Invalid blob type: ${blob.type}`);
		} catch (e) {
			console.error(e);
			// throw e;
			return null;
		}
	};

	// not using withCache(), cos blob was causing problem when serializing
	return fallback();
};

export const GET: RequestHandler = async ({ url }) => {
	const realm = url.searchParams.get('realm') ?? REALM_HELIOS;
	const type = url.searchParams.get('type') ?? '';
	let id: string | number = url.searchParams.get('id') ?? '';
	if (type !== 'race' && type !== 'raid') {
		id = Number(id);
		if (isFinite(id) === false || isNaN(id)) {
			error(400, 'id must be finite integer');
		}
	}

	let iconUrl = null;
	if (type === 'item') {
		iconUrl = getRemoteItemIconUrl(id as number);
	} else if (type === 'talent') {
		iconUrl = getRemoteTalentSpecIconUrl(realm, id as number);
	} else if (type === 'class') {
		iconUrl = getRemoteClassIconUrl(id as number);
	} else if (type === 'race') {
		iconUrl = getRemoteRaceIconUrl(id as string);
	} else if (type === 'raid') {
		iconUrl = getRemoteRaidIconUrl(decodeURIComponent(id as string));
	}
	if (iconUrl !== null) {
		const cached = await blobCacheGet(iconUrl);
		const headers: HeadersInit = {
			// 14 days
			'Cache-Control': 'max-age=1209600, s-maxage=1209600'
		};
		let blob = null;
		let blobType = undefined;
		if (cached === null) {
			headers['X-Cache-Miss'] = '1';
			blob = await getBlob(iconUrl);
			if (blob != null) {
				blobType = blob.type;
				await blobCacheSet(iconUrl, blob);
			}
		} else {
			headers['X-Cache-Hit'] = '1';
			// @ts-ignore
			blob = new Blob([Buffer.from(cached.value, 'binary')], { type: cached.type });
			blobType = cached.type;
		}

		if (blob !== null) {
			if (blobType) {
				headers['Content-Type'] = blobType;
			}
			return new Response(blob, {
				headers
			});
		}

		// return placeholder
		redirect(302, `/icons/inv_misc_questionmark.png`);
		// throw error(404, `img not found by id ${id} and type ${type}`);
	}

	error(400, `unknown type ${type}`);
};
