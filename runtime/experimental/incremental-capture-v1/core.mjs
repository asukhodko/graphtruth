import { createHash, randomUUID } from "node:crypto";
import {
  constants,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

export const controlFormat =
  "graphtruth.experimental.incremental-capture-control.v1";
export const recordFormat =
  "graphtruth.experimental.incremental-capture-record.v1";
export const viewFormat =
  "graphtruth.experimental.incremental-capture-view.v1";
export const projectionManifestFormat =
  "graphtruth.experimental.incremental-capture-projection.v1";

const maximumRecords = 64;
const maximumFiles = 96;
const maximumBytes = 2 * 1024 * 1024;
const sha256Pattern = /^[a-f0-9]{64}$/;
const sha1Pattern = /^[a-f0-9]{40}$/;
const opaqueIdPattern = /^[A-Za-z0-9][A-Za-z0-9.-]{0,127}$/;
const timestampPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const recordKinds = new Set([
  "CorpusOpened",
  "SourceSnapshot",
  "SourceAbsence",
  "EvidenceSpan",
  "AssertionRevision",
  "QuestionOpened",
  "HorizonClosed",
  "CorpusClosed",
]);

export class IncrementalCaptureError extends Error {
  constructor(code, detail = "") {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "IncrementalCaptureError";
    this.code = code;
  }
}

function reject(code, detail = "") {
  throw new IncrementalCaptureError(code, detail);
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return Buffer.from(`${JSON.stringify(normalize(value))}\n`, "utf8");
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function assertString(value, code = "SHAPE_INVALID") {
  if (typeof value !== "string" || value.length === 0) reject(code);
}

function assertInteger(value, code = "SHAPE_INVALID") {
  if (!Number.isSafeInteger(value) || value < 0) reject(code);
}

function assertOpaqueId(value, code = "ID_INVALID") {
  if (typeof value !== "string" || !opaqueIdPattern.test(value)) reject(code);
}

function assertSha256(value, code = "SHA256_INVALID") {
  if (typeof value !== "string" || !sha256Pattern.test(value)) reject(code);
}

function assertSha1(value, code = "SHA1_INVALID") {
  if (typeof value !== "string" || !sha1Pattern.test(value)) reject(code);
}

function assertTimestamp(value, code = "TIMESTAMP_INVALID") {
  if (
    typeof value !== "string" ||
    !timestampPattern.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    reject(code);
  }
}

function assertSafeRelativePath(value, code = "PATH_UNSAFE") {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    reject(code);
  }
}

function assertDescendant(root, candidate, code = "OUTPUT_PATH_UNSAFE") {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  if (
    relative === "" ||
    relative.startsWith(`..${path.sep}`) ||
    relative === ".." ||
    path.isAbsolute(relative)
  ) {
    reject(code);
  }
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

async function readRegularNoFollow(filename, limit = maximumBytes) {
  let handle;
  try {
    handle = await open(
      filename,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW === undefined ? 0 : constants.O_NOFOLLOW),
    );
  } catch (error) {
    if (error?.code === "ELOOP") reject("PATH_UNSAFE");
    throw error;
  }
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size > limit) reject("FILE_INVALID");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      bytes.length !== before.size ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    ) {
      reject("FILE_CHANGED_DURING_READ");
    }
    const current = await lstat(filename);
    if (
      current.isSymbolicLink() ||
      !current.isFile() ||
      current.dev !== before.dev ||
      current.ino !== before.ino
    ) {
      reject("PATH_UNSAFE");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

function decodeUtf8(bytes) {
  try {
    const text = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: false,
    }).decode(bytes);
    if (text.startsWith("\uFEFF")) reject("UTF8_INVALID");
    return text;
  } catch (error) {
    if (error instanceof IncrementalCaptureError) throw error;
    reject("UTF8_INVALID");
  }
}

async function readJson(filename) {
  const bytes = await readRegularNoFollow(filename);
  try {
    return { bytes, value: JSON.parse(decodeUtf8(bytes)) };
  } catch {
    reject("JSON_INVALID", path.basename(filename));
  }
}

async function listFiles(root) {
  const rootStat = await lstat(root).catch(() => reject("ROOT_INVALID"));
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    reject("ROOT_INVALID");
  }
  const files = [];
  let bytes = 0;
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      assertSafeRelativePath(relative);
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink()) reject("PATH_UNSAFE");
      if (stat.isDirectory()) {
        await visit(filename, relative);
      } else if (stat.isFile()) {
        files.push(relative);
        bytes += stat.size;
        if (files.length > maximumFiles || bytes > maximumBytes) {
          reject("BUDGET_EXCEEDED");
        }
      } else {
        reject("PATH_UNSAFE");
      }
    }
  }
  await visit(root, "");
  return { files, bytes };
}

