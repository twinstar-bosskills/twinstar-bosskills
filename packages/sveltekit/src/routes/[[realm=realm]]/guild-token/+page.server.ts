import { REALM_CATA_PROUDMOORE } from '@twinstar-bosskills/core/dist/realm';
import { createGuildToken } from '$lib/server/guild-token.service';
import { addYears } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const form = await request.formData();
		const guild = String(form.get('guild') ?? '').trim();
		const token = String(form.get('token') ?? '').trim();
		const realm = params?.realm ?? REALM_CATA_PROUDMOORE;
		if (createGuildToken({ guild, realm }) !== token) {
			return {
				message: `Either token or guild or realm is wrong. Please try again.`
			};
		}

		cookies.set('guild-token', token, {
			path: `/${realm}`,
			httpOnly: true,
			expires: addYears(new Date(), 1)
		});
		cookies.set('guild-name', guild, {
			path: `/${realm}`,
			httpOnly: true,
			expires: addYears(new Date(), 1)
		});

		return {
			message: 'Token saved'
		};
	}
} satisfies Actions;

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		token: cookies.get('guild-token') ?? '',
		guild: cookies.get('guild-name') ?? ''
	};
};
