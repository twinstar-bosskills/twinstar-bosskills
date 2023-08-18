import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
export const actions: Actions = {
	select: async ({ request, cookies }) => {
		const form = await request.formData();
		const character = String(form.get('character') ?? '').trim();

		cookies.set('character', character);

		/*
		const redirectUrl = String(form.get('redirectUrl') ?? '').trim();
		if (redirectUrl.startsWith('/') === false) {
			throw redirect(303, '/');
		}
		throw redirect(303, redirectUrl);
		*/

		throw redirect(303, `/character/${character}`);
	}
} satisfies Actions;
