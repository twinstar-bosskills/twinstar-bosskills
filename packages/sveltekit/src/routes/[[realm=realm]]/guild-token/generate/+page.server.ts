import { SECRET_TOKEN_ADMIN } from '$env/static/private';
import { REALM_CATA_PROUDMOORE } from '$lib/realm';
import { createGuildToken } from '$lib/server/guild-token.service';
import { addYears } from 'date-fns';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const form = await request.formData();
		const guild = String(form.get('guild') ?? '').trim();
		const adminToken = String(form.get('admin-token') ?? '').trim();
		if (adminToken !== SECRET_TOKEN_ADMIN) {
			return {
				message: `Wrong admin token`
			};
		}

		cookies.set('admin-token', adminToken, {
			path: '/',
			httpOnly: true,
			expires: addYears(new Date(), 1)
		});

		const realm = params?.realm ?? REALM_CATA_PROUDMOORE;
		return {
			message: `Token for guild ${guild} and realm ${realm} is: ${createGuildToken({
				guild,
				realm
			})}`
		};
	}
} satisfies Actions;

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		token: cookies.get('admin-token')
	};
};
