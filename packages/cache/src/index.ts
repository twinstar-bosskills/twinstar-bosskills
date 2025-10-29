import stableStringify from "json-stable-stringify";
import { createDragonflyClient } from "./dragonfly";
const CACHE: Record<string, unknown> = {};
const TIMERS: Record<string, number | NodeJS.Timeout> = {};
/**
 * @see https://jameshfisher.com/2017/10/30/web-cryptography-api-hello-world/
 */
async function sha256(str: string) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return Array.prototype.map
    .call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

type Args<T> = {
  deps: unknown[];
  fallback: () => Promise<T> | T;
  /**
   * In seconds
   * Default: 24 * 60 * 60 = 1 day
   */
  expire?: number;
  /**
   * Refresh timers on cache hit
   */
  sliding?: boolean;
  defaultValue?: T;
  /**
   * Force to set cached item again even if found
   */
  force?: boolean;
};

const setupTimer = (key: string, expire: number) => {
  try {
    if (typeof TIMERS[key] !== "undefined") {
      clearTimeout(TIMERS[key]);
    }

    TIMERS[key] = setTimeout(() => {
      delete CACHE[key];
    }, 1000 * expire);
  } catch (e) {}
};

export const EXPIRE_5_MIN = 5 * 60;
export const EXPIRE_30_MIN = 30 * 60;
export const EXPIRE_1_HOUR = 60 * 60;
export const EXPIRE_1_DAY = 24 * EXPIRE_1_HOUR;
export const EXPIRE_7_DAYS = 7 * EXPIRE_1_DAY;
const EXPIRE_DEFAULT = EXPIRE_1_DAY;

const createKey = async (deps: unknown[]) => {
  const str = stableStringify(deps);
  if (typeof str !== "string") {
    console.error("stableStringify has failed", { deps });
    throw new Error("stableStringify has failed");
  }
  const k = sha256(str);
  // prefix key if possible
  if (typeof deps[0] === "string") {
    return deps[0] + ":" + (await k);
  }
  return k;
};
const memory = async <T = unknown>({
  deps,
  fallback,
  expire = EXPIRE_DEFAULT,
  sliding = true,
  defaultValue = undefined,
}: Args<T>): Promise<T> => {
  const key = await createKey(deps);
  const item = CACHE[key];
  if (typeof item === "undefined") {
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
const delay = <T = unknown>({
  timeout = 1000,
  value = undefined,
}: DelayArgs<T> = {}) =>
  new Promise<T>((res) => setTimeout(() => res(value as T), timeout));
const df = createDragonflyClient();
const dragonfly = async <T = unknown>({
  deps,
  fallback,
  expire = EXPIRE_DEFAULT,
  sliding = true,
  force = false,
  defaultValue = undefined,
}: Args<T>): Promise<T> => {
  const key = await createKey(deps);

  // remove keys with ttl bigger that it should be
  if (!sliding) {
    const ttl = await df.ttl(key);
    if (ttl > expire) {
      await df.del(key);
    }
  }

  const item = await Promise.race([df.get(key), delay({ value: null })]);
  if (item === null || force) {
    try {
      // TODO: lock?
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

type BlobCacheItem = { type: Blob["type"]; value: string } | null;
export const blobCacheGet = async (key: string): Promise<BlobCacheItem> => {
  const v = await df.hget("blob-cache", key);
  if (v !== null) {
    try {
      const item = JSON.parse(v);
      if (typeof item?.type !== "string" || typeof item?.value !== "string") {
        throw new Error(`Invalid item: ${v}`);
      }
      return item;
    } catch (e) {
      // ignore
    }
  }
  return null;
};

export const blobCacheSet = async (
  key: string,
  blob: Blob,
): Promise<BlobCacheItem> => {
  try {
    const value = Buffer.from(await blob.arrayBuffer()).toString("binary");
    const item = { type: blob.type, value };
    await df.hset("blob-cache", { [key]: JSON.stringify(item) });

    return item;
  } catch (e) {
    // ignore
  }
  return null;
};
