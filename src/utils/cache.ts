import { redis } from "@/config";

async function findCachedData(key: string) {
  const haveCache = await redis.exists(key);

  if (haveCache) {
    const data = await redis.get(key);
    return JSON.parse(data);
  }

  return [];
}

function cacheData<Type>({ key, value }: CacheDataParams<Type>) {
  redis.set(key, JSON.stringify(value));
}

function clearCache() {
  redis.flushAll();
}

function deleteCachedKey(key: string | string[]) {
  redis.del(key);
}

type CacheDataParams<Type> = { key: string; value: Type };

export { findCachedData, cacheData, clearCache, deleteCachedKey };
