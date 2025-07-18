/**
 * @file A fast and modern cache library for javascript runtimes.
 * @module @bepalo/cache
 * @author Natnael Eshetu
 * @exports Cache
 * @exports CacheConfig
 * @exports CacheEntry
 * @exports GenericCacheKey
 * @exports CacheNowFn
 * @exports CacheDefaultExpFn
 * @exports CacheDeleteReason
 * @exports CacheMissReason
 * @exports CacheOnGetHitFn
 * @exports CacheOnGetMissFn
 * @exports CacheOnDeleteFn
 * @exports CacheOnDeleteExpiredFn
 */

import { List, ListNode } from "./list";
export * from "./list";

/**
 * Represents a single entry in the cache.
 */
export type CacheEntry<Key = string, Value = unknown> = {
  /** Cache key */
  key: Key;
  /** Stored value */
  value: Value;
  /** Expiration timestamp (milliseconds since epoch), or null/undefined if no expiration */
  exp?: number | null;
  /** Optional reference to the node in the LRU linked list */
  lruNode?: ListNode<CacheEntry<Key, Value>>;
};

/**
 * Type of keys accepted by the cache.
 */
export type GenericCacheKey = string | number | Symbol;

/**
 * Reason why an entry was deleted from the cache.
 */
export type CacheDeleteReason = "LRU" | "expired" | "deleted";

/**
 * Reason why a cache `get()` missed.
 */
export type CacheMissReason = "missing" | "expired";

/**
 * Function to return the current time (usually in milliseconds).
 */
export type CacheNowFn = () => number;

/**
 * Function to compute a default expiration timestamp.
 */
export type CacheDefaultExpFn = () => number | undefined | null;

/**
 * Called when a cache `get()` hits an entry.
 */
export type CacheOnGetHitFn<Key = GenericCacheKey, Value = unknown> =
  (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>) => unknown;

/**
 * Called when a cache `get()` misses.
 */
export type CacheOnGetMissFn<Key = GenericCacheKey, Value = unknown> =
  (cache: Cache<Key, Value>, key: Key, reason: CacheMissReason) => unknown;

/**
 * Called when an entry is deleted from the cache.
 */
export type CacheOnDeleteFn<Key = GenericCacheKey, Value = unknown> =
  (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>, reason: CacheDeleteReason) => unknown;

/**
 * Called after expired entries are batch-deleted.
 */
export type CacheOnDeleteExpiredFn = (count: number) => unknown;

/**
 * Configuration options for initializing a cache.
 */
export type CacheConfig<Key = GenericCacheKey, Value = unknown> = {
  /** Function to get the current time. Defaults to `Date.now`. */
  now?: CacheNowFn;
  /** Function to compute a default expiration time. */
  defaultExp?: CacheDefaultExpFn;
  /** Default TTL in milliseconds for new entries (overridden by `exp` or `maxAge`). */
  defaultMaxAge?: number | null;
  /** Maximum number of entries to keep in the cache (LRU eviction). */
  lruMaxSize?: number | null;
  /** Interval (ms) for automatic cleanup of expired entries. */
  cleanupInterval?: number;
  /** Size of expiration buckets (ms). Larger values reduce memory usage. Best to use the same as the `cleanupInterval` */
  expiryBucketSize?: number;
  /** If true, expired entries can still be retrieved. */
  getExpired?: boolean;
  /** If true, expired entries will be deleted automatically during `get()`. */
  deleteExpiredOnGet?: boolean;
  /** Called when an entry is retrieved successfully. */
  onGetHit?: CacheOnGetHitFn<Key, Value> | null;
  /** Called when an entry is missing or expired. */
  onGetMiss?: CacheOnGetMissFn<Key, Value> | null;
  /** Called when an entry is removed (explicitly, expired, or evicted). */
  onDelete?: CacheOnDeleteFn<Key, Value> | null;
  /** Called when expired entries are removed in batch. */
  onDeleteExpired?: CacheOnDeleteExpiredFn | null;
};

/**
 * A fast and modern in-memory cache with optional expiration and LRU eviction.
 * 
 * @template Key - Cache key type (defaults to string | number | symbol).
 * @template Value - Cache value type.
 */
