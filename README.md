# 🏆 @bepalo/cache

A fast and modern in-memory cache library with TTL and LRU for javascript runtimes.

## 📦 Project Status

Currently the project is in discovery and experimental stage.

## 📢 Benchmarks

These benchmarks were done on the following system with `1,000,000` iterations, 
`10,000` warmup iterations, `500,000` LRU limit and `UUIDv4` keys. Checkout [benchmark](bench/benchmark.js)

**System Info:**

```js
CPU: AMD Ryzen 7 5700U (8 cores, 16 threads)
RAM: 16 GB DDR4
OS: Pop!_OS 22.04 (Linux 6.8)
Node.js: v22.6.0
```

### 🥇 Bun v1.2.6**

<details>
<summary>Bun benchmark results</summary>

**Benchmarking @bepalo/cache (N=`1,000,000`, LRU-Limit=`500,000`, K=`UUIDv4`)**


| Operation                    | ns/operation | operations/s |
|------------------------------|--------------|--------------|
| cache.get: hit               |       111.14 |    8,997,658 |
| cache.get: miss              |      105.218 |    9,504,060 |
| cache.get: miss, empty       |       11.781 |   84,883,677 |
| cache.set: new               |      449.293 |    2,225,718 |
| cache.set: override          |      534.526 |    1,870,816 |
| cache.update:                |      298.698 |    3,347,867 |
| cache.deleteExpired: all     |  333,333,333 |            3 |
| cache.deleteExpired: none    |  421,052.632 |        2,375 |

**Comparing with native Map**

| Operation                    | ns/operation | operations/s |
|------------------------------|--------------|--------------|
| Map.get: hit                 |        4.768 |  209,744,784 |
| Map.get: miss                |        5.078 |  196,931,841 |
| Map.get: miss, empty         |        4.539 |  220,326,435 |
| Map.set:                     |      241.091 |    4,147,819 |
| Map.set: update              |      139.334 |    7,177,024 |
| Map.delete:                  |      179.569 |    5,568,900 |

</details>

### 🥈 Node v22.16.0

<details>
<summary>Node benchmark results</summary>

**Benchmarking @bepalo/cache (N=`1,000,000`, LRU-Limit=`500,000`, K=`UUIDv4`)**

| Operation                    | ns/operation | operations/s |
|------------------------------|--------------|--------------|
| cache.get: hit               |        223.6 |    4,472,267 |
| cache.get: miss              |      235.573 |    4,244,975 |
| cache.get: miss, empty       |       31.271 |   31,978,921 |
| cache.set: new               |      889.589 |    1,124,115 |
| cache.set: override          |    1,167.268 |      856,701 |
| cache.update:                |      544.116 |    1,837,842 |
| cache.deleteExpired: all     |  500,000,000 |            2 |
| cache.deleteExpired: none    |  176,211.454 |        5,675 |

**Comparing with native Map**

| Operation                    | ns/operation | operations/s |
|------------------------------|--------------|--------------|
| Map.get: hit                 |      185.881 |    5,379,777 |
| Map.get: miss                |      184.672 |    5,415,001 |
| Map.get: miss, empty         |        9.007 |  111,025,374 |
| Map.set:                     |      268.631 |    3,722,579 |
| Map.set: update              |      196.197 |    5,096,925 |
| Map.delete:                  |      219.495 |    4,555,914 |

</details>


## 📦 Basic Usage


```js
import { Cache } from "@bepalo/cache";

const cache = new Cache();

cache.set("hello", "world");
console.log(cache.get("hello")?.value); // => "world"

cache.delete("hello");
console.log(cache.get("hello")); // => undefined
```

### Using TTL (Time to Live)

```js
const cache = new Cache({
  defaultMaxAge: 1000, // 1 second TTL
});

cache.set("foo", 123);
setTimeout(() => {
  console.log(cache.get("foo")); // => undefined (expired)
}, 1500);
```

### With LRU Eviction

```js
const cache = new Cache({
  lruMaxSize: 2,
});

cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3); // "a" gets evicted (least recently used)

console.log(cache.has("a")); // => false
console.log(cache.has("b")); // => true
```

### Custom expiration time and cleanup interval