function validateSourceManifest(manifest) {
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    Array.isArray(manifest) ||
    manifest.status !== "frozen" ||
    manifest.closedCorpus === null ||
    typeof manifest.closedCorpus !== "object"
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  const corpus = manifest.closedCorpus;
  if (
    !Array.isArray(corpus.paths) ||
    corpus.paths.length === 0 ||
    !Array.isArray(corpus.horizonOrder) ||
    corpus.horizonOrder.length !== 2 ||
    corpus.horizonOrder[0] !== "H1" ||
    corpus.horizonOrder[1] !== "H2" ||
    !Array.isArray(corpus.inventory) ||
    corpus.inventory.length !== 2
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  const paths = new Set();
  for (const sourcePath of corpus.paths) {
    assertSafeRelativePath(sourcePath, "SOURCE_MANIFEST_INVALID");
    if (paths.has(sourcePath)) reject("SOURCE_MANIFEST_INVALID");
    paths.add(sourcePath);
  }
  const horizons = new Set();
  let presentFiles = 0;
  let presentBytes = 0;
  for (const horizon of corpus.inventory) {
    if (
      horizon === null ||
      typeof horizon !== "object" ||
      !corpus.horizonOrder.includes(horizon.horizonId) ||
      horizons.has(horizon.horizonId) ||
      !Array.isArray(horizon.files) ||
      horizon.files.length !== paths.size
    ) {
      reject("SOURCE_MANIFEST_INVALID");
    }
    horizons.add(horizon.horizonId);
    assertSha1(horizon.commitSha1, "SOURCE_MANIFEST_INVALID");
    const seen = new Set();
    for (const file of horizon.files) {
      if (
        file === null ||
        typeof file !== "object" ||
        !paths.has(file.path) ||
        seen.has(file.path) ||
        !["present", "absent"].includes(file.state)
      ) {
        reject("SOURCE_MANIFEST_INVALID");
      }
      seen.add(file.path);
      if (file.state === "present") {
        assertSafeRelativePath(file.snapshotPath, "SOURCE_MANIFEST_INVALID");
        assertSha1(file.gitBlobSha1, "SOURCE_MANIFEST_INVALID");
        assertSha256(file.sha256, "SOURCE_MANIFEST_INVALID");
        assertInteger(file.sizeBytes, "SOURCE_MANIFEST_INVALID");
        presentFiles += 1;
        presentBytes += file.sizeBytes;
      }
    }
  }
  if (
    presentFiles !== corpus.totalPresentFiles ||
    presentBytes !== corpus.totalPresentBytes ||
    presentFiles > maximumFiles ||
    presentBytes > maximumBytes
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  return manifest;
}

async function loadSourceManifest(filename, expectedSha256) {
  assertSha256(expectedSha256);
  const { bytes, value } = await readJson(filename);
  if (sha256(bytes) !== expectedSha256) reject("SOURCE_MANIFEST_HASH_MISMATCH");
  return validateSourceManifest(value);
}

function recordCore({
  body,
  identity,
  kind,
  previousRecordSha256,
  recordedAt,
  sequence,
  sourceHorizonId,
}) {
  return {
    body,
    format: recordFormat,
    identity,
    kind,
    previousRecordSha256,
    recordedAt,
    sequence,
    sourceHorizonId,
  };
}

function makeRecord(fields) {
  const core = recordCore(fields);
  return {
    ...core,
    recordSha256: sha256(canonicalJson(core)),
  };
}

function validateControl(control) {
  if (
    control === null ||
    typeof control !== "object" ||
    Array.isArray(control) ||
    control.format !== controlFormat
  ) {
    reject("CONTROL_INVALID");
  }
  assertOpaqueId(control.identity, "CONTROL_INVALID");
  assertSha256(control.sourceManifestSha256, "CONTROL_INVALID");
  assertSha256(control.contractSha256, "CONTROL_INVALID");
  assertTimestamp(control.createdAt, "CONTROL_INVALID");
  if (
    !Array.isArray(control.horizonOrder) ||
    control.horizonOrder.length !== 2 ||
    control.horizonOrder[0] !== "H1" ||
    control.horizonOrder[1] !== "H2" ||
    !Array.isArray(control.sourcePaths) ||
    control.sourcePaths.length === 0 ||
    control.limits?.maximumRecords !== maximumRecords ||
    control.limits?.maximumFiles !== maximumFiles ||
    control.limits?.maximumBytes !== maximumBytes
  ) {
    reject("CONTROL_INVALID");
  }
  const paths = new Set();
  for (const sourcePath of control.sourcePaths) {
    assertSafeRelativePath(sourcePath, "CONTROL_INVALID");
    if (paths.has(sourcePath)) reject("CONTROL_INVALID");
    paths.add(sourcePath);
  }
  return control;
}

async function readControl(outputRoot) {
  const { bytes, value } = await readJson(path.join(outputRoot, "CONTROL.json"));
  if (!Buffer.from(bytes).equals(canonicalJson(value))) {
    reject("CONTROL_NOT_CANONICAL");
  }
  return validateControl(value);
}

async function readRecords(outputRoot) {
  const bytes = await readRegularNoFollow(
    path.join(outputRoot, "records.jsonl"),
    maximumBytes,
  );
  const text = decodeUtf8(bytes);
  if (!text.endsWith("\n")) reject("RECORD_LOG_INVALID");
  const lines = text.slice(0, -1).split("\n");
  if (lines.length === 1 && lines[0] === "") reject("RECORD_LOG_INVALID");
  if (lines.length > maximumRecords) reject("BUDGET_EXCEEDED");
  return lines.map((line) => {
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      reject("RECORD_LOG_INVALID");
    }
    if (!Buffer.from(`${line}\n`, "utf8").equals(canonicalJson(value))) {
      reject("RECORD_NOT_CANONICAL");
    }
    return value;
  });
}

function stateFromRecords(control, records) {
  const state = {
    assertions: new Map(),
    closedHorizons: new Set(),
    corpusClosed: false,
    evidence: new Map(),
    questions: new Map(),
    revisions: new Map(),
    sources: new Map(),
  };
  let previousHash = null;
  let previousTimestamp = null;
  let highestHorizonIndex = 0;
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (
      record === null ||
      typeof record !== "object" ||
      Array.isArray(record) ||
      record.format !== recordFormat ||
      record.identity !== control.identity ||
      !recordKinds.has(record.kind) ||
      record.sequence !== index + 1 ||
      record.previousRecordSha256 !== previousHash
    ) {
      reject("RECORD_INVALID", String(index + 1));
    }
    assertTimestamp(record.recordedAt, "RECORD_INVALID");
    if (
      previousTimestamp !== null &&
      Date.parse(record.recordedAt) < Date.parse(previousTimestamp)
    ) {
      reject("RECORD_TIME_REVERSED");
    }
    const core = recordCore(record);
    if (
      typeof record.recordSha256 !== "string" ||
      record.recordSha256 !== sha256(canonicalJson(core))
    ) {
      reject("RECORD_HASH_MISMATCH");
    }
    if (
      record.kind === "CorpusOpened" ||
      record.kind === "CorpusClosed"
    ) {
      if (record.sourceHorizonId !== null) reject("HORIZON_INVALID");
    } else if (!control.horizonOrder.includes(record.sourceHorizonId)) {
      reject("HORIZON_INVALID");
    }
    const horizonIndex =
      record.sourceHorizonId === null
        ? -1
        : control.horizonOrder.indexOf(record.sourceHorizonId);
    if (
      horizonIndex >= 0 &&
      horizonIndex < highestHorizonIndex &&
      record.kind !== "HorizonClosed"
    ) {
      reject("HORIZON_REOPENED");
    }
    if (state.corpusClosed) reject("CORPUS_ALREADY_CLOSED");
    const body = record.body;
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      reject("RECORD_INVALID");
    }
    if (record.kind === "CorpusOpened") {
      if (index !== 0) reject("CORPUS_OPEN_INVALID");
    } else if (index === 0) {
      reject("CORPUS_OPEN_INVALID");
    }
    if (record.kind === "SourceSnapshot" || record.kind === "SourceAbsence") {
      if (state.closedHorizons.has(record.sourceHorizonId)) {
        reject("HORIZON_CLOSED");
      }
      assertSafeRelativePath(body.path);
      const sourceKey = `${record.sourceHorizonId}:${body.path}`;
      if (
        !control.sourcePaths.includes(body.path) ||
        state.sources.has(sourceKey)
      ) {
        reject("SOURCE_INVALID");
      }
      if (record.kind === "SourceSnapshot") {
        assertOpaqueId(body.sourceId, "SOURCE_INVALID");
        assertSafeRelativePath(body.snapshotPath, "SOURCE_INVALID");
        assertSha1(body.gitBlobSha1, "SOURCE_INVALID");
        assertSha256(body.sha256, "SOURCE_INVALID");
        assertInteger(body.sizeBytes, "SOURCE_INVALID");
      } else if (body.state !== "absent") {
        reject("SOURCE_INVALID");
      }
      state.sources.set(sourceKey, record);
      highestHorizonIndex = Math.max(highestHorizonIndex, horizonIndex);
    } else if (record.kind === "EvidenceSpan") {
      if (state.closedHorizons.has(record.sourceHorizonId)) {
        reject("HORIZON_CLOSED");
      }
      assertOpaqueId(body.spanId, "EVIDENCE_INVALID");
      assertSafeRelativePath(body.path, "EVIDENCE_INVALID");
      assertInteger(body.lineStart, "EVIDENCE_INVALID");
      assertInteger(body.lineEnd, "EVIDENCE_INVALID");
      assertInteger(body.byteStart, "EVIDENCE_INVALID");
      assertInteger(body.byteEndExclusive, "EVIDENCE_INVALID");
      assertSha256(body.sha256, "EVIDENCE_INVALID");
      if (
        body.lineStart < 1 ||
        body.lineEnd < body.lineStart ||
        body.byteEndExclusive <= body.byteStart ||
        state.evidence.has(body.spanId) ||
        !state.sources.has(`${record.sourceHorizonId}:${body.path}`) ||
        state.sources.get(`${record.sourceHorizonId}:${body.path}`).kind !==
          "SourceSnapshot"
      ) {
        reject("EVIDENCE_INVALID");
      }
      state.evidence.set(body.spanId, record);
      highestHorizonIndex = Math.max(highestHorizonIndex, horizonIndex);
    } else if (record.kind === "AssertionRevision") {
      if (state.closedHorizons.has(record.sourceHorizonId)) {
        reject("HORIZON_CLOSED");
      }
      assertOpaqueId(body.assertionId, "ASSERTION_INVALID");
      assertOpaqueId(body.revisionId, "ASSERTION_INVALID");
      assertString(body.text, "ASSERTION_INVALID");
      if (
        !Array.isArray(body.evidenceIds) ||
        body.evidenceIds.length === 0 ||
        new Set(body.evidenceIds).size !== body.evidenceIds.length ||
        state.revisions.has(body.revisionId)
      ) {
        reject("ASSERTION_INVALID");
      }
      for (const evidenceId of body.evidenceIds) {
        assertOpaqueId(evidenceId, "ASSERTION_INVALID");
        const evidence = state.evidence.get(evidenceId);
        if (
          !evidence ||
          control.horizonOrder.indexOf(evidence.sourceHorizonId) > horizonIndex
        ) {
          reject("HORIZON_LEAK");
        }
      }
      const previous = state.assertions.get(body.assertionId);
      if (
        (previous === undefined && body.predecessorRevisionId !== null) ||
        (previous !== undefined &&
          body.predecessorRevisionId !== previous.body.revisionId)
      ) {
        reject("REVISION_CHAIN_INVALID");
      }
      state.assertions.set(body.assertionId, record);
      state.revisions.set(body.revisionId, record);
      highestHorizonIndex = Math.max(highestHorizonIndex, horizonIndex);
    } else if (record.kind === "QuestionOpened") {
      if (state.closedHorizons.has(record.sourceHorizonId)) {
        reject("HORIZON_CLOSED");
      }
      assertOpaqueId(body.questionId, "QUESTION_INVALID");
      assertString(body.text, "QUESTION_INVALID");
      if (
        body.status !== "open" ||
        !Array.isArray(body.evidenceIds) ||
        body.evidenceIds.length === 0 ||
        state.questions.has(body.questionId)
      ) {
        reject("QUESTION_INVALID");
      }
      for (const evidenceId of body.evidenceIds) {
        const evidence = state.evidence.get(evidenceId);
        if (
          !evidence ||
          control.horizonOrder.indexOf(evidence.sourceHorizonId) > horizonIndex
        ) {
          reject("HORIZON_LEAK");
        }
      }
      state.questions.set(body.questionId, record);
      highestHorizonIndex = Math.max(highestHorizonIndex, horizonIndex);
    } else if (record.kind === "HorizonClosed") {
      if (
        body.horizonId !== record.sourceHorizonId ||
        state.closedHorizons.has(record.sourceHorizonId)
      ) {
        reject("HORIZON_CLOSE_INVALID");
      }
      const expectedIndex = state.closedHorizons.size;
      if (control.horizonOrder[expectedIndex] !== record.sourceHorizonId) {
        reject("HORIZON_ORDER_INVALID");
      }
      for (const sourcePath of control.sourcePaths) {
        if (!state.sources.has(`${record.sourceHorizonId}:${sourcePath}`)) {
          reject("CORPUS_INCOMPLETE");
        }
      }
      state.closedHorizons.add(record.sourceHorizonId);
      highestHorizonIndex = Math.max(highestHorizonIndex, horizonIndex);
    } else if (record.kind === "CorpusClosed") {
      if (
        state.closedHorizons.size !== control.horizonOrder.length ||
        body.horizonIds?.join(",") !== control.horizonOrder.join(",")
      ) {
        reject("CORPUS_CLOSE_INVALID");
      }
      state.corpusClosed = true;
    }
    previousHash = record.recordSha256;
    previousTimestamp = record.recordedAt;
  }
  if (records[0]?.kind !== "CorpusOpened") reject("CORPUS_OPEN_INVALID");
  return state;
}

