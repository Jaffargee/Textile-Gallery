// lib/cache-service.ts

interface CacheEntry {
      data: any;
      timestamp: number;
      expiresIn?: number;
}

export default class Cache {

      private memcache = new Map<string, CacheEntry>();

      private static instance: Cache | null = null;

      static getInstance() {
            if (Cache.instance === null) {
                  Cache.instance = new Cache();
                  return Cache.instance;
            }
            return Cache.instance;
      }

      exists(key: string): boolean {
            const entry = this.memcache.get(key);
            if (!entry) return false;
            if (entry.expiresIn) {
                  const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
                  if (isExpired) {
                        this.memcache.delete(key);
                        return false;
                  }
            }
            return true;
      }

      addData<T>(key: string, value: T, expiresIn?: number): void {
            this.memcache.set(key, {
                  data: value,
                  timestamp: Date.now(),
                  expiresIn
            });
      }

      getData<T>(key: string): T | undefined {
            const entry = this.memcache.get(key);
            if (!entry) {
                  return undefined;
            }
            return entry.data as T;
      }

      deleteData(key: string): boolean {
            return this.memcache.delete(key);
      }

      clear(): void {
            this.memcache.clear();
      }

      invalidatePattern(pattern: string): void {
            for (const key of this.memcache.keys()) {
                  if (key.includes(pattern)) {
                        this.memcache.delete(key);
                  }
            }
      }
}