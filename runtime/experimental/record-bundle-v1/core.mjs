import { createHash, randomBytes } from "node:crypto";
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

export const contractSha256 =
  "5365c408abf4a21d6be0523b7e1bd7dea39382241e316384c8b06c042603bf96";
export const journeyIdentity = "record-and-bundle-golden-journey-v1";
export const recordFormat = "graphtruth.experimental.record.v1";
export const bundleFormat = "graphtruth.experimental.record-bundle.v1";
export const profileFormat = "graphtruth.experimental.record-bundle-profile.v1";
export const semanticFormat = "graphtruth.experimental.semantic-view-set.v1";

const sha256Pattern = /^[a-f0-9]{64}$/;
const opaqueIdPattern = /^[A-Za-z0-9][A-Za-z0-9.-]{0,127}$/;
const mediaTypePattern = /^[a-z0-9.+-]+\/[a-z0-9.+-]+(?:; charset=utf-8)?$/;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const recordKinds = new Set([
  "SourceSnapshot",
  "EvidenceSpan",
  "AssertionRevision",
  "Assessment",
  "AcceptanceDecision",
]);

export class RecordBundleError extends Error {
  constructor(code, detail = "") {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "RecordBundleError";
    this.code = code;
  }
}

function reject(code, detail = "") {
  throw new RecordBundleError(code, detail);
}

export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
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

function decodeUtf8(bytes) {
  try {
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes);
    if (text.startsWith("\uFEFF")) reject("UTF8_INVALID", "BOM is not allowed");
    return text;
  } catch (error) {
    if (error instanceof RecordBundleError) throw error;
    reject("UTF8_INVALID");
  }
}

class StrictJsonParser {
  constructor(text) {
    this.text = text;
    this.index = 0;
  }

  parse() {
    this.skipWhitespace();
    const value = this.parseValue();
    this.skipWhitespace();
    if (this.index !== this.text.length) reject("JSON_INVALID");
    return value;
  }

  skipWhitespace() {
    while (
      this.index < this.text.length &&
      (this.text[this.index] === " " ||
        this.text[this.index] === "\n" ||
        this.text[this.index] === "\r" ||
        this.text[this.index] === "\t")
    ) {
      this.index += 1;
    }
  }

  parseValue() {
    const token = this.text[this.index];
    if (token === "{") return this.parseObject();
    if (token === "[") return this.parseArray();
    if (token === '"') return this.parseString();
    if (token === "t" && this.consumeLiteral("true")) return true;
    if (token === "f" && this.consumeLiteral("false")) return false;
    if (token === "n" && this.consumeLiteral("null")) return null;
    return this.parseNumber();
  }

  consumeLiteral(literal) {
    if (this.text.slice(this.index, this.index + literal.length) !== literal) return false;
    this.index += literal.length;
    return true;
  }

  parseString() {
    const start = this.index;
    this.index += 1;
    let escaped = false;
    while (this.index < this.text.length) {
      const character = this.text[this.index];
      const code = this.text.charCodeAt(this.index);
      if (!escaped && character === '"') {
        this.index += 1;
        try {
          return JSON.parse(this.text.slice(start, this.index));
        } catch {
          reject("JSON_INVALID");
        }
      }
      if (!escaped && code < 0x20) reject("JSON_INVALID");
      if (!escaped && character === "\\") escaped = true;
      else escaped = false;
      this.index += 1;
    }
    reject("JSON_INVALID");
  }

  parseNumber() {
    const match = this.text.slice(this.index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) reject("JSON_INVALID");
    this.index += match[0].length;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) reject("JSON_INVALID");
    return value;
  }

  parseArray() {
    const values = [];
    this.index += 1;
    this.skipWhitespace();
    if (this.text[this.index] === "]") {
      this.index += 1;
      return values;
    }
    while (true) {
      this.skipWhitespace();
      values.push(this.parseValue());
      this.skipWhitespace();
      if (this.text[this.index] === "]") {
        this.index += 1;
        return values;
      }
      if (this.text[this.index] !== ",") reject("JSON_INVALID");
      this.index += 1;
    }
  }

  parseObject() {
    const value = {};
    const keys = new Set();
    this.index += 1;
    this.skipWhitespace();
    if (this.text[this.index] === "}") {
      this.index += 1;
      return value;
    }
    while (true) {
      this.skipWhitespace();
      if (this.text[this.index] !== '"') reject("JSON_INVALID");
      const key = this.parseString();
      if (keys.has(key)) reject("JSON_DUPLICATE_KEY", key);
      keys.add(key);
      this.skipWhitespace();
      if (this.text[this.index] !== ":") reject("JSON_INVALID");
      this.index += 1;
      this.skipWhitespace();
      value[key] = this.parseValue();
      this.skipWhitespace();
      if (this.text[this.index] === "}") {
        this.index += 1;
        return value;
      }
      if (this.text[this.index] !== ",") reject("JSON_INVALID");
      this.index += 1;
    }
  }
}

