import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  constants,
  lstat,
  open,
  readdir,
  realpath,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

export const rolesFilename = "artifact-roles.json";
export const rolesFormat = "graphtruth.private-g1-artifact-roles/1";
export const lockFormat = "graphtruth.private-g1-pack-lock/1";
export const platformMetadataPolicy = "darwin-provenance-11-byte-only";
export const accessPolicy = "owner-only-no-acl-v1";

const decoder = new TextDecoder("utf-8", { fatal: true });
const neutralTokenPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const sha256Pattern = /^[a-f0-9]{64}$/;
const maxNeutralPathBytes = 1024;
const maxNeutralPathDepth = 64;

export class PrivatePackLockError extends Error {
  constructor(code) {
    super(`private pack lock rejected (${code})`);
    this.name = "PrivatePackLockError";
    this.code = code;
  }
}

function reject(code) {
  throw new PrivatePackLockError(code);
}

function wrapUnknown(error) {
  if (error instanceof PrivatePackLockError) throw error;
  reject("IO_FAILURE");
}

function compareAscii(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort(compareAscii);
  const wanted = [...expected].sort(compareAscii);
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isNeutralToken(value, maximumLength = 128) {
  return (
    typeof value === "string" &&
    value.length <= maximumLength &&
    neutralTokenPattern.test(value) &&
    value !== "." &&
    value !== ".."
  );
}

export function isNeutralRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    Buffer.byteLength(value, "utf8") > maxNeutralPathBytes ||
    value.includes("\\") ||
    path.posix.isAbsolute(value)
  ) {
    return false;
  }
  const components = value.split("/");
  return (
    components.length <= maxNeutralPathDepth &&
    components.every((component) => isNeutralToken(component, 255))
  );
}

class DuplicateJsonKeyError extends SyntaxError {
  constructor() {
    super("duplicate JSON object key");
    this.code = "JSON_DUPLICATE_KEY";
  }
}

export function parseStrictJson(text) {
  let index = 0;

  const fail = () => {
    throw new SyntaxError("invalid JSON");
  };
  const skipWhitespace = () => {
    while (index < text.length && /[\x20\x09\x0a\x0d]/.test(text[index])) index += 1;
  };
  const parseString = () => {
    if (text[index] !== '"') fail();
    const start = index;
    index += 1;
    while (index < text.length) {
      const character = text[index];
      index += 1;
      if (character === '"') return JSON.parse(text.slice(start, index));
      if (character === "\\") {
        if (index >= text.length) fail();
        const escape = text[index];
        index += 1;
        if (escape === "u") {
          if (!/^[a-fA-F0-9]{4}$/.test(text.slice(index, index + 4))) fail();
          index += 4;
        } else if (!'"\\/bfnrt'.includes(escape)) {
          fail();
        }
      } else if (character.charCodeAt(0) <= 0x1f) {
        fail();
      }
    }
    fail();
  };
  const parseNumber = () => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(index));
    if (!match || !Number.isFinite(Number(match[0]))) fail();
    index += match[0].length;
  };
  const parseValue = (depth = 0) => {
    if (depth > 256) fail();
    skipWhitespace();
    if (text[index] === "{") {
      index += 1;
      skipWhitespace();
      const keys = new Set();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        const key = parseString();
        if (keys.has(key)) throw new DuplicateJsonKeyError();
        keys.add(key);
        skipWhitespace();
        if (text[index] !== ":") fail();
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") fail();
        index += 1;
        skipWhitespace();
      }
      fail();
    }
    if (text[index] === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") fail();
        index += 1;
      }
      fail();
    }
    if (text[index] === '"') {
      parseString();
      return;
    }
    for (const literal of ["true", "false", "null"]) {
      if (text.startsWith(literal, index)) {
        index += literal.length;
        return;
      }
    }
    parseNumber();
  };

  parseValue();
  skipWhitespace();
  if (index !== text.length) fail();
  return JSON.parse(text);
}

function decodeJson(buffer, code) {
  try {
    return parseStrictJson(decoder.decode(buffer));
  } catch {
    reject(code);
  }
}

