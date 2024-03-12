import { createDragonflyClient } from './cache/dragonfly';

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

type Args<T> = {
	deps: unknown[];
	fallback: () => Promise<T>;
	/**
	 * In seconds
	 * Default: 5 * 60 = 5 min
	 */
	expire?: number;
	/**
	 * Refresh timers on cache hit
	 */
	sliding?: boolean;
	defaultValue?: T;
};

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

const memory = async <T = unknown>({
	deps,
	fallback,
	expire = 5 * 60,
	sliding = true,
	defaultValue = undefined
}: Args<T>): Promise<T> => {
	const key = await sha256(JSON.stringify(deps));
	const item = CACHE[key];
	if (typeof item === 'undefined') {
		try {
			const data = await fallback();
			CACHE[key] = data;
			setupTimer(key, expire);
			return data;
		} catch (e) {
			// ignore
			return defaultValue as T;
		}
	} else {
		// refresh timer on cache hit
		if (sliding) {
			setupTimer(key, expire);
		}

		return item as T;
	}

	// @ts-ignore
	return defaultValue as T;
};

type DelayArgs<T> = {
	timeout?: number;
	value?: T;
};
const delay = <T = unknown>(
	{ timeout, value }: DelayArgs<T> = {
		timeout: 1000,
		value: undefined
	}
) => new Promise<T>((res) => setTimeout(() => res(value as T), timeout));
const df = createDragonflyClient();
const dragonfly = async <T = unknown>({
	deps,
	fallback,
	expire = 5 * 60,
	sliding = true,
	defaultValue = undefined
}: Args<T>): Promise<T> => {
	const key = await sha256(JSON.stringify(deps));
	const item = await Promise.race([df.get(key), delay({ value: null })]);
	if (item === null) {
		try {
			const data = await fallback();
			await df.set(key, JSON.stringify(data));
			df.expire(key, expire).catch(() => {});
			return data;
		} catch (e) {
			// ignore
			return defaultValue as T;
		}
	} else {
		// refresh timer on cache hit
		if (sliding) {
			df.expire(key, expire).catch(() => {});
		}

		try {
			return JSON.parse(item) as T;
		} catch (e) {
			// ignore
			return defaultValue as T;
		}
	}

	// @ts-ignore
	return defaultValue as T;
};

export const withCache = async <T = unknown>(args: Args<T>): Promise<T> => {
	return dragonfly<T>(args);
};
