"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Cache_instances, _Cache_store, _Cache_lruList, _Cache_expBuckets, _Cache_intervalId, _Cache_now, _Cache_timeScale, _Cache_defaultExp, _Cache_defaultMaxAge, _Cache_lruMaxSize, _Cache_cleanupInterval, _Cache_expiryBucketSize, _Cache_getExpired, _Cache_deleteExpiredOnGet, _Cache_onGetHit, _Cache_onGetMiss, _Cache_onDelete, _Cache_onDeleteExpired, _Cache_bucketIndex, _Cache_updateLRU;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const list_1 = require("./list");
__exportStar(require("./list"), exports);
/**
 * A fast and modern in-memory cache with optional expiration and LRU eviction.
 *
 * @template Key - Cache key type (defaults to string | number | symbol).
 * @template Value - Cache value type.
 */
class Cache {
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
    constructor(config) {
        _Cache_instances.add(this);
        // Private fields
        _Cache_store.set(this, new Map());
        _Cache_lruList.set(this, new list_1.List());
        _Cache_expBuckets.set(this, new Map());
        _Cache_intervalId.set(this, undefined);
        _Cache_now.set(this, Date.now);
        _Cache_timeScale.set(this, 1);
        _Cache_defaultExp.set(this, () => null);
        _Cache_defaultMaxAge.set(this, null);
        _Cache_lruMaxSize.set(this, null);
        _Cache_cleanupInterval.set(this, 0);
        _Cache_expiryBucketSize.set(this, 300000);
        _Cache_getExpired.set(this, false);
        _Cache_deleteExpiredOnGet.set(this, false);
        _Cache_onGetHit.set(this, null);
        _Cache_onGetMiss.set(this, null);
        _Cache_onDelete.set(this, null);
        _Cache_onDeleteExpired.set(this, undefined);
        if (config) {
            if (config.now != null) {
                __classPrivateFieldSet(this, _Cache_now, config.now, "f");
                const nowTest = this.now() || 1;
                __classPrivateFieldSet(this, _Cache_timeScale, Date.now() / nowTest, "f");
            }
            __classPrivateFieldSet(this, _Cache_lruMaxSize, config.lruMaxSize ? Math.max(0, config.lruMaxSize) : null, "f");
            if (__classPrivateFieldGet(this, _Cache_lruMaxSize, "f") === 0) {
                __classPrivateFieldSet(this, _Cache_lruMaxSize, null, "f");
            }
            if (config.defaultExp != null) {
                __classPrivateFieldSet(this, _Cache_defaultExp, config.defaultExp, "f");
            }
            if (config.defaultMaxAge != null) {
                __classPrivateFieldSet(this, _Cache_defaultMaxAge, config.defaultMaxAge, "f");
            }
            if (config.cleanupInterval != null) {
                __classPrivateFieldSet(this, _Cache_cleanupInterval, config.cleanupInterval, "f");
            }
            if (config.expiryBucketSize != null && config.expiryBucketSize >= 0) {
                __classPrivateFieldSet(this, _Cache_expiryBucketSize, config.expiryBucketSize, "f");
            }
            else {
                __classPrivateFieldSet(this, _Cache_expiryBucketSize, __classPrivateFieldGet(this, _Cache_expiryBucketSize, "f") / __classPrivateFieldGet(this, _Cache_timeScale, "f"), "f");
            }
            if (config.getExpired != null) {
                __classPrivateFieldSet(this, _Cache_getExpired, config.getExpired, "f");
            }
            if (config.deleteExpiredOnGet != null) {
                __classPrivateFieldSet(this, _Cache_deleteExpiredOnGet, config.deleteExpiredOnGet, "f");
            }
            __classPrivateFieldSet(this, _Cache_onDeleteExpired, config.onDeleteExpired ? config.onDeleteExpired.bind(this) : undefined, "f");
            __classPrivateFieldSet(this, _Cache_onDelete, config.onDelete ? config.onDelete.bind(this) : undefined, "f");
            __classPrivateFieldSet(this, _Cache_onGetHit, config.onGetHit ? config.onGetHit.bind(this) : undefined, "f");
            __classPrivateFieldSet(this, _Cache_onGetMiss, config.onGetMiss ? config.onGetMiss.bind(this) : undefined, "f");
        }
        this.startCleanupInterval();
    }
    /**
     * **Debug only! DO NOT MODIFY**
     * @returns {List<CacheEntry<Key,Value>>} The LRU list.
     */
    get lruList() {
        return __classPrivateFieldGet(this, _Cache_lruList, "f");
    }
    /**
     * **Debug only! DO NOT MODIFY**
     * @returns {Map<number,Set<Key>>} The expiration buckets map.
     */
    get expBuckets() {
        return __classPrivateFieldGet(this, _Cache_expBuckets, "f");
    }
    /**
     * Enables `for...of` iteration over the cache.
     *
     * @returns {IterableIterator<[Key, CacheEntry]>}
     */
    [(_Cache_store = new WeakMap(), _Cache_lruList = new WeakMap(), _Cache_expBuckets = new WeakMap(), _Cache_intervalId = new WeakMap(), _Cache_now = new WeakMap(), _Cache_timeScale = new WeakMap(), _Cache_defaultExp = new WeakMap(), _Cache_defaultMaxAge = new WeakMap(), _Cache_lruMaxSize = new WeakMap(), _Cache_cleanupInterval = new WeakMap(), _Cache_expiryBucketSize = new WeakMap(), _Cache_getExpired = new WeakMap(), _Cache_deleteExpiredOnGet = new WeakMap(), _Cache_onGetHit = new WeakMap(), _Cache_onGetMiss = new WeakMap(), _Cache_onDelete = new WeakMap(), _Cache_onDeleteExpired = new WeakMap(), _Cache_instances = new WeakSet(), _Cache_bucketIndex = function _Cache_bucketIndex(time) {
        return Math.floor(time / __classPrivateFieldGet(this, _Cache_expiryBucketSize, "f"));
    }, _Cache_updateLRU = function _Cache_updateLRU(key, entry, evictLRU) {
        if (__classPrivateFieldGet(this, _Cache_lruMaxSize, "f")) {
            if (entry.lruNode == null) {
                entry.lruNode = __classPrivateFieldGet(this, _Cache_lruList, "f").push(entry);
            }
            else if (entry.lruNode !== __classPrivateFieldGet(this, _Cache_lruList, "f").last) {
                const node = __classPrivateFieldGet(this, _Cache_lruList, "f").remove(entry.lruNode);
                __classPrivateFieldGet(this, _Cache_lruList, "f").insertNodeAfter(node, __classPrivateFieldGet(this, _Cache_lruList, "f").last);
            }
            if (evictLRU && __classPrivateFieldGet(this, _Cache_store, "f").size > __classPrivateFieldGet(this, _Cache_lruMaxSize, "f")) {
                const lruEntry = __classPrivateFieldGet(this, _Cache_lruList, "f").popFirst();
                if (lruEntry != null) {
                    const lruKey = lruEntry.key;
                    const exp = entry.exp;
                    if (exp) {
                        const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, exp);
                        const bucket = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                        if (bucket) {
                            bucket.delete(lruKey);
                            if (bucket.size === 0) {
                                __classPrivateFieldGet(this, _Cache_expBuckets, "f").delete(bucketIndex);
                            }
                        }
                    }
                    __classPrivateFieldGet(this, _Cache_store, "f").delete(lruKey);
                    if (__classPrivateFieldGet(this, _Cache_onDelete, "f")) {
                        __classPrivateFieldGet(this, _Cache_onDelete, "f").call(this, this, lruKey, lruEntry, "LRU");
                    }
                }
            }
        }
    }, Symbol.iterator)]() {
        return __classPrivateFieldGet(this, _Cache_store, "f")[Symbol.iterator]();
    }
    /** @returns {CacheNowFn} The set `now` function. */
    get now() {
        return __classPrivateFieldGet(this, _Cache_now, "f");
    }
    /** @returns {number} The time scale to get milliseconds calculated using Date.now(). */
    get timeScale() {
        return __classPrivateFieldGet(this, _Cache_timeScale, "f");
    }
    /** @returns {CacheDefaultExpFn} The set default expiry function. */
    get defaultExp() {
        return __classPrivateFieldGet(this, _Cache_defaultExp, "f");
    }
    /** @returns {number|undefined|null} The set default max-age value. */
    get defaultMaxAge() {
        return __classPrivateFieldGet(this, _Cache_defaultMaxAge, "f");
    }
    /** @returns {number|undefined|null} The set max LRU size. */
    get lruMaxSize() {
        return __classPrivateFieldGet(this, _Cache_lruMaxSize, "f");
    }
    /** @returns {number|undefined|null} The set cleanup interval. */
    get cleanupInterval() {
        return __classPrivateFieldGet(this, _Cache_cleanupInterval, "f");
    }
    /** @returns {number} The set expiry bucket size. */
    get expiryBucketSize() {
        return __classPrivateFieldGet(this, _Cache_expiryBucketSize, "f");
    }
    /** @returns {CacheOnDeleteExpiredFn|null|undefined} The set on-delete-expired event function. */
    get onDeleteExpired() {
        return __classPrivateFieldGet(this, _Cache_onDeleteExpired, "f");
    }
    /** @returns {CacheOnDeleteFn<Key,Value>|null|undefined} The set on-delete event function. */
    get onDelete() {
        return __classPrivateFieldGet(this, _Cache_onDelete, "f");
    }
    /** @returns {CacheOnGetHitFn<Key,Value>|null|undefined} The set on-get-cache-hit event function. */
    get onGetHit() {
        return __classPrivateFieldGet(this, _Cache_onGetHit, "f");
    }
    /** @returns {CacheOnGetMissFn<Key,Value>|null|undefined} The set on-get-cache-miss event function. */
    get onGetMiss() {
        return __classPrivateFieldGet(this, _Cache_onGetMiss, "f");
    }
    /**
     * Gets the number of entries in the cache (including expired ones).
     *
     * @returns {number} The number of stored entries.
     */
    get size() {
        return __classPrivateFieldGet(this, _Cache_store, "f").size;
    }
    /**
     * Iterates over the cache keys.
     *
     * @returns {IterableIterator<Key>} Iterator over keys.
     */
    keys() {
        return __classPrivateFieldGet(this, _Cache_store, "f").keys();
    }
    /**
     * Iterates over cache values (entries).
     *
     * @returns {IterableIterator<CacheEntry>} Iterator over entries.
     */
    values() {
        return __classPrivateFieldGet(this, _Cache_store, "f").values();
    }
    /**
     * Iterates over cache entries as [key, entry] tuples.
     *
     * @returns {IterableIterator<[Key, CacheEntry]>} Iterator over key-value pairs.
     */
    entries() {
        return __classPrivateFieldGet(this, _Cache_store, "f").entries();
    }
    /**
     * Starts the automatic cleanup interval to remove expired entries.
     *
     * @param {Object} [options]
     * @param {number} [options.interval] - Interval (in milliseconds by default).
     * @param {boolean} [options.restart=false] - Whether to force restart an existing interval.
     * @returns {boolean} True if interval was started, false if skipped.
     */
    startCleanupInterval(options) {
        var _a;
        if (__classPrivateFieldGet(this, _Cache_intervalId, "f")) {
            if (!(options === null || options === void 0 ? void 0 : options.restart)) {
                return false;
            }
            else {
                clearInterval(__classPrivateFieldGet(this, _Cache_intervalId, "f"));
            }
        }
        // calculate interval scale to get milliseconds
        __classPrivateFieldSet(this, _Cache_cleanupInterval, (_a = options === null || options === void 0 ? void 0 : options.interval) !== null && _a !== void 0 ? _a : __classPrivateFieldGet(this, _Cache_cleanupInterval, "f"), "f");
        if (__classPrivateFieldGet(this, _Cache_cleanupInterval, "f") && __classPrivateFieldGet(this, _Cache_cleanupInterval, "f") > 0) {
            __classPrivateFieldSet(this, _Cache_intervalId, setInterval(() => {
                this.deleteExpired();
            }, __classPrivateFieldGet(this, _Cache_cleanupInterval, "f") * __classPrivateFieldGet(this, _Cache_timeScale, "f")), "f");
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
    restartCleanupInterval(options) {
        return this.startCleanupInterval(Object.assign(Object.assign({}, options), { restart: true }));
    }
    /**
     * Stops the automatic cleanup interval.
     *
     * @returns {boolean} True if the interval was running and was stopped.
     */
    stopCleanupInterval() {
        if (__classPrivateFieldGet(this, _Cache_intervalId, "f")) {
            clearInterval(__classPrivateFieldGet(this, _Cache_intervalId, "f"));
            __classPrivateFieldSet(this, _Cache_intervalId, undefined, "f");
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
    getDefaultExp(exp, maxAge) {
        var _a;
        maxAge = maxAge !== null && maxAge !== void 0 ? maxAge : __classPrivateFieldGet(this, _Cache_defaultMaxAge, "f");
        const defaultExp = (_a = exp !== null && exp !== void 0 ? exp : (maxAge
            ? __classPrivateFieldGet(this, _Cache_now, "f").call(this) + maxAge
            : null)) !== null && _a !== void 0 ? _a : __classPrivateFieldGet(this, _Cache_defaultExp, "f").call(this);
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
    has(key, options) {
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry) {
            if (options === null || options === void 0 ? void 0 : options.expired) {
                return true;
            }
            const now = this.now();
            if (!entry.exp || entry.exp > now) {
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
    get(key, options) {
        let entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (!entry && __classPrivateFieldGet(this, _Cache_onGetMiss, "f")) {
            const result = __classPrivateFieldGet(this, _Cache_onGetMiss, "f").call(this, this, key, "missing");
            if (result)
                entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        }
        else if (entry && __classPrivateFieldGet(this, _Cache_onGetHit, "f")) {
            __classPrivateFieldGet(this, _Cache_onGetHit, "f").call(this, this, key, entry);
        }
        if (entry && entry.exp) {
            const exp = entry.exp;
            const now = this.now();
            if (exp <= now) {
                const expired = (options === null || options === void 0 ? void 0 : options.expired) != null
                    ? options === null || options === void 0 ? void 0 : options.expired
                    : __classPrivateFieldGet(this, _Cache_getExpired, "f");
                const deleteExpired = (options === null || options === void 0 ? void 0 : options.deleteExpired) != null
                    ? options === null || options === void 0 ? void 0 : options.deleteExpired
                    : __classPrivateFieldGet(this, _Cache_deleteExpiredOnGet, "f");
                // delete expired  
                if (deleteExpired) {
                    this.delete(key);
                }
                else if (expired) {
                    __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_updateLRU).call(this, key, entry);
                }
                else if (__classPrivateFieldGet(this, _Cache_onGetMiss, "f")) {
                    const result = __classPrivateFieldGet(this, _Cache_onGetMiss, "f").call(this, this, key, "expired");
                    if (result)
                        return __classPrivateFieldGet(this, _Cache_store, "f").get(key);
                }
                return expired ? entry : undefined;
            }
            __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_updateLRU).call(this, key, entry);
        }
        return entry;
    }
    /**
     * Retrieves a cache entry without affecting LRU order or triggering events.
     *
     * @param {Key} key - Cache key.
     * @param {Object} [options]
     * @param {boolean} [options.expired=false] - Whether to include expired entries.
     * @returns {CacheEntry|undefined} The entry or undefined.
     */
    peek(key, options) {
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry && entry.exp && entry.exp <= this.now() && !(options === null || options === void 0 ? void 0 : options.expired)) {
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
    set(key, value, options) {
        const exp = this.getDefaultExp(options === null || options === void 0 ? void 0 : options.exp, options === null || options === void 0 ? void 0 : options.maxAge);
        const existingEntry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (existingEntry) {
            const existingExp = existingEntry.exp;
            if (existingExp !== exp && existingExp) {
                const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, existingExp);
                const bucket = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                if (bucket) {
                    bucket.delete(key);
                    if (bucket.size === 0) {
                        __classPrivateFieldGet(this, _Cache_expBuckets, "f").delete(bucketIndex);
                    }
                }
                if (exp) {
                    const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, exp);
                    const existingBucketMap = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                    const bucket = existingBucketMap !== null && existingBucketMap !== void 0 ? existingBucketMap : new Set();
                    bucket.add(key);
                    if (!existingBucketMap) {
                        __classPrivateFieldGet(this, _Cache_expBuckets, "f").set(bucketIndex, bucket);
                    }
                }
            }
            existingEntry.exp = exp;
            existingEntry.value = value;
            __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_updateLRU).call(this, key, existingEntry);
        }
        else {
            const entry = { key, value, exp };
            if (exp) {
                const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, exp);
                const existingBucketMap = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                const bucket = existingBucketMap !== null && existingBucketMap !== void 0 ? existingBucketMap : new Set();
                bucket.add(key);
                if (!existingBucketMap) {
                    __classPrivateFieldGet(this, _Cache_expBuckets, "f").set(bucketIndex, bucket);
                }
            }
            __classPrivateFieldGet(this, _Cache_store, "f").set(key, entry);
            __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_updateLRU).call(this, key, entry, true);
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
    update(key, changes) {
        var _a;
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry != null) {
            if (changes.hasOwnProperty("exp") || changes.hasOwnProperty("maxAge")) {
                const exp = (_a = changes.exp) !== null && _a !== void 0 ? _a : (changes.maxAge ? this.now() + changes.maxAge : null);
                // remove from old expiry bucket
                if (entry.exp && entry.exp !== exp) {
                    const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, entry.exp);
                    const bucket = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                    if (bucket) {
                        bucket.delete(key);
                        if (bucket.size === 0) {
                            __classPrivateFieldGet(this, _Cache_expBuckets, "f").delete(bucketIndex);
                        }
                    }
                }
                // add to new expiry bucket
                if (exp) {
                    const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, exp);
                    const existingBucketMap = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                    const bucket = existingBucketMap !== null && existingBucketMap !== void 0 ? existingBucketMap : new Set();
                    bucket.add(key);
                    if (!existingBucketMap) {
                        __classPrivateFieldGet(this, _Cache_expBuckets, "f").set(bucketIndex, bucket);
                    }
                }
                entry.exp = exp;
            }
            if (changes.hasOwnProperty("value")) {
                entry.value = changes.value;
            }
            // update LRU
            __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_updateLRU).call(this, key, entry, true);
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
    delete(key, reason = "deleted") {
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry) {
            const exp = entry.exp;
            if (exp) {
                const bucketIndex = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, exp);
                const bucket = __classPrivateFieldGet(this, _Cache_expBuckets, "f").get(bucketIndex);
                if (bucket) {
                    bucket.delete(key);
                    if (bucket.size === 0) {
                        __classPrivateFieldGet(this, _Cache_expBuckets, "f").delete(bucketIndex);
                    }
                }
            }
            if (entry.lruNode != null) {
                __classPrivateFieldGet(this, _Cache_lruList, "f").remove(entry.lruNode);
            }
            __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
            if (__classPrivateFieldGet(this, _Cache_onDelete, "f")) {
                __classPrivateFieldGet(this, _Cache_onDelete, "f").call(this, this, key, entry, reason);
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
    deleteExpired() {
        let count = 0;
        const now = this.now();
        const bucketIndexNow = __classPrivateFieldGet(this, _Cache_instances, "m", _Cache_bucketIndex).call(this, now);
        const expired = new Array();
        for (const [bucketIndex, bucket] of __classPrivateFieldGet(this, _Cache_expBuckets, "f")) {
            if (bucketIndex <= bucketIndexNow) {
                for (const key of bucket) {
                    const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
                    const exp = entry === null || entry === void 0 ? void 0 : entry.exp;
                    if (exp && exp <= now) {
                        expired.push({ key, bucket, entry });
                    }
                }
            }
        }
        count = expired.length;
        for (const { key, bucket, entry } of expired) {
            bucket.delete(key);
            if (entry.lruNode != null) {
                __classPrivateFieldGet(this, _Cache_lruList, "f").remove(entry.lruNode);
            }
            __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
            if (__classPrivateFieldGet(this, _Cache_onDelete, "f")) {
                __classPrivateFieldGet(this, _Cache_onDelete, "f").call(this, this, key, entry, "expired");
            }
        }
        if (__classPrivateFieldGet(this, _Cache_onDeleteExpired, "f")) {
            __classPrivateFieldGet(this, _Cache_onDeleteExpired, "f").call(this, count);
        }
        // remove empty buckets
        {
            const emptyBuckets = Array();
            for (const buckPair of __classPrivateFieldGet(this, _Cache_expBuckets, "f")) {
                const [, bucket] = buckPair;
                if (bucket.size === 0) {
                    emptyBuckets.push(buckPair);
                }
            }
            for (const [bucketIndex] of emptyBuckets) {
                __classPrivateFieldGet(this, _Cache_expBuckets, "f").delete(bucketIndex);
            }
        }
        return count;
    }
    /**
     * Clears all entries from the cache (including LRU and expiry buckets).
     */
    clear() {
        for (const [, bucket] of __classPrivateFieldGet(this, _Cache_expBuckets, "f")) {
            bucket.clear();
        }
        __classPrivateFieldGet(this, _Cache_expBuckets, "f").clear();
        __classPrivateFieldGet(this, _Cache_lruList, "f").clear();
        __classPrivateFieldGet(this, _Cache_store, "f").clear();
    }
}
exports.Cache = Cache;
;
exports.default = Cache;
//# sourceMappingURL=index.js.map