function fingerprint(stat) {
  return {
    dev: stat.dev,
    ino: stat.ino,
    uid: stat.uid,
    mode: stat.mode,
    nlink: stat.nlink,
    size: stat.size,
    mtimeNs: stat.mtimeNs,
    ctimeNs: stat.ctimeNs,
  };
}

function sameFingerprint(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.uid === right.uid &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

export function samePackEntryStat(left, right) {
  return sameFingerprint(fingerprint(left), fingerprint(right));
}

export function assertPackEntryOwner(actualUid, rootUid) {
  if (actualUid !== rootUid) reject("PACK_ENTRY_OWNER");
}

function assertPackEntryBoundary(stat, rootDev, rootUid) {
  if (stat.dev !== rootDev) reject("PACK_ENTRY_DEVICE");
  assertPackEntryOwner(stat.uid, rootUid);
}

function assertPackEntryAccess(stat) {
  if ((stat.mode & 0o077n) !== 0n) reject("PACK_ENTRY_ACCESS");
}

async function resolvePack(packArgument) {
  try {
    const requested = path.resolve(packArgument);
    const requestedStat = await lstat(requested, { bigint: true });
    if (!requestedStat.isDirectory() || requestedStat.isSymbolicLink()) reject("PACK_BOUNDARY");
    const canonical = await realpath(requested);
    const canonicalStat = await lstat(canonical, { bigint: true });
    if (!canonicalStat.isDirectory() || canonicalStat.isSymbolicLink()) reject("PACK_BOUNDARY");
    return { root: canonical, dev: canonicalStat.dev, uid: canonicalStat.uid };
  } catch (error) {
    if (error instanceof PrivatePackLockError) throw error;
    reject("PACK_BOUNDARY");
  }
}

async function resolveLock(packRoot, lockArgument) {
  if (typeof lockArgument !== "string" || lockArgument.length === 0) reject("LOCK_BOUNDARY");
  const requested = path.isAbsolute(lockArgument)
    ? path.resolve(lockArgument)
    : path.resolve(packRoot, lockArgument);
  const basename = path.basename(requested);
  if (!isNeutralToken(basename, 255) || basename === rolesFilename) reject("LOCK_BOUNDARY");
  try {
    const parent = await realpath(path.dirname(requested));
    if (parent !== packRoot) reject("LOCK_BOUNDARY");
  } catch (error) {
    if (error instanceof PrivatePackLockError) throw error;
    reject("LOCK_BOUNDARY");
  }
  return { absolute: path.join(packRoot, basename), relative: basename };
}

async function scanPack(packRoot, rootDev, rootUid) {
  const files = new Map();
  const directories = new Map();

  async function readDirectoryStat(directory) {
    let stat;
    try {
      stat = await lstat(directory, { bigint: true });
    } catch {
      reject("PACK_CHANGED");
    }
    assertPackEntryBoundary(stat, rootDev, rootUid);
    if (stat.isSymbolicLink() || !stat.isDirectory()) reject("PACK_ENTRY_TYPE");
    assertPackEntryAccess(stat);
    return stat;
  }

  async function visit(directory, prefix) {
    const before = await readDirectoryStat(directory);
    let entries;
    try {
      entries = await readdir(directory);
    } catch {
      reject("PACK_SCAN");
    }
    const afterRead = await readDirectoryStat(directory);
    if (!samePackEntryStat(before, afterRead)) reject("PACK_CHANGED");
    directories.set(prefix, fingerprint(before));
    entries.sort(compareAscii);
    for (const name of entries) {
      const relative = prefix === "" ? name : `${prefix}/${name}`;
      if (!isNeutralRelativePath(relative)) reject("PACK_PATH");
      const absolute = path.join(directory, name);
      let stat;
      try {
        stat = await lstat(absolute, { bigint: true });
      } catch {
        reject("PACK_CHANGED");
      }
      assertPackEntryBoundary(stat, rootDev, rootUid);
      if (stat.isSymbolicLink()) reject("PACK_ENTRY_TYPE");
      if (stat.isDirectory()) {
        assertPackEntryAccess(stat);
        await visit(absolute, relative);
      } else if (stat.isFile()) {
        assertPackEntryAccess(stat);
        if (stat.nlink !== 1n) reject("PACK_ENTRY_LINK");
        files.set(relative, fingerprint(stat));
      } else {
        reject("PACK_ENTRY_TYPE");
      }
    }
    const afterVisit = await readDirectoryStat(directory);
    if (!samePackEntryStat(before, afterVisit)) reject("PACK_CHANGED");
  }

  await visit(packRoot, "");
  return { files, directories };
}

export async function assertAllowedDarwinMetadataEntry(absolute) {
  let acl;
  try {
    acl = await execFileAsync("/bin/ls", ["-lde", absolute], {
      encoding: "utf8",
      env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
      maxBuffer: 64 * 1024,
    });
  } catch (error) {
    if (error instanceof PrivatePackLockError) throw error;
    reject("PACK_ENTRY_ACCESS");
  }
  if (acl.stderr !== "" || /\n [0-9]+: /.test(acl.stdout)) {
    reject("PACK_ENTRY_ACCESS");
  }

  try {
    const listed = await execFileAsync("/usr/bin/xattr", ["-s", absolute], {
      encoding: "utf8",
      env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
      maxBuffer: 64 * 1024,
    });
    if (listed.stderr !== "") reject("PACK_EXTENDED_ATTRIBUTES");
    const names = listed.stdout.split("\n").filter(Boolean);
    if (names.length === 0) {
      assertDarwinXattrState(names, null);
    } else {
      const value = await execFileAsync(
        "/usr/bin/xattr",
        ["-pxs", "com.apple.provenance", absolute],
        {
          encoding: "utf8",
          env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
          maxBuffer: 64 * 1024,
        },
      );
      if (value.stderr !== "") reject("PACK_EXTENDED_ATTRIBUTES");
      assertDarwinXattrState(names, value.stdout.replaceAll(/\s/g, ""));
    }
  } catch (error) {
    if (error instanceof PrivatePackLockError) throw error;
    reject("PACK_EXTENDED_ATTRIBUTES");
  }
}

async function assertAllowedDarwinMetadata(packRoot, scanned) {
  if (process.platform !== "darwin") return;
  const relativePaths = [
    ...scanned.directories.keys(),
    ...scanned.files.keys(),
  ].sort(compareAscii);
  for (const relative of relativePaths) {
    const absolute =
      relative === "" ? packRoot : path.join(packRoot, ...relative.split("/"));
    await assertAllowedDarwinMetadataEntry(absolute);
  }
}

export function assertDarwinXattrState(names, provenanceHex) {
  if (!Array.isArray(names)) reject("PACK_EXTENDED_ATTRIBUTES");
  if (names.length === 0 && provenanceHex === null) return;
  if (
    names.length !== 1 ||
    names[0] !== "com.apple.provenance" ||
    typeof provenanceHex !== "string" ||
    !/^[a-fA-F0-9]{22}$/.test(provenanceHex)
  ) {
    reject("PACK_EXTENDED_ATTRIBUTES");
  }
}

async function readStableFile(packRoot, relative, rootDev, rootUid) {
  if (!isNeutralRelativePath(relative)) reject("PACK_PATH");
  const absolute = path.join(packRoot, ...relative.split("/"));
  let handle;
  try {
    handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) reject("PACK_ENTRY_TYPE");
    assertPackEntryBoundary(before, rootDev, rootUid);
    assertPackEntryAccess(before);
    if (before.nlink !== 1n) reject("PACK_ENTRY_LINK");
    if (before.size > BigInt(Number.MAX_SAFE_INTEGER)) reject("PACK_ENTRY_SIZE");
    const buffer = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (!samePackEntryStat(before, after)) reject("PACK_CHANGED");
    if (buffer.length !== Number(before.size)) reject("PACK_CHANGED");
    return { buffer, fingerprint: fingerprint(after) };
  } catch (error) {
    if (error instanceof PrivatePackLockError) throw error;
    reject("PACK_READ");
  } finally {
    if (handle !== undefined) {
      await handle.close();
    }
  }
}

