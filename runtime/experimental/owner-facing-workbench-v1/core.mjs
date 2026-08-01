import { createHash, randomUUID } from "node:crypto";
import {
  chmod,
  constants,
  cp,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

export const identity = "owner-facing-workbench-v1";
export const commandResultSchema =
  "owner-facing-workbench-v1-command-result";
export const recordSchema = "owner-facing-workbench-v1-record";
export const headSchema = "owner-facing-workbench-v1-head";
export const draftSchema = "owner-facing-workbench-v1-draft";
export const viewSchema = "owner-facing-workbench-v1-view";
export const stateSchema = "owner-facing-workbench-v1-state";
export const metadataSchema = "owner-facing-workbench-v1-metadata";

export const limits = Object.freeze({
  canonicalRecords: 64,
  regularFiles: 96,
  retainedBytes: 2 * 1024 * 1024,
});

const aliasesPattern = /^[a-z][a-z0-9-]{0,63}$/;
const logicalSegmentPattern = /^[A-Za-z0-9._-]+$/;
const sha256Pattern = /^[a-f0-9]{64}$/;
const generatedIdPattern = /^[a-z]{3}_[a-f0-9]{32}$/;
const timestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const stateNamePattern = /^state-([a-f0-9]{64})-([a-f0-9]{32})$/;
const recordKinds = new Set([
  "WorkspaceInitialized",
  "HorizonOpened",
  "SourceSnapshot",
  "EvidenceSpan",
  "AssertionRevision",
  "QuestionOpened",
  "HorizonClosed",
]);

const errorStatus = Object.freeze({
  USAGE: 2,
  INVALID_UTF8: 3,
  INVALID_ALIAS: 3,
  INVALID_PATH: 3,
  UNSAFE_SOURCE: 3,
  DUPLICATE_SOURCE: 3,
  INVALID_LINE_RANGE: 3,
  LIMIT_EXCEEDED: 6,
  NOT_INITIALIZED: 4,
  ALREADY_INITIALIZED: 4,
  HORIZON_ALREADY_OPEN: 4,
  NO_OPEN_HORIZON: 4,
  HORIZON_NOT_FOUND: 4,
  REFERENCE_NOT_FOUND: 4,
  SOURCE_CHANGED: 5,
  CONCURRENT_WRITER: 5,
  CANONICAL_INTEGRITY: 5,
  SNAPSHOT_INTEGRITY: 5,
  PROJECTION_INTEGRITY: 5,
  ATOMIC_PUBLICATION: 5,
  INTERNAL: 70,
});

const errorMessages = Object.freeze({
  USAGE: "command grammar is invalid",
  INVALID_UTF8: "selected source is not valid UTF-8",
  INVALID_ALIAS: "alias or horizon name is invalid or already used",
  INVALID_PATH: "logical source path is invalid",
  UNSAFE_SOURCE: "source root or selected source is unsafe",
  DUPLICATE_SOURCE: "source duplicates an item already staged in this horizon",
  INVALID_LINE_RANGE: "evidence line range is invalid",
  LIMIT_EXCEEDED: "the frozen workspace limit would be exceeded",
  NOT_INITIALIZED: "workbench is not initialized",
  ALREADY_INITIALIZED: "workbench is already initialized",
  HORIZON_ALREADY_OPEN: "a horizon is already open",
  NO_OPEN_HORIZON: "no horizon is open",
  HORIZON_NOT_FOUND: "named closed horizon was not found",
  REFERENCE_NOT_FOUND: "referenced alias or draft action was not found",
  SOURCE_CHANGED: "a staged host source changed before close",
  CONCURRENT_WRITER: "another writer holds the workspace lock",
  CANONICAL_INTEGRITY: "canonical workspace integrity check failed",
  SNAPSHOT_INTEGRITY: "retained source snapshot integrity check failed",
  PROJECTION_INTEGRITY: "derived projection integrity check failed",
  ATOMIC_PUBLICATION: "atomic state publication failed",
  INTERNAL: "unexpected internal failure",
});

export class WorkbenchError extends Error {
  constructor(code, message = errorMessages[code]) {
    super(message ?? errorMessages.INTERNAL);
    this.name = "WorkbenchError";
    this.code = Object.hasOwn(errorStatus, code) ? code : "INTERNAL";
    this.status = errorStatus[this.code];
  }
}

export function exitStatusFor(code) {
  return errorStatus[code] ?? errorStatus.INTERNAL;
}

export function stableMessageFor(code) {
  return errorMessages[code] ?? errorMessages.INTERNAL;
}

function reject(code, message) {
  throw new WorkbenchError(code, message);
}

function normalized(value) {
  if (Array.isArray(value)) return value.map(normalized);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareUtf8)
        .map((key) => [key, normalized(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return Buffer.from(`${JSON.stringify(normalized(value))}\n`, "utf8");
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function exactKeys(value, keys, code = "CANONICAL_INTEGRITY") {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  ) {
    reject(code);
  }
}

function stringValue(value, code = "CANONICAL_INTEGRITY", nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== "string") reject(code);
}

function nonEmptyText(value, code = "USAGE") {
  if (typeof value !== "string" || value.length === 0) reject(code);
}

function safeInteger(value, code = "CANONICAL_INTEGRITY") {
  if (!Number.isSafeInteger(value) || value < 0) reject(code);
}

function validSha256(value, code = "CANONICAL_INTEGRITY") {
  if (typeof value !== "string" || !sha256Pattern.test(value)) reject(code);
}

function validGeneratedId(value, code = "CANONICAL_INTEGRITY") {
  if (typeof value !== "string" || !generatedIdPattern.test(value)) reject(code);
}

function validTimestamp(value, code = "CANONICAL_INTEGRITY") {
  if (
    typeof value !== "string" ||
    !timestampPattern.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    reject(code);
  }
}

export function validateAlias(value, code = "INVALID_ALIAS") {
  if (typeof value !== "string" || !aliasesPattern.test(value)) {
    reject(code);
  }
  return value;
}

export function validateLogicalPath(value, code = "INVALID_PATH") {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    value.includes("\0") ||
    value.startsWith("/") ||
    value.endsWith("/") ||
    value.includes("//") ||
    /^[A-Za-z]:/.test(value)
  ) {
    reject(code);
  }
  const segments = value.split("/");
  if (
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        !logicalSegmentPattern.test(segment),
    )
  ) {
    reject(code);
  }
  return value;
}

function services(overrides = {}) {
  return {
    now: overrides.now ?? (() => new Date().toISOString()),
    uuid: overrides.uuid ?? randomUUID,
  };
}

function generatedId(prefix, taken, serviceOverrides) {
  const runtime = services(serviceOverrides);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = runtime.uuid().replaceAll("-", "").toLowerCase();
    const candidate = `${prefix}_${suffix}`;
    if (/^[a-z]{3}_[a-f0-9]{32}$/.test(candidate) && !taken.has(candidate)) {
      taken.add(candidate);
      return candidate;
    }
  }
  reject("INTERNAL");
}

function generatedTimestamp(serviceOverrides) {
  const value = services(serviceOverrides).now();
  validTimestamp(value, "INTERNAL");
  return value;
}

async function exists(filename) {
  try {
    await lstat(filename);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function privateDirectory(filename) {
  await mkdir(filename, { mode: 0o700, recursive: true });
  await chmod(filename, 0o700);
}

async function privateFile(filename, bytes) {
  await writeFile(filename, bytes, { mode: 0o600 });
  await chmod(filename, 0o600);
}

async function readCanonicalJson(filename, code = "CANONICAL_INTEGRITY") {
  let bytes;
  try {
    bytes = await readFile(filename);
  } catch {
    reject(code);
  }
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    reject(code);
  }
  if (!bytes.equals(canonicalJson(value))) reject(code);
  return { bytes, value };
}

async function treeEntries(root, prefix = "") {
  const items = [];
  async function visit(directory, relativeDirectory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      reject("CANONICAL_INTEGRITY");
    }
    entries.sort((left, right) => compareUtf8(left.name, right.name));
    for (const entry of entries) {
      const relative = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename).catch(() =>
        reject("CANONICAL_INTEGRITY"),
      );
      if (stat.isSymbolicLink()) reject("CANONICAL_INTEGRITY");
      if (stat.isDirectory()) {
        items.push({
          path: prefix ? `${prefix}/${relative}` : relative,
          bytes: Buffer.alloc(0),
          mode: stat.mode & 0o777,
          type: "directory",
        });
        await visit(filename, relative);
      } else if (stat.isFile()) {
        const bytes = await readFile(filename);
        items.push({
          path: prefix ? `${prefix}/${relative}` : relative,
          bytes,
          mode: stat.mode & 0o777,
          type: "file",
        });
      } else {
        reject("CANONICAL_INTEGRITY");
      }
    }
  }
  await visit(root, "");
  items.sort((left, right) => compareUtf8(left.path, right.path));
  return items;
}

async function treeInventory(root, prefix = "") {
  return (await treeEntries(root, prefix)).filter((item) => item.type === "file");
}

function inventoryDigest(items) {
  const hash = createHash("sha256");
  for (const item of items) {
    hash.update(Buffer.from(item.path, "utf8"));
    hash.update(Buffer.from([0]));
    hash.update(Buffer.from(item.type, "ascii"));
    hash.update(Buffer.from([0]));
    hash.update(Buffer.from(String(item.mode), "ascii"));
    hash.update(Buffer.from([0]));
    hash.update(Buffer.from(String(item.bytes.length), "ascii"));
    hash.update(Buffer.from([0]));
    hash.update(item.bytes);
    hash.update(Buffer.from([0]));
  }
  return hash.digest("hex");
}

async function areaDigest(stateRoot, area) {
  const areaRoot = path.join(stateRoot, area);
  const rootStat = await lstat(areaRoot).catch(() =>
    reject("CANONICAL_INTEGRITY"),
  );
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    reject("CANONICAL_INTEGRITY");
  }
  return inventoryDigest([
    {
      path: area,
      bytes: Buffer.alloc(0),
      mode: rootStat.mode & 0o777,
      type: "directory",
    },
    ...(await treeEntries(areaRoot, area)),
  ]);
}

