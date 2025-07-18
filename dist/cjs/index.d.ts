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
export type CacheEntry<Key = string, Value = unknown> = {
    key: Key;
    value: Value;
    exp?: number | null;
    lruNode?: ListNode<CacheEntry<Key, Value>>;
};
export type GenericCacheKey = string | number | Symbol;
export type CacheDeleteReason = "LRU" | "expired" | "deleted";
export type CacheMissReason = "missing" | "expired";
export type CacheNowFn = () => number;
export type CacheDefaultExpFn = () => number | undefined | null;
export type CacheOnGetHitFn<Key = GenericCacheKey, Value = unknown> = (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>) => unknown;
export type CacheOnGetMissFn<Key = GenericCacheKey, Value = unknown> = (cache: Cache<Key, Value>, key: Key, reason: CacheMissReason) => unknown;
export type CacheOnDeleteFn<Key = GenericCacheKey, Value = unknown> = (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>, reason: CacheDeleteReason) => unknown;
export type CacheOnDeleteExpiredFn = (count: number) => unknown;
export type CacheConfig<Key = GenericCacheKey, Value = unknown> = {
    now?: CacheNowFn;
    defaultExp?: CacheDefaultExpFn;
    defaultMaxAge?: number | null;
    lruMaxSize?: number | null;
    cleanupInterval?: number;
    expiryBucketSize?: number;
    getExpired?: boolean;
    deleteExpiredOnGet?: boolean;
    onGetHit?: CacheOnGetHitFn<Key, Value> | null;
    onGetMiss?: CacheOnGetMissFn<Key, Value> | null;
    onDelete?: CacheOnDeleteFn<Key, Value> | null;
    onDeleteExpired?: CacheOnDeleteExpiredFn | null;
};
/**
 * A fast and modern in-memory cache with optional expiration and LRU eviction.
 *
 * @template Key - Cache key type (defaults to string | number | symbol).
 * @template Value - Cache value type.
 */
