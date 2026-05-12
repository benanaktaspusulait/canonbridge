import type { ValidateFunction } from 'ajv';

/**
 * Compiled transformation artifacts.
 * Cannot be directly serialized to Redis (contains functions).
 */
export type Compiled = {
  validateInput: ValidateFunction;
  validateOutput: ValidateFunction;
  evaluate: (input: unknown) => Promise<unknown>;
};

/**
 * Serializable cache entry for Redis storage.
 * Contains only the raw schemas and mapping text.
 */
export interface CacheEntry {
  inputSchema: unknown;
  canonicalSchema: unknown;
  mappingText: string;
}

/**
 * Cache abstraction for compiled transformation artifacts.
 * Supports both in-memory (default) and Redis backends.
 */
export interface TransformCache {
  /** Get compiled entry by key */
  get(key: string): Promise<Compiled | undefined>;
  
  /** Set compiled entry with raw artifacts */
  set(key: string, compiled: Compiled, entry: CacheEntry): Promise<void>;
  
  /** Delete a single entry */
  delete(key: string): Promise<void>;
  
  /** Clear all entries */
  clear(): Promise<void>;
  
  /** Get cache size (for metrics) */
  size(): Promise<number>;
  
  /** Close connections (for graceful shutdown) */
  close(): Promise<void>;
}

/**
 * In-memory cache implementation (default).
 * Fast, no external dependencies, but lost on restart.
 */
export class InMemoryCache implements TransformCache {
  private readonly cache = new Map<string, Compiled>();

  async get(key: string): Promise<Compiled | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, compiled: Compiled): Promise<void> {
    this.cache.set(key, compiled);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async close(): Promise<void> {
    // No-op for in-memory
  }
}

/**
 * Redis cache implementation.
 * Persistent across restarts, shared between instances.
 * Stores only raw schemas/mappings; compilation happens on cache miss.
 */
export class RedisCache implements TransformCache {
  private redis: any = null;
  private readonly redisUrl: string;
  private readonly prefix: string;
  private readonly ttlSeconds: number;
  // Local in-memory cache for compiled artifacts (not serializable)
  private readonly localCache = new Map<string, Compiled>();

  constructor(redisUrl: string, prefix = 'canonbridge:transform:', ttlSeconds = 3600) {
    this.redisUrl = redisUrl;
    this.prefix = prefix;
    this.ttlSeconds = ttlSeconds;
  }

  private async getRedisClient(): Promise<any> {
    if (!this.redis) {
      const Redis = (await import('ioredis')).default as any;
      this.redis = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });
    }
    return this.redis;
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async get(key: string): Promise<Compiled | undefined> {
    // Check local cache first (compiled artifacts)
    const local = this.localCache.get(key);
    if (local) return local;

    // Check Redis for raw entry
    const redis = await this.getRedisClient();
    const raw = await redis.get(this.key(key));
    if (!raw) return undefined;

    // Entry exists in Redis but not compiled locally
    // Return undefined to trigger compilation in transformEngine
    return undefined;
  }

  /**
   * Get raw cache entry from Redis (for compilation).
   * Used by transformEngine to recompile from stored artifacts.
   */
  async getRaw(key: string): Promise<CacheEntry | undefined> {
    const redis = await this.getRedisClient();
    const raw = await redis.get(this.key(key));
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as CacheEntry;
    } catch {
      return undefined;
    }
  }

  async set(key: string, compiled: Compiled, entry: CacheEntry): Promise<void> {
    // Store compiled in local cache
    this.localCache.set(key, compiled);
    
    // Store raw entry in Redis
    const redis = await this.getRedisClient();
    const raw = JSON.stringify(entry);
    await redis.setex(this.key(key), this.ttlSeconds, raw);
  }

  async delete(key: string): Promise<void> {
    this.localCache.delete(key);
    const redis = await this.getRedisClient();
    await redis.del(this.key(key));
  }

  async clear(): Promise<void> {
    this.localCache.clear();
    const redis = await this.getRedisClient();
    // Delete all keys with prefix
    const keys = await redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async size(): Promise<number> {
    // Return local cache size (compiled artifacts)
    // Redis size would require KEYS scan which is expensive
    return this.localCache.size;
  }

  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

/**
 * Factory function to create cache instance based on configuration.
 */
export function createCache(redisUrl?: string): TransformCache {
  if (redisUrl) {
    return new RedisCache(redisUrl);
  }
  return new InMemoryCache();
}
