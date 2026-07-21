import { createHash } from "node:crypto";
import {
  chmod,
  constants,
  lstat,
  mkdtemp,
  open,
  readdir,
  realpath,
  rename,
  rm,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs, TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

import { parseStrictJson } from "./private-pack-lock.mjs";

const decoder = new TextDecoder("utf-8", { fatal: true });
const sha256Pattern = /^[a-f0-9]{64}$/;
const gitBlobPattern = /^[a-f0-9]{40}$/;
const maximumItems = 256;
const maximumItemBytes = 512 * 1024;
const maximumTotalBytes = 1024 * 1024;
const modulePath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(modulePath), "..");

export const projectionKind = "verbatim-rst-text/1";

export class VerbatimProjectionError extends Error {
  constructor(code) {
    super(`verbatim projection rejected (${code})`);
    this.name = "VerbatimProjectionError";
    this.code = code;
  }
}

function reject(code) {
  throw new VerbatimProjectionError(code);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function gitBlobOid(bytes) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${bytes.byteLength}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function ownerUid() {
  if (typeof process.geteuid !== "function") reject("OWNER_UNAVAILABLE");
  return process.geteuid();
}

function assertDirectoryStat(stat) {
  if (!stat.isDirectory() || stat.isSymbolicLink()) reject("DIRECTORY_TYPE");
  if (stat.uid !== ownerUid() || (stat.mode & 0o777) !== 0o700) reject("DIRECTORY_ACCESS");
}

function assertFileStat(stat, expectedBytes) {
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) reject("FILE_TYPE");
  if (stat.uid !== ownerUid() || (stat.mode & 0o777) !== 0o600) reject("FILE_ACCESS");
  if (!Number.isSafeInteger(stat.size) || stat.size !== expectedBytes) reject("FILE_SIZE");
}

function sameFileSnapshot(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

async function canonicalExistingDirectory(argument) {
  if (!path.isAbsolute(argument)) reject("PATH");
  const resolved = path.resolve(argument);
  const canonical = await realpath(resolved);
  if (canonical !== resolved) reject("PATH");
  const handle = await open(canonical, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    assertDirectoryStat(await handle.stat());
  } finally {
    await handle.close();
  }
  return canonical;
}

async function canonicalNewDirectory(argument) {
  if (!path.isAbsolute(argument)) reject("PATH");
  const resolved = path.resolve(argument);
  const parent = path.dirname(resolved);
  const canonicalParent = await realpath(parent);
  if (canonicalParent !== parent || path.basename(resolved) === "") reject("PATH");
  let exists = true;
  try {
    await lstat(resolved);
  } catch (error) {
    if (error.code === "ENOENT") exists = false;
    else throw error;
  }
  if (exists) reject("OUTPUT_EXISTS");
  const parentHandle = await open(canonicalParent, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    assertDirectoryStat(await parentHandle.stat());
  } finally {
    await parentHandle.close();
  }
  return resolved;
}

function expectedFilename(order) {
  return `item-${String(order).padStart(4, "0")}.rst`;
}

function parseManifest(bytes, expectedSha256) {
  if (!sha256Pattern.test(expectedSha256) || sha256(bytes) !== expectedSha256) {
    reject("MANIFEST_DIGEST");
  }
  let manifest;
  try {
    manifest = parseStrictJson(decoder.decode(bytes));
  } catch {
    reject("MANIFEST_JSON");
  }
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest) ||
    !Array.isArray(manifest.items) ||
    manifest.items.length === 0 ||
    manifest.items.length > maximumItems
  ) {
    reject("MANIFEST_SHAPE");
  }
  if (
    manifest.limits === null ||
    typeof manifest.limits !== "object" ||
    Array.isArray(manifest.limits) ||
    manifest.limits.maximumBytesPerItem !== maximumItemBytes ||
    manifest.limits.maximumTotalBytes !== maximumTotalBytes ||
    manifest.limits.truncateOrSummarize !== false
  ) {
    reject("MANIFEST_LIMITS");
  }
  const orders = new Set();
  const ids = new Set();
  let totalBytes = 0;
  const items = manifest.items.map((item) => {
    if (
      item === null ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      typeof item.id !== "string" ||
      item.id.length === 0 ||
      ids.has(item.id) ||
      !Number.isInteger(item.revealOrder) ||
      item.revealOrder < 1 ||
      orders.has(item.revealOrder) ||
      !sha256Pattern.test(item.sha256) ||
      !gitBlobPattern.test(item.gitBlobOid) ||
      !Number.isSafeInteger(item.byteSize) ||
      item.byteSize < 1 ||
      item.byteSize > maximumItemBytes ||
      item.strictUtf8 !== true ||
      item.mediaType !== "text/x-rst; charset=utf-8"
    ) {
      reject("MANIFEST_ITEM");
    }
    ids.add(item.id);
    orders.add(item.revealOrder);
    totalBytes += item.byteSize;
    return {
      id: item.id,
      order: item.revealOrder,
      filename: expectedFilename(item.revealOrder),
      sha256: item.sha256,
      gitBlobOid: item.gitBlobOid,
      bytes: item.byteSize,
    };
  });
  items.sort((left, right) => left.order - right.order);
  if (items.some((item, index) => item.order !== index + 1)) reject("MANIFEST_ORDER");
  if (manifest.totalByteSize !== totalBytes || totalBytes > maximumTotalBytes) {
    reject("MANIFEST_TOTAL");
  }
  return items;
}