async function verifySnapshots(outputRoot, state) {
  for (const record of state.sources.values()) {
    if (record.kind !== "SourceSnapshot") continue;
    const filename = path.join(outputRoot, record.body.snapshotPath);
    assertDescendant(outputRoot, filename);
    const bytes = await readRegularNoFollow(filename);
    if (
      bytes.length !== record.body.sizeBytes ||
      sha256(bytes) !== record.body.sha256
    ) {
      reject("SOURCE_HASH_MISMATCH", record.body.path);
    }
  }
}

export async function verifyStore(outputRoot) {
  const rootStat = await lstat(outputRoot).catch(() => reject("STORE_INVALID"));
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    reject("STORE_INVALID");
  }
  const { files, bytes } = await listFiles(outputRoot);
  if (files.length > maximumFiles || bytes > maximumBytes) {
    reject("BUDGET_EXCEEDED");
  }
  if (!files.includes("CONTROL.json") || !files.includes("records.jsonl")) {
    reject("STORE_INVALID");
  }
  const control = await readControl(outputRoot);
  const records = await readRecords(outputRoot);
  const state = stateFromRecords(control, records);
  const expectedSnapshots = [...state.sources.values()]
    .filter((record) => record.kind === "SourceSnapshot")
    .map((record) => record.body.snapshotPath)
    .sort();
  const actualSnapshots = files
    .filter((filename) => filename.startsWith("snapshots/"))
    .sort();
  if (
    expectedSnapshots.length !== actualSnapshots.length ||
    expectedSnapshots.some(
      (filename, index) => filename !== actualSnapshots[index],
    )
  ) {
    reject("SOURCE_INVENTORY_MISMATCH");
  }
  await verifySnapshots(outputRoot, state);
  await verifyEvidenceBytes(outputRoot, records);
  return {
    bytes,
    control,
    files,
    records,
    state,
    status: "verified",
  };
}

