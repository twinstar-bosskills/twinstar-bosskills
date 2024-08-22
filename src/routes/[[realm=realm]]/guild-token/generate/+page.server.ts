import { SECRET_TOKEN_ADMIN } from '$env/static/private';
import { createGuildToken } from '$lib/server/guild-token.service';

import type { Actions, PageServerLoad } from './$types';
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const guild = String(form.get('guild') ?? '').trim();
		const adminToken = String(form.get('admin-token') ?? '').trim();
		if (adminToken !== SECRET_TOKEN_ADMIN) {
			return {
				message: `Wrong admin token`
			};
		}

		cookies.set('admin-token', adminToken, { path: '/' });

		return { message: `Token for guild ${guild} is: ${createGuildToken(guild)}` };
	}
} satisfies Actions;

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		token: cookies.get('admin-token')
	};
};