export class Cache<Key=GenericCacheKey, Value=unknown> {
  // Private fields
  #store: Map<Key, CacheEntry<Key, Value>> = new Map();
  #lruList: List<CacheEntry<Key, Value>> = new List();
  #expBuckets = new Map<number, Set<Key>>();
  #intervalId?: ReturnType<typeof setTimeout> = undefined; 
  #now: CacheNowFn = Date.now;
  #timeScale = 1;
  #defaultExp: CacheDefaultExpFn = () => null;
  #defaultMaxAge?: number | null = null;
  #lruMaxSize?: number | null = null;
  #cleanupInterval?: number = 0;
  #expiryBucketSize: number = 300_000;
  #getExpired?: boolean = false;
  #deleteExpiredOnGet?: boolean = false;
  #onGetHit?: CacheOnGetHitFn<Key, Value> | null = null;
  #onGetMiss?: CacheOnGetMissFn<Key, Value> | null = null;
  #onDelete?: CacheOnDeleteFn<Key, Value> | null = null;
  #onDeleteExpired?: CacheOnDeleteExpiredFn | null = undefined;
 
  /**
   * Creates a new Cache instance with optional configuration.
   *
   * The cache supports LRU eviction, time-based expiration (TTL), and customizable hooks
   * for get, miss, delete, and periodic cleanup behavior.
   *
   * @param {CacheConfig<Key, Value>} [config] - Configuration object.
   * @param {CacheNowFn} [config.now] - A function returning the current time (e.g., Date.now()). Used for custom clocks or testing.
   * @param {CacheDefaultExpFn} [config.defaultExp] - Function to compute default expiration timestamps (overridden by `exp` or `maxAge`).
   * @param {number|null} [config.defaultMaxAge] - TTL (in milliseconds by default) to apply if no explicit expiration is given.
   * @param {number|null} [config.lruMaxSize] - Maximum number of entries. When exceeded, least-recently-used items are evicted.
   * @param {number} [config.cleanupInterval] - Interval in ms for automatic deletion of expired entries. Set to 0 to disable.
   * @param {number} [config.expiryBucketSize=300000] - Granularity of expiration bucketing (in milliseconds by default). Smaller = more precise, but slower.
   * @param {boolean} [config.getExpired=false] - Whether to return expired entries from `.get()` (useful for diagnostics or soft TTL).
   * @param {boolean} [config.deleteExpiredOnGet=false] - If true, expired items are immediately removed when accessed.
   * @param {CacheOnGetHitFn<Key, Value>} [config.onGetHit] - Hook called when a `get()` returns a valid (non-expired) value.
   * @param {CacheOnGetMissFn<Key, Value>} [config.onGetMiss] - Hook called when a key is not found or is expired (returns reason).
   * @param {CacheOnDeleteFn<Key, Value>} [config.onDelete] - Hook called whenever an entry is removed, with reason (e.g., LRU or expired).
   * @param {CacheOnDeleteExpiredFn} [config.onDeleteExpired] - Hook called when `deleteExpired()` runs, with count of removed entries.
   */
  constructor(config?: CacheConfig<Key, Value>) {
    if(config) {
      if(config.now != null) {
        this.#now = config.now;
        const nowTest = this.now() || 1;
        this.#timeScale = Date.now() / nowTest;
      }
      this.#lruMaxSize = config.lruMaxSize ? Math.max(0, config.lruMaxSize) : null;
      if(this.#lruMaxSize === 0) {
        this.#lruMaxSize = null;
      }
      if(config.defaultExp != null) {
        this.#defaultExp = config.defaultExp;
      }
      if(config.defaultMaxAge != null) {
        this.#defaultMaxAge = config.defaultMaxAge;
      }
      if(config.cleanupInterval != null) {
        this.#cleanupInterval = config.cleanupInterval;
      }
      if(config.expiryBucketSize != null && config.expiryBucketSize >= 0) {
        this.#expiryBucketSize = config.expiryBucketSize;
      } else {
        this.#expiryBucketSize /= this.#timeScale;
      }
      if(config.getExpired != null) {
        this.#getExpired = config.getExpired;
      }
      if(config.deleteExpiredOnGet != null) {
        this.#deleteExpiredOnGet = config.deleteExpiredOnGet;
      }
      this.#onDeleteExpired = config.onDeleteExpired ? config.onDeleteExpired.bind(this) : undefined;
      this.#onDelete = config.onDelete ? config.onDelete.bind(this) : undefined;
      this.#onGetHit = config.onGetHit ? config.onGetHit.bind(this) : undefined;
      this.#onGetMiss = config.onGetMiss ? config.onGetMiss.bind(this) : undefined;
    }
    this.startCleanupInterval();
  }