function prepareRecords(verification, fields, additional = {}) {
  if (verification.records.length + fields.length > maximumRecords) {
    reject("BUDGET_EXCEEDED");
  }
  const prepared = [];
  let previous =
    verification.records[verification.records.length - 1]?.recordSha256 ?? null;
  for (const [index, item] of fields.entries()) {
    const record = makeRecord({
      ...item,
      identity: verification.control.identity,
      previousRecordSha256: previous,
      sequence: verification.records.length + index + 1,
    });
    prepared.push(record);
    previous = record.recordSha256;
  }
  stateFromRecords(verification.control, [
    ...verification.records,
    ...prepared,
  ]);
  const recordBytes = Buffer.concat(prepared.map(canonicalJson));
  if (
    verification.bytes +
        recordBytes.length +
        (additional.bytes ?? 0) >
      maximumBytes ||
    verification.files.length + (additional.files ?? 0) > maximumFiles
  ) {
    reject("BUDGET_EXCEEDED");
  }
  return { prepared, recordBytes };
}

async function appendPreparedRecords(outputRoot, prepared) {
  const handle = await open(path.join(outputRoot, "records.jsonl"), "a");
  try {
    await handle.write(prepared.recordBytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function appendRecord(outputRoot, fields) {
  const verification = await verifyStore(outputRoot);
  const prepared = prepareRecords(verification, [fields]);
  await appendPreparedRecords(outputRoot, prepared);
  return prepared.prepared[0];
}

export async function initializeStore({
  contractSha256,
  identity,
  outputRoot,
  recordedAt,
  sourceManifestPath,
  sourceManifestSha256,
}) {
  assertOpaqueId(identity);
  assertSha256(contractSha256);
  assertSha256(sourceManifestSha256);
  assertTimestamp(recordedAt);
  if (await exists(outputRoot)) reject("OUTPUT_EXISTS");
  const manifest = await loadSourceManifest(
    sourceManifestPath,
    sourceManifestSha256,
  );
  const stage = `${outputRoot}.stage-${randomUUID()}`;
  if (await exists(stage)) reject("OUTPUT_EXISTS");
  await mkdir(path.dirname(outputRoot), { recursive: true });
  await mkdir(path.join(stage, "snapshots"), { recursive: true });
  await mkdir(path.join(stage, "projections"), { recursive: true });
  const control = {
    contractSha256,
    createdAt: recordedAt,
    format: controlFormat,
    horizonOrder: [...manifest.closedCorpus.horizonOrder],
    identity,
    limits: {
      maximumBytes,
      maximumFiles,
      maximumRecords,
    },
    sourceManifestSha256,
    sourcePaths: [...manifest.closedCorpus.paths],
  };
  const opened = makeRecord({
    body: {
      contractSha256,
      horizonOrder: [...control.horizonOrder],
      sourceManifestSha256,
      sourcePaths: [...control.sourcePaths],
    },
    identity,
    kind: "CorpusOpened",
    previousRecordSha256: null,
    recordedAt,
    sequence: 1,
    sourceHorizonId: null,
  });
  await writeFile(path.join(stage, "CONTROL.json"), canonicalJson(control), {
    flag: "wx",
    mode: 0o644,
  });
  await writeFile(path.join(stage, "records.jsonl"), canonicalJson(opened), {
    flag: "wx",
    mode: 0o644,
  });
  await rename(stage, outputRoot);
  return {
    identity,
    recordHeadSha256: opened.recordSha256,
    records: 1,
    status: "initialized",
  };
}

function horizonInventory(manifest, horizonId) {
  const horizon = manifest.closedCorpus.inventory.find(
    (item) => item.horizonId === horizonId,
  );
  if (!horizon) reject("HORIZON_INVALID");
  return horizon;
}

export async function appendSourceHorizon({
  horizonId,
  outputRoot,
  recordedAt,
  sourceManifestPath,
  sourceRoot,
}) {
  assertTimestamp(recordedAt);
  const before = await verifyStore(outputRoot);
  const manifest = await loadSourceManifest(
    sourceManifestPath,
    before.control.sourceManifestSha256,
  );
  const horizon = horizonInventory(manifest, horizonId);
  const expectedIndex = before.state.closedHorizons.size;
  if (
    before.control.horizonOrder[expectedIndex] !== horizonId ||
    [...before.state.sources.keys()].some((key) => key.startsWith(`${horizonId}:`))
  ) {
    reject("HORIZON_ORDER_INVALID");
  }
  const sourceListing = await listFiles(sourceRoot);
  const expectedPresent = horizon.files
    .filter((file) => file.state === "present")
    .map((file) => file.path)
    .sort();
  if (
    sourceListing.files.length !== expectedPresent.length ||
    sourceListing.files.some((file, index) => file !== expectedPresent[index])
  ) {
    reject("SOURCE_INVENTORY_MISMATCH");
  }
  const loaded = [];
  let sourceBytes = 0;
  let sourceFiles = 0;
  for (const file of horizon.files) {
    if (file.state === "absent") {
      if (await exists(path.join(sourceRoot, file.path))) {
        reject("SOURCE_INVENTORY_MISMATCH");
      }
      loaded.push({ file });
      continue;
    }
    const bytes = await readRegularNoFollow(path.join(sourceRoot, file.path));
    if (bytes.length !== file.sizeBytes || sha256(bytes) !== file.sha256) {
      reject("SOURCE_HASH_MISMATCH", file.path);
    }
    loaded.push({ bytes, file });
    sourceBytes += bytes.length;
    sourceFiles += 1;
  }
  const recordFields = loaded.map((item) =>
    item.file.state === "absent"
      ? {
          body: {
            path: item.file.path,
            state: "absent",
          },
          kind: "SourceAbsence",
          recordedAt,
          sourceHorizonId: horizonId,
        }
      : {
          body: {
            gitBlobSha1: item.file.gitBlobSha1,
            path: item.file.path,
            sha256: item.file.sha256,
            sizeBytes: item.file.sizeBytes,
            snapshotPath: `snapshots/${horizonId}/${item.file.path}`,
            sourceId: `source.${horizonId.toLowerCase()}.${item.file.path
              .replaceAll("/", ".")
              .replaceAll("_", "-")
              .replace(/[^A-Za-z0-9.-]/g, "-")}`,
          },
          kind: "SourceSnapshot",
          recordedAt,
          sourceHorizonId: horizonId,
        },
  );
  const prepared = prepareRecords(before, recordFields, {
    bytes: sourceBytes,
    files: sourceFiles,
  });
  const target = path.join(outputRoot, "snapshots", horizonId);
  assertDescendant(outputRoot, target);
  if (await exists(target)) reject("OUTPUT_EXISTS");
  const stage = `${target}.stage-${randomUUID()}`;
  await mkdir(stage, { recursive: true });
  for (const item of loaded) {
    if (!item.bytes) continue;
    const destination = path.join(stage, item.file.path);
    assertDescendant(stage, destination);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, item.bytes, { flag: "wx", mode: 0o644 });
  }
  await rename(stage, target);
  await appendPreparedRecords(outputRoot, prepared);
  return {
    appendedRecords: prepared.prepared.length,
    horizonId,
    status: "horizon-sources-appended",
  };
}

function lineSpan(bytes, lineStart, lineEnd) {
  if (!Number.isSafeInteger(lineStart) || !Number.isSafeInteger(lineEnd)) {
    reject("EVIDENCE_INVALID");
  }
  if (lineStart < 1 || lineEnd < lineStart) reject("EVIDENCE_INVALID");
  decodeUtf8(bytes);
  const starts = [0];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0x0a && index + 1 < bytes.length) starts.push(index + 1);
  }
  if (lineEnd > starts.length) reject("EVIDENCE_INVALID");
  const byteStart = starts[lineStart - 1];
  const byteEndExclusive =
    lineEnd < starts.length ? starts[lineEnd] : bytes.length;
  return {
    byteEndExclusive,
    byteStart,
    bytes: bytes.subarray(byteStart, byteEndExclusive),
  };
}

