// benchmark.js
import * as Cache from "npm:@bepalo/cache"; // for deno
import { randomUUID } from "node:crypto";
// import os from "node:os";

// function printSystemInfo() {
//   const cpus = os.cpus();
//   const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);
//   console.log(`\nSystem Info:`);
//   console.log(`- CPU: ${cpus[0]?.model} (${cpus.length} threads)`);
//   console.log(`- RAM: ${totalMemGB} GB`);
//   console.log(`- Platform: ${os.platform()} ${os.release()}`);
//   console.log(`- Node.js: ${process.version}`);
// }

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function benchmark(label, fn, iterations, warmup, warmupIterations, cleanup) {
  if (warmup && warmupIterations) {
    for (let i = 0; i < warmupIterations; i++) {
      warmup(i);
    }
  }
  const start = performance.now();
  let count = 1;
  for (let i = 0; i < iterations; i++) {
    count += fn(i) || 1;
  }
  const end = performance.now();
  cleanup && cleanup();
  const totalTime = end - start;
  const opsPerSec = Math.floor((count / totalTime) * 1000);
  console.log(
    `| ${label.padEnd(28)} | ${(1e9 / ((1000 * count) / totalTime))
      .toLocaleString(undefined, { minimumFractionDigits: 3 })
      .padStart(12)} | ${opsPerSec.toLocaleString().padStart(12)} |`
  );
  return opsPerSec;
}

async function run() {
  // printSystemInfo();
  const restMillis = 200;
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
    `\n**Benchmarking @bepalo/cache (N=\`${iterations.toLocaleString()}\` LRU-Limit=\`${lruMaxSize.toLocaleString()}\` K=\`${keyType}\`)**\n`
  );

  console.log("| Operation                    | ns/operation | operations/s |");
  console.log("|------------------------------|-------------:|-------------:|");
  await sleep(restMillis);

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

  await sleep(restMillis);

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

  await sleep(restMillis);

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

  await sleep(restMillis);

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

  await sleep(restMillis);

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

  await sleep(restMillis);

  const exp = Date.now() + 100;
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

  await sleep(450);

  console.assert(lruMaxSize === cache.size);

  benchmark(
    "cache.deleteExpired: all",
    () => {
      return cache.deleteExpired();
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
    iterations
  );

  console.log(`\n**Comparing with native Map**\n`);

  console.log("| Operation                    | ns/operation | operations/s |");
  console.log("|------------------------------|--------------|--------------|");

  await sleep(200);

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

  await sleep(restMillis);

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

  await sleep(restMillis);

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

  nativeMap.clear();

  await sleep(restMillis);

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

  await sleep(restMillis);

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

  console.assert(iterations + warmupIterations === nativeMap.size);

  await sleep(restMillis);

  benchmark(
    "Map.delete: all",
    (i) => {
      nativeMap.delete(keys[i]);
    },
    iterations,
    (i) => {
      nativeMap.delete(keys1[i]);
    },
    warmupIterations
  );

  console.assert(0 === nativeMap.size);

  await sleep(restMillis);

  benchmark(
    "Map.delete: none",
    (i) => {
      nativeMap.delete(keys[i]);
    },
    iterations,
    (i) => {
      nativeMap.delete(keys1[i]);
    },
    warmupIterations
  );
}

await run();