async function readSnapshot(packRoot, rootDev, rootUid, scannedFiles) {
  const snapshot = new Map();
  for (const relative of [...scannedFiles.keys()].sort(compareAscii)) {
    snapshot.set(relative, await readStableFile(packRoot, relative, rootDev, rootUid));
  }
  return snapshot;
}

function assertUnchangedScan(scanned, snapshot, rescanned) {
  const expectedPaths = [...scanned.files.keys()].sort(compareAscii);
  const actualPaths = [...rescanned.files.keys()].sort(compareAscii);
  if (
    expectedPaths.length !== actualPaths.length ||
    expectedPaths.some((value, index) => value !== actualPaths[index])
  ) {
    reject("PACK_CHANGED");
  }
  for (const relative of expectedPaths) {
    const read = snapshot.get(relative);
    if (
      read === undefined ||
      !sameFingerprint(scanned.files.get(relative), read.fingerprint) ||
      !sameFingerprint(read.fingerprint, rescanned.files.get(relative))
    ) {
      reject("PACK_CHANGED");
    }
  }

  const expectedDirectories = [...scanned.directories.keys()].sort(compareAscii);
  const actualDirectories = [...rescanned.directories.keys()].sort(compareAscii);
  if (
    expectedDirectories.length !== actualDirectories.length ||
    expectedDirectories.some((value, index) => value !== actualDirectories[index])
  ) {
    reject("PACK_CHANGED");
  }
  for (const relative of expectedDirectories) {
    if (!sameFingerprint(scanned.directories.get(relative), rescanned.directories.get(relative))) {
      reject("PACK_CHANGED");
    }
  }
}

