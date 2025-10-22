import { browser } from '$app/environment';
import type { SvelteComponent } from 'svelte';

const CACHE: Record<string, string> = {};
export const renderComponentToHtml = <
	C extends new (options: { target: Element; props: P }) => SvelteComponent<P>,
	P extends Record<string, any>
>(
	component: C,
	props: P
): string => {
	if (browser) {
		let key = '';
		try {
			key = JSON.stringify(props);
		} catch (e) {}
		const useCache = key !== '';

		if (useCache && typeof CACHE[key] === 'string') {
			return CACHE[key]!;
		}

		const temp = document.createElement('div');
		new component({
			target: temp,
			props
		});

		// Extract the HTML
		const html = temp.innerHTML;

		if (useCache) {
			CACHE[key] = html;
		}
		return html;
	}
	return '';
};
