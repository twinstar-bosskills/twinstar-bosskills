const CACHE: Record<string, unknown> = {};
const TIMERS: Record<string, number> = {};
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
	/**
	 * In seconds
	 * Default: 60 * 60 = 1 hour
	 */
	expire?: number;
};

export const withCache = async <T = unknown>({
	deps,
	fallback,
	expire = 60 * 60
}: Args<T>): Promise<T> => {
	const key = await sha256(JSON.stringify(deps));
	if (typeof CACHE[key] === 'undefined') {
		// console.log(`cache-miss, key: ${key}`);
		CACHE[key] = await fallback();
		try {
			if (typeof TIMERS[key] !== 'undefined') {
				clearTimeout(TIMERS[key]);
			}

			try {
				TIMERS[key] = setTimeout(() => {
					delete CACHE[key];
				}, 1000 * expire);
			} catch (e) {}
		} catch (e) {
			// ignore
		}
	} else {
		// console.log(`cache-hit, key: ${key}`, CACHE[key]);
	}

	return CACHE[key] as T;
};
