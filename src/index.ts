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

import { List, ListNode } from "./list";
export * from "./list";

export type CacheEntry<Key = string, Value = unknown> = {
  value: Value,
  exp?: number|null,
  lruNode?: ListNode<Key>;
};

export type GenericCacheKey = string | number | Symbol;
export type CacheDeleteReason = "LRU"|"expired"|"deleted";
export type CacheMissReason = "missing"|"expired";
export type CacheNowFn = () => number;
export type CacheDefaultExpFn = () => number | undefined | null;
export type CacheOnGetHitFn<Key = GenericCacheKey, Value = unknown> 
  = (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>) => unknown;
export type CacheOnGetMissFn<Key = GenericCacheKey, Value = unknown> 
  = (cache: Cache<Key, Value>, key: Key, reason: CacheMissReason) => unknown;
export type CacheOnDeleteFn<Key = GenericCacheKey, Value = unknown> 
  = (cache: Cache<Key, Value>, key: Key, entry: CacheEntry<Key, Value>, reason: CacheDeleteReason) => unknown;
export type CacheOnDeleteExpiredFn = (count: number) => unknown;

export type CacheConfig<Key = GenericCacheKey, Value = unknown> = {
  now?: CacheNowFn,
  defaultExp?: CacheDefaultExpFn,
  defaultMaxAge?: number | null,
  lruMaxSize?: number | null,
  cleanupInterval?: number,
  expiryBucketSize?: number,
  getExpired?: boolean,
  deleteExpiredOnGet?: boolean,
  onGetHit?: CacheOnGetHitFn<Key, Value> | null,
  onGetMiss?: CacheOnGetMissFn<Key, Value> | null,
  onDelete?: CacheOnDeleteFn<Key, Value> | null,
  onDeleteExpired?: CacheOnDeleteExpiredFn | null,
};

export class Cache<Key=GenericCacheKey, Value=unknown> {
  #store: Map<Key, CacheEntry<Key, Value>> = new Map();
  #lruList: List<Key> = new List();
  #expBuckets = new Map<number, Set<Key>>();
  #intervalId?: ReturnType<typeof setTimeout> = undefined; 
  #now: CacheNowFn = () => Date.now();
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

  [Symbol.iterator](): MapIterator<[Key, CacheEntry<Key, Value>]> {
    return this.#store[Symbol.iterator]();
  }

  get now(): CacheNowFn {
    return this.#now;
  }

  get timeScale(): number {
    return this.#timeScale;
  }

  get defaultExp(): CacheDefaultExpFn {
    return this.#defaultExp;
  }

  get defaultMaxAge(): number | undefined | null {
    return this.#defaultMaxAge;
  }

  get lruMaxSize(): number | undefined | null {
    return this.#lruMaxSize;
  }

  get cleanupInterval(): number | undefined | null {
    return this.#cleanupInterval;
  }

  get expiryBucketSize(): number {
    return this.#expiryBucketSize;
  }

  get onDeleteExpired(): CacheOnDeleteExpiredFn | null | undefined {
    return this.#onDeleteExpired;
  }

  get onDelete(): CacheOnDeleteFn<Key, Value> | null | undefined {
    return this.#onDelete;
  }

  get onGetHit(): CacheOnGetHitFn<Key, Value> | null | undefined {
    return this.#onGetHit;
  }

  get onGetMiss(): CacheOnGetMissFn<Key, Value> | null | undefined {
    return this.#onGetMiss;
  }

  get size(): number {
    return this.#store.size;
  }

  keys(): MapIterator<Key> {
    return this.#store.keys();
  }

  values(): MapIterator<CacheEntry<Key, Value>> {
    return this.#store.values();
  }

  entries(): MapIterator<[Key, CacheEntry<Key, Value>]> {
    return this.#store.entries();
  }

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

  restartCleanupInterval(options?: {
    interval?: number
  }): boolean {
    return this.startCleanupInterval({ ...options, restart: true });
  }

  stopCleanupInterval(): boolean {
    if(this.#intervalId) {
      clearInterval(this.#intervalId);
      this.#intervalId = undefined;
      return true;
    }
    return false;
  }

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

  #updateLRU(key: Key, entry: CacheEntry<Key,Value>, evictLRU?: boolean) {
    if(this.#lruMaxSize) {
      if(entry.lruNode == null) {
        entry.lruNode = this.#lruList.push(key);
      } else if(entry.lruNode !== this.#lruList.last) {
        const node = this.#lruList.remove(entry.lruNode);
        this.#lruList.insertNodeAfter(node, this.#lruList.last!);
      }
      if(evictLRU && this.#store.size > this.#lruMaxSize) {
        const lruKey = this.#lruList.popFirst();
        if(lruKey != null) {
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
            this.#onDelete(this, lruKey, entry, "LRU");
          }
        }
      }
    }
  }

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

  peek(key: Key, options?: {
    expired?: boolean
  }): CacheEntry<Key, Value> | undefined {
    const entry = this.#store.get(key);
    if(entry && entry.exp && entry.exp <= this.now() && !options?.expired) {
      return undefined;
    }
    return entry;
  }

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
      const entry = { value, exp } as CacheEntry<Key, Value>;
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

  update(key: Key, newEntry: {
    exp?: number,
    value?: Value
  }): boolean {
    const entry = this.#store.get(key);
    if(entry != null) {
      if(newEntry.hasOwnProperty("exp"))
        entry.exp = newEntry.exp;
      if(newEntry.value !== undefined)
        entry.value = newEntry.value;
      // update LRU
      this.#updateLRU(key, entry, true);
      return true;
    }
    return false;
  }

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