export function parseStrictJson(bytes, { canonical = false } = {}) {
  const value = new StrictJsonParser(decodeUtf8(bytes)).parse();
  if (canonical && !Buffer.from(bytes).equals(canonicalJson(value))) {
    reject("JSON_NOT_CANONICAL");
  }
  return value;
}

function assertExactKeys(value, keys, code = "RECORD_SHAPE_INVALID") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) reject(code);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    reject(code);
  }
}

function assertOpaqueId(value, code = "RECORD_SHAPE_INVALID") {
  if (typeof value !== "string" || !opaqueIdPattern.test(value)) reject(code);
}

function assertSha256(value, code = "RECORD_SHAPE_INVALID") {
  if (typeof value !== "string" || !sha256Pattern.test(value)) reject(code);
}

function assertTimestamp(value, code = "RECORD_SHAPE_INVALID") {
  if (
    typeof value !== "string" ||
    !timestampPattern.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    reject(code);
  }
}

function assertSafeRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value ||
    value.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    reject("BUNDLE_ENTRY_UNSAFE");
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

async function readRegularNoFollow(filename, maximumBytes = 1024 * 1024) {
  let handle;
  try {
    handle = await open(
      filename,
      constants.O_RDONLY | (constants.O_NOFOLLOW === undefined ? 0 : constants.O_NOFOLLOW),
    );
  } catch (error) {
    if (error?.code === "ELOOP") reject("BUNDLE_ENTRY_UNSAFE");
    throw error;
  }
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size > maximumBytes) reject("BUNDLE_ENTRY_UNSAFE");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      bytes.length !== before.size ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    ) {
      reject("BUNDLE_ENTRY_UNSAFE");
    }
    const pathStat = await lstat(filename);
    if (
      pathStat.isSymbolicLink() ||
      !pathStat.isFile() ||
      pathStat.dev !== before.dev ||
      pathStat.ino !== before.ino
    ) {
      reject("BUNDLE_ENTRY_UNSAFE");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

async function listBundleFiles(root) {
  const rootStat = await lstat(root).catch(() => reject("BUNDLE_ROOT_INVALID"));
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) reject("BUNDLE_ROOT_INVALID");
  const files = [];
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      assertSafeRelativePath(relative);
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink()) reject("BUNDLE_ENTRY_UNSAFE");
      if (stat.isDirectory()) await visit(filename, relative);
      else if (stat.isFile()) files.push(relative);
      else reject("BUNDLE_ENTRY_UNSAFE");
    }
  }
  await visit(root, "");
  return files;
}

function validateProfile(profile) {
  assertExactKeys(profile, ["format", "identity", "fact", "horizons", "policies"]);
  if (profile.format !== profileFormat || typeof profile.identity !== "string") {
    reject("UNKNOWN_FORMAT");
  }
  assertExactKeys(profile.fact, ["factKey", "unit", "valueType"]);
  assertOpaqueId(profile.fact.factKey);
  if (profile.fact.valueType !== "integer" || profile.fact.unit !== "attempts") {
    reject("RECORD_SHAPE_INVALID");
  }
  if (!Array.isArray(profile.horizons) || profile.horizons.length === 0) {
    reject("RECORD_SHAPE_INVALID");
  }
  const horizonIds = new Set();
  let priorRecordedAsOf = "";
  for (const horizon of profile.horizons) {
    assertExactKeys(horizon, ["horizonId", "recordedAsOf", "validAt"]);
    assertOpaqueId(horizon.horizonId);
    assertTimestamp(horizon.recordedAsOf);
    assertTimestamp(horizon.validAt);
    if (horizonIds.has(horizon.horizonId) || horizon.recordedAsOf <= priorRecordedAsOf) {
      reject("RECORDED_ORDER_INVALID");
    }
    horizonIds.add(horizon.horizonId);
    priorRecordedAsOf = horizon.recordedAsOf;
  }
  if (!Array.isArray(profile.policies) || profile.policies.length === 0) {
    reject("RECORD_SHAPE_INVALID");
  }
  const policyIds = new Set();
  for (const policy of profile.policies) {
    assertExactKeys(policy, ["policyId", "purpose", "eligibleAssertionId"]);
    assertOpaqueId(policy.policyId);
    assertOpaqueId(policy.purpose);
    assertOpaqueId(policy.eligibleAssertionId);
    if (policyIds.has(policy.policyId)) reject("RECORD_SHAPE_INVALID");
    policyIds.add(policy.policyId);
  }
}