function parseRoles(buffer) {
  const value = decodeJson(buffer, "ROLES_JSON");
  if (!hasExactKeys(value, ["format", "artifacts"]) || value.format !== rolesFormat) {
    reject("ROLES_FORMAT");
  }
  if (!Array.isArray(value.artifacts) || value.artifacts.length === 0) reject("ROLES_FORMAT");
  const roles = new Map();
  for (const artifact of value.artifacts) {
    if (!hasExactKeys(artifact, ["path", "role"])) reject("ROLES_FORMAT");
    if (!isNeutralRelativePath(artifact.path) || !isNeutralToken(artifact.role, 128)) {
      reject("ROLES_FORMAT");
    }
    if (roles.has(artifact.path)) reject("ROLES_FORMAT");
    roles.set(artifact.path, artifact.role);
  }
  if (roles.get(rolesFilename) !== "artifact-role-map") reject("ROLES_FORMAT");
  return roles;
}

function assertRoleInventory(roles, dataPaths, lockRelative) {
  if (roles.has(lockRelative)) reject("ROLES_INVENTORY");
  const expected = [...dataPaths].sort(compareAscii);
  const declared = [...roles.keys()].sort(compareAscii);
  if (
    expected.length !== declared.length ||
    expected.some((value, index) => value !== declared[index])
  ) {
    reject("ROLES_INVENTORY");
  }
}

function artifactRecords(snapshot, roles, lockRelative) {
  return [...snapshot.entries()]
    .filter(([relative]) => relative !== lockRelative)
    .sort(([left], [right]) => compareAscii(left, right))
    .map(([relative, { buffer }]) => ({
      path: relative,
      role: roles.get(relative),
      sha256: createHash("sha256").update(buffer).digest("hex"),
      bytes: buffer.length,
    }));
}

function makeLock(contractId, artifacts) {
  return {
    format: lockFormat,
    contractId,
    rolesPath: rolesFilename,
    digestAlgorithm: "sha256",
    accessPolicy,
    platformMetadataPolicy,
    artifacts,
  };
}

function serializeLock(lock) {
  return `${JSON.stringify(lock, null, 2)}\n`;
}