async function finalizeState(stage) {
  await rm(path.join(stage, ".STATE.json"), { force: true });
  const metadata = await readFile(path.join(stage, ".META.json"));
  const manifest = {
    canonicalSha256: await areaDigest(stage, "canonical"),
    derivedSha256: await areaDigest(stage, "derived"),
    draftSha256: await areaDigest(stage, "draft"),
    metadataSha256: sha256(metadata),
    schema: stateSchema,
  };
  await privateFile(path.join(stage, ".STATE.json"), canonicalJson(manifest));
  const inventory = await treeEntries(stage);
  const files = inventory.filter((item) => item.type === "file");
  const fileCount = files.length;
  const byteCount = files.reduce((total, item) => total + item.bytes.length, 0);
  if (fileCount > limits.regularFiles || byteCount > limits.retainedBytes) {
    reject("LIMIT_EXCEEDED");
  }
  return {
    byteCount,
    fileCount,
    identity: inventoryDigest(inventory),
    manifest,
  };
}

function metadataValue({ owner, requestedAsOf, workspaceId }) {
  return {
    owner,
    requestedAsOf: [...requestedAsOf].sort(compareUtf8),
    schema: metadataSchema,
    workspaceId,
  };
}

async function writeMetadata(stateRoot, metadata) {
  await privateFile(
    path.join(stateRoot, ".META.json"),
    canonicalJson(metadataValue(metadata)),
  );
}

function recordWithHash(core) {
  return { ...core, recordSha256: sha256(canonicalJson(core)) };
}

function appendRecord(records, { body, horizonId, id, kind, recordedAt }) {
  const core = {
    body,
    horizonId,
    id,
    kind,
    previousRecordSha256:
      records.length === 0 ? null : records.at(-1).recordSha256,
    recordedAt,
    schema: recordSchema,
    sequence: records.length + 1,
  };
  const record = recordWithHash(core);
  records.push(record);
  return record;
}

function journalBytes(records) {
  return Buffer.concat(records.map((record) => canonicalJson(record)));
}

function headValue({ horizons, owner, records, workspaceId }) {
  return {
    headHorizonId: horizons.length === 0 ? null : horizons.at(-1).id,
    headHorizonName: horizons.length === 0 ? null : horizons.at(-1).name,
    headSha256: records.at(-1).recordSha256,
    horizons,
    journalSha256: sha256(journalBytes(records)),
    owner,
    recordCount: records.length,
    schema: headSchema,
    workspaceId,
  };
}

async function writeCanonical(stateRoot, verified) {
  const canonicalRoot = path.join(stateRoot, "canonical");
  await privateFile(
    path.join(canonicalRoot, "JOURNAL.jsonl"),
    journalBytes(verified.records),
  );
  await privateFile(
    path.join(canonicalRoot, "HEAD.json"),
    canonicalJson(
      headValue({
        horizons: verified.horizons,
        owner: verified.owner,
        records: verified.records,
        workspaceId: verified.workspaceId,
      }),
    ),
  );
}

function parseJournal(bytes) {
  if (bytes.length === 0 || bytes.at(-1) !== 0x0a) {
    reject("CANONICAL_INTEGRITY");
  }
  const text = bytes.toString("utf8");
  const lines = text.slice(0, -1).split("\n");
  const records = [];
  for (const line of lines) {
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      reject("CANONICAL_INTEGRITY");
    }
    if (!Buffer.from(`${line}\n`, "utf8").equals(canonicalJson(value))) {
      reject("CANONICAL_INTEGRITY");
    }
    records.push(value);
  }
  return records;
}