async function readManifest(manifestPath, expectedSha256) {
  if (!path.isAbsolute(manifestPath)) reject("PATH");
  const resolved = path.resolve(manifestPath);
  const canonical = await realpath(resolved);
  if (canonical !== resolved) reject("PATH");
  const handle = await open(canonical, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1) reject("MANIFEST_FILE");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (!sameFileSnapshot(before, after)) reject("MANIFEST_CHANGED");
    return parseManifest(bytes, expectedSha256);
  } finally {
    await handle.close();
  }
}

async function closedInventory(root, expectedNames) {
  const entries = await readdir(root, { withFileTypes: true });
  const names = entries.map((entry) => entry.name).sort();
  const expected = [...expectedNames].sort();
  if (
    entries.some((entry) => !entry.isFile() || entry.isSymbolicLink()) ||
    names.length !== expected.length ||
    names.some((name, index) => name !== expected[index])
  ) {
    reject("INVENTORY");
  }
}

async function readExactFile(root, item) {
  const filename = path.join(root, item.filename);
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    assertFileStat(before, item.bytes);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (!sameFileSnapshot(before, after)) reject("FILE_CHANGED");
    try {
      decoder.decode(bytes);
    } catch {
      reject("UTF8");
    }
    if (sha256(bytes) !== item.sha256 || gitBlobOid(bytes) !== item.gitBlobOid) {
      reject("FILE_DIGEST");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

async function writeExactFile(root, item, bytes) {
  const filename = path.join(root, item.filename);
  const handle = await open(
    filename,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function validateRoots(sourceRoot, outputRoot, outputMustExist) {
  const source = await canonicalExistingDirectory(sourceRoot);
  const output = outputMustExist
    ? await canonicalExistingDirectory(outputRoot)
    : await canonicalNewDirectory(outputRoot);
  if (
    isInside(repositoryRoot, source) ||
    isInside(repositoryRoot, output) ||
    isInside(source, output) ||
    isInside(output, source)
  ) {
    reject("BOUNDARY");
  }
  return { source, output };
}

async function verifyItems(sourceRoot, outputRoot, items) {
  const names = items.map((item) => item.filename);
  await closedInventory(sourceRoot, names);
  await closedInventory(outputRoot, names);
  for (const item of items) {
    const source = await readExactFile(sourceRoot, item);
    const output = await readExactFile(outputRoot, item);
    if (!output.equals(source)) reject("NOT_VERBATIM");
  }
}

export async function buildVerbatimProjection(options) {
  const items = await readManifest(options.manifest, options.manifestSha256);
  const { source, output } = await validateRoots(options.sourceRoot, options.outputRoot, false);
  const names = items.map((item) => item.filename);
  await closedInventory(source, names);
  const outputParent = path.dirname(output);
  let staging = null;
  let published = false;
  try {
    staging = await mkdtemp(path.join(outputParent, ".verbatim-rst-stage-"));
    await chmod(staging, 0o700);
    for (const item of items) {
      const bytes = await readExactFile(source, item);
      await writeExactFile(staging, item, bytes);
    }
    await canonicalExistingDirectory(staging);
    await verifyItems(source, staging, items);
    await canonicalNewDirectory(output);
    await rename(staging, output);
    staging = null;
    published = true;
  } catch (error) {
    if (staging !== null) await rm(staging, { recursive: true, force: true });
    if (published) await rm(output, { recursive: true, force: true });
    throw error;
  }
}

export async function verifyVerbatimProjection(options) {
  const items = await readManifest(options.manifest, options.manifestSha256);
  const { source, output } = await validateRoots(options.sourceRoot, options.outputRoot, true);
  await verifyItems(source, output, items);
}

function usage() {
  return [
    "usage:",
    "  node tooling/project-verbatim-rst.mjs build --manifest PATH --manifest-sha256 SHA256 --source-root PATH --output-root PATH",
    "  node tooling/project-verbatim-rst.mjs verify --manifest PATH --manifest-sha256 SHA256 --source-root PATH --output-root PATH",
  ].join("\n");
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (!new Set(["build", "verify"]).has(command)) reject("USAGE");
  let values;
  try {
    ({ values } = parseArgs({
      args: rest,
      options: {
        manifest: { type: "string" },
        "manifest-sha256": { type: "string" },
        "source-root": { type: "string" },
        "output-root": { type: "string" },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch {
    reject("USAGE");
  }
  if (["manifest", "manifest-sha256", "source-root", "output-root"].some((key) => values[key] === undefined)) {
    reject("USAGE");
  }
  const options = {
    manifest: values.manifest,
    manifestSha256: values["manifest-sha256"],
    sourceRoot: values["source-root"],
    outputRoot: values["output-root"],
  };
  if (command === "build") await buildVerbatimProjection(options);
  else await verifyVerbatimProjection(options);
  process.stdout.write(command === "build" ? "verbatim-projection-built\n" : "verbatim-projection-verified\n");
}

const invokedAsScript = process.argv[1] !== undefined && path.resolve(process.argv[1]) === modulePath;

if (invokedAsScript) {
  main(process.argv.slice(2)).catch((error) => {
    if (error instanceof VerbatimProjectionError && error.code === "USAGE") {
      process.stderr.write(`${usage()}\n`);
      process.exitCode = 2;
      return;
    }
    const code = error instanceof VerbatimProjectionError ? error.code : "UNEXPECTED_FAILURE";
    process.stderr.write(`verbatim-projection-failed (${code})\n`);
    process.exitCode = 1;
  });
}