export async function appendEvidenceSpan({
  horizonId,
  lineEnd,
  lineStart,
  outputRoot,
  recordedAt,
  sourcePath,
  spanId,
}) {
  assertOpaqueId(spanId);
  assertSafeRelativePath(sourcePath);
  assertTimestamp(recordedAt);
  const verification = await verifyStore(outputRoot);
  const source = verification.state.sources.get(`${horizonId}:${sourcePath}`);
  if (!source || source.kind !== "SourceSnapshot") reject("SOURCE_INVALID");
  const bytes = await readRegularNoFollow(
    path.join(outputRoot, source.body.snapshotPath),
  );
  const span = lineSpan(bytes, lineStart, lineEnd);
  const record = await appendRecord(outputRoot, {
    body: {
      byteEndExclusive: span.byteEndExclusive,
      byteStart: span.byteStart,
      lineEnd,
      lineStart,
      path: sourcePath,
      sha256: sha256(span.bytes),
      sourceId: source.body.sourceId,
      spanId,
    },
    kind: "EvidenceSpan",
    recordedAt,
    sourceHorizonId: horizonId,
  });
  return {
    recordSha256: record.recordSha256,
    spanId,
    status: "evidence-span-appended",
  };
}

function parseEvidenceIds(evidenceIds) {
  if (
    !Array.isArray(evidenceIds) ||
    evidenceIds.length === 0 ||
    new Set(evidenceIds).size !== evidenceIds.length
  ) {
    reject("EVIDENCE_INVALID");
  }
  for (const evidenceId of evidenceIds) assertOpaqueId(evidenceId);
  return evidenceIds;
}