function validateRecordEnvelope(record, index, previousHash) {
  exactKeys(record, [
    "body",
    "horizonId",
    "id",
    "kind",
    "previousRecordSha256",
    "recordedAt",
    "recordSha256",
    "schema",
    "sequence",
  ]);
  if (
    record.schema !== recordSchema ||
    record.sequence !== index + 1 ||
    !recordKinds.has(record.kind) ||
    record.previousRecordSha256 !== previousHash
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  validGeneratedId(record.id);
  stringValue(record.horizonId, "CANONICAL_INTEGRITY", true);
  if (record.horizonId !== null) validGeneratedId(record.horizonId);
  validTimestamp(record.recordedAt);
  validSha256(record.recordSha256);
  const { recordSha256, ...core } = record;
  if (sha256(canonicalJson(core)) !== recordSha256) {
    reject("CANONICAL_INTEGRITY");
  }
}

function validateSourceRecord(record, openHorizon, sourcePaths) {
  exactKeys(record.body, [
    "alias",
    "identity",
    "logicalPath",
    "sha256",
    "size",
    "snapshotPath",
  ]);
  validateAlias(record.body.alias, "CANONICAL_INTEGRITY");
  validateLogicalPath(record.body.logicalPath, "CANONICAL_INTEGRITY");
  validSha256(record.body.sha256);
  safeInteger(record.body.size);
  if (record.body.snapshotPath !== `snapshots/${record.body.sha256}.bin`) {
    reject("CANONICAL_INTEGRITY");
  }
  exactKeys(record.body.identity, ["ctimeNs", "dev", "ino", "mtimeNs", "size"]);
  for (const value of Object.values(record.body.identity)) {
    stringValue(value);
    if (!/^\d+$/.test(value)) reject("CANONICAL_INTEGRITY");
  }
  if (record.body.identity.size !== String(record.body.size)) {
    reject("CANONICAL_INTEGRITY");
  }
  if (record.horizonId !== openHorizon.id) reject("CANONICAL_INTEGRITY");
  if (
    sourcePaths.length > 0 &&
    compareUtf8(sourcePaths.at(-1), record.body.logicalPath) >= 0
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  sourcePaths.push(record.body.logicalPath);
}

function validateEvidenceRecord(record, openHorizon, sources) {
  exactKeys(record.body, [
    "byteEnd",
    "byteStart",
    "lineEnd",
    "lineStart",
    "sha256",
    "sourceId",
  ]);
  for (const key of ["byteEnd", "byteStart", "lineEnd", "lineStart"]) {
    safeInteger(record.body[key]);
  }
  if (
    record.body.lineStart < 1 ||
    record.body.lineEnd < record.body.lineStart ||
    record.body.byteEnd <= record.body.byteStart
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  validSha256(record.body.sha256);
  validGeneratedId(record.body.sourceId);
  const source = sources.get(record.body.sourceId);
  if (source === undefined || source.horizonId !== openHorizon.id) {
    reject("CANONICAL_INTEGRITY");
  }
}

async function verifyCanonical(stateRoot) {
  const canonicalRoot = path.join(stateRoot, "canonical");
  const canonicalLayout = await treeEntries(canonicalRoot);
  const canonicalDirectories = canonicalLayout
    .filter((item) => item.type === "directory")
    .map((item) => item.path);
  if (
    canonicalDirectories.length !== 1 ||
    canonicalDirectories[0] !== "snapshots"
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const canonicalItems = await treeInventory(canonicalRoot);
  const paths = canonicalItems.map((item) => item.path);
  if (!paths.includes("HEAD.json") || !paths.includes("JOURNAL.jsonl")) {
    reject("CANONICAL_INTEGRITY");
  }
  if (
    paths.some(
      (item) =>
        item !== "HEAD.json" &&
        item !== "JOURNAL.jsonl" &&
        !/^snapshots\/[a-f0-9]{64}\.bin$/.test(item),
    )
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const journal = await readFile(path.join(canonicalRoot, "JOURNAL.jsonl")).catch(
    () => reject("CANONICAL_INTEGRITY"),
  );
  const records = parseJournal(journal);
  if (records.length === 0 || records.length > limits.canonicalRecords) {
    reject("CANONICAL_INTEGRITY");
  }
  const ids = new Set();
  const aliases = {
    assertion: new Set(),
    horizon: new Set(),
    question: new Set(),
    source: new Set(),
  };
  const sources = new Map();
  const evidence = new Map();
  const assertions = new Map();
  const assertionAliases = new Map();
  const questions = new Map();
  const horizons = [];
  let owner;
  let workspaceId;
  let openHorizon = null;
  let sourcePaths = [];
  let semanticStarted = false;
  let horizonSourceHashes = new Set();
  let horizonSourceIdentities = new Set();
  let previousHash = null;

  for (const [index, record] of records.entries()) {
    validateRecordEnvelope(record, index, previousHash);
    previousHash = record.recordSha256;
    if (ids.has(record.id)) reject("CANONICAL_INTEGRITY");
    ids.add(record.id);

    if (record.kind === "WorkspaceInitialized") {
      exactKeys(record.body, ["owner"]);
      if (index !== 0 || record.horizonId !== null || workspaceId !== undefined) {
        reject("CANONICAL_INTEGRITY");
      }
      validateAlias(record.body.owner, "CANONICAL_INTEGRITY");
      owner = record.body.owner;
      workspaceId = record.id;
    } else if (record.kind === "HorizonOpened") {
      exactKeys(record.body, ["coverage", "name", "scope"]);
      if (openHorizon !== null || record.horizonId !== record.id) {
        reject("CANONICAL_INTEGRITY");
      }
      validateAlias(record.body.name, "CANONICAL_INTEGRITY");
      if (aliases.horizon.has(record.body.name)) reject("CANONICAL_INTEGRITY");
      if (!new Set(["partial", "closed-selection"]).has(record.body.coverage)) {
        reject("CANONICAL_INTEGRITY");
      }
      stringValue(record.body.scope, "CANONICAL_INTEGRITY", true);
      if (
        record.body.coverage === "closed-selection" &&
        (record.body.scope === null || record.body.scope.length === 0)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      aliases.horizon.add(record.body.name);
      openHorizon = {
        coverage: record.body.coverage,
        id: record.id,
        name: record.body.name,
        openedAt: record.recordedAt,
        scope: record.body.scope,
      };
      sourcePaths = [];
      horizonSourceHashes = new Set();
      horizonSourceIdentities = new Set();
      semanticStarted = false;
    } else if (record.kind === "SourceSnapshot") {
      if (openHorizon === null || semanticStarted) reject("CANONICAL_INTEGRITY");
      validateSourceRecord(record, openHorizon, sourcePaths);
      const identityKey = canonicalJson(record.body.identity).toString("utf8");
      if (
        horizonSourceHashes.has(record.body.sha256) ||
        horizonSourceIdentities.has(identityKey)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      horizonSourceHashes.add(record.body.sha256);
      horizonSourceIdentities.add(identityKey);
      if (aliases.source.has(record.body.alias)) reject("CANONICAL_INTEGRITY");
      aliases.source.add(record.body.alias);
      sources.set(record.id, record);
    } else if (record.kind === "EvidenceSpan") {
      if (openHorizon === null) reject("CANONICAL_INTEGRITY");
      semanticStarted = true;
      validateEvidenceRecord(record, openHorizon, sources);
      evidence.set(record.id, record);
    } else if (record.kind === "AssertionRevision") {
      exactKeys(record.body, [
        "alias",
        "assertionId",
        "evidenceSpanId",
        "predecessorRevisionId",
        "reason",
        "scope",
        "text",
        "uncertainty",
      ]);
      if (openHorizon === null || record.horizonId !== openHorizon.id) {
        reject("CANONICAL_INTEGRITY");
      }
      semanticStarted = true;
      validateAlias(record.body.alias, "CANONICAL_INTEGRITY");
      validGeneratedId(record.body.assertionId);
      validGeneratedId(record.body.evidenceSpanId);
      stringValue(record.body.predecessorRevisionId, "CANONICAL_INTEGRITY", true);
      stringValue(record.body.reason, "CANONICAL_INTEGRITY", true);
      stringValue(record.body.scope, "CANONICAL_INTEGRITY", true);
      stringValue(record.body.uncertainty, "CANONICAL_INTEGRITY", true);
      nonEmptyText(record.body.text, "CANONICAL_INTEGRITY");
      const span = evidence.get(record.body.evidenceSpanId);
      if (span === undefined || records[index - 1]?.id !== span.id) {
        reject("CANONICAL_INTEGRITY");
      }
      const current = assertions.get(record.body.assertionId);
      if (current === undefined) {
        if (
          record.body.predecessorRevisionId !== null ||
          record.body.reason !== null ||
          ids.has(record.body.assertionId) ||
          aliases.assertion.has(record.body.alias)
        ) {
          reject("CANONICAL_INTEGRITY");
        }
        ids.add(record.body.assertionId);
        aliases.assertion.add(record.body.alias);
        assertionAliases.set(record.body.alias, record.body.assertionId);
      } else if (
        current.body.alias !== record.body.alias ||
        record.body.predecessorRevisionId !== current.id ||
        record.body.reason === null
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      assertions.set(record.body.assertionId, record);
    } else if (record.kind === "QuestionOpened") {
      exactKeys(record.body, ["alias", "evidenceSpanId", "status", "text"]);
      if (openHorizon === null || record.horizonId !== openHorizon.id) {
        reject("CANONICAL_INTEGRITY");
      }
      semanticStarted = true;
      validateAlias(record.body.alias, "CANONICAL_INTEGRITY");
      nonEmptyText(record.body.text, "CANONICAL_INTEGRITY");
      if (record.body.status !== "open" || aliases.question.has(record.body.alias)) {
        reject("CANONICAL_INTEGRITY");
      }
      if (record.body.evidenceSpanId !== null) {
        validGeneratedId(record.body.evidenceSpanId);
        const span = evidence.get(record.body.evidenceSpanId);
        if (span === undefined || records[index - 1]?.id !== span.id) {
          reject("CANONICAL_INTEGRITY");
        }
      }
      aliases.question.add(record.body.alias);
      questions.set(record.id, record);
    } else if (record.kind === "HorizonClosed") {
      exactKeys(record.body, ["coverage", "name", "scope"]);
      if (
        openHorizon === null ||
        record.horizonId !== openHorizon.id ||
        record.body.name !== openHorizon.name ||
        record.body.coverage !== openHorizon.coverage ||
        record.body.scope !== openHorizon.scope ||
        sourcePaths.length === 0
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      horizons.push({
        closedAt: record.recordedAt,
        coverage: openHorizon.coverage,
        headSha256: record.recordSha256,
        id: openHorizon.id,
        name: openHorizon.name,
        scope: openHorizon.scope,
      });
      openHorizon = null;
    }
  }
  if (workspaceId === undefined || openHorizon !== null) {
    reject("CANONICAL_INTEGRITY");
  }
  const evidenceUseCounts = new Map([...evidence.keys()].map((id) => [id, 0]));
  for (const record of records) {
    if (record.kind === "AssertionRevision") {
      evidenceUseCounts.set(
        record.body.evidenceSpanId,
        (evidenceUseCounts.get(record.body.evidenceSpanId) ?? 0) + 1,
      );
    } else if (
      record.kind === "QuestionOpened" &&
      record.body.evidenceSpanId !== null
    ) {
      evidenceUseCounts.set(
        record.body.evidenceSpanId,
        (evidenceUseCounts.get(record.body.evidenceSpanId) ?? 0) + 1,
      );
    }
  }
  if ([...evidenceUseCounts.values()].some((count) => count !== 1)) {
    reject("CANONICAL_INTEGRITY");
  }

  const { bytes: headBytes, value: head } = await readCanonicalJson(
    path.join(canonicalRoot, "HEAD.json"),
  );
  exactKeys(head, [
    "headHorizonId",
    "headHorizonName",
    "headSha256",
    "horizons",
    "journalSha256",
    "owner",
    "recordCount",
    "schema",
    "workspaceId",
  ]);
  const expectedHead = headValue({ horizons, owner, records, workspaceId });
  if (!headBytes.equals(canonicalJson(expectedHead))) {
    reject("CANONICAL_INTEGRITY");
  }

  const expectedSnapshots = new Map();
  for (const source of sources.values()) {
    expectedSnapshots.set(source.body.sha256, source.body.size);
  }
  const actualSnapshotPaths = paths
    .filter((item) => item.startsWith("snapshots/"))
    .sort(compareUtf8);
  const expectedSnapshotPaths = [...expectedSnapshots.keys()]
    .sort(compareUtf8)
    .map((hash) => `snapshots/${hash}.bin`);
  if (
    actualSnapshotPaths.length !== expectedSnapshotPaths.length ||
    actualSnapshotPaths.some((item, index) => item !== expectedSnapshotPaths[index])
  ) {
    reject("SNAPSHOT_INTEGRITY");
  }
  const snapshotBytes = new Map();
  for (const [hash, size] of expectedSnapshots) {
    const bytes = await readFile(path.join(canonicalRoot, "snapshots", `${hash}.bin`));
    if (bytes.length !== size || sha256(bytes) !== hash) {
      reject("SNAPSHOT_INTEGRITY");
    }
    snapshotBytes.set(hash, bytes);
  }
  for (const span of evidence.values()) {
    const source = sources.get(span.body.sourceId);
    const bytes = snapshotBytes.get(source.body.sha256);
    const expectedSpan = lineSpan(
      bytes,
      span.body.lineStart,
      span.body.lineEnd,
      "SNAPSHOT_INTEGRITY",
    );
    if (
      span.body.byteStart !== expectedSpan.byteStart ||
      span.body.byteEnd !== expectedSpan.byteEnd ||
      span.body.sha256 !== expectedSpan.sha256
    ) {
      reject("SNAPSHOT_INTEGRITY");
    }
  }

  return {
    aliases,
    assertionAliases,
    assertions,
    evidence,
    head: expectedHead,
    horizons,
    ids,
    owner,
    questions,
    records,
    snapshotBytes,
    sources,
    workspaceId,
  };
}

function validateMetadata(metadata, canonical) {
  exactKeys(metadata, ["owner", "requestedAsOf", "schema", "workspaceId"]);
  if (
    metadata.schema !== metadataSchema ||
    metadata.owner !== canonical.owner ||
    metadata.workspaceId !== canonical.workspaceId ||
    !Array.isArray(metadata.requestedAsOf)
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const names = new Set();
  for (const name of metadata.requestedAsOf) {
    validateAlias(name, "CANONICAL_INTEGRITY");
    if (names.has(name) || !canonical.horizons.some((item) => item.name === name)) {
      reject("CANONICAL_INTEGRITY");
    }
    names.add(name);
  }
  if (
    metadata.requestedAsOf.some(
      (name, index, values) => index > 0 && compareUtf8(values[index - 1], name) >= 0,
    )
  ) {
    reject("CANONICAL_INTEGRITY");
  }
}

function validateDraftShape(draft, canonical) {
  exactKeys(draft, [
    "actions",
    "coverage",
    "horizonId",
    "name",
    "openedAt",
    "schema",
    "scope",
    "sourceRoot",
  ]);
  if (draft.schema !== draftSchema) reject("CANONICAL_INTEGRITY");
  validGeneratedId(draft.horizonId);
  validateAlias(draft.name, "CANONICAL_INTEGRITY");
  validTimestamp(draft.openedAt);
  stringValue(draft.sourceRoot);
  if (!path.isAbsolute(draft.sourceRoot)) reject("CANONICAL_INTEGRITY");
  if (!new Set(["partial", "closed-selection"]).has(draft.coverage)) {
    reject("CANONICAL_INTEGRITY");
  }
  stringValue(draft.scope, "CANONICAL_INTEGRITY", true);
  if (
    draft.coverage === "closed-selection" &&
    (draft.scope === null || draft.scope.length === 0)
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  if (
    canonical.horizons.some((item) => item.name === draft.name || item.id === draft.horizonId) ||
    !Array.isArray(draft.actions)
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const ids = new Set(canonical.ids);
  const sourceAliases = new Set(canonical.aliases.source);
  const assertionAliases = new Map(canonical.assertionAliases);
  const questionAliases = new Set(canonical.aliases.question);
  const sourcePaths = new Set();
  const sourceHashes = new Set();
  const sourceIdentities = new Set();
  const sources = new Map();
  const currentRevision = new Map(
    [...canonical.assertions.entries()].map(([key, value]) => [key, value.id]),
  );
  for (const action of draft.actions) {
    if (action === null || typeof action !== "object" || Array.isArray(action)) {
      reject("CANONICAL_INTEGRITY");
    }
    validTimestamp(action.recordedAt);
    if (action.kind === "source") {
      exactKeys(action, [
        "alias",
        "capturedFile",
        "identity",
        "kind",
        "logicalPath",
        "recordedAt",
        "sha256",
        "size",
        "sourceId",
      ]);
      validateAlias(action.alias, "CANONICAL_INTEGRITY");
      validateLogicalPath(action.logicalPath, "CANONICAL_INTEGRITY");
      validGeneratedId(action.sourceId);
      validSha256(action.sha256);
      safeInteger(action.size);
      exactKeys(action.identity, ["ctimeNs", "dev", "ino", "mtimeNs", "size"]);
      for (const value of Object.values(action.identity)) {
        stringValue(value);
        if (!/^\d+$/.test(value)) reject("CANONICAL_INTEGRITY");
      }
      if (action.identity.size !== String(action.size)) {
        reject("CANONICAL_INTEGRITY");
      }
      if (action.capturedFile !== `sources/${action.sourceId}.bin`) {
        reject("CANONICAL_INTEGRITY");
      }
      const identityKey = canonicalJson(action.identity).toString("utf8");
      if (
        ids.has(action.sourceId) ||
        sourceAliases.has(action.alias) ||
        sourcePaths.has(action.logicalPath) ||
        sourceHashes.has(action.sha256) ||
        sourceIdentities.has(identityKey)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      ids.add(action.sourceId);
      sourceAliases.add(action.alias);
      sourcePaths.add(action.logicalPath);
      sourceHashes.add(action.sha256);
      sourceIdentities.add(identityKey);
      sources.set(action.alias, action);
    } else if (action.kind === "assertion-add") {
      exactKeys(action, [
        "alias",
        "assertionId",
        "evidenceSpanId",
        "kind",
        "lineEnd",
        "lineStart",
        "recordedAt",
        "revisionId",
        "scope",
        "sourceAlias",
        "text",
        "uncertainty",
      ]);
      validateAlias(action.alias, "CANONICAL_INTEGRITY");
      validGeneratedId(action.assertionId);
      validGeneratedId(action.revisionId);
      validGeneratedId(action.evidenceSpanId);
      if (
        ids.has(action.assertionId) ||
        ids.has(action.revisionId) ||
        ids.has(action.evidenceSpanId) ||
        assertionAliases.has(action.alias)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      validateSemanticAction(action, sources);
      ids.add(action.assertionId);
      ids.add(action.revisionId);
      ids.add(action.evidenceSpanId);
      assertionAliases.set(action.alias, action.assertionId);
      currentRevision.set(action.assertionId, action.revisionId);
    } else if (action.kind === "assertion-revise") {
      exactKeys(action, [
        "alias",
        "assertionId",
        "evidenceSpanId",
        "kind",
        "lineEnd",
        "lineStart",
        "predecessorRevisionId",
        "reason",
        "recordedAt",
        "revisionId",
        "scope",
        "sourceAlias",
        "text",
        "uncertainty",
      ]);
      validateAlias(action.alias, "CANONICAL_INTEGRITY");
      validGeneratedId(action.assertionId);
      validGeneratedId(action.revisionId);
      validGeneratedId(action.evidenceSpanId);
      validGeneratedId(action.predecessorRevisionId);
      nonEmptyText(action.reason, "CANONICAL_INTEGRITY");
      if (
        assertionAliases.get(action.alias) !== action.assertionId ||
        currentRevision.get(action.assertionId) !== action.predecessorRevisionId ||
        ids.has(action.revisionId) ||
        ids.has(action.evidenceSpanId)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      validateSemanticAction(action, sources);
      ids.add(action.revisionId);
      ids.add(action.evidenceSpanId);
      currentRevision.set(action.assertionId, action.revisionId);
    } else if (action.kind === "question") {
      exactKeys(action, [
        "alias",
        "evidenceSpanId",
        "kind",
        "lineEnd",
        "lineStart",
        "questionId",
        "recordedAt",
        "sourceAlias",
        "text",
      ]);
      validateAlias(action.alias, "CANONICAL_INTEGRITY");
      validGeneratedId(action.questionId);
      stringValue(action.evidenceSpanId, "CANONICAL_INTEGRITY", true);
      if (action.evidenceSpanId !== null) validGeneratedId(action.evidenceSpanId);
      if (
        ids.has(action.questionId) ||
        (action.evidenceSpanId !== null && ids.has(action.evidenceSpanId)) ||
        questionAliases.has(action.alias)
      ) {
        reject("CANONICAL_INTEGRITY");
      }
      nonEmptyText(action.text, "CANONICAL_INTEGRITY");
      if (action.sourceAlias === null) {
        if (action.lineStart !== null || action.lineEnd !== null || action.evidenceSpanId !== null) {
          reject("CANONICAL_INTEGRITY");
        }
      } else {
        stringValue(action.sourceAlias);
        if (!sources.has(action.sourceAlias)) reject("CANONICAL_INTEGRITY");
        safeLineRange(action.lineStart, action.lineEnd, "CANONICAL_INTEGRITY");
      }
      ids.add(action.questionId);
      if (action.evidenceSpanId !== null) ids.add(action.evidenceSpanId);
      questionAliases.add(action.alias);
    } else {
      reject("CANONICAL_INTEGRITY");
    }
  }
  return { ids, sources };
}

function validateSemanticAction(action, sources) {
  nonEmptyText(action.text, "CANONICAL_INTEGRITY");
  stringValue(action.scope, "CANONICAL_INTEGRITY", true);
  stringValue(action.uncertainty, "CANONICAL_INTEGRITY", true);
  stringValue(action.sourceAlias);
  if (!sources.has(action.sourceAlias)) reject("CANONICAL_INTEGRITY");
  safeLineRange(action.lineStart, action.lineEnd, "CANONICAL_INTEGRITY");
}

function safeLineRange(first, last, code = "INVALID_LINE_RANGE") {
  if (
    !Number.isSafeInteger(first) ||
    !Number.isSafeInteger(last) ||
    first < 1 ||
    last < first
  ) {
    reject(code);
  }
}

async function readDraft(stateRoot, canonical) {
  const draftRoot = path.join(stateRoot, "draft");
  const layout = await treeEntries(draftRoot);
  const items = await treeInventory(draftRoot);
  const directories = layout
    .filter((item) => item.type === "directory")
    .map((item) => item.path);
  if (items.length === 0) {
    if (directories.length !== 0) reject("CANONICAL_INTEGRITY");
    return null;
  }
  const paths = items.map((item) => item.path);
  if (
    !paths.includes("STATE.json") ||
    paths.some(
      (item) => item !== "STATE.json" && !/^sources\/[a-z]{3}_[a-f0-9]{32}\.bin$/.test(item),
    )
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const { value: draft } = await readCanonicalJson(path.join(draftRoot, "STATE.json"));
  const validated = validateDraftShape(draft, canonical);
  const expectedDirectories = validated.sources.size === 0 ? [] : ["sources"];
  if (
    directories.length !== expectedDirectories.length ||
    directories.some((item, index) => item !== expectedDirectories[index])
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const expectedFiles = [...validated.sources.values()]
    .map((source) => source.capturedFile)
    .sort(compareUtf8);
  const actualFiles = paths.filter((item) => item !== "STATE.json").sort(compareUtf8);
  if (
    expectedFiles.length !== actualFiles.length ||
    expectedFiles.some((item, index) => item !== actualFiles[index])
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  for (const source of validated.sources.values()) {
    const bytes = await readFile(path.join(draftRoot, source.capturedFile));
    if (bytes.length !== source.size || sha256(bytes) !== source.sha256) {
      reject("CANONICAL_INTEGRITY");
    }
  }
  return draft;
}

async function validateStaticRoot(root) {
  let stat;
  try {
    stat = await lstat(root);
  } catch (error) {
    if (error?.code === "ENOENT") reject("NOT_INITIALIZED");
    throw error;
  }
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) {
    reject("CANONICAL_INTEGRITY");
  }
  const allowed = new Set([
    ".active",
    ".states",
    ".writer.lock",
    "canonical",
    "derived",
    "draft",
  ]);
  const entries = await readdir(root, { withFileTypes: true });
  if (entries.some((entry) => !allowed.has(entry.name))) {
    reject("CANONICAL_INTEGRITY");
  }
  const states = entries.find((entry) => entry.name === ".states");
  if (states === undefined || !states.isDirectory() || states.isSymbolicLink()) {
    reject("CANONICAL_INTEGRITY");
  }
  const statesStat = await lstat(path.join(root, ".states"));
  if ((statesStat.mode & 0o077) !== 0) reject("CANONICAL_INTEGRITY");
  for (const [name, target] of [
    ["canonical", ".active/canonical"],
    ["draft", ".active/draft"],
    ["derived", ".active/derived"],
  ]) {
    const entry = entries.find((item) => item.name === name);
    if (entry === undefined || !entry.isSymbolicLink()) reject("CANONICAL_INTEGRITY");
    if ((await readlink(path.join(root, name))) !== target) {
      reject("CANONICAL_INTEGRITY");
    }
  }
}

async function loadWorkspace(root) {
  root = path.resolve(root);
  await validateStaticRoot(root);
  const activePath = path.join(root, ".active");
  const activeStat = await lstat(activePath).catch(() => reject("CANONICAL_INTEGRITY"));
  if (!activeStat.isSymbolicLink()) reject("CANONICAL_INTEGRITY");
  const target = await readlink(activePath);
  const match = target.match(
    /^\.states\/(state-[a-f0-9]{64}-[a-f0-9]{32})$/,
  );
  if (match === null) reject("CANONICAL_INTEGRITY");
  const stateName = match[1];
  const statesRoot = path.join(root, ".states");
  const stateEntries = await readdir(statesRoot, { withFileTypes: true });
  if (
    stateEntries.length !== 1 ||
    stateEntries[0].name !== stateName ||
    !stateEntries[0].isDirectory() ||
    stateEntries[0].isSymbolicLink()
  ) {
    reject("ATOMIC_PUBLICATION");
  }
  const stateRoot = path.join(statesRoot, stateName);
  const stateStat = await lstat(stateRoot);
  if ((stateStat.mode & 0o077) !== 0) reject("CANONICAL_INTEGRITY");
  const { bytes: manifestBytes, value: manifest } = await readCanonicalJson(
    path.join(stateRoot, ".STATE.json"),
  );
  exactKeys(manifest, [
    "canonicalSha256",
    "derivedSha256",
    "draftSha256",
    "metadataSha256",
    "schema",
  ]);
  if (manifest.schema !== stateSchema) reject("CANONICAL_INTEGRITY");
  for (const key of [
    "canonicalSha256",
    "derivedSha256",
    "draftSha256",
    "metadataSha256",
  ]) {
    validSha256(manifest[key]);
  }
  const actual = {
    canonicalSha256: await areaDigest(stateRoot, "canonical"),
    derivedSha256: await areaDigest(stateRoot, "derived"),
    draftSha256: await areaDigest(stateRoot, "draft"),
  };
  const metadataRead = await readCanonicalJson(path.join(stateRoot, ".META.json"));
  if (
    actual.draftSha256 !== manifest.draftSha256 ||
    sha256(metadataRead.bytes) !== manifest.metadataSha256
  ) {
    reject("CANONICAL_INTEGRITY");
  }
  const canonical = await verifyCanonical(stateRoot);
  if (actual.canonicalSha256 !== manifest.canonicalSha256) {
    reject("CANONICAL_INTEGRITY");
  }
  validateMetadata(metadataRead.value, canonical);
  const draft = await readDraft(stateRoot, canonical);
  const inventory = await treeEntries(stateRoot);
  const actualStateIdentity = inventoryDigest(inventory);
  const derivedDirty = actual.derivedSha256 !== manifest.derivedSha256;
  if (actualStateIdentity !== stateNamePattern.exec(stateName)?.[1] && !derivedDirty) {
    reject("CANONICAL_INTEGRITY");
  }
  return {
    canonical,
    derivedDirty,
    draft,
    manifest,
    metadata: metadataRead.value,
    root,
    stateName,
    stateRoot,
  };
}

async function acquireWriter(root) {
  root = path.resolve(root);
  if (!(await exists(root))) reject("NOT_INITIALIZED");
  const lockPath = path.join(root, ".writer.lock");
  let handle;
  try {
    handle = await open(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    await handle.writeFile(`${process.pid}\n`, "utf8");
  } catch (error) {
    await handle?.close().catch(() => {});
    if (error?.code === "EEXIST") reject("CONCURRENT_WRITER");
    throw error;
  }
  return async () => {
    await handle.close().catch(() => {});
    await rm(lockPath, { force: true }).catch(() => {});
  };
}

async function withWriter(root, operation) {
  const release = await acquireWriter(root);
  try {
    const workspace = await loadWorkspace(root);
    return await operation(workspace);
  } finally {
    await release();
  }
}

async function publishMutation(workspace, mutate, hooks = {}) {
  const statesRoot = path.join(workspace.root, ".states");
  const stage = path.join(statesRoot, `.stage-${randomUUID()}`);
  let finalRoot = null;
  let nextSelector = null;
  let committed = false;
  try {
    await cp(workspace.stateRoot, stage, {
      dereference: false,
      errorOnExist: true,
      recursive: true,
    });
    await rm(path.join(stage, ".STATE.json"), { force: true });
    await mutate(stage);
    const finalized = await finalizeState(stage);
    await validateStagedState(stage);
    const generationSuffix = randomUUID().replaceAll("-", "").toLowerCase();
    finalRoot = path.join(
      statesRoot,
      `state-${finalized.identity}-${generationSuffix}`,
    );
    if (await exists(finalRoot)) reject("ATOMIC_PUBLICATION");
    await rename(stage, finalRoot);
    if (typeof hooks.beforeCommit === "function") {
      try {
        await hooks.beforeCommit();
      } catch {
        reject("ATOMIC_PUBLICATION");
      }
    }
    nextSelector = path.join(
      workspace.root,
      `.active-next-${randomUUID()}`,
    );
    await symlink(`.states/${path.basename(finalRoot)}`, nextSelector);
    await rename(nextSelector, path.join(workspace.root, ".active"));
    committed = true;
    await rm(workspace.stateRoot, { force: true, recursive: true }).catch(() => {});
    return { ...finalized, stateRoot: finalRoot };
  } catch (error) {
    await rm(stage, { force: true, recursive: true }).catch(() => {});
    if (nextSelector !== null) {
      await rm(nextSelector, { force: true }).catch(() => {});
    }
    if (!committed && finalRoot !== null && finalRoot !== workspace.stateRoot) {
      await rm(finalRoot, { force: true, recursive: true }).catch(() => {});
    }
    throw error;
  }
}

async function validateStagedState(stateRoot) {
  try {
    const canonical = await verifyCanonical(stateRoot);
    const metadataRead = await readCanonicalJson(
      path.join(stateRoot, ".META.json"),
    );
    validateMetadata(metadataRead.value, canonical);
    const draft = await readDraft(stateRoot, canonical);
    const status = await projectionStatus({
      canonical,
      draft,
      metadata: metadataRead.value,
      stateRoot,
    });
    if (status === "invalid" || status === "stale") {
      reject("ATOMIC_PUBLICATION");
    }
  } catch (error) {
    if (error instanceof WorkbenchError && error.code === "LIMIT_EXCEEDED") {
      throw error;
    }
    reject("ATOMIC_PUBLICATION");
  }
}

async function verifyRealDirectory(directory, code = "UNSAFE_SOURCE") {
  let stat;
  let resolved;
  try {
    stat = await lstat(directory);
    resolved = await realpath(directory);
  } catch {
    reject(code);
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) reject(code);
  return resolved;
}

function pathsOverlap(left, right) {
  const leftToRight = path.relative(left, right);
  const rightToLeft = path.relative(right, left);
  return (
    leftToRight === "" ||
    (!leftToRight.startsWith(`..${path.sep}`) && leftToRight !== "..") ||
    (!rightToLeft.startsWith(`..${path.sep}`) && rightToLeft !== "..")
  );
}

function fileIdentity(stat) {
  return {
    ctimeNs: String(stat.ctimeNs),
    dev: String(stat.dev),
    ino: String(stat.ino),
    mtimeNs: String(stat.mtimeNs),
    size: String(stat.size),
  };
}

async function readSelectedFile(sourceRoot, logicalPath) {
  validateLogicalPath(logicalPath);
  const verifiedRoot = await verifyRealDirectory(sourceRoot);
  if (verifiedRoot !== sourceRoot) reject("UNSAFE_SOURCE");
  let current = sourceRoot;
  const segments = logicalPath.split("/");
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    let stat;
    try {
      stat = await lstat(current);
    } catch {
      reject("UNSAFE_SOURCE");
    }
    if (stat.isSymbolicLink()) reject("UNSAFE_SOURCE");
    if (index < segments.length - 1 && !stat.isDirectory()) reject("UNSAFE_SOURCE");
    if (index === segments.length - 1 && !stat.isFile()) reject("UNSAFE_SOURCE");
  }
  let handle;
  try {
    handle = await open(
      current,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW === undefined ? 0 : constants.O_NOFOLLOW),
    );
  } catch {
    reject("UNSAFE_SOURCE");
  }
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile() || before.size > BigInt(limits.retainedBytes)) {
      reject("LIMIT_EXCEEDED");
    }
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    const beforeIdentity = fileIdentity(before);
    const pathAfter = await lstat(current, { bigint: true }).catch(() =>
      reject("SOURCE_CHANGED"),
    );
    const realPathAfter = await realpath(current).catch(() =>
      reject("SOURCE_CHANGED"),
    );
    if (
      bytes.length !== Number(before.size) ||
      canonicalJson(beforeIdentity).compare(canonicalJson(fileIdentity(after))) !== 0 ||
      pathAfter.isSymbolicLink() ||
      !pathAfter.isFile() ||
      canonicalJson(beforeIdentity).compare(
        canonicalJson(fileIdentity(pathAfter)),
      ) !== 0 ||
      realPathAfter !== current
    ) {
      reject("SOURCE_CHANGED");
    }
    try {
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch {
      reject("INVALID_UTF8");
    }
    return { bytes, identity: beforeIdentity, sha256: sha256(bytes) };
  } finally {
    await handle.close();
  }
}

function sameIdentity(left, right) {
  return canonicalJson(left).equals(canonicalJson(right));
}

function lineSpan(bytes, first, last, code = "INVALID_LINE_RANGE") {
  safeLineRange(first, last, code);
  const starts = [0];
  const ends = [];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0x0a) {
      ends.push(index + 1);
      if (index + 1 < bytes.length) starts.push(index + 1);
    }
  }
  if (bytes.length > 0 && ends.length < starts.length) ends.push(bytes.length);
  if (bytes.length === 0 || first > starts.length || last > starts.length) {
    reject(code);
  }
  const byteStart = starts[first - 1];
  const byteEnd = ends[last - 1];
  if (byteEnd === undefined || byteEnd <= byteStart) reject(code);
  const selected = bytes.subarray(byteStart, byteEnd);
  return { byteEnd, byteStart, sha256: sha256(selected) };
}

function sourceActions(draft) {
  return draft.actions.filter((action) => action.kind === "source");
}

function sourceByAlias(draft, alias) {
  return sourceActions(draft).find((source) => source.alias === alias);
}

function allTakenIds(canonical, draft) {
  const taken = new Set(canonical.ids);
  if (draft !== null) {
    for (const action of draft.actions) {
      for (const key of [
        "sourceId",
        "assertionId",
        "revisionId",
        "evidenceSpanId",
        "questionId",
      ]) {
        if (typeof action[key] === "string") taken.add(action[key]);
      }
    }
    taken.add(draft.horizonId);
  }
  return taken;
}

function assertionState(canonical, draft) {
  const byAlias = new Map();
  for (const [alias, assertionId] of canonical.assertionAliases) {
    byAlias.set(alias, {
      assertionId,
      revisionId: canonical.assertions.get(assertionId).id,
    });
  }
  for (const action of draft.actions) {
    if (action.kind === "assertion-add" || action.kind === "assertion-revise") {
      byAlias.set(action.alias, {
        assertionId: action.assertionId,
        revisionId: action.revisionId,
      });
    }
  }
  return byAlias;
}

async function writeDraft(stateRoot, draft) {
  await privateFile(path.join(stateRoot, "draft", "STATE.json"), canonicalJson(draft));
}

function projectionPaths(metadata, canonical) {
  if (canonical.horizons.length === 0) return [];
  const paths = ["current/DOSSIER.md", "current/VIEW.json"];
  for (const name of metadata.requestedAsOf) {
    paths.push(`as-of/${name}/DOSSIER.md`, `as-of/${name}/VIEW.json`);
  }
  return paths.sort(compareUtf8);
}

function recordsThroughHorizon(canonical, horizonName) {
  const horizon = canonical.horizons.find((item) => item.name === horizonName);
  if (horizon === undefined) reject("HORIZON_NOT_FOUND");
  const end = canonical.records.findIndex(
    (record) => record.recordSha256 === horizon.headSha256,
  );
  if (end < 0) reject("CANONICAL_INTEGRITY");
  return { horizon, records: canonical.records.slice(0, end + 1) };
}

function buildView(canonical, horizonName) {
  const { horizon, records } = recordsThroughHorizon(canonical, horizonName);
  const sources = new Map();
  const evidence = new Map();
  const assertions = new Map();
  const questions = [];
  const horizons = [];
  for (const record of records) {
    if (record.kind === "SourceSnapshot") sources.set(record.id, record);
    if (record.kind === "EvidenceSpan") evidence.set(record.id, record);
    if (record.kind === "AssertionRevision") {
      assertions.set(record.body.assertionId, record);
    }
    if (record.kind === "QuestionOpened") questions.push(record);
    if (record.kind === "HorizonClosed") {
      const item = canonical.horizons.find((candidate) => candidate.id === record.horizonId);
      horizons.push(item);
    }
  }
  const sourceItems = [...sources.values()].map((record) => ({
    alias: record.body.alias,
    horizonId: record.horizonId,
    logicalPath: record.body.logicalPath,
    sha256: record.body.sha256,
    size: record.body.size,
    sourceId: record.id,
  }));
  const assertionItems = [...assertions.values()].map((record) => {
    const span = evidence.get(record.body.evidenceSpanId);
    const source = sources.get(span.body.sourceId);
    return {
      alias: record.body.alias,
      assertionId: record.body.assertionId,
      evidence: {
        byteEnd: span.body.byteEnd,
        byteStart: span.body.byteStart,
        evidenceSpanId: span.id,
        lineEnd: span.body.lineEnd,
        lineStart: span.body.lineStart,
        logicalPath: source.body.logicalPath,
        sha256: span.body.sha256,
        sourceId: source.id,
      },
      horizonId: record.horizonId,
      predecessorRevisionId: record.body.predecessorRevisionId,
      reason: record.body.reason,
      revisionId: record.id,
      scope: record.body.scope,
      text: record.body.text,
      uncertainty: record.body.uncertainty,
    };
  });
  const questionItems = questions.map((record) => {
    let evidenceValue = null;
    if (record.body.evidenceSpanId !== null) {
      const span = evidence.get(record.body.evidenceSpanId);
      const source = sources.get(span.body.sourceId);
      evidenceValue = {
        byteEnd: span.body.byteEnd,
        byteStart: span.body.byteStart,
        evidenceSpanId: span.id,
        lineEnd: span.body.lineEnd,
        lineStart: span.body.lineStart,
        logicalPath: source.body.logicalPath,
        sha256: span.body.sha256,
        sourceId: source.id,
      };
    }
    return {
      alias: record.body.alias,
      evidence: evidenceValue,
      horizonId: record.horizonId,
      questionId: record.id,
      status: "open",
      text: record.body.text,
    };
  });
  return {
    asOf: {
      closedAt: horizon.closedAt,
      headSha256: horizon.headSha256,
      horizonId: horizon.id,
      name: horizon.name,
    },
    assertions: assertionItems,
    coverage: { mode: horizon.coverage, scope: horizon.scope },
    horizons,
    questions: questionItems,
    schema: viewSchema,
    sources: sourceItems,
    workspace: { owner: canonical.owner, workspaceId: canonical.workspaceId },
  };
}

function quoted(value) {
  return JSON.stringify(value);
}

function renderDossier(view) {
  const lines = [
    "# GraphTruth dossier",
    "",
    `As of horizon ${quoted(view.asOf.name)} (${view.asOf.horizonId}).`,
    `Closed at: ${view.asOf.closedAt}`,
    `Head SHA-256: ${view.asOf.headSha256}`,
    `Owner: ${quoted(view.workspace.owner)}`,
    `Workspace: ${view.workspace.workspaceId}`,
    "",
    "## Horizons",
    "",
  ];
  for (const horizon of view.horizons) {
    lines.push(
      `- ${quoted(horizon.name)}: id=${horizon.id}; coverage=${horizon.coverage}; scope=${quoted(horizon.scope)}; closedAt=${horizon.closedAt}; head=${horizon.headSha256}`,
    );
  }
  lines.push("", "## Sources", "");
  for (const source of view.sources) {
    lines.push(
      `- ${quoted(source.alias)}: path=${quoted(source.logicalPath)}; id=${source.sourceId}; horizon=${source.horizonId}; sha256=${source.sha256}; size=${source.size}`,
    );
  }
  lines.push("", "## Assertions", "");
  for (const assertion of view.assertions) {
    lines.push(
      `### ${quoted(assertion.alias)}`,
      "",
      `- Assertion: ${assertion.assertionId}`,
      `- Revision: ${assertion.revisionId}`,
      `- Predecessor: ${assertion.predecessorRevisionId ?? "none"}`,
      `- Reason: ${quoted(assertion.reason)}`,
      `- Horizon: ${assertion.horizonId}`,
      `- Text: ${quoted(assertion.text)}`,
      `- Scope: ${quoted(assertion.scope)}`,
      `- Uncertainty: ${quoted(assertion.uncertainty)}`,
      `- Evidence: ${assertion.evidence.evidenceSpanId}; source=${assertion.evidence.sourceId}; path=${quoted(assertion.evidence.logicalPath)}; lines=${assertion.evidence.lineStart}:${assertion.evidence.lineEnd}; bytes=${assertion.evidence.byteStart}:${assertion.evidence.byteEnd}; sha256=${assertion.evidence.sha256}`,
      "",
    );
  }
  lines.push("## Open questions", "");
  for (const question of view.questions) {
    lines.push(
      `### ${quoted(question.alias)}`,
      "",
      `- Question: ${question.questionId}`,
      `- Horizon: ${question.horizonId}`,
      `- Status: ${question.status}`,
      `- Text: ${quoted(question.text)}`,
      `- Evidence: ${
        question.evidence === null
          ? "none"
          : `${question.evidence.evidenceSpanId}; source=${question.evidence.sourceId}; path=${quoted(question.evidence.logicalPath)}; lines=${question.evidence.lineStart}:${question.evidence.lineEnd}; bytes=${question.evidence.byteStart}:${question.evidence.byteEnd}; sha256=${question.evidence.sha256}`
      }`,
      "",
    );
  }
  return Buffer.from(`${lines.join("\n")}\n`, "utf8");
}

function expectedProjectionMap(canonical, metadata) {
  const map = new Map();
  if (canonical.horizons.length === 0) return map;
  const currentName = canonical.horizons.at(-1).name;
  const pairs = [["current", currentName]];
  for (const name of metadata.requestedAsOf) pairs.push([`as-of/${name}`, name]);
  for (const [prefix, name] of pairs) {
    const view = buildView(canonical, name);
    map.set(`${prefix}/VIEW.json`, canonicalJson(view));
    map.set(`${prefix}/DOSSIER.md`, renderDossier(view));
  }
  return map;
}

async function projectionInventory(stateRoot) {
  try {
    return await treeInventory(path.join(stateRoot, "derived"));
  } catch (error) {
    if (error instanceof WorkbenchError) return null;
    throw error;
  }
}

async function projectionDirectoryInventory(stateRoot) {
  try {
    return (await treeEntries(path.join(stateRoot, "derived")))
      .filter((item) => item.type === "directory")
      .map((item) => item.path);
  } catch (error) {
    if (error instanceof WorkbenchError) return null;
    throw error;
  }
}

async function projectionModesArePrivate(stateRoot) {
  try {
    const rootStat = await lstat(path.join(stateRoot, "derived"));
    const entries = await treeEntries(path.join(stateRoot, "derived"));
    return (
      (rootStat.mode & 0o777) === 0o700 &&
      entries.every((item) =>
        item.type === "directory" ? item.mode === 0o700 : item.mode === 0o600,
      )
    );
  } catch {
    return false;
  }
}

function expectedProjectionDirectories(expectedPaths) {
  const directories = new Set();
  for (const item of expectedPaths) {
    let current = path.posix.dirname(item);
    while (current !== ".") {
      directories.add(current);
      current = path.posix.dirname(current);
    }
  }
  return [...directories].sort(compareUtf8);
}

async function projectionStatus(workspace) {
  const actual = await projectionInventory(workspace.stateRoot);
  const actualDirectories = await projectionDirectoryInventory(workspace.stateRoot);
  if (actual === null || actualDirectories === null) return "invalid";
  if (
    !(await projectionModesArePrivate(workspace.stateRoot)) ||
    actual.some((item) => item.mode !== 0o600)
  ) {
    return "invalid";
  }
  if (actual.length === 0 && actualDirectories.length === 0) return "absent";
  const expected = expectedProjectionMap(workspace.canonical, workspace.metadata);
  const expectedDirectories = expectedProjectionDirectories([...expected.keys()]);
  if (
    actual.length !== expected.size ||
    actualDirectories.length !== expectedDirectories.length ||
    actualDirectories.some((item, index) => item !== expectedDirectories[index])
  ) {
    return "invalid";
  }
  const actualMap = new Map(actual.map((item) => [item.path, item.bytes]));
  const mismatched = actual.filter((item) => {
    const expectedBytes = expected.get(item.path);
    return expectedBytes === undefined || !item.bytes.equals(expectedBytes);
  });
  if (mismatched.length > 0) {
    try {
      const currentViewBytes = actualMap.get("current/VIEW.json");
      const currentDossierBytes = actualMap.get("current/DOSSIER.md");
      const currentView = JSON.parse(currentViewBytes.toString("utf8"));
      const priorHeads = new Set(
        workspace.canonical.horizons
          .slice(0, -1)
          .map((horizon) => horizon.headSha256),
      );
      const otherFilesCurrent = actual.every(
        (item) =>
          item.path.startsWith("current/") ||
          item.bytes.equals(expected.get(item.path)),
      );
      if (
        currentViewBytes.equals(canonicalJson(currentView)) &&
        currentDossierBytes.equals(renderDossier(currentView)) &&
        priorHeads.has(currentView?.asOf?.headSha256) &&
        otherFilesCurrent
      ) {
        return "stale";
      }
    } catch {
      // Invalid is returned below.
    }
    return "invalid";
  }
  for (const item of actual) {
    const expectedBytes = expected.get(item.path);
    if (expectedBytes === undefined || !item.bytes.equals(expectedBytes)) {
      return "invalid";
    }
  }
  return "current";
}

async function requireUsableProjections(workspace) {
  const status = await projectionStatus(workspace);
  if (status === "invalid" || status === "stale") reject("PROJECTION_INTEGRITY");
  return status;
}

async function assertOnlySupportedProjectionFiles(workspace) {
  const actual = await projectionInventory(workspace.stateRoot);
  const directories = await projectionDirectoryInventory(workspace.stateRoot);
  if (actual === null || directories === null) reject("PROJECTION_INTEGRITY");
  const supported = new Set(projectionPaths(workspace.metadata, workspace.canonical));
  const supportedDirectories = new Set(
    expectedProjectionDirectories([...supported]),
  );
  if (actual.some((item) => !supported.has(item.path))) {
    reject("PROJECTION_INTEGRITY");
  }
  if (directories.some((item) => !supportedDirectories.has(item))) {
    reject("PROJECTION_INTEGRITY");
  }
}

async function replaceDerived(stateRoot, canonical, metadata) {
  const derived = path.join(stateRoot, "derived");
  await rm(derived, { force: true, recursive: true });
  await privateDirectory(derived);
  const expected = expectedProjectionMap(canonical, metadata);
  for (const [relative, bytes] of [...expected].sort(([left], [right]) => compareUtf8(left, right))) {
    const filename = path.join(derived, ...relative.split("/"));
    await privateDirectory(path.dirname(filename));
    await privateFile(filename, bytes);
    if (!(await readFile(filename)).equals(bytes)) {
      reject("ATOMIC_PUBLICATION");
    }
  }
  return [...expected.keys()].sort(compareUtf8);
}

function resultKeys(value, keys) {
  if (Object.keys(value).join("\0") !== keys.join("\0")) reject("INTERNAL");
  return value;
}

export async function initializeWorkspace({ owner, root }, internal = {}) {
  validateAlias(owner);
  root = path.resolve(root);
  if (await exists(root)) reject("ALREADY_INITIALIZED");
  const parent = path.dirname(root);
  await verifyRealDirectory(parent, "UNSAFE_SOURCE");
  const temporaryRoot = path.join(parent, `.${path.basename(root)}.init-${randomUUID()}`);
  const taken = new Set();
  const workspaceId = generatedId("wrk", taken, internal.services);
  const recordedAt = generatedTimestamp(internal.services);
  try {
    await mkdir(temporaryRoot, { mode: 0o700 });
    await chmod(temporaryRoot, 0o700);
    const statesRoot = path.join(temporaryRoot, ".states");
    await privateDirectory(statesRoot);
    const stage = path.join(statesRoot, `.stage-${randomUUID()}`);
    await privateDirectory(path.join(stage, "canonical", "snapshots"));
    await privateDirectory(path.join(stage, "draft"));
    await privateDirectory(path.join(stage, "derived"));
    const records = [];
    appendRecord(records, {
      body: { owner },
      horizonId: null,
      id: workspaceId,
      kind: "WorkspaceInitialized",
      recordedAt,
    });
    await writeCanonical(stage, {
      horizons: [],
      owner,
      records,
      workspaceId,
    });
    await writeMetadata(stage, {
      owner,
      requestedAsOf: [],
      workspaceId,
    });
    const finalized = await finalizeState(stage);
    await validateStagedState(stage);
    const generationSuffix = randomUUID().replaceAll("-", "").toLowerCase();
    const stateName = `state-${finalized.identity}-${generationSuffix}`;
    await rename(stage, path.join(statesRoot, stateName));
    await symlink(`.states/${stateName}`, path.join(temporaryRoot, ".active"));
    await symlink(".active/canonical", path.join(temporaryRoot, "canonical"));
    await symlink(".active/draft", path.join(temporaryRoot, "draft"));
    await symlink(".active/derived", path.join(temporaryRoot, "derived"));
    await rename(temporaryRoot, root);
    return resultKeys({ workspaceId, owner }, ["workspaceId", "owner"]);
  } catch (error) {
    await rm(temporaryRoot, { force: true, recursive: true }).catch(() => {});
    if (error?.code === "EEXIST") reject("ALREADY_INITIALIZED");
    throw error;
  }
}

export async function openHorizon(
  { coverage = "partial", name, root, scope = null, sourceRoot },
  internal = {},
) {
  validateAlias(name);
  if (!new Set(["partial", "closed-selection"]).has(coverage)) reject("USAGE");
  if (scope !== null) nonEmptyText(scope);
  if (coverage === "closed-selection" && scope === null) reject("USAGE");
  return withWriter(root, async (workspace) => {
    if (workspace.draft !== null) reject("HORIZON_ALREADY_OPEN");
    if (workspace.canonical.aliases.horizon.has(name)) reject("INVALID_ALIAS");
    await requireUsableProjections(workspace);
    const realSourceRoot = await verifyRealDirectory(path.resolve(sourceRoot));
    const realWorkspaceRoot = await realpath(workspace.root);
    if (pathsOverlap(realWorkspaceRoot, realSourceRoot)) reject("UNSAFE_SOURCE");
    const taken = allTakenIds(workspace.canonical, null);
    const horizonId = generatedId("hor", taken, internal.services);
    const openedAt = generatedTimestamp(internal.services);
    const draft = {
      actions: [],
      coverage,
      horizonId,
      name,
      openedAt,
      schema: draftSchema,
      scope,
      sourceRoot: realSourceRoot,
    };
    await publishMutation(
      workspace,
      async (stage) => {
        await writeDraft(stage, draft);
      },
      internal.hooks,
    );
    return resultKeys({ horizonId, name, coverage, scope }, [
      "horizonId",
      "name",
      "coverage",
      "scope",
    ]);
  });
}

export async function addSource({ alias, logicalPath, root }, internal = {}) {
  validateAlias(alias);
  validateLogicalPath(logicalPath);
  return withWriter(root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    if (workspace.canonical.aliases.source.has(alias)) reject("INVALID_ALIAS");
    const draft = structuredClone(workspace.draft);
    if (sourceActions(draft).some((source) => source.alias === alias)) {
      reject("INVALID_ALIAS");
    }
    const selected = await readSelectedFile(draft.sourceRoot, logicalPath);
    const identityKey = canonicalJson(selected.identity).toString("utf8");
    if (
      sourceActions(draft).some(
        (source) =>
          source.logicalPath === logicalPath ||
          source.sha256 === selected.sha256 ||
          canonicalJson(source.identity).toString("utf8") === identityKey,
      )
    ) {
      reject("DUPLICATE_SOURCE");
    }
    const taken = allTakenIds(workspace.canonical, draft);
    const sourceId = generatedId("src", taken, internal.services);
    const action = {
      alias,
      capturedFile: `sources/${sourceId}.bin`,
      identity: selected.identity,
      kind: "source",
      logicalPath,
      recordedAt: generatedTimestamp(internal.services),
      sha256: selected.sha256,
      size: selected.bytes.length,
      sourceId,
    };
    draft.actions.push(action);
    await publishMutation(
      workspace,
      async (stage) => {
        const captured = path.join(stage, "draft", action.capturedFile);
        await privateDirectory(path.dirname(captured));
        await privateFile(captured, selected.bytes);
        await writeDraft(stage, draft);
      },
      internal.hooks,
    );
    return resultKeys(
      { sourceId, logicalPath, sha256: selected.sha256, size: selected.bytes.length },
      ["sourceId", "logicalPath", "sha256", "size"],
    );
  });
}

function validateOptionalText(value) {
  if (value !== null) nonEmptyText(value);
}

async function appendAssertionAction(
  workspace,
  {
    alias,
    firstLine,
    kind,
    lastLine,
    reason = null,
    scope = null,
    sourceAlias,
    text,
    uncertainty = null,
  },
  internal,
) {
  validateAlias(alias);
  validateAlias(sourceAlias);
  nonEmptyText(text);
  validateOptionalText(scope);
  validateOptionalText(uncertainty);
  if (kind === "assertion-revise") nonEmptyText(reason);
  safeLineRange(firstLine, lastLine);
  const draft = structuredClone(workspace.draft);
  const source = sourceByAlias(draft, sourceAlias);
  if (source === undefined) reject("REFERENCE_NOT_FOUND");
  const sourceBytes = await readFile(path.join(workspace.stateRoot, "draft", source.capturedFile));
  lineSpan(sourceBytes, firstLine, lastLine);
  const assertions = assertionState(workspace.canonical, draft);
  const taken = allTakenIds(workspace.canonical, draft);
  let assertionId;
  let predecessorRevisionId = null;
  if (kind === "assertion-add") {
    if (assertions.has(alias)) reject("INVALID_ALIAS");
    assertionId = generatedId("ast", taken, internal.services);
  } else {
    const current = assertions.get(alias);
    if (current === undefined) reject("REFERENCE_NOT_FOUND");
    assertionId = current.assertionId;
    predecessorRevisionId = current.revisionId;
  }
  const revisionId = generatedId("rev", taken, internal.services);
  const evidenceSpanId = generatedId("evd", taken, internal.services);
  draft.actions.push({
    alias,
    assertionId,
    evidenceSpanId,
    kind,
    lineEnd: lastLine,
    lineStart: firstLine,
    ...(kind === "assertion-revise" ? { predecessorRevisionId } : {}),
    ...(kind === "assertion-revise" ? { reason } : {}),
    recordedAt: generatedTimestamp(internal.services),
    revisionId,
    scope,
    sourceAlias,
    text,
    uncertainty,
  });
  await publishMutation(
    workspace,
    async (stage) => writeDraft(stage, draft),
    internal.hooks,
  );
  if (kind === "assertion-add") {
    return resultKeys({ assertionId, revisionId, evidenceSpanId }, [
      "assertionId",
      "revisionId",
      "evidenceSpanId",
    ]);
  }
  return resultKeys(
    { assertionId, revisionId, predecessorRevisionId, evidenceSpanId },
    ["assertionId", "revisionId", "predecessorRevisionId", "evidenceSpanId"],
  );
}

export async function addAssertion(options, internal = {}) {
  return withWriter(options.root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    return appendAssertionAction(
      workspace,
      { ...options, kind: "assertion-add" },
      internal,
    );
  });
}

export async function reviseAssertion(options, internal = {}) {
  return withWriter(options.root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    return appendAssertionAction(
      workspace,
      { ...options, alias: options.assertionAlias, kind: "assertion-revise" },
      internal,
    );
  });
}

export async function addQuestion(
  { alias, firstLine = null, lastLine = null, root, sourceAlias = null, text },
  internal = {},
) {
  validateAlias(alias);
  nonEmptyText(text);
  if ((sourceAlias === null) !== (firstLine === null || lastLine === null)) {
    reject("USAGE");
  }
  if (sourceAlias !== null) {
    validateAlias(sourceAlias);
    safeLineRange(firstLine, lastLine);
  }
  return withWriter(root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    if (workspace.canonical.aliases.question.has(alias)) reject("INVALID_ALIAS");
    const draft = structuredClone(workspace.draft);
    if (draft.actions.some((action) => action.kind === "question" && action.alias === alias)) {
      reject("INVALID_ALIAS");
    }
    let source = null;
    if (sourceAlias !== null) {
      source = sourceByAlias(draft, sourceAlias);
      if (source === undefined) reject("REFERENCE_NOT_FOUND");
      const sourceBytes = await readFile(
        path.join(workspace.stateRoot, "draft", source.capturedFile),
      );
      lineSpan(sourceBytes, firstLine, lastLine);
    }
    const taken = allTakenIds(workspace.canonical, draft);
    const questionId = generatedId("qst", taken, internal.services);
    const evidenceSpanId =
      source === null ? null : generatedId("evd", taken, internal.services);
    draft.actions.push({
      alias,
      evidenceSpanId,
      kind: "question",
      lineEnd: source === null ? null : lastLine,
      lineStart: source === null ? null : firstLine,
      questionId,
      recordedAt: generatedTimestamp(internal.services),
      sourceAlias,
      text,
    });
    await publishMutation(
      workspace,
      async (stage) => writeDraft(stage, draft),
      internal.hooks,
    );
    return resultKeys({ questionId, evidenceSpanId }, [
      "questionId",
      "evidenceSpanId",
    ]);
  });
}

export async function undoDraft({ root }, internal = {}) {
  return withWriter(root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    const draft = structuredClone(workspace.draft);
    const action = draft.actions.pop();
    if (action === undefined) reject("REFERENCE_NOT_FOUND");
    if (action.kind === "source") {
      if (draft.actions.some((item) => item.sourceAlias === action.alias)) {
        reject("REFERENCE_NOT_FOUND");
      }
    }
    const undoneKind =
      action.kind === "assertion-add"
        ? "assertion"
        : action.kind === "assertion-revise"
          ? "assertion-revision"
          : action.kind;
    const undoneAlias = action.alias;
    await publishMutation(
      workspace,
      async (stage) => {
        if (action.kind === "source") {
          await rm(path.join(stage, "draft", action.capturedFile), { force: true });
          if (sourceActions(draft).length === 0) {
            await rm(path.join(stage, "draft", "sources"), {
              force: true,
              recursive: true,
            });
          }
        }
        await writeDraft(stage, draft);
      },
      internal.hooks,
    );
    return resultKeys({ undoneKind, undoneAlias }, ["undoneKind", "undoneAlias"]);
  });
}

export async function abortHorizon({ root }, internal = {}) {
  return withWriter(root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    const { horizonId, name } = workspace.draft;
    await publishMutation(
      workspace,
      async (stage) => {
        await rm(path.join(stage, "draft"), { force: true, recursive: true });
        await privateDirectory(path.join(stage, "draft"));
      },
      internal.hooks,
    );
    return resultKeys({ horizonId, name }, ["horizonId", "name"]);
  });
}

async function revalidateDraftSources(workspace) {
  const retained = new Map();
  for (const source of sourceActions(workspace.draft)) {
    const current = await readSelectedFile(workspace.draft.sourceRoot, source.logicalPath);
    const captured = await readFile(
      path.join(workspace.stateRoot, "draft", source.capturedFile),
    );
    if (
      !sameIdentity(current.identity, source.identity) ||
      current.sha256 !== source.sha256 ||
      !current.bytes.equals(captured)
    ) {
      reject("SOURCE_CHANGED");
    }
    retained.set(source.alias, captured);
  }
  return retained;
}

function appendEvidenceAndSemantic(records, draft, action, retained) {
  const source = sourceByAlias(draft, action.sourceAlias);
  const span = lineSpan(retained.get(source.alias), action.lineStart, action.lineEnd);
  appendRecord(records, {
    body: {
      byteEnd: span.byteEnd,
      byteStart: span.byteStart,
      lineEnd: action.lineEnd,
      lineStart: action.lineStart,
      sha256: span.sha256,
      sourceId: source.sourceId,
    },
    horizonId: draft.horizonId,
    id: action.evidenceSpanId,
    kind: "EvidenceSpan",
    recordedAt: action.recordedAt,
  });
  if (action.kind === "assertion-add" || action.kind === "assertion-revise") {
    appendRecord(records, {
      body: {
        alias: action.alias,
        assertionId: action.assertionId,
        evidenceSpanId: action.evidenceSpanId,
        predecessorRevisionId:
          action.kind === "assertion-revise" ? action.predecessorRevisionId : null,
        reason: action.kind === "assertion-revise" ? action.reason : null,
        scope: action.scope,
        text: action.text,
        uncertainty: action.uncertainty,
      },
      horizonId: draft.horizonId,
      id: action.revisionId,
      kind: "AssertionRevision",
      recordedAt: action.recordedAt,
    });
  } else {
    appendRecord(records, {
      body: {
        alias: action.alias,
        evidenceSpanId: action.evidenceSpanId,
        status: "open",
        text: action.text,
      },
      horizonId: draft.horizonId,
      id: action.questionId,
      kind: "QuestionOpened",
      recordedAt: action.recordedAt,
    });
  }
}

export async function closeHorizon({ root }, internal = {}) {
  return withWriter(root, async (workspace) => {
    if (workspace.draft === null) reject("NO_OPEN_HORIZON");
    await requireUsableProjections(workspace);
    const sources = sourceActions(workspace.draft);
    if (sources.length === 0) reject("REFERENCE_NOT_FOUND");
    const retained = await revalidateDraftSources(workspace);
    const records = structuredClone(workspace.canonical.records);
    const closedAt = generatedTimestamp(internal.services);
    appendRecord(records, {
      body: {
        coverage: workspace.draft.coverage,
        name: workspace.draft.name,
        scope: workspace.draft.scope,
      },
      horizonId: workspace.draft.horizonId,
      id: workspace.draft.horizonId,
      kind: "HorizonOpened",
      recordedAt: workspace.draft.openedAt,
    });
    for (const source of [...sources].sort((left, right) =>
      compareUtf8(left.logicalPath, right.logicalPath),
    )) {
      appendRecord(records, {
        body: {
          alias: source.alias,
          identity: source.identity,
          logicalPath: source.logicalPath,
          sha256: source.sha256,
          size: source.size,
          snapshotPath: `snapshots/${source.sha256}.bin`,
        },
        horizonId: workspace.draft.horizonId,
        id: source.sourceId,
        kind: "SourceSnapshot",
        recordedAt: source.recordedAt,
      });
    }
    for (const action of workspace.draft.actions) {
      if (action.kind === "source") continue;
      if (action.kind === "question" && action.evidenceSpanId === null) {
        appendRecord(records, {
          body: {
            alias: action.alias,
            evidenceSpanId: null,
            status: "open",
            text: action.text,
          },
          horizonId: workspace.draft.horizonId,
          id: action.questionId,
          kind: "QuestionOpened",
          recordedAt: action.recordedAt,
        });
      } else {
        appendEvidenceAndSemantic(records, workspace.draft, action, retained);
      }
    }
    const taken = allTakenIds(workspace.canonical, workspace.draft);
    const closeId = generatedId("cls", taken, internal.services);
    const closeRecord = appendRecord(records, {
      body: {
        coverage: workspace.draft.coverage,
        name: workspace.draft.name,
        scope: workspace.draft.scope,
      },
      horizonId: workspace.draft.horizonId,
      id: closeId,
      kind: "HorizonClosed",
      recordedAt: closedAt,
    });
    if (records.length > limits.canonicalRecords) reject("LIMIT_EXCEEDED");
    const horizons = [
      ...workspace.canonical.horizons,
      {
        closedAt,
        coverage: workspace.draft.coverage,
        headSha256: closeRecord.recordSha256,
        id: workspace.draft.horizonId,
        name: workspace.draft.name,
        scope: workspace.draft.scope,
      },
    ];
    const futureCanonical = {
      ...workspace.canonical,
      horizons,
      records,
    };
    await publishMutation(
      workspace,
      async (stage) => {
        for (const source of sources) {
          const destination = path.join(
            stage,
            "canonical",
            "snapshots",
            `${source.sha256}.bin`,
          );
          if (!(await exists(destination))) {
            await privateFile(destination, retained.get(source.alias));
          }
        }
        await writeCanonical(stage, futureCanonical);
        await rm(path.join(stage, "draft"), { force: true, recursive: true });
        await privateDirectory(path.join(stage, "draft"));
        await replaceDerived(stage, futureCanonical, workspace.metadata);
      },
      internal.hooks,
    );
    const snapshotCount = new Set(
      records
        .filter((record) => record.kind === "SourceSnapshot")
        .map((record) => record.body.sha256),
    ).size;
    return resultKeys(
      {
        horizonId: workspace.draft.horizonId,
        headSha256: closeRecord.recordSha256,
        recordCount: records.length,
        snapshotCount,
      },
      ["horizonId", "headSha256", "recordCount", "snapshotCount"],
    );
  });
}

export async function verifyWorkspace({ root }) {
  if (await exists(path.join(path.resolve(root), ".writer.lock"))) {
    reject("CONCURRENT_WRITER");
  }
  const workspace = await loadWorkspace(root);
  const status = await projectionStatus(workspace);
  return resultKeys(
    {
      headSha256: workspace.canonical.head.headSha256,
      canonicalRecordCount: workspace.canonical.records.length,
      projectionStatus: status,
    },
    ["headSha256", "canonicalRecordCount", "projectionStatus"],
  );
}

export async function publishDossier({ horizonName, root }, internal = {}) {
  validateAlias(horizonName);
  return withWriter(root, async (workspace) => {
    if (!workspace.canonical.horizons.some((item) => item.name === horizonName)) {
      reject("HORIZON_NOT_FOUND");
    }
    await requireUsableProjections(workspace);
    const requestedAsOf = [...new Set([...workspace.metadata.requestedAsOf, horizonName])].sort(
      compareUtf8,
    );
    const metadata = metadataValue({ ...workspace.metadata, requestedAsOf });
    await publishMutation(
      workspace,
      async (stage) => {
        await writeMetadata(stage, metadata);
        await replaceDerived(stage, workspace.canonical, metadata);
      },
      internal.hooks,
    );
    const horizon = workspace.canonical.horizons.find((item) => item.name === horizonName);
    return resultKeys(
      {
        horizonId: horizon.id,
        viewPath: `derived/as-of/${horizonName}/VIEW.json`,
        dossierPath: `derived/as-of/${horizonName}/DOSSIER.md`,
      },
      ["horizonId", "viewPath", "dossierPath"],
    );
  });
}

export async function rebuildProjections({ root }, internal = {}) {
  return withWriter(root, async (workspace) => {
    await assertOnlySupportedProjectionFiles(workspace);
    const rebuiltFiles = projectionPaths(workspace.metadata, workspace.canonical).map(
      (item) => `derived/${item}`,
    );
    await publishMutation(
      workspace,
      async (stage) => {
        await replaceDerived(stage, workspace.canonical, workspace.metadata);
      },
      internal.hooks,
    );
    return resultKeys(
      {
        headSha256: workspace.canonical.head.headSha256,
        rebuiltFiles,
      },
      ["headSha256", "rebuiltFiles"],
    );
  });
}

export const testing = Object.freeze({
  buildView,
  expectedProjectionMap,
  lineSpan,
  loadWorkspace,
  projectionStatus,
  renderDossier,
});
