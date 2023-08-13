const CACHE: Record<string, unknown> = {};

/**
 * @see https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world/
 */
async function sha256(str: string) {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
	return Array.prototype.map
		.call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
		.join('');
}

type Args<T> = {
	deps: unknown[];
	fallback: () => Promise<T>;
};
export const withCache = async <T = unknown>({ deps, fallback }: Args<T>): Promise<T> => {
	const key = await sha256(JSON.stringify(deps));
	if (typeof CACHE[key] === 'undefined') {
		// console.log(`cache-miss, key: ${key}`);
		try {
			CACHE[key] = await fallback();
		} catch (e) {
			// ignore
		}
	} else {
		// console.log(`cache-hit, key: ${key}`, CACHE[key]);
	}

	return CACHE[key] as T;
};