function parseLock(buffer, lockRelative) {
  const value = decodeJson(buffer, "LOCK_JSON");
  if (
    !hasExactKeys(value, [
      "format",
      "contractId",
      "rolesPath",
      "digestAlgorithm",
      "accessPolicy",
      "platformMetadataPolicy",
      "artifacts",
    ]) ||
    value.format !== lockFormat ||
    !isNeutralToken(value.contractId, 128) ||
    value.rolesPath !== rolesFilename ||
    value.digestAlgorithm !== "sha256" ||
    value.accessPolicy !== accessPolicy ||
    value.platformMetadataPolicy !== platformMetadataPolicy ||
    !Array.isArray(value.artifacts)
  ) {
    reject("LOCK_FORMAT");
  }

  const seen = new Set();
  let previous = null;
  const artifacts = value.artifacts.map((artifact) => {
    if (!hasExactKeys(artifact, ["path", "role", "sha256", "bytes"])) {
      reject("LOCK_FORMAT");
    }
    if (
      !isNeutralRelativePath(artifact.path) ||
      artifact.path === lockRelative ||
      !isNeutralToken(artifact.role, 128) ||
      typeof artifact.sha256 !== "string" ||
      !sha256Pattern.test(artifact.sha256) ||
      !Number.isSafeInteger(artifact.bytes) ||
      artifact.bytes < 0 ||
      seen.has(artifact.path) ||
      (previous !== null && compareAscii(previous, artifact.path) >= 0)
    ) {
      reject("LOCK_FORMAT");
    }
    seen.add(artifact.path);
    previous = artifact.path;
    return {
      path: artifact.path,
      role: artifact.role,
      sha256: artifact.sha256,
      bytes: artifact.bytes,
    };
  });

  const normalized = makeLock(value.contractId, artifacts);
  if (!buffer.equals(Buffer.from(serializeLock(normalized), "utf8"))) reject("LOCK_CANONICAL");
  return normalized;
}

function assertArtifactsMatch(expected, actual) {
  if (expected.length !== actual.length) reject("LOCK_INVENTORY");
  for (let index = 0; index < expected.length; index += 1) {
    const left = expected[index];
    const right = actual[index];
    if (left.path !== right.path || left.role !== right.role) reject("LOCK_INVENTORY");
  }
  for (let index = 0; index < expected.length; index += 1) {
    const left = expected[index];
    const right = actual[index];
    if (left.sha256 !== right.sha256 || left.bytes !== right.bytes) reject("LOCK_CONTENT");
  }
}

async function collectPackState(packRoot, rootDev, rootUid, lockRelative) {
  const scanned = await scanPack(packRoot, rootDev, rootUid);
  await assertAllowedDarwinMetadata(packRoot, scanned);
  const snapshot = await readSnapshot(packRoot, rootDev, rootUid, scanned.files);
  const rolesRead = snapshot.get(rolesFilename);
  if (rolesRead === undefined) reject("ROLES_INVENTORY");
  const roles = parseRoles(rolesRead.buffer);
  const dataPaths = [...snapshot.keys()].filter((relative) => relative !== lockRelative);
  assertRoleInventory(roles, dataPaths, lockRelative);
  const artifacts = artifactRecords(snapshot, roles, lockRelative);
  const rescanned = await scanPack(packRoot, rootDev, rootUid);
  assertUnchangedScan(scanned, snapshot, rescanned);
  await assertAllowedDarwinMetadata(packRoot, rescanned);
  return { artifacts, snapshot };
}

async function lockExists(lockAbsolute) {
  try {
    await lstat(lockAbsolute, { bigint: true });
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    reject("LOCK_BOUNDARY");
  }
}

export async function createPackLock(packArgument, lockArgument, contractId) {
  try {
    if (!isNeutralToken(contractId, 128)) reject("CONTRACT_ID");
    const pack = await resolvePack(packArgument);
    const lock = await resolveLock(pack.root, lockArgument);
    if (await lockExists(lock.absolute)) reject("LOCK_EXISTS");
    if (typeof process.geteuid === "function") {
      assertPackEntryOwner(BigInt(process.geteuid()), pack.uid);
    }

    const { artifacts } = await collectPackState(pack.root, pack.dev, pack.uid, lock.relative);
    const bytes = Buffer.from(serializeLock(makeLock(contractId, artifacts)), "utf8");
    let handle;
    try {
      handle = await open(lock.absolute, "wx", 0o600);
      await handle.writeFile(bytes);
      await handle.sync();
    } catch (error) {
      if (error?.code === "EEXIST") reject("LOCK_EXISTS");
      throw error;
    } finally {
      if (handle !== undefined) await handle.close();
    }

    await verifyPackLock(pack.root, lock.absolute, contractId);
    return { ok: true };
  } catch (error) {
    wrapUnknown(error);
  }
}