  #bucketIndex(time: number): number {
    return Math.floor(time / this.#expiryBucketSize);
  }

  #updateLRU(key: Key, entry: CacheEntry<Key,Value>, evictLRU?: boolean): void {
    if(this.#lruMaxSize) {
      if(entry.lruNode == null) {
        entry.lruNode = this.#lruList.push(entry);
      } else if(entry.lruNode !== this.#lruList.last) {
        const node = this.#lruList.remove(entry.lruNode);
        this.#lruList.insertNodeAfter(node, this.#lruList.last!);
      }
      if(evictLRU && this.#store.size > this.#lruMaxSize) {
        const lruEntry = this.#lruList.popFirst();
        if(lruEntry != null) {
          const lruKey = lruEntry.key;
          const exp = entry.exp;
          if(exp) {
            const bucketIndex = this.#bucketIndex(exp);
            const bucket = this.#expBuckets.get(bucketIndex);
            if(bucket) {
              bucket.delete(lruKey);
              if(bucket.size === 0) {
                this.#expBuckets.delete(bucketIndex);
              }
            }
          }
          this.#store.delete(lruKey);
          if(this.#onDelete) {
            this.#onDelete(this, lruKey, lruEntry, "LRU");
          }
        }
      }
    }
  }

  /**
   * **Debug only! DO NOT MODIFY**
   * @returns {List<CacheEntry<Key,Value>>} The LRU list.
   */
  get lruList(): List<CacheEntry<Key,Value>> {
    return this.#lruList;
  }

  /**
   * **Debug only! DO NOT MODIFY**
   * @returns {Map<number,Set<Key>>} The expiration buckets map.
   */
  get expBuckets(): Map<number, Set<Key>> {
    return this.#expBuckets;
  }

  /**
   * Enables `for...of` iteration over the cache.
   * 
   * @returns {IterableIterator<[Key, CacheEntry]>}
   */
  [Symbol.iterator](): MapIterator<[Key, CacheEntry<Key, Value>]> {
    return this.#store[Symbol.iterator]();
  }

  /** @returns {CacheNowFn} The set `now` function. */
  get now(): CacheNowFn {
    return this.#now;
  }

  /** @returns {number} The time scale to get milliseconds calculated using Date.now(). */
  get timeScale(): number {
    return this.#timeScale;
  }

  /** @returns {CacheDefaultExpFn} The set default expiry function. */
  get defaultExp(): CacheDefaultExpFn {
    return this.#defaultExp;
  }

  /** @returns {number|undefined|null} The set default max-age value. */
  get defaultMaxAge(): number | undefined | null {
    return this.#defaultMaxAge;
  }

  /** @returns {number|undefined|null} The set max LRU size. */
  get lruMaxSize(): number | undefined | null {
    return this.#lruMaxSize;
  }

  /** @returns {number|undefined|null} The set cleanup interval. */
  get cleanupInterval(): number | undefined | null {
    return this.#cleanupInterval;
  }

  /** @returns {number} The set expiry bucket size. */
  get expiryBucketSize(): number {
    return this.#expiryBucketSize;
  }

  /** @returns {CacheOnDeleteExpiredFn|null|undefined} The set on-delete-expired event function. */
  get onDeleteExpired(): CacheOnDeleteExpiredFn | null | undefined {
    return this.#onDeleteExpired;
  }

  /** @returns {CacheOnDeleteFn<Key,Value>|null|undefined} The set on-delete event function. */
  get onDelete(): CacheOnDeleteFn<Key, Value> | null | undefined {
    return this.#onDelete;
  }

  /** @returns {CacheOnGetHitFn<Key,Value>|null|undefined} The set on-get-cache-hit event function. */
  get onGetHit(): CacheOnGetHitFn<Key, Value> | null | undefined {
    return this.#onGetHit;
  }

  /** @returns {CacheOnGetMissFn<Key,Value>|null|undefined} The set on-get-cache-miss event function. */
  get onGetMiss(): CacheOnGetMissFn<Key, Value> | null | undefined {
    return this.#onGetMiss;
  }

  /**
   * Gets the number of entries in the cache (including expired ones).
   * 
   * @returns {number} The number of stored entries.
   */
  get size(): number {
    return this.#store.size;
  }

  /**
   * Iterates over the cache keys.
   * 
   * @returns {IterableIterator<Key>} Iterator over keys.
   */
  keys(): MapIterator<Key> {
    return this.#store.keys();
  }

  /**
   * Iterates over cache values (entries).
   * 
   * @returns {IterableIterator<CacheEntry>} Iterator over entries.
   */
  values(): MapIterator<CacheEntry<Key, Value>> {
    return this.#store.values();
  }

  /**
   * Iterates over cache entries as [key, entry] tuples.
   * 
   * @returns {IterableIterator<[Key, CacheEntry]>} Iterator over key-value pairs.
   */
  entries(): MapIterator<[Key, CacheEntry<Key, Value>]> {
    return this.#store.entries();
  }

  /**
   * Starts the automatic cleanup interval to remove expired entries.
   * 
   * @param {Object} [options]
   * @param {number} [options.interval] - Interval (in milliseconds by default).
   * @param {boolean} [options.restart=false] - Whether to force restart an existing interval.
   * @returns {boolean} True if interval was started, false if skipped.
   */
  startCleanupInterval(options?: {
    interval?: number,
    restart?: boolean,
  }): boolean {
    if(this.#intervalId) {
      if(!options?.restart) {
        return false;
      } else {
        clearInterval(this.#intervalId);
      }
    }
    // calculate interval scale to get milliseconds
    this.#cleanupInterval = options?.interval ?? this.#cleanupInterval;
    if(this.#cleanupInterval && this.#cleanupInterval > 0) {
      this.#intervalId = setInterval(() => {
        this.deleteExpired();
      }, this.#cleanupInterval * this.#timeScale);
      return true;
    }
    return false;
  }

  /**
   * Restarts the cleanup interval with a new or existing interval duration.
   * 
   * @param {Object} [options]
   * @param {number} [options.interval] - Optional new interval.
   * @returns {boolean} True if interval was restarted.
   */
  restartCleanupInterval(options?: {
    interval?: number
  }): boolean {
    return this.startCleanupInterval({ ...options, restart: true });
  }

  /**
   * Stops the automatic cleanup interval.
   * 
   * @returns {boolean} True if the interval was running and was stopped.
   */
  stopCleanupInterval(): boolean {
    if(this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = undefined;
      return true;
    }
    return false;
  }

  /**
   * Computes the default expiration timestamp.
   * 
   * @param {number|null} [exp] - Custom expiration timestamp.
   * @param {number|null} [maxAge] - Milliseconds from now to expire.
   * @returns {number|null|undefined} Final expiration timestamp or null/undefined.
   */
  getDefaultExp(exp?: number | null, maxAge?: number | null): number|undefined|null {
    maxAge = maxAge ?? this.#defaultMaxAge;
    const defaultExp = exp 
      ?? (
        maxAge 
          ? this.#now() + maxAge
          : null
      ) ?? this.#defaultExp();
    return defaultExp;
  }

  /**
   * Checks if a key exists in the cache.
   * 
   * @param {Key} key - Cache key.
   * @param {Object} [options]
   * @param {boolean} [options.expired=false] - Whether to include expired entries.
   * @returns {boolean} True if the key exists and (by default) is not expired.
   */
  has(key: Key, options?: {
    expired?: boolean
  }): boolean {
    const entry = this.#store.get(key);
    if(entry) {
      if(options?.expired) {
        return true;
      }
      const now = this.now();
      if(!entry.exp || entry.exp > now) {
        return true;
      }
    }
    return false;
  }

  /**
   * Retrieves an entry from the cache.
   * 
   * @param {Key} key - Cache key.
   * @param {Object} [options]
   * @param {boolean} [options.expired=false] - Whether to return expired entries.
   * @param {boolean} [options.deleteExpired=false] - Whether to delete expired entries on access.
   * @returns {CacheEntry|undefined} The entry or undefined if missing or expired.
   */
  get(key: Key, options?: {
    expired?: boolean,
    deleteExpired?: boolean
  }): CacheEntry<Key, Value> | undefined {
    let entry = this.#store.get(key);
    if(!entry && this.#onGetMiss) {
      const result = this.#onGetMiss(this, key, "missing"); 
      if(result)
        entry = this.#store.get(key);
    } else if(entry && this.#onGetHit) {
      this.#onGetHit(this, key, entry);
    }
    if(entry && entry.exp) {
      const exp = entry.exp;
      const now = this.now();
      if(exp <= now) {
        const expired = options?.expired != null 
          ? options?.expired
          : this.#getExpired;
        const deleteExpired = options?.deleteExpired != null 
          ? options?.deleteExpired
          : this.#deleteExpiredOnGet;
        // delete expired  
        if(deleteExpired) {
          this.delete(key);
        } else if(expired) {
          this.#updateLRU(key, entry);
        } else if(this.#onGetMiss) {
          const result = this.#onGetMiss(this, key, "expired"); 
          if(result)
            return this.#store.get(key);
        }
        return expired ? entry : undefined;
      } 
      this.#updateLRU(key, entry);
    }
    return entry as CacheEntry<Key, Value>;
  }

  /**
   * Retrieves a cache entry without affecting LRU order or triggering events.
   * 
   * @param {Key} key - Cache key.
   * @param {Object} [options]
   * @param {boolean} [options.expired=false] - Whether to include expired entries.
   * @returns {CacheEntry|undefined} The entry or undefined.
   */
  peek(key: Key, options?: {
    expired?: boolean
  }): CacheEntry<Key, Value> | undefined {
    const entry = this.#store.get(key);
    if(entry && entry.exp && entry.exp <= this.now() && !options?.expired) {
      return undefined;
    }
    return entry;
  }

  /**
   * Sets a value in the cache.
   * 
   * @param {Key} key - Cache key.
   * @param {Value} value - Value to store.
   * @param {Object} [options]
   * @param {number} [options.exp] - Exact expiration timestamp.
   * @param {number} [options.maxAge] - TTL (in milliseconds by default) from now.
   */
  set(key: Key, value: Value, options?: {
    exp?: number,
    maxAge?: number,
  }): void {
    const exp = this.getDefaultExp(options?.exp, options?.maxAge); 
    const existingEntry = this.#store.get(key);
    if(existingEntry) {
      const existingExp = existingEntry.exp;
      if(existingExp !== exp && existingExp) {
        const bucketIndex = this.#bucketIndex(existingExp);
        const bucket = this.#expBuckets.get(bucketIndex);
        if(bucket) {
          bucket.delete(key);
          if(bucket.size === 0) {
            this.#expBuckets.delete(bucketIndex);
          }
        }
        if(exp) {
          const bucketIndex = this.#bucketIndex(exp);
          const existingBucketMap = this.#expBuckets.get(bucketIndex);
          const bucket = existingBucketMap ?? new Set<Key>();
          bucket.add(key);
          if(!existingBucketMap) {
            this.#expBuckets.set(bucketIndex, bucket);
          }
        }
      }
      existingEntry.exp = exp;
      existingEntry.value = value;
      this.#updateLRU(key, existingEntry);
    } else {
      const entry = { key, value, exp } as CacheEntry<Key, Value>;
      if(exp) {
        const bucketIndex = this.#bucketIndex(exp);
        const existingBucketMap = this.#expBuckets.get(bucketIndex);
        const bucket = existingBucketMap ?? new Set<Key>();
        bucket.add(key);
        if(!existingBucketMap) {
          this.#expBuckets.set(bucketIndex, bucket);
        }
      }
      this.#store.set(key, entry);
      this.#updateLRU(key, entry, true);
    }
  }

  /**
   * Updates an existing cache entry’s expiration or value.
   * 
   * @param {Key} key - Cache key.
   * @param {Object} changes
   * @param {number} [changes.exp] - New expiration timestamp.
   * @param {Value} [changes.value] - New value.
   * @returns {boolean} True if the entry exists and was updated.
   */
  update(key: Key, changes: {
    value?: Value,
    exp?: number,
    maxAge?: number,
  }): boolean {
    const entry = this.#store.get(key);
    if(entry != null) {
      if(changes.hasOwnProperty("exp") || changes.hasOwnProperty("maxAge")) {
        const exp = changes.exp ?? (changes.maxAge ? this.now() + changes.maxAge : null);
        // remove from old expiry bucket
        if(entry.exp && entry.exp !== exp) {
          const bucketIndex = this.#bucketIndex(entry.exp);
          const bucket = this.#expBuckets.get(bucketIndex);
          if(bucket) {
            bucket.delete(key);
            if(bucket.size === 0) {
              this.#expBuckets.delete(bucketIndex);
            }
          }
        }
        // add to new expiry bucket
        if(exp) {
          const bucketIndex = this.#bucketIndex(exp);
          const existingBucketMap = this.#expBuckets.get(bucketIndex);
          const bucket = existingBucketMap ?? new Set<Key>();
          bucket.add(key);
          if(!existingBucketMap) {
            this.#expBuckets.set(bucketIndex, bucket);
          }
        }
        entry.exp = exp;
      }
      if(changes.hasOwnProperty("value")) {
        entry.value = changes.value!;
      }
      // update LRU
      this.#updateLRU(key, entry, true);
      return true;
    }
    return false;
  }

  /**
   * Deletes a key from the cache.
   * 
   * @param {Key} key - Cache key.
   * @param {CacheDeleteReason} [reason="deleted"] - Reason for deletion.
   * @returns {boolean} True if the key existed and was deleted.
   */
  delete(key: Key, reason: CacheDeleteReason = "deleted"): boolean {
    const entry = this.#store.get(key);
    if(entry) {
      const exp = entry.exp;
      if(exp) {
        const bucketIndex = this.#bucketIndex(exp);
        const bucket = this.#expBuckets.get(bucketIndex);
        if(bucket) {
          bucket.delete(key);
          if(bucket.size === 0) {
            this.#expBuckets.delete(bucketIndex);
          }
        }
      }
      if(entry.lruNode != null) {
        this.#lruList.remove(entry.lruNode);
      }
      this.#store.delete(key);
      if(this.#onDelete) {
        this.#onDelete(this, key, entry, reason);
      }
      return true;
    }
    return false;
  }
  

  /**
   * Deletes all expired entries based on the current time.
   * 
   * @returns {number} Number of entries removed.
   */
  deleteExpired(): number {
    let count = 0;
    const now = this.now();
    const bucketIndexNow = this.#bucketIndex(now);
    const expired = new Array<{ key: Key, bucket: Set<Key>, entry: CacheEntry<Key, Value> }>();
    for(const [bucketIndex, bucket] of this.#expBuckets) {
      if(bucketIndex <= bucketIndexNow) {
        for(const key of bucket) {
          const entry = this.#store.get(key);
          const exp = entry?.exp;
          if(exp && exp <= now) {
            expired.push({key, bucket, entry});
          }
        }
      }  
    }
    count = expired.length;
    for(const { key, bucket, entry } of expired) {
      bucket.delete(key);
      if(entry.lruNode != null) {
        this.#lruList.remove(entry.lruNode);
      }
      this.#store.delete(key);
      if(this.#onDelete) {
        this.#onDelete(this, key, entry, "expired");
      }
    }
    if(this.#onDeleteExpired) {
      this.#onDeleteExpired(count);
    }
    // remove empty buckets
    {
      const emptyBuckets = Array<[number, Set<Key>]>();
      for(const buckPair of this.#expBuckets) {
        const [, bucket] = buckPair;
        if(bucket.size === 0) {
          emptyBuckets.push(buckPair);
        }
      }
      for(const [bucketIndex] of emptyBuckets) {
        this.#expBuckets.delete(bucketIndex);
      }
    }
    return count;
  }

  /**
   * Clears all entries from the cache (including LRU and expiry buckets).
   */
  clear(): void {
    for(const [,bucket] of this.#expBuckets) {
      bucket.clear();
    }
    this.#expBuckets.clear();
    this.#lruList.clear();
    this.#store.clear();
  }

};

export default Cache;

