/**
 *  A fast and modern cache library for javascript runtimes.
 *
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
export type CacheEntry<Key = string, Value = unknown> = {
    value: Value;
    exp?: number | null;
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
export declare class Cache<Key = GenericCacheKey, Value = unknown> {
    #private;
    constructor(config?: CacheConfig<Key, Value>);
    [Symbol.iterator](): MapIterator<[Key, CacheEntry<Key, Value>]>;
    get now(): CacheNowFn;
    get timeScale(): number;
    get defaultExp(): CacheDefaultExpFn;
    get defaultMaxAge(): number | undefined | null;
    get lruMaxSize(): number | undefined | null;
    get cleanupInterval(): number | undefined | null;
    get expiryBucketSize(): number;
    get onDeleteExpired(): CacheOnDeleteExpiredFn | null | undefined;
    get onDelete(): CacheOnDeleteFn<Key, Value> | null | undefined;
    get onGetHit(): CacheOnGetHitFn<Key, Value> | null | undefined;
    get onGetMiss(): CacheOnGetMissFn<Key, Value> | null | undefined;
    get size(): number;
    keys(): MapIterator<Key>;
    values(): MapIterator<CacheEntry<Key, Value>>;
    entries(): MapIterator<[Key, CacheEntry<Key, Value>]>;
    startCleanupInterval(options?: {
        interval?: number;
        restart?: boolean;
    }): boolean;
    restartCleanupInterval(options?: {
        interval?: number;
    }): boolean;
    stopCleanupInterval(): boolean;
    getDefaultExp(exp?: number | null, maxAge?: number | null): number | undefined | null;
    has(key: Key, options?: {
        expired?: boolean;
    }): boolean;
    get(key: Key, options?: {
        expired?: boolean;
        deleteExpired?: boolean;
    }): CacheEntry<Key, Value> | undefined;
    peek(key: Key, options?: {
        expired?: boolean;
    }): CacheEntry<Key, Value> | undefined;
    set(key: Key, value: Value, options?: {
        exp?: number;
        maxAge?: number;
    }): void;
    update(key: Key, newEntry: {
        exp?: number;
        value?: Value;
    }): boolean;
    delete(key: Key, reason?: CacheDeleteReason): boolean;
    deleteExpired(): number;
    clear(): void;
}
export default Cache;
