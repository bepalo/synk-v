# Test Report

| 🕙 Start time | ⌛ Duration |
| --- | ---: |
| 7/19/2025, 1:25:49 AM | 0.414 s |

| | ✅ Passed | ❌ Failed | ⏩ Skipped | 🚧 Todo | ⚪ Total |
| --- | ---: | ---: | ---: | ---: | ---: |
|Test Suites|2|0|0|0|2|
|Tests|22|0|0|0|22|

## ✅ <a id="file0" href="#file0">tests/cache.test.ts</a>

22 passed, 0 failed, 0 skipped, 0 todo, done in 11.070262999999954 s

```
✅ Cache
   ✅ should set and get a value
   ✅ should return undefined for missing keys
   ✅ should expire entries with custom now()
   ✅ should support getExpired option
   ✅ should support deleteExpiredOnGet
   ✅ should evict least recently used entries
   ✅ should call onGetHit and onGetMiss hooks
   ✅ should call onDelete hook with reason on set, delete and deleteExpired
   ✅ should call onDeleteExpired after deleteExpired
   ✅ should update expiration only
   ✅ should update value only
   ✅ should update expiration and value
   ✅ should not update nonexistent entry
   ✅ should peek without triggering LRU or events
   ✅ should support clear
   ✅ should support for...of
   ✅ should start and stop cleanup interval
   ✅ should fallback to defaultMaxAge
   ✅ should use defaultExp function
   ✅ should support non-string keys like numbers and symbols
   ✅ should not crash when deleting from empty bucket
   ✅ should calculate timeScale correctly if now is mocked
```
