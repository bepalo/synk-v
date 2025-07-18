import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CacheDeleteReason, CacheEntry, CacheMissReason } from "@bepalo/cache";
import { Cache } from "@bepalo/cache";

describe("Cache", () => {
  let now = vi.fn(() => 1000);

  beforeEach(() => {
    now = vi.fn(() => 1000);
  });

  it("should set and get a value", () => {
    const cache = new Cache();
    expect(cache.size).toBe(0);
    cache.set("foo", "bar");
    expect(cache.size).toBe(1);
    expect(cache.get("foo")?.value).toBe("bar");
    expect(cache.has("foo")).toBe(true);
  });

  it("should return undefined for missing keys", () => {
    const cache = new Cache();
    expect(cache.get("missing")).toBeUndefined();
    expect(cache.has("missing")).toBe(false);
  });

  it("should expire entries with custom now()", () => {
    const cache = new Cache({ now });
    cache.set("foo", "bar", { exp: 900 });
    expect(cache.get("foo")).toBeUndefined();
    expect(cache.has("foo")).toBe(false);
  });

  it("should support getExpired option", () => {
    const cache = new Cache({ now, getExpired: true });
    cache.set("foo", "bar", { exp: 900 });
    expect(cache.get("foo")?.value).toBe("bar");
    expect(cache.has("foo")).toBe(true);
    expect(cache.get("foo", { expired: false })?.value).toBeUndefined();
    expect(cache.has("foo", { expired: false })).toBe(false);
  });

  it("should support deleteExpiredOnGet", () => {
    const cache = new Cache({ now, deleteExpiredOnGet: true });
    cache.set("foo", "bar", { exp: 900 });
    expect(cache.get("foo")).toBeUndefined();
    expect(cache.has("foo")).toBe(false);
    expect(cache.get("foo", { expired: true })).toBeUndefined();
    expect(cache.has("foo", { expired: true })).toBe(false);
  });

  it("should evict least recently used entries", () => {
    const cache = new Cache({ lruMaxSize: 2 });
    expect(cache.size).toBe(0);
    cache.set("x", 1);
    cache.set("y", 2);
    cache.get("x");
    cache.set("z", 3);
    expect(cache.size).toBe(2);
    expect(cache.has("x")).toBe(false);
    expect(cache.has("y")).toBe(true);
    expect(cache.has("z")).toBe(true);
    expect(cache.size).toBe(2);
  });

  it("should call onGetHit and onGetMiss hooks", () => {
    const hits: string[] = [];
    const misses: string[] = [];
    const cache = new Cache<string>({
      onGetHit: (_c: Cache<string>, k: string) => hits.push(String(k)),
      onGetMiss: (_c: Cache<string>, k: string, r: CacheMissReason) =>
        misses.push(`${String(k)}:${r}`),
    });
    cache.set("x", 123);
    cache.get("x");
    cache.get("y");
    expect(hits).toEqual(["x"]);
    expect(misses).toEqual(["y:missing"]);
  });

  it("should call onDelete hook with reason on set, delete and deleteExpired", () => {
    const events: [string, string][] = [];
    const cache = new Cache<string>({
      lruMaxSize: 1,
      onDelete: (_c: Cache<string>, k: string, _e: CacheEntry<string>, r: CacheDeleteReason) =>
        events.push([String(r), String(k)]),
    });
    cache.set("x", 1);
    cache.set("y", 2); // x evicted
    cache.delete("y");
    cache.set("z", 3, { exp: 900 });
    cache.deleteExpired();
    expect(events).toEqual([
      ["LRU", "x"],
      ["deleted", "y"],
      ["expired", "z"],
    ]);
  });

  it("should call onDeleteExpired after deleteExpired", () => {
    let called = 0;
    const cache = new Cache({
      now,
      onDeleteExpired: (count: number) => (called = count),
    });
    cache.set("x", 1, { exp: 900 });
    now.mockReturnValue(1200);
    expect(cache.deleteExpired()).toBe(1);
    expect(called).toBe(1);
  });

  it("should update expiration only", () => {
    const cache = new Cache();
    cache.set("x", 10);
    const exp = Date.now() + 1000;
    expect(cache.update("x", { exp })).toBe(true);
    const entry = cache.get("x");
    expect(entry?.exp).toBe(exp);
    expect(entry?.value).toBe(10);
  });

  it("should update value only", () => {
    const cache = new Cache();
    cache.set("x", 10);
    expect(cache.update("x", { value: 20 })).toBe(true);
    const entry = cache.get("x");
    expect(entry?.exp).toBeNull();
    expect(entry?.value).toBe(20);
  });

  it("should update expiration and value", () => {
    const cache = new Cache();
    cache.set("x", 10);
    const exp = Date.now() + 1000;
    expect(cache.update("x", { exp, value: 20 })).toBe(true);
    const entry = cache.get("x");
    expect(entry?.exp).toBe(exp);
    expect(entry?.value).toBe(20);
  });

  it("should not update nonexistent entry", () => {
    const cache = new Cache();
    expect(cache.update("none", { value: 10 })).toBe(false);
    expect(cache.get("none")).toBeUndefined();
  });

  it("should peek without triggering LRU or events", () => {
    const spy = vi.fn();
    const cache = new Cache({ onGetHit: spy });
    cache.set("x", 1);
    expect(cache.peek("x")?.value).toBe(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it("should support clear", () => {
    const cache = new Cache();
    cache.set("x", 1);
    cache.set("y", 2);
    expect(cache.size).toBe(2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("should support for...of", () => {
    const cache = new Cache<string>();
    cache.set("x", 1);
    cache.set("y", 2);
    const keys: string[] = [];
    for (const [k] of cache) keys.push(k);
    expect(cache.size).toBe(2);
    expect(keys).toContain("x");
    expect(keys).toContain("y");
    expect(keys.length).toBe(2);
  });

  it("should start and stop cleanup interval", async () => {
    vi.useFakeTimers();
    const cache = new Cache({ cleanupInterval: 1000 });
    cache.set("x", 123, { exp: Date.now() + 500 });
    vi.advanceTimersByTime(2000);
    await Promise.resolve(); // wait for tick
    expect(cache.has("x")).toBe(false);
    expect(cache.has("x", { expired: true })).toBe(false);
    expect(cache.stopCleanupInterval()).toBe(true);
    cache.set("x", 123, { exp: Date.now() + 500 });
    vi.advanceTimersByTime(2000);
    await Promise.resolve(); // wait for tick
    expect(cache.has("x")).toBe(false);
    expect(cache.has("x", { expired: true })).toBe(true);
    vi.useRealTimers();
  });

  it("should fallback to defaultMaxAge", () => {
    const now = vi.fn(() => 500);
    const cache = new Cache({ now, defaultMaxAge: 100 });
    cache.set("x", 1);
    expect(cache.get("x")?.exp).toBe(600);
  });

  it("should use defaultExp function", () => {
    const now = vi.fn(() => 0);
    const defaultExp = () => 1234;
    const cache = new Cache({ now, defaultExp });
    cache.set("x", 1);
    expect(cache.get("x")?.exp).toBe(1234);
  });

  it("should support non-string keys like numbers and symbols", () => {
    const key1 = 123;
    const key2 = Symbol("key");
    const cache = new Cache();
    cache.set(key1, "num");
    cache.set(key2, "sym");
    expect(cache.get(key1)?.value).toBe("num");
    expect(cache.get(key2)?.value).toBe("sym");
  });

  it("should not crash when deleting from empty bucket", () => {
    const cache = new Cache();
    expect(cache.size).toBe(0);
    cache.delete("nope"); // should not throw
    expect(cache.size).toBe(0);
  });

  it("should calculate timeScale correctly if now is mocked", () => {
    const cache = new Cache({
      now: () => 10,
    });
    expect(cache.timeScale).toBeCloseTo(Date.now() / 10, 1);
  });
});
