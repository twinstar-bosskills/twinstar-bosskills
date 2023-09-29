const CACHE: Record<string, unknown> = {};
const TIMERS: Record<string, number | NodeJS.Timeout> = {};
/**
 * @see https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world/
 */
async function sha256(str: string) {
	const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
	return Array.prototype.map
		.call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
		.join('');
}

const setupTimer = (key: string, expire: number) => {
	try {
		if (typeof TIMERS[key] !== 'undefined') {
			clearTimeout(TIMERS[key]);
		}

		TIMERS[key] = setTimeout(() => {
			delete CACHE[key];
		}, 1000 * expire);
	} catch (e) {}
};

type Args<T> = {
	deps: unknown[];
	fallback: () => Promise<T>;
	/**
	 * In seconds
	 * Default: 60 * 60 = 1 hour
	 */
	expire?: number;
	/**
	 * Refresh timers on cache hit
	 */
	sliding?: boolean;
};

export const withCache = async <T = unknown>({
	deps,
	fallback,
	expire = 60 * 60,
	sliding = true
}: Args<T>): Promise<T> => {
	const key = await sha256(JSON.stringify(deps));
	if (typeof CACHE[key] === 'undefined') {
		// console.log(`cache-miss, key: ${key}`);
		try {
			CACHE[key] = await fallback();
			setupTimer(key, expire);
		} catch (e) {
			// ignore
		}
	} else {
		// console.log(`cache-hit, key: ${key}`, CACHE[key]);
		// refresh timer on cache hit
		if (sliding) {
			setupTimer(key, expire);
		}
	}

	return CACHE[key] as T;
};