function lineAtByte(bytes, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (bytes[index] === 0x0a) line += 1;
  }
  return line;
}

function validateRecordBody(record, context) {
  const body = record.body;
  if (record.kind === "SourceSnapshot") {
    assertExactKeys(body, [
      "sourceId",
      "path",
      "mediaType",
      "size",
      "sha256",
      "authoredByActorId",
      "eventTime",
    ]);
    assertOpaqueId(body.sourceId);
    assertSafeRelativePath(body.path);
    if (
      !Number.isSafeInteger(body.size) ||
      body.size < 0 ||
      typeof body.mediaType !== "string" ||
      !mediaTypePattern.test(body.mediaType)
    ) {
      reject("RECORD_SHAPE_INVALID");
    }
    assertSha256(body.sha256);
    assertOpaqueId(body.authoredByActorId);
    assertTimestamp(body.eventTime);
    if (context.sourcesById.has(body.sourceId) || context.sourceRecordByPath.has(body.path)) {
      reject("RECORD_ID_CONFLICT");
    }
    const source = context.sourceFiles.get(body.path);
    if (
      source === undefined ||
      source.bytes.length !== body.size ||
      sha256(source.bytes) !== body.sha256 ||
      source.mediaType !== body.mediaType
    ) {
      reject("SOURCE_HASH_MISMATCH");
    }
    context.sourcesById.set(body.sourceId, { ...body, recordId: record.recordId });
    context.sourceRecordByPath.set(body.path, record.recordId);
    context.sourceRecordById.set(record.recordId, body);
    return;
  }

  if (record.kind === "EvidenceSpan") {
    assertExactKeys(body, [
      "evidenceId",
      "sourceRecordId",
      "byteStart",
      "byteEnd",
      "lineStart",
      "lineEnd",
      "sha256",
      "text",
    ]);
    assertOpaqueId(body.evidenceId);
    assertOpaqueId(body.sourceRecordId);
    assertSha256(body.sha256);
    if (context.evidenceById.has(body.evidenceId)) reject("RECORD_ID_CONFLICT");
    const sourceRecord = context.sourceRecordById.get(body.sourceRecordId);
    if (sourceRecord === undefined) reject("REFERENCE_DANGLING");
    const source = context.sourceFiles.get(sourceRecord.path);
    if (
      !Number.isSafeInteger(body.byteStart) ||
      !Number.isSafeInteger(body.byteEnd) ||
      body.byteStart < 0 ||
      body.byteEnd <= body.byteStart ||
      body.byteEnd > source.bytes.length ||
      !Number.isSafeInteger(body.lineStart) ||
      !Number.isSafeInteger(body.lineEnd) ||
      body.lineStart < 1 ||
      body.lineEnd < body.lineStart
    ) {
      reject("EVIDENCE_BOUNDS_INVALID");
    }
    const span = source.bytes.subarray(body.byteStart, body.byteEnd);
    if (
      sha256(span) !== body.sha256 ||
      decodeUtf8(span) !== body.text ||
      lineAtByte(source.bytes, body.byteStart) !== body.lineStart ||
      lineAtByte(source.bytes, body.byteEnd) !== body.lineEnd
    ) {
      reject("EVIDENCE_HASH_MISMATCH");
    }
    context.evidenceById.set(body.evidenceId, body);
    return;
  }

  if (record.kind === "AssertionRevision") {
    assertExactKeys(body, [
      "assertionId",
      "revisionId",
      "predecessorRevisionId",
      "factKey",
      "value",
      "unit",
      "validFrom",
      "evidenceIds",
    ]);
    assertOpaqueId(body.assertionId);
    assertOpaqueId(body.revisionId);
    assertOpaqueId(body.factKey);
    if (context.revisionsById.has(body.revisionId)) reject("RECORD_ID_CONFLICT");
    if (
      !Number.isSafeInteger(body.value) ||
      body.unit !== context.profile.fact.unit ||
      body.factKey !== context.profile.fact.factKey ||
      !Array.isArray(body.evidenceIds) ||
      body.evidenceIds.length === 0
    ) {
      reject("RECORD_SHAPE_INVALID");
    }
    assertTimestamp(body.validFrom);
    for (const evidenceId of body.evidenceIds) {
      assertOpaqueId(evidenceId);
      if (!context.evidenceById.has(evidenceId)) reject("REFERENCE_DANGLING");
    }
    const prior = context.latestRevisionByAssertion.get(body.assertionId);
    if (
      (prior === undefined && body.predecessorRevisionId !== null) ||
      (prior !== undefined && body.predecessorRevisionId !== prior.body.revisionId)
    ) {
      reject("REVISION_CHAIN_INVALID");
    }
    const entry = { body, record };
    context.revisionsById.set(body.revisionId, entry);
    context.latestRevisionByAssertion.set(body.assertionId, entry);
    return;
  }

  if (record.kind === "Assessment") {
    assertExactKeys(body, [
      "assessmentId",
      "actorId",
      "targetRevisionId",
      "stance",
      "basisRevisionIds",
      "evidenceIds",
      "reasonCode",
    ]);
    assertOpaqueId(body.assessmentId);
    assertOpaqueId(body.actorId);
    assertOpaqueId(body.targetRevisionId);
    assertOpaqueId(body.reasonCode);
    if (
      context.assessmentsById.has(body.assessmentId) ||
      body.stance !== "challenge" ||
      !Array.isArray(body.basisRevisionIds) ||
      body.basisRevisionIds.length === 0 ||
      !Array.isArray(body.evidenceIds) ||
      body.evidenceIds.length === 0 ||
      !context.revisionsById.has(body.targetRevisionId)
    ) {
      reject("REFERENCE_DANGLING");
    }
    for (const revisionId of body.basisRevisionIds) {
      assertOpaqueId(revisionId);
      if (!context.revisionsById.has(revisionId)) reject("REFERENCE_DANGLING");
    }
    for (const evidenceId of body.evidenceIds) {
      assertOpaqueId(evidenceId);
      if (!context.evidenceById.has(evidenceId)) reject("REFERENCE_DANGLING");
    }
    context.assessmentsById.set(body.assessmentId, { body, record });
    return;
  }

  if (record.kind === "AcceptanceDecision") {
    assertExactKeys(body, [
      "decisionId",
      "action",
      "actorId",
      "policyId",
      "purpose",
      "targetRevisionId",
      "revokesDecisionId",
    ]);
    assertOpaqueId(body.decisionId);
    assertOpaqueId(body.actorId);
    assertOpaqueId(body.policyId);
    assertOpaqueId(body.purpose);
    assertOpaqueId(body.targetRevisionId);
    if (context.decisionsById.has(body.decisionId)) reject("RECORD_ID_CONFLICT");
    const policy = context.profile.policies.find((item) => item.policyId === body.policyId);
    const revision = context.revisionsById.get(body.targetRevisionId);
    if (
      policy === undefined ||
      policy.purpose !== body.purpose ||
      revision === undefined ||
      revision.body.assertionId !== policy.eligibleAssertionId
    ) {
      reject("DECISION_INVALID");
    }
    if (body.action === "accept") {
      if (body.revokesDecisionId !== null) reject("DECISION_INVALID");
    } else if (body.action === "revoke") {
      assertOpaqueId(body.revokesDecisionId, "DECISION_INVALID");
      const revoked = context.decisionsById.get(body.revokesDecisionId);
      if (
        revoked === undefined ||
        revoked.body.action !== "accept" ||
        revoked.body.policyId !== body.policyId ||
        revoked.body.purpose !== body.purpose ||
        revoked.body.targetRevisionId !== body.targetRevisionId ||
        context.revokedDecisionIds.has(body.revokesDecisionId)
      ) {
        reject("DECISION_INVALID");
      }
      context.revokedDecisionIds.add(body.revokesDecisionId);
    } else {
      reject("DECISION_INVALID");
    }
    context.decisionsById.set(body.decisionId, { body, record });
  }
}