export async function verifyPackLock(packArgument, lockArgument, expectedContractId = null) {
  try {
    if (expectedContractId !== null && !isNeutralToken(expectedContractId, 128)) {
      reject("CONTRACT_ID");
    }
    const pack = await resolvePack(packArgument);
    const lock = await resolveLock(pack.root, lockArgument);
    if (typeof process.geteuid === "function") {
      assertPackEntryOwner(BigInt(process.geteuid()), pack.uid);
    }
    const scanned = await scanPack(pack.root, pack.dev, pack.uid);
    await assertAllowedDarwinMetadata(pack.root, scanned);
    const lockFingerprint = scanned.files.get(lock.relative);
    if (lockFingerprint === undefined) reject("LOCK_MISSING");
    const snapshot = await readSnapshot(pack.root, pack.dev, pack.uid, scanned.files);
    const lockRead = snapshot.get(lock.relative);
    if (lockRead === undefined) reject("LOCK_MISSING");
    const parsedLock = parseLock(lockRead.buffer, lock.relative);
    if (expectedContractId !== null && parsedLock.contractId !== expectedContractId) {
      reject("CONTRACT_ID");
    }

    const rolesRead = snapshot.get(rolesFilename);
    if (rolesRead === undefined) reject("ROLES_INVENTORY");
    const roles = parseRoles(rolesRead.buffer);
    const dataPaths = [...snapshot.keys()].filter((relative) => relative !== lock.relative);
    assertRoleInventory(roles, dataPaths, lock.relative);
    const actualArtifacts = artifactRecords(snapshot, roles, lock.relative);
    assertArtifactsMatch(parsedLock.artifacts, actualArtifacts);

    const rescanned = await scanPack(pack.root, pack.dev, pack.uid);
    assertUnchangedScan(scanned, snapshot, rescanned);
    await assertAllowedDarwinMetadata(pack.root, rescanned);
    return { ok: true, contractId: parsedLock.contractId };
  } catch (error) {
    wrapUnknown(error);
  }
}

function usage() {
  return [
    "usage:",
    "  private-pack-lock create <PACK> <LOCK> <CONTRACT_ID>",
    "  private-pack-lock verify <PACK> <LOCK> [CONTRACT_ID]",
  ].join("\n");
}

async function main(argv) {
  if (process.platform !== "darwin") reject("UNSUPPORTED_PLATFORM");
  const [command, packArgument, lockArgument, contractId, ...extra] = argv;
  if (extra.length > 0 || !["create", "verify"].includes(command)) reject("USAGE");
  if (command === "create") {
    if (packArgument === undefined || lockArgument === undefined || contractId === undefined) {
      reject("USAGE");
    }
    await createPackLock(packArgument, lockArgument, contractId);
    process.stdout.write("private-pack-lock: created\n");
    return;
  }
  if (packArgument === undefined || lockArgument === undefined) reject("USAGE");
  await verifyPackLock(packArgument, lockArgument, contractId ?? null);
  process.stdout.write("private-pack-lock: verified\n");
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedAsScript) {
  main(process.argv.slice(2)).catch((error) => {
    if (error instanceof PrivatePackLockError && error.code === "USAGE") {
      process.stderr.write(`${usage()}\n`);
      process.exitCode = 2;
      return;
    }
    const code = error instanceof PrivatePackLockError ? error.code : "PRIVATE_PACK_LOCK_FAILURE";
    process.stderr.write(`private-pack-lock: rejected (${code})\n`);
    process.exitCode = 1;
  });
}