export declare class Cache<Key = GenericCacheKey, Value = unknown> {
    #private;
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
    constructor(config?: CacheConfig<Key, Value>);
    /**
     * **Debug only! DO NOT MODIFY**
     * @returns {List<CacheEntry<Key,Value>>} The LRU list.
     */
    get lruList(): List<CacheEntry<Key, Value>>;
    /**
     * **Debug only! DO NOT MODIFY**
     * @returns {Map<number,Set<Key>>} The expiration buckets map.
     */
    get expBuckets(): Map<number, Set<Key>>;
    /**
     * Enables `for...of` iteration over the cache.
     *
     * @returns {IterableIterator<[Key, CacheEntry]>}
     */
    [Symbol.iterator](): MapIterator<[Key, CacheEntry<Key, Value>]>;
    /** @returns {CacheNowFn} The set `now` function. */
    get now(): CacheNowFn;
    /** @returns {number} The time scale to get milliseconds calculated using Date.now(). */
    get timeScale(): number;
    /** @returns {CacheDefaultExpFn} The set default expiry function. */
    get defaultExp(): CacheDefaultExpFn;
    /** @returns {number|undefined|null} The set default max-age value. */
    get defaultMaxAge(): number | undefined | null;
    /** @returns {number|undefined|null} The set max LRU size. */
    get lruMaxSize(): number | undefined | null;
    /** @returns {number|undefined|null} The set cleanup interval. */
    get cleanupInterval(): number | undefined | null;
    /** @returns {number} The set expiry bucket size. */
    get expiryBucketSize(): number;
    /** @returns {CacheOnDeleteExpiredFn|null|undefined} The set on-delete-expired event function. */
    get onDeleteExpired(): CacheOnDeleteExpiredFn | null | undefined;
    /** @returns {CacheOnDeleteFn<Key,Value>|null|undefined} The set on-delete event function. */
    get onDelete(): CacheOnDeleteFn<Key, Value> | null | undefined;
    /** @returns {CacheOnGetHitFn<Key,Value>|null|undefined} The set on-get-cache-hit event function. */
    get onGetHit(): CacheOnGetHitFn<Key, Value> | null | undefined;
    /** @returns {CacheOnGetMissFn<Key,Value>|null|undefined} The set on-get-cache-miss event function. */
    get onGetMiss(): CacheOnGetMissFn<Key, Value> | null | undefined;
    /**
     * Gets the number of entries in the cache (including expired ones).
     *
     * @returns {number} The number of stored entries.
     */
    get size(): number;
    /**
     * Iterates over the cache keys.
     *
     * @returns {IterableIterator<Key>} Iterator over keys.
     */
    keys(): MapIterator<Key>;
    /**
     * Iterates over cache values (entries).
     *
     * @returns {IterableIterator<CacheEntry>} Iterator over entries.
     */
    values(): MapIterator<CacheEntry<Key, Value>>;
    /**
     * Iterates over cache entries as [key, entry] tuples.
     *
     * @returns {IterableIterator<[Key, CacheEntry]>} Iterator over key-value pairs.
     */
    entries(): MapIterator<[Key, CacheEntry<Key, Value>]>;
    /**
     * Starts the automatic cleanup interval to remove expired entries.
     *
     * @param {Object} [options]
     * @param {number} [options.interval] - Interval (in milliseconds by default).
     * @param {boolean} [options.restart=false] - Whether to force restart an existing interval.
     * @returns {boolean} True if interval was started, false if skipped.
     */
    startCleanupInterval(options?: {
        interval?: number;
        restart?: boolean;
    }): boolean;
    /**
     * Restarts the cleanup interval with a new or existing interval duration.
     *
     * @param {Object} [options]
     * @param {number} [options.interval] - Optional new interval.
     * @returns {boolean} True if interval was restarted.
     */
    restartCleanupInterval(options?: {
        interval?: number;
    }): boolean;
    /**
     * Stops the automatic cleanup interval.
     *
     * @returns {boolean} True if the interval was running and was stopped.
     */
    stopCleanupInterval(): boolean;
    /**
     * Computes the default expiration timestamp.
     *
     * @param {number|null} [exp] - Custom expiration timestamp.
     * @param {number|null} [maxAge] - Milliseconds from now to expire.
     * @returns {number|null|undefined} Final expiration timestamp or null/undefined.
     */
    getDefaultExp(exp?: number | null, maxAge?: number | null): number | undefined | null;
    /**
     * Checks if a key exists in the cache.
     *
     * @param {Key} key - Cache key.
     * @param {Object} [options]
     * @param {boolean} [options.expired=false] - Whether to include expired entries.
     * @returns {boolean} True if the key exists and (by default) is not expired.
     */
    has(key: Key, options?: {
        expired?: boolean;
    }): boolean;
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
        expired?: boolean;
        deleteExpired?: boolean;
    }): CacheEntry<Key, Value> | undefined;
    /**
     * Retrieves a cache entry without affecting LRU order or triggering events.
     *
     * @param {Key} key - Cache key.
     * @param {Object} [options]
     * @param {boolean} [options.expired=false] - Whether to include expired entries.
     * @returns {CacheEntry|undefined} The entry or undefined.
     */
    peek(key: Key, options?: {
        expired?: boolean;
    }): CacheEntry<Key, Value> | undefined;
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
        exp?: number;
        maxAge?: number;
    }): void;
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
        value?: Value;
        exp?: number;
        maxAge?: number;
    }): boolean;
    /**
     * Deletes a key from the cache.
     *
     * @param {Key} key - Cache key.
     * @param {CacheDeleteReason} [reason="deleted"] - Reason for deletion.
     * @returns {boolean} True if the key existed and was deleted.
     */
    delete(key: Key, reason?: CacheDeleteReason): boolean;
    /**
     * Deletes all expired entries based on the current time.
     *
     * @returns {number} Number of entries removed.
     */
    deleteExpired(): number;
    /**
     * Clears all entries from the cache (including LRU and expiry buckets).
     */
    clear(): void;
}
export default Cache;