function validateRecords(recordsWithBytes, profile, sourceFiles) {
  const context = {
    profile,
    sourceFiles,
    sourcesById: new Map(),
    sourceRecordByPath: new Map(),
    sourceRecordById: new Map(),
    evidenceById: new Map(),
    revisionsById: new Map(),
    latestRevisionByAssertion: new Map(),
    assessmentsById: new Map(),
    decisionsById: new Map(),
    revokedDecisionIds: new Set(),
  };
  const recordIds = new Set();
  let previousBytes = null;
  let previousRecordedAt = "";
  for (const [index, item] of recordsWithBytes.entries()) {
    const record = item.value;
    assertExactKeys(record, [
      "format",
      "recordId",
      "recordedSequence",
      "recordedAt",
      "previousRecordSha256",
      "kind",
      "body",
    ]);
    if (record.format !== recordFormat || !recordKinds.has(record.kind)) reject("UNKNOWN_FORMAT");
    assertOpaqueId(record.recordId);
    if (recordIds.has(record.recordId)) reject("RECORD_ID_CONFLICT");
    recordIds.add(record.recordId);
    const expectedSequence = index + 1;
    if (
      record.recordedSequence !== expectedSequence ||
      !Number.isSafeInteger(record.recordedSequence)
    ) {
      reject("RECORDED_ORDER_INVALID");
    }
    const expectedPath = `records/${String(expectedSequence).padStart(4, "0")}-${record.recordId}.json`;
    if (item.path !== expectedPath) reject("RECORD_PATH_INVALID");
    assertTimestamp(record.recordedAt, "RECORDED_ORDER_INVALID");
    if (record.recordedAt <= previousRecordedAt) reject("RECORDED_ORDER_INVALID");
    previousRecordedAt = record.recordedAt;
    if (index === 0) {
      if (record.previousRecordSha256 !== null) reject("RECORD_CHAIN_INVALID");
    } else {
      assertSha256(record.previousRecordSha256, "RECORD_CHAIN_INVALID");
      if (record.previousRecordSha256 !== sha256(previousBytes)) {
        reject("RECORD_CHAIN_INVALID");
      }
    }
    validateRecordBody(record, context);
    previousBytes = item.bytes;
  }
  if (context.sourceRecordByPath.size !== sourceFiles.size) reject("SOURCE_HASH_MISMATCH");
  return {
    context,
    recordHeadSha256: previousBytes === null ? null : sha256(previousBytes),
  };
}