```js
const cache = new Cache({
  defaultExp: () => Date.now() + 5000, // set default expiry using a function
  cleanupInterval: 500, // auto-clean every 500ms
});

cache.set("temp", "value", { maxAge: 100 }); // expires in 100ms

setTimeout(() => {
  console.log(cache.has("temp")); // => false
}, 1000);
```

### Custom time functions

```js
const cache = new Cache({
  now: () => Date.now() / 1000, // now will return time in seconds
  defaultMaxAge: 60 // treated as 60 seconds
  cleanupInterval: 5, // auto-clean every 5sec
});

cache.set("temp", "value", { maxAge: 3 }); // expires in 3sec

setTimeout(() => {
  console.log(cache.has("temp")); // => false
}, 4000);
```

### Using event hooks


```js
const cache = new Cache({
  deleteExpiredOnGet: true,

  onGetHit: (cache, key, entry) => {
    console.log(`Hit: ${key}`);
  },
  onGetMiss: (cache, key, reason) => {
    console.log(`Miss: ${key} (${reason})`);
  },
  onDelete: (cache, key, entry, reason) => {
    console.log(`Deleted: ${key} (${reason})`);
  },
  onDeleteExpired: (count) => {
    console.log(`Expired entries removed: ${count}`);
  }
});

cache.set("x", 42, { maxAge: 10 });

cache.get("y"); // triggers `onGetMiss`

setTimeout(() => {
  cache.get("x"); // triggers `onGetHit`, `onDelete`, `onDeleteExpired`
}, 100);
```

## Sample

```ts
import { Cache } from ".";

const timestampRef = performance.now();
const timestamp = () => `${(performance.now() - timestampRef).toFixed()}ms: `;
const log = console.log;

const cache = new Cache<string, string>({
  // now: () => Date.now(),
  // defaultExp: () => Date.now() + 5000,
  defaultMaxAge: 5000,
  // cleanupInterval: 5000,
  // expiryBucketSize: 5000,
  lruMaxSize: 3,
  // getExpired: true,
  // deleteExpiredOnGet: true,
  onGetHit: async(cache, key, entry) => 
    log(timestamp(), "cache-hit", key),
  onGetMiss: async(cache, key, reason) => 
    log(timestamp(), reason, key),
  onDelete: async (cache, key, entry, reason) => 
    log(timestamp(), "Evict", reason, key),
  onDeleteExpired: async (count) => 
    count > 0 && log(timestamp(), `Expired ${count} entries.`)
}); 

cache.set("item-1", "'sample entry 1'");
cache.set("item-2", "'sample entry 2'", { exp: Date.now() + 2000 });
cache.set("item-3", "'sample entry 3'", { maxAge: 3000 });
cache.set("item-4", "'sample entry 4'", { maxAge: 2500 });

setTimeout(() => log(timestamp(), "1 get", cache.get("item-4")?.value), 1000);
setTimeout(() => log(timestamp(), "2 get", cache.get("item-4", { expired: true })?.value), 2000);
setTimeout(() => log(timestamp(), "3 peek", cache.peek("item-4")?.value), 3000);
setTimeout(() => log(timestamp(), "4 peek", cache.peek("item-4", { expired: true })?.value), 3000);
setTimeout(() => log(timestamp(), "5 get", cache.get("item-4", { deleteExpired: true })?.value), 3000);
setTimeout(() => log(timestamp(), "6 get", cache.get("item-4", { expired: true })?.value), 4000);

for(const [key, entry] of cache) {
  log(timestamp(), key, entry);
}
```

OUTPUT:

```sh
1ms:  Evict LRU item-1
3ms:  item-2 {
  value: "'sample entry 2'",
  exp: 1752603303022,
}
4ms:  item-3 {
  value: "'sample entry 3'",
  exp: 1752603304022,
}
4ms:  item-4 {
  value: "'sample entry 4'",
  exp: 1752603303522,
}
1003ms:  cache-hit item-4
1003ms:  1 get 'sample entry 4'
2003ms:  cache-hit item-4
2003ms:  2 get 'sample entry 4'
3003ms:  3 peek undefined
3003ms:  4 peek 'sample entry 4'
3004ms:  cache-hit item-4
3004ms:  Evict deleted item-4
3003ms:  5 get undefined
4003ms:  missing item-4
4003ms:  6 get undefined
```

