# @bepalo/cache

A fast and modern cache library for javascript runtimes.

## Project Status

Currently the project is in discovery and experimental stage.


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


<details>
<summary> Easter egg</summary>

<div style="word-break: break-all;">
eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCJ9.eyJtZXNzYWdlIjoi8J-Viu-4jyBUaGFuayBHb2QgdGhyb3VnaCBKZXN1cyBDaHJpc3QgZm9yIGV2ZXJ5dGhpbmchIiwiaWF0IjoxNzUyNDg1NTgwLCJuYmYiOi0yMTQ2NTIxNjAwLCJpc3MiOiJOYXRuYWVsIiwic3ViIjoiR3JhdGl0dWRlIn0.MGUCMQDT70X5eLyghdZB_za7B92FLYUy6x7yP4eD3X7VgEZqPnLMc3XZA8vBYh-Zj6SdD2wCMCxSjhloUa8RYYs4xLoeBOBcLn1ky8Kiw_xZrzZSF8fgDXWGmXhuzJXOJG_F8A2EMw
</div>

</details>


<!-- <details>
<summary>public key</summary>

```pem
-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEviwJ0AyuHBd6ccb/OxxStG1VY15+vpGr
rJKH93drYS0LZQf3e6UiEaCcvdSaWkCXlQWwxISP3bgRxoNmnE+c4BEE1AWGTHkv
B4/XKBrlOA5gSAUmY1kNBCpiS22PbUX/
-----END PUBLIC KEY-----

```

</details> -->

