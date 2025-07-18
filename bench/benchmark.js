// benchmark.js
import { performance } from "node:perf_hooks";
import { Cache } from "@bepalo/cache";
import { randomUUID } from "node:crypto";
import os from "node:os";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printSystemInfo() {
  const cpus = os.cpus();
  const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);
  console.log(`\nSystem Info:`);
  console.log(`- CPU: ${cpus[0].model} (${cpus.length} threads)`);
  console.log(`- RAM: ${totalMemGB} GB`);
  console.log(`- Platform: ${os.platform()} ${os.release()}`);
  console.log(`- Node.js: ${process.version}`);
}

function benchmark(label, fn, iterations, warmup, warmupIterations, cleanup) {
  if (warmup) {
    for (let i = 0; i < warmupIterations; i++) {
      warmup(i);
    }
  }
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(i);
  }
  const end = performance.now();
  cleanup && cleanup();
  const totalTime = end - start;
  const opsPerSec = Math.floor((iterations / totalTime) * 1000);
  console.log(
    `| ${label.padEnd(28)} | ${(1e9 / opsPerSec)
      .toLocaleString()
      .padStart(12)} | ${opsPerSec.toLocaleString().padStart(12)} |`
  );
  return opsPerSec;
}

async function run() {
  printSystemInfo();
  const keyType = "UUIDv4";
  const lruMaxSize = 500_000;
  const iterations = 1_000_000;
  const warmupIterations = 10_000;
  const keys = Array(iterations);
  const keys1 = Array(iterations);
  const keys2 = Array(iterations);

  for (let i = 0; i < keys.length; i++) {
    keys[i] = randomUUID();
    keys1[i] = randomUUID();
    keys2[i] = randomUUID();
  }

  const cache = new Cache({
    lruMaxSize,
  });

  const nativeMap = new Map();

  // Pre-populate
  for (let i = 0; i < iterations; i++) {
    const key = keys[i];
    cache.set(key, i);
    nativeMap.set(key, i);
  }

  console.log(
    `\n**Benchmarking @bepalo/cache (N=\`${iterations.toLocaleString()}\`, LRU-Limit=\`${lruMaxSize}\`, K=\`${keyType}\`)**\n`
  );

  console.log("| Operation                    | ns/operation | operations/s |");
  console.log("|------------------------------|--------------|--------------|");
  await sleep(100);

  // console.log("```js");
  benchmark(
    "cache.get: hit",
    (i) => {
      cache.get(keys[i]);
    },
    iterations,
    (i) => {
      cache.get(keys[i]);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "cache.get: miss",
    (i) => {
      cache.get(keys[i]);
    },
    iterations,
    (i) => {
      cache.get(keys1[i]);
    },
    warmupIterations
  );

  cache.clear();

  await sleep(100);

  benchmark(
    "cache.get: miss, empty",
    (i) => {
      cache.get(keys[i]);
    },
    iterations,
    (i) => {
      cache.get(keys1[i]);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "cache.set: new",
    (i) => {
      cache.set(keys[i], i + 20);
    },
    iterations,
    (i) => {
      cache.set(keys1[i], i + 20);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "cache.set: override",
    (i) => {
      cache.set(keys[i], i + 20);
    },
    iterations,
    (i) => {
      cache.set(keys1[i], i + 20);
    },
    warmupIterations
  );

  await sleep(100);

  let exp = Date.now() + 400;
  benchmark(
    "cache.update:",
    (i) => {
      cache.update(keys[i], {
        value: i + 20,
        exp,
      });
    },
    iterations,
    (i) => {
      cache.update(keys1[i], {
        value: i + 20,
        exp,
      });
    },
    warmupIterations
  );

  await sleep(200);

  console.assert(lruMaxSize === cache.size);

  benchmark(
    "cache.deleteExpired: all",
    () => {
      // console.assert(iterations === cache.deleteExpired());
      cache.deleteExpired();
    },
    1
  );

  console.assert(0 === cache.size);

  await sleep(200);
  benchmark(
    "cache.deleteExpired: none",
    () => {
      cache.deleteExpired();
    },
    1
  );
  // console.log("```");

  console.log(`\n**Comparing with native Map**\n`);

  console.log("| Operation                    | ns/operation | operations/s |");
  console.log("|------------------------------|--------------|--------------|");

  await sleep(200);

  // console.log("```js");
  benchmark(
    "Map.get: hit",
    (i) => {
      nativeMap.get(keys[i]);
    },
    iterations,
    (i) => {
      nativeMap.get(keys[i]);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "Map.get: miss",
    (i) => {
      nativeMap.get(keys[i]);
    },
    iterations,
    (i) => {
      nativeMap.get(keys1[i]);
    },
    warmupIterations
  );

  nativeMap.clear();

  await sleep(100);

  benchmark(
    "Map.get: miss, empty",
    (i) => {
      nativeMap.get(keys[i]);
    },
    iterations,
    (i) => {
      nativeMap.get(keys1[i]);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "Map.set:",
    (i) => {
      nativeMap.set(keys[i], i + 20);
    },
    iterations,
    (i) => {
      nativeMap.set(keys1[i], i + 20);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "Map.set: update",
    (i) => {
      nativeMap.set(keys[i], i + 30);
    },
    iterations,
    (i) => {
      nativeMap.set(keys1[i], i + 30);
    },
    warmupIterations
  );

  await sleep(100);

  benchmark(
    "Map.delete:",
    (i) => {
      nativeMap.delete(keys[i]);
    },
    iterations,
    () => {
      for (let i = 0; i < warmupIterations; i++) {
        cache.delete(keys1[i]);
      }
    },
    warmupIterations
  );
  // console.log("```\n");
}

run();
