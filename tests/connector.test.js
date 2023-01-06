/* eslint-disable no-console */
/* eslint-disable no-undef */

jest.setTimeout(10000);
const fs = require("fs").promises;

/**
 * Module to be tested
 */

const { init, sha256FileHash } = require("../example/connector");

/**
 * Mock Data
 */

const dir = "**/testFile*.txt";
const testFile1Hash =
  "9db8d89a49974784e31ec9ffe31c9ea9194bc60007663132af3d9ba71011b4af";

const nonExistingHash =
  "313eb3b93b547c7713b9370a1c5e886181b05c8f45c16c54f5c6e463ca3d50e3";

const testFiles = [
  {
    path: "testFile1.txt",
    content: "Some content 1",
  },
  {
    path: "testFile2.txt",
    content: "Some content 2",
  },
  {
    path: "testFile3.txt",
    content: "Some content 3",
  },
  {
    path: "testFile4.txt",
    content: "Some content 4",
  },
  {
    path: "testFile5.txt",
    content: "Some content 5",
  },
];

beforeEach(async () =>
  Promise.all(
    testFiles.map(async (f) => {
      await fs.writeFile(f.path, f.content);
    })
  )
);

afterEach(async () =>
  Promise.all(
    testFiles.map(async (f) => {
      try {
        await fs.unlink(f.path);
      } catch (e) {
        console.log("file not found, no problem ;)");
      }
    })
  )
);

/**
 * Tests
 */

test("Connector: Dir can be indexed", async () => {
  expect(await init(dir)).toBe(true);
});

test("Connector: Existing file with specific SHA256 hash can be found", async () => {
  await init(dir);
  expect(sha256FileHash.exists(testFile1Hash)).toBe(true);
});

test("Connector: Non existing file with specific SHA256 hash can not be found", async () => {
  await init(dir);
  expect(sha256FileHash.exists(nonExistingHash)).toBe(false);
});

test("Connector: Existing file can be deleted", async () => {
  await init(dir);
  expect(await sha256FileHash.destroy(testFile1Hash)).toBe(true);
  await init(dir);
  expect(sha256FileHash.exists(testFile1Hash)).toBe(false);
});

test("Connector: Deletion of file can be simulated", async () => {
  await init(dir);
  expect(await sha256FileHash.simDestroy(testFile1Hash)).toBe(true);
  await init(dir);
  expect(sha256FileHash.exists(testFile1Hash)).toBe(true);
});

test("Connector: Existing file can be wiped", async () => {
  await init(dir);
  expect(await sha256FileHash.wipe(testFile1Hash)).toBe(true);
  await init(dir);
  expect(sha256FileHash.exists(testFile1Hash)).toBe(false);
});

test("Connector: Non existing file cannot be deleted, throws error", async () => {
  await init(dir);
  expect(async () => sha256FileHash.destroy(nonExistingHash)).rejects.toThrow();
});

test("Connector: wiping file success", async () => {
  await init(dir);
  expect(await sha256FileHash.wipe(testFile1Hash)).toBe(true);
  await init(dir);
  expect(sha256FileHash.exists(testFile1Hash)).toBe(false);
});