function activeAcceptanceFor(records, revisionsById, horizon, policy) {
  const visible = records.filter((record) => record.recordedAt <= horizon.recordedAsOf);
  const decisions = visible.filter(
    (record) =>
      record.kind === "AcceptanceDecision" &&
      record.body.policyId === policy.policyId &&
      record.body.purpose === policy.purpose,
  );
  const revoked = new Set(
    decisions.filter((record) => record.body.action === "revoke").map(
      (record) => record.body.revokesDecisionId,
    ),
  );
  const active = decisions.filter((record) => {
    if (record.body.action !== "accept" || revoked.has(record.body.decisionId)) return false;
    const revision = revisionsById.get(record.body.targetRevisionId);
    return (
      revision !== undefined &&
      revision.body.assertionId === policy.eligibleAssertionId &&
      revision.body.validFrom <= horizon.validAt
    );
  });
  if (active.length > 1) reject("POLICY_AMBIGUOUS");
  return { active: active[0] ?? null, visible };
}

export function reduceSemanticViews(profile, records) {
  const revisionsById = new Map(
    records
      .filter((record) => record.kind === "AssertionRevision")
      .map((record) => [record.body.revisionId, { body: record.body, record }]),
  );
  const views = [];
  for (const horizon of profile.horizons) {
    for (const policy of profile.policies) {
      const { active, visible } = activeAcceptanceFor(
        records,
        revisionsById,
        horizon,
        policy,
      );
      if (active === null) {
        views.push({
          horizonId: horizon.horizonId,
          recordedAsOf: horizon.recordedAsOf,
          validAt: horizon.validAt,
          policyId: policy.policyId,
          status: "abstain",
          value: null,
          unit: profile.fact.unit,
          revisionId: null,
          acceptanceDecisionId: null,
          assessmentIds: [],
          evidenceIds: [],
          reasonCode: "no-active-policy-acceptance",
        });
        continue;
      }
      const revision = revisionsById.get(active.body.targetRevisionId);
      const assessments = visible.filter(
        (record) =>
          record.kind === "Assessment" &&
          record.body.targetRevisionId === revision.body.revisionId,
      );
      const evidenceIds = [...revision.body.evidenceIds];
      for (const assessment of assessments) {
        for (const evidenceId of assessment.body.evidenceIds) {
          if (!evidenceIds.includes(evidenceId)) evidenceIds.push(evidenceId);
        }
      }
      views.push({
        horizonId: horizon.horizonId,
        recordedAsOf: horizon.recordedAsOf,
        validAt: horizon.validAt,
        policyId: policy.policyId,
        status: "selected",
        value: revision.body.value,
        unit: revision.body.unit,
        revisionId: revision.body.revisionId,
        acceptanceDecisionId: active.body.decisionId,
        assessmentIds: assessments.map((record) => record.body.assessmentId),
        evidenceIds,
        reasonCode:
          assessments.length === 0
            ? "sole-active-policy-acceptance"
            : "sole-active-policy-acceptance-with-challenge",
      });
    }
  }
  return {
    format: semanticFormat,
    identity: profile.identity,
    views,
  };
}

