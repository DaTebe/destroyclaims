const fs = require("fs").promises;
const glob = require("glob");
const hasha = require("hasha");
const srm = require("secure-rm");

let index = [];

const sha256 = (buffer) => hasha.async(buffer, { algorithm: "sha256" });

const readFiles = async (dir) =>
  new Promise((resolve, reject) => {
    glob(dir, {}, (er, files) => {
      if (er) {
        reject(er);
      } else {
        index = files.map((f) => ({ path: f }));
        resolve(true);
      }
    });
  });

const buildIndex = async () =>
  Promise.all(
    index.map(async (file) => {
      const buffer = await fs.readFile(file.path);
      const hash = await sha256(buffer);
      // eslint-disable-next-line no-param-reassign
      file.sha256 = hash;
    })
  );

const init = async (dir) => {
  try {
    await readFiles(dir);
    await buildIndex();
    return true;
  } catch (e) {
    throw new Error(e);
  }
};

const exists = (hash) => {
  if (typeof index.find((x) => x.sha256 === hash) !== "undefined") {
    return true;
  }
  return false;
};

const simDestroy = (hash) => {
  try {
    const file = index.find((x) => x.sha256 === hash);
    if (typeof file !== "undefined") {
      console.log(`simulated destroy of: ${file.path}`);
      return true;
    }
    throw new Error("data not found");
  } catch (e) {
    throw new Error(`data could not be destroyed: ${e}`);
  }
};

const wipe = async (hash) =>
  new Promise((resolve, reject) => {
    srm(index.find((x) => x.sha256 === hash).path)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });

const destroy = async (hash) => {
  try {
    const file = index.find((x) => x.sha256 === hash);
    if (typeof file !== "undefined") {
      await fs.unlink(file.path);
      return true;
    }
    throw new Error("data not found");
  } catch (e) {
    throw new Error(`data could not be destroyed: ${e}`);
  }
};

const sha256FileHash = {
  exists: (hash) => exists(hash),
  wipe: async (hash) => wipe(hash),
  destroy: async (hash) => destroy(hash),
  simDestroy: (hash) => simDestroy(hash),
};

module.exports = {
  init,
  sha256FileHash,
};