export async function appendAssertion({
  assertionId,
  evidenceIds,
  horizonId,
  outputRoot,
  predecessorRevisionId,
  recordedAt,
  revisionId,
  text,
}) {
  assertOpaqueId(assertionId);
  assertOpaqueId(revisionId);
  if (predecessorRevisionId !== null) assertOpaqueId(predecessorRevisionId);
  assertString(text);
  assertTimestamp(recordedAt);
  parseEvidenceIds(evidenceIds);
  const record = await appendRecord(outputRoot, {
    body: {
      assertionId,
      evidenceIds,
      predecessorRevisionId,
      revisionId,
      text,
    },
    kind: "AssertionRevision",
    recordedAt,
    sourceHorizonId: horizonId,
  });
  return {
    assertionId,
    recordSha256: record.recordSha256,
    revisionId,
    status: "assertion-revision-appended",
  };
}

export async function appendQuestion({
  evidenceIds,
  horizonId,
  outputRoot,
  questionId,
  recordedAt,
  text,
}) {
  assertOpaqueId(questionId);
  assertString(text);
  assertTimestamp(recordedAt);
  parseEvidenceIds(evidenceIds);
  const record = await appendRecord(outputRoot, {
    body: {
      evidenceIds,
      questionId,
      status: "open",
      text,
    },
    kind: "QuestionOpened",
    recordedAt,
    sourceHorizonId: horizonId,
  });
  return {
    questionId,
    recordSha256: record.recordSha256,
    status: "question-opened",
  };
}

