"use strict";
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
var _Cache_instances, _Cache_store, _Cache_expBuckets, _Cache_intervalId, _Cache_now, _Cache_timeScale, _Cache_defaultExp, _Cache_defaultMaxAge, _Cache_lruMaxSize, _Cache_cleanupInterval, _Cache_expiryBucketSize, _Cache_getExpired, _Cache_deleteExpiredOnGet, _Cache_onGetHit, _Cache_onGetMiss, _Cache_onDelete, _Cache_onDeleteExpired, _Cache_bucketIndex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor(config) {
        _Cache_instances.add(this);
        _Cache_store.set(this, new Map());
        _Cache_expBuckets.set(this, new Map());
        _Cache_intervalId.set(this, undefined);
        _Cache_now.set(this, () => Date.now());
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
    [(_Cache_store = new WeakMap(), _Cache_expBuckets = new WeakMap(), _Cache_intervalId = new WeakMap(), _Cache_now = new WeakMap(), _Cache_timeScale = new WeakMap(), _Cache_defaultExp = new WeakMap(), _Cache_defaultMaxAge = new WeakMap(), _Cache_lruMaxSize = new WeakMap(), _Cache_cleanupInterval = new WeakMap(), _Cache_expiryBucketSize = new WeakMap(), _Cache_getExpired = new WeakMap(), _Cache_deleteExpiredOnGet = new WeakMap(), _Cache_onGetHit = new WeakMap(), _Cache_onGetMiss = new WeakMap(), _Cache_onDelete = new WeakMap(), _Cache_onDeleteExpired = new WeakMap(), _Cache_instances = new WeakSet(), _Cache_bucketIndex = function _Cache_bucketIndex(time) {
        return Math.floor(time / __classPrivateFieldGet(this, _Cache_expiryBucketSize, "f"));
    }, Symbol.iterator)]() {
        return __classPrivateFieldGet(this, _Cache_store, "f")[Symbol.iterator]();
    }
    get now() {
        return __classPrivateFieldGet(this, _Cache_now, "f");
    }
    get timeScale() {
        return __classPrivateFieldGet(this, _Cache_timeScale, "f");
    }
    get defaultExp() {
        return __classPrivateFieldGet(this, _Cache_defaultExp, "f");
    }
    get defaultMaxAge() {
        return __classPrivateFieldGet(this, _Cache_defaultMaxAge, "f");
    }
    get lruMaxSize() {
        return __classPrivateFieldGet(this, _Cache_lruMaxSize, "f");
    }
    get cleanupInterval() {
        return __classPrivateFieldGet(this, _Cache_cleanupInterval, "f");
    }
    get expiryBucketSize() {
        return __classPrivateFieldGet(this, _Cache_expiryBucketSize, "f");
    }
    get onDeleteExpired() {
        return __classPrivateFieldGet(this, _Cache_onDeleteExpired, "f");
    }
    get onDelete() {
        return __classPrivateFieldGet(this, _Cache_onDelete, "f");
    }
    get onGetHit() {
        return __classPrivateFieldGet(this, _Cache_onGetHit, "f");
    }
    get onGetMiss() {
        return __classPrivateFieldGet(this, _Cache_onGetMiss, "f");
    }
    get size() {
        return __classPrivateFieldGet(this, _Cache_store, "f").size;
    }
    keys() {
        return __classPrivateFieldGet(this, _Cache_store, "f").keys();
    }
    values() {
        return __classPrivateFieldGet(this, _Cache_store, "f").values();
    }
    entries() {
        return __classPrivateFieldGet(this, _Cache_store, "f").entries();
    }
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
    restartCleanupInterval(options) {
        return this.startCleanupInterval(Object.assign(Object.assign({}, options), { restart: true }));
    }
    stopCleanupInterval() {
        if (__classPrivateFieldGet(this, _Cache_intervalId, "f")) {
            clearInterval(__classPrivateFieldGet(this, _Cache_intervalId, "f"));
            __classPrivateFieldSet(this, _Cache_intervalId, undefined, "f");
            return true;
        }
        return false;
    }
    getDefaultExp(exp, maxAge) {
        var _a;
        maxAge = maxAge !== null && maxAge !== void 0 ? maxAge : __classPrivateFieldGet(this, _Cache_defaultMaxAge, "f");
        const defaultExp = (_a = exp !== null && exp !== void 0 ? exp : (maxAge
            ? __classPrivateFieldGet(this, _Cache_now, "f").call(this) + maxAge
            : null)) !== null && _a !== void 0 ? _a : __classPrivateFieldGet(this, _Cache_defaultExp, "f").call(this);
        return defaultExp;
    }
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
                    if (__classPrivateFieldGet(this, _Cache_lruMaxSize, "f")) {
                        // update LRU
                        __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
                        __classPrivateFieldGet(this, _Cache_store, "f").set(key, entry);
                    }
                }
                else if (__classPrivateFieldGet(this, _Cache_onGetMiss, "f")) {
                    // let refreshedEntry = undefined as CacheEntry<Key, unknown> | undefined;
                    const result = __classPrivateFieldGet(this, _Cache_onGetMiss, "f").call(this, this, key, "expired");
                    if (result)
                        return __classPrivateFieldGet(this, _Cache_store, "f").get(key);
                }
                return expired ? entry : undefined;
            }
            else if (__classPrivateFieldGet(this, _Cache_lruMaxSize, "f")) {
                // update LRU
                __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
                __classPrivateFieldGet(this, _Cache_store, "f").set(key, entry);
            }
        }
        return entry;
    }
    peek(key, options) {
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry && entry.exp && entry.exp <= this.now() && !(options === null || options === void 0 ? void 0 : options.expired)) {
            return undefined;
        }
        return entry;
    }
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
            __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
            __classPrivateFieldGet(this, _Cache_store, "f").set(key, existingEntry);
        }
        else {
            const entry = { value, exp };
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
        }
        // evict LRU item
        {
            const lruMaxSize = __classPrivateFieldGet(this, _Cache_lruMaxSize, "f");
            if (lruMaxSize && __classPrivateFieldGet(this, _Cache_store, "f").size > lruMaxSize) {
                const lruKey = __classPrivateFieldGet(this, _Cache_store, "f").keys().next().value;
                this.delete(lruKey, "LRU");
            }
        }
    }
    update(key, newEntry) {
        const entry = __classPrivateFieldGet(this, _Cache_store, "f").get(key);
        if (entry) {
            if (newEntry.hasOwnProperty("exp"))
                entry.exp = newEntry.exp;
            if (newEntry.value !== undefined)
                entry.value = newEntry.value;
            // update LRU
            if (__classPrivateFieldGet(this, _Cache_lruMaxSize, "f")) {
                __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
                __classPrivateFieldGet(this, _Cache_store, "f").set(key, entry);
            }
            return true;
        }
        return false;
    }
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
            __classPrivateFieldGet(this, _Cache_store, "f").delete(key);
            if (__classPrivateFieldGet(this, _Cache_onDelete, "f")) {
                __classPrivateFieldGet(this, _Cache_onDelete, "f").call(this, this, key, entry, reason);
            }
            return true;
        }
        return false;
    }
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
    clear() {
        for (const [, bucket] of __classPrivateFieldGet(this, _Cache_expBuckets, "f")) {
            bucket.clear();
        }
        __classPrivateFieldGet(this, _Cache_expBuckets, "f").clear();
        __classPrivateFieldGet(this, _Cache_store, "f").clear();
    }
}
exports.Cache = Cache;
;
exports.default = Cache;
//# sourceMappingURL=index.js.map