function validateManifest(manifest) {
  assertExactKeys(manifest, [
    "format",
    "identity",
    "recordCount",
    "recordHeadSha256",
    "files",
  ]);
  if (manifest.format !== bundleFormat || typeof manifest.identity !== "string") {
    reject("UNKNOWN_FORMAT");
  }
  if (
    !Number.isSafeInteger(manifest.recordCount) ||
    manifest.recordCount < 1 ||
    manifest.recordCount > 32 ||
    !Array.isArray(manifest.files)
  ) {
    reject("BUNDLE_LIMIT_EXCEEDED");
  }
  assertSha256(manifest.recordHeadSha256, "RECORD_CHAIN_INVALID");
  const paths = new Set();
  for (const entry of manifest.files) {
    assertExactKeys(entry, ["path", "role", "mediaType", "size", "sha256"]);
    assertSafeRelativePath(entry.path);
    if (entry.path === "manifest.json" || paths.has(entry.path)) reject("BUNDLE_ENTRY_UNSAFE");
    paths.add(entry.path);
    if (
      !["profile", "source", "record"].includes(entry.role) ||
      typeof entry.mediaType !== "string" ||
      !mediaTypePattern.test(entry.mediaType) ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 0
    ) {
      reject("BUNDLE_ENTRY_UNSAFE");
    }
    assertSha256(entry.sha256, "BUNDLE_ENTRY_UNSAFE");
  }
}