export async function closeHorizon({
  final,
  horizonId,
  outputRoot,
  recordedAt,
}) {
  assertTimestamp(recordedAt);
  const closed = await appendRecord(outputRoot, {
    body: {
      horizonId,
    },
    kind: "HorizonClosed",
    recordedAt,
    sourceHorizonId: horizonId,
  });
  let corpus = null;
  if (final) {
    const verification = await verifyStore(outputRoot);
    corpus = await appendRecord(outputRoot, {
      body: {
        horizonIds: [...verification.control.horizonOrder],
      },
      kind: "CorpusClosed",
      recordedAt,
      sourceHorizonId: null,
    });
  }
  return {
    corpusClosed: corpus !== null,
    horizonId,
    recordHeadSha256: (corpus ?? closed).recordSha256,
    status: "horizon-closed",
  };
}

async function verifyEvidenceBytes(outputRoot, records) {
  const sources = new Map();
  for (const record of records) {
    if (record.kind === "SourceSnapshot") {
      sources.set(`${record.sourceHorizonId}:${record.body.path}`, record);
    } else if (record.kind === "EvidenceSpan") {
      const source = sources.get(
        `${record.sourceHorizonId}:${record.body.path}`,
      );
      if (!source) reject("EVIDENCE_INVALID");
      const bytes = await readRegularNoFollow(
        path.join(outputRoot, source.body.snapshotPath),
      );
      const span = lineSpan(
        bytes,
        record.body.lineStart,
        record.body.lineEnd,
      );
      if (
        span.byteStart !== record.body.byteStart ||
        span.byteEndExclusive !== record.body.byteEndExclusive ||
        sha256(span.bytes) !== record.body.sha256
      ) {
        reject("EVIDENCE_HASH_MISMATCH");
      }
    }
  }
}

function visibleRecords(control, records, asOfHorizon) {
  const index = control.horizonOrder.indexOf(asOfHorizon);
  if (index < 0) reject("HORIZON_INVALID");
  return records.filter(
    (record) =>
      record.sourceHorizonId === null
        ? record.kind === "CorpusOpened"
        : control.horizonOrder.indexOf(record.sourceHorizonId) <= index,
  );
}

function deriveView(control, records, asOfHorizon) {
  const visible = visibleRecords(control, records, asOfHorizon);
  const sources = [];
  const evidenceSpans = [];
  const histories = new Map();
  const questions = [];
  for (const record of visible) {
    if (
      record.kind === "SourceSnapshot" ||
      record.kind === "SourceAbsence"
    ) {
      sources.push({
        horizonId: record.sourceHorizonId,
        kind: record.kind,
        ...record.body,
      });
    } else if (record.kind === "EvidenceSpan") {
      evidenceSpans.push({
        horizonId: record.sourceHorizonId,
        recordedAt: record.recordedAt,
        recordSequence: record.sequence,
        ...record.body,
      });
    } else if (record.kind === "AssertionRevision") {
      const history = histories.get(record.body.assertionId) ?? [];
      history.push({
        horizonId: record.sourceHorizonId,
        recordedAt: record.recordedAt,
        recordSequence: record.sequence,
        ...record.body,
      });
      histories.set(record.body.assertionId, history);
    } else if (record.kind === "QuestionOpened") {
      questions.push({
        horizonId: record.sourceHorizonId,
        recordedAt: record.recordedAt,
        recordSequence: record.sequence,
        ...record.body,
      });
    }
  }
  return {
    asOfHorizon,
    assertions: [...histories.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([assertionId, history]) => ({
        assertionId,
        current: history[history.length - 1],
        history,
      })),
    contractSha256: control.contractSha256,
    evidenceSpans: evidenceSpans.sort((left, right) =>
      left.spanId.localeCompare(right.spanId),
    ),
    format: viewFormat,
    identity: control.identity,
    questions: questions.sort((left, right) =>
      left.questionId.localeCompare(right.questionId),
    ),
    sourceManifestSha256: control.sourceManifestSha256,
    sources: sources.sort(
      (left, right) =>
        control.horizonOrder.indexOf(left.horizonId) -
          control.horizonOrder.indexOf(right.horizonId) ||
        left.path.localeCompare(right.path),
    ),
    visibleRecordCount: visible.length,
    visibleRecordHeadSha256: visible[visible.length - 1].recordSha256,
  };
}

