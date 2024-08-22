import { createGuildToken } from '$lib/server/guild-token.service';
import type { Actions, PageServerLoad } from './$types';
export const actions: Actions = {
	default: async ({ request, cookies, params }) => {
		const form = await request.formData();
		const guild = String(form.get('guild') ?? '').trim();
		const token = String(form.get('token') ?? '').trim();

		if (createGuildToken(guild) !== token) {
			return {
				message: `Either token or guild is wrong. Please try again.`
			};
		}

		cookies.set('guild-token', token, { path: '/' });
		cookies.set('guild-name', guild, { path: '/' });

		return {
			message: 'Token saved'
		};
	}
} satisfies Actions;

export const load: PageServerLoad = async ({ request, cookies, parent }) => {
	return {
		token: cookies.get('guild-token') ?? '',
		guild: cookies.get('guild-name') ?? ''
	};
};