export async function verifyBundle(bundleRoot, expectedManifestSha256) {
  assertSha256(expectedManifestSha256, "MANIFEST_HASH_INVALID");
  const files = await listBundleFiles(bundleRoot);
  if (!files.includes("manifest.json")) reject("BUNDLE_FILE_MISSING");
  if (files.length > 64) reject("BUNDLE_LIMIT_EXCEEDED");
  const manifestBytes = await readRegularNoFollow(path.join(bundleRoot, "manifest.json"));
  if (sha256(manifestBytes) !== expectedManifestSha256) {
    reject("MANIFEST_HASH_MISMATCH");
  }
  const manifest = parseStrictJson(manifestBytes, { canonical: true });
  validateManifest(manifest);
  const actualFiles = files.filter((filename) => filename !== "manifest.json").sort();
  const declaredFiles = manifest.files.map((entry) => entry.path).sort();
  for (const declared of declaredFiles) {
    if (!actualFiles.includes(declared)) reject("BUNDLE_FILE_MISSING");
  }
  for (const actual of actualFiles) {
    if (!declaredFiles.includes(actual)) reject("BUNDLE_FILE_UNDECLARED");
  }
  let totalBytes = manifestBytes.length;
  const fileBytes = new Map();
  for (const entry of manifest.files) {
    const bytes = await readRegularNoFollow(path.join(bundleRoot, ...entry.path.split("/")));
    totalBytes += bytes.length;
    if (bytes.length !== entry.size || sha256(bytes) !== entry.sha256) {
      reject("BUNDLE_FILE_HASH_MISMATCH");
    }
    fileBytes.set(entry.path, { bytes, mediaType: entry.mediaType, role: entry.role });
  }
  if (totalBytes > 1024 * 1024) reject("BUNDLE_LIMIT_EXCEEDED");
  const profileEntries = manifest.files.filter((entry) => entry.role === "profile");
  if (profileEntries.length !== 1 || profileEntries[0].path !== "profile.json") {
    reject("BUNDLE_ENTRY_UNSAFE");
  }
  const profile = parseStrictJson(fileBytes.get("profile.json").bytes, { canonical: true });
  validateProfile(profile);
  if (profile.identity !== manifest.identity) reject("RECORD_SHAPE_INVALID");

  const sourceFiles = new Map();
  for (const entry of manifest.files.filter((item) => item.role === "source")) {
    if (!entry.path.startsWith("sources/")) reject("BUNDLE_ENTRY_UNSAFE");
    const item = fileBytes.get(entry.path);
    decodeUtf8(item.bytes);
    sourceFiles.set(entry.path, item);
  }
  const recordsWithBytes = manifest.files
    .filter((entry) => entry.role === "record")
    .map((entry) => {
      if (!entry.path.startsWith("records/")) reject("BUNDLE_ENTRY_UNSAFE");
      const item = fileBytes.get(entry.path);
      return {
        path: entry.path,
        bytes: item.bytes,
        value: parseStrictJson(item.bytes, { canonical: true }),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
  if (recordsWithBytes.length !== manifest.recordCount) reject("RECORD_SHAPE_INVALID");
  const validated = validateRecords(recordsWithBytes, profile, sourceFiles);
  if (validated.recordHeadSha256 !== manifest.recordHeadSha256) {
    reject("RECORD_CHAIN_INVALID");
  }
  const records = recordsWithBytes.map((item) => item.value);
  const semanticOutput = reduceSemanticViews(profile, records);
  const semanticBytes = canonicalJson(semanticOutput);
  return {
    manifest,
    manifestBytes,
    manifestSha256: expectedManifestSha256,
    profile,
    records,
    semanticOutput,
    semanticBytes,
    semanticDigest: sha256(semanticBytes),
    context: validated.context,
    fileCount: files.length,
    totalBytes,
  };
}

function recordFilename(record) {
  return `records/${String(record.recordedSequence).padStart(4, "0")}-${record.recordId}.json`;
}

async function writeNew(filename, bytes) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, bytes, { flag: "wx", mode: 0o644 });
}

async function createStagingDirectory(outputRoot) {
  if (await exists(outputRoot)) reject("OUTPUT_EXISTS");
  const parent = path.dirname(outputRoot);
  await mkdir(parent, { recursive: true });
  const stage = path.join(
    parent,
    `.${path.basename(outputRoot)}.tmp-${process.pid}-${randomBytes(8).toString("hex")}`,
  );
  await mkdir(stage, { recursive: false, mode: 0o755 });
  return stage;
}

export async function buildBundleFromContract(contract, sourceRoot, outputRoot) {
  const stage = await createStagingDirectory(outputRoot);
  let published = false;
  try {
    const profileBytes = canonicalJson(contract.profile);
    await writeNew(path.join(stage, "profile.json"), profileBytes);
    const entries = [
      {
        path: "profile.json",
        role: "profile",
        mediaType: "application/json",
        size: profileBytes.length,
        sha256: sha256(profileBytes),
      },
    ];
    for (const source of contract.sources) {
      assertSafeRelativePath(source.path);
      const sourceBytes = await readRegularNoFollow(path.join(sourceRoot, ...source.path.split("/")));
      if (sourceBytes.length !== source.size || sha256(sourceBytes) !== source.sha256) {
        reject("SOURCE_HASH_MISMATCH");
      }
      decodeUtf8(sourceBytes);
      await writeNew(path.join(stage, ...source.path.split("/")), sourceBytes);
      entries.push({
        path: source.path,
        role: "source",
        mediaType: source.mediaType,
        size: sourceBytes.length,
        sha256: sha256(sourceBytes),
      });
    }
    let previousRecordBytes = null;
    for (const event of contract.records) {
      const record = {
        format: recordFormat,
        recordId: event.recordId,
        recordedSequence: event.recordedSequence,
        recordedAt: event.recordedAt,
        previousRecordSha256:
          previousRecordBytes === null ? null : sha256(previousRecordBytes),
        kind: event.kind,
        body: event.body,
      };
      const bytes = canonicalJson(record);
      const relative = recordFilename(record);
      await writeNew(path.join(stage, ...relative.split("/")), bytes);
      entries.push({
        path: relative,
        role: "record",
        mediaType: "application/json",
        size: bytes.length,
        sha256: sha256(bytes),
      });
      previousRecordBytes = bytes;
    }
    entries.sort((left, right) => left.path.localeCompare(right.path));
    const manifest = {
      format: bundleFormat,
      identity: contract.profile.identity,
      recordCount: contract.records.length,
      recordHeadSha256: sha256(previousRecordBytes),
      files: entries,
    };
    const manifestBytes = canonicalJson(manifest);
    await writeNew(path.join(stage, "manifest.json"), manifestBytes);
    const manifestSha256 = sha256(manifestBytes);
    const verified = await verifyBundle(stage, manifestSha256);
    await rename(stage, outputRoot);
    published = true;
    return verified;
  } finally {
    if (!published) await rm(stage, { recursive: true, force: true });
  }
}

export async function loadFrozenContract(journeyRoot) {
  const contractPath = path.join(journeyRoot, "JOURNEY-CONTRACT.json");
  const bytes = await readRegularNoFollow(contractPath);
  if (sha256(bytes) !== contractSha256) reject("CONTRACT_IDENTITY_MISMATCH");
  const contract = parseStrictJson(bytes);
  if (
    contract?.format !== "graphtruth.experimental.record-bundle-journey-contract.v1" ||
    contract?.identity !== journeyIdentity ||
    contract?.records?.length !== 14 ||
    contract?.sources?.length !== 3 ||
    contract?.denominator?.cellCount !== 18 ||
    contract?.mutations?.length !== 16
  ) {
    reject("CONTRACT_SHAPE_INVALID");
  }
  return contract;
}

export async function buildFrozenJourneyBundle(journeyRoot, outputRoot) {
  const contract = await loadFrozenContract(journeyRoot);
  return buildBundleFromContract(contract, journeyRoot, outputRoot);
}

export function renderDossier(verification) {
  const lines = [
    "# Record-and-bundle golden journey dossier",
    "",
    `Identity: \`${verification.profile.identity}\``,
    "",
    `Manifest SHA-256: \`${verification.manifestSha256}\``,
    "",
    `Semantic SHA-256: \`${verification.semanticDigest}\``,
    "",
  ];
  for (const horizon of verification.profile.horizons) {
    lines.push(`## ${horizon.horizonId}`, "");
    lines.push(
      `Recorded as of \`${horizon.recordedAsOf}\`; valid at \`${horizon.validAt}\`.`,
      "",
      "| Policy | Result | Revision | Decision | Assessments | Evidence |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const view of verification.semanticOutput.views.filter(
      (item) => item.horizonId === horizon.horizonId,
    )) {
      const result =
        view.status === "selected" ? `${view.value} ${view.unit}` : "abstain";
      lines.push(
        `| \`${view.policyId}\` | ${result} | ${view.revisionId ?? "—"} | ${
          view.acceptanceDecisionId ?? "—"
        } | ${view.assessmentIds.join(", ") || "—"} | ${
          view.evidenceIds.join(", ") || "—"
        } |`,
      );
    }
    lines.push("");
  }
  lines.push(
    "This dossier is a disposable projection. Canonical authority remains in the bundle.",
    "",
  );
  return lines.join("\n");
}

export async function writeProjectionDirectory(outputRoot, verification) {
  const stage = await createStagingDirectory(outputRoot);
  let published = false;
  try {
    await writeNew(path.join(stage, "views.json"), verification.semanticBytes);
    await writeNew(
      path.join(stage, "semantic-digest.txt"),
      Buffer.from(`${verification.semanticDigest}\n`, "utf8"),
    );
    await writeNew(
      path.join(stage, "dossier.md"),
      Buffer.from(renderDossier(verification), "utf8"),
    );
    await rename(stage, outputRoot);
    published = true;
  } finally {
    if (!published) await rm(stage, { recursive: true, force: true });
  }
}