function dossierFor(view) {
  const lines = [
    `# ${view.identity}: ${view.asOfHorizon} dossier`,
    "",
    `Visible record head: \`${view.visibleRecordHeadSha256}\`.`,
    "",
    "## Closed source view",
    "",
  ];
  for (const source of view.sources) {
    if (source.kind === "SourceAbsence") {
      lines.push(`- ${source.horizonId} \`${source.path}\`: absent.`);
    } else {
      lines.push(
        `- ${source.horizonId} \`${source.path}\`: SHA-256 \`${source.sha256}\`, ${source.sizeBytes} bytes.`,
      );
    }
  }
  lines.push("", "## Current assertions", "");
  for (const assertion of view.assertions) {
    const current = assertion.current;
    lines.push(
      `### ${assertion.assertionId}`,
      "",
      current.text,
      "",
      `Revision: \`${current.revisionId}\`; source horizon: ${current.horizonId}; record sequence: ${current.recordSequence}.`,
      "",
      "Evidence:",
      "",
    );
    for (const evidenceId of current.evidenceIds) {
      const span = view.evidenceSpans.find((item) => item.spanId === evidenceId);
      if (!span) reject("REFERENCE_DANGLING");
      lines.push(
        `- \`${span.spanId}\`: ${span.horizonId} \`${span.path}\` lines ${span.lineStart}-${span.lineEnd}, bytes ${span.byteStart}-${span.byteEndExclusive}, SHA-256 \`${span.sha256}\`.`,
      );
    }
    if (assertion.history.length > 1) {
      lines.push("", "History:", "");
      for (const revision of assertion.history) {
        lines.push(
          `- \`${revision.revisionId}\` (${revision.horizonId}, sequence ${revision.recordSequence}): ${revision.text}`,
        );
      }
    }
    lines.push("");
  }
  lines.push("## Open questions", "");
  if (view.questions.length === 0) {
    lines.push("None recorded at this horizon.", "");
  } else {
    for (const question of view.questions) {
      lines.push(
        `- \`${question.questionId}\` (${question.horizonId}, ${question.status}): ${question.text}`,
      );
    }
    lines.push("");
  }
  return Buffer.from(`${lines.join("\n")}\n`, "utf8");
}

export async function buildProjection({
  asOfHorizon,
  outputRoot,
  projectionRoot,
}) {
  assertDescendant(path.join(outputRoot, "projections"), projectionRoot);
  if (await exists(projectionRoot)) reject("OUTPUT_EXISTS");
  const verification = await verifyStore(outputRoot);
  await verifyEvidenceBytes(outputRoot, verification.records);
  const view = deriveView(
    verification.control,
    verification.records,
    asOfHorizon,
  );
  const viewBytes = canonicalJson(view);
  const dossierBytes = dossierFor(view);
  const manifest = {
    asOfHorizon,
    files: [
      {
        path: "DOSSIER.md",
        sha256: sha256(dossierBytes),
        sizeBytes: dossierBytes.length,
      },
      {
        path: "VIEW.json",
        sha256: sha256(viewBytes),
        sizeBytes: viewBytes.length,
      },
    ],
    format: projectionManifestFormat,
    identity: verification.control.identity,
    visibleRecordHeadSha256: view.visibleRecordHeadSha256,
  };
  const manifestBytes = canonicalJson(manifest);
  const stage = `${projectionRoot}.stage-${randomUUID()}`;
  await mkdir(stage, { recursive: true });
  await writeFile(path.join(stage, "DOSSIER.md"), dossierBytes, {
    flag: "wx",
    mode: 0o644,
  });
  await writeFile(path.join(stage, "VIEW.json"), viewBytes, {
    flag: "wx",
    mode: 0o644,
  });
  await writeFile(path.join(stage, "MANIFEST.json"), manifestBytes, {
    flag: "wx",
    mode: 0o644,
  });
  const staged = await listFiles(stage);
  if (
    verification.files.length + staged.files.length > maximumFiles ||
    verification.bytes + staged.bytes > maximumBytes
  ) {
    await rm(stage, { recursive: true, force: false });
    reject("BUDGET_EXCEEDED");
  }
  await rename(stage, projectionRoot);
  return {
    asOfHorizon,
    dossierSha256: sha256(dossierBytes),
    manifestSha256: sha256(manifestBytes),
    status: "projection-built",
    viewSha256: sha256(viewBytes),
  };
}

async function projectionBytes(projectionRoot) {
  const listing = await listFiles(projectionRoot);
  const expected = ["DOSSIER.md", "MANIFEST.json", "VIEW.json"];
  if (
    listing.files.length !== expected.length ||
    listing.files.some((file, index) => file !== expected[index])
  ) {
    reject("PROJECTION_INVALID");
  }
  return Object.fromEntries(
    await Promise.all(
      expected.map(async (filename) => [
        filename,
        await readRegularNoFollow(path.join(projectionRoot, filename)),
      ]),
    ),
  );
}

export async function rebuildProjectionExact({
  asOfHorizon,
  outputRoot,
  projectionRoot,
}) {
  assertDescendant(path.join(outputRoot, "projections"), projectionRoot);
  const before = await projectionBytes(projectionRoot);
  await rm(projectionRoot, { recursive: true, force: false });
  const result = await buildProjection({
    asOfHorizon,
    outputRoot,
    projectionRoot,
  });
  const after = await projectionBytes(projectionRoot);
  for (const filename of Object.keys(before)) {
    if (!before[filename].equals(after[filename])) {
      reject("PROJECTION_REBUILD_MISMATCH", filename);
    }
  }
  return {
    ...result,
    status: "projection-rebuilt-exactly",
  };
}
