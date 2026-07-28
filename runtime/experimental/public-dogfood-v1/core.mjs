import { randomUUID } from "node:crypto";
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

import {
  canonicalJson,
  parseStrictJson,
  sha256,
} from "../record-bundle-v1/core.mjs";

export { canonicalJson, sha256 };

export const identity = "murmurmark-echo-lab-correction-v1";
export const contractSha256 =
  "fa382ab9888f417337775b60b80b0011bb4e0767992e46b95ad7360412ea9c5e";
export const sourceManifestSha256 =
  "3ab4aaaf26dc983434f5ff7fe034df7f64573af823a87e5876dc905460650b38";
export const captureFormat = "graphtruth.experimental.public-dogfood-capture.v1";
export const profileFormat = "graphtruth.experimental.public-dogfood-profile.v1";
export const recordFormat = "graphtruth.experimental.public-dogfood-record.v1";
export const bundleFormat = "graphtruth.experimental.public-dogfood-bundle.v1";
export const viewFormat = "graphtruth.experimental.public-dogfood-views.v1";

const maximumBundleFiles = 64;
const maximumBundleBytes = 1024 * 1024;
const maximumRecords = 32;
const sha256Pattern = /^[a-f0-9]{64}$/;
const sha1Pattern = /^[a-f0-9]{40}$/;
const opaqueIdPattern = /^[A-Za-z0-9][A-Za-z0-9.-]{0,127}$/;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const recordKinds = new Set([
  "SourceSnapshot",
  "EvidenceSpan",
  "AssertionRevision",
  "Assessment",
  "Question",
]);

export class PublicDogfoodError extends Error {
  constructor(code, detail = "") {
    super(detail ? `${code}: ${detail}` : code);
    this.name = "PublicDogfoodError";
    this.code = code;
  }
}

function reject(code, detail = "") {
  throw new PublicDogfoodError(code, detail);
}

function assertExactKeys(value, keys, code = "SHAPE_INVALID") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    reject(code);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    reject(code);
  }
}

function assertString(value, code = "SHAPE_INVALID") {
  if (typeof value !== "string" || value.length === 0) reject(code);
}

function assertStringArray(value, { empty = false, code = "SHAPE_INVALID" } = {}) {
  if (
    !Array.isArray(value) ||
    (!empty && value.length === 0) ||
    value.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    reject(code);
  }
}

function assertOpaqueId(value, code = "SHAPE_INVALID") {
  if (typeof value !== "string" || !opaqueIdPattern.test(value)) reject(code);
}

function assertSha256(value, code = "SHAPE_INVALID") {
  if (typeof value !== "string" || !sha256Pattern.test(value)) reject(code);
}

function assertSha1(value, code = "SHAPE_INVALID") {
  if (typeof value !== "string" || !sha1Pattern.test(value)) reject(code);
}

function assertTimestamp(value, code = "SHAPE_INVALID") {
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

function assertUniqueStrings(value, options = {}) {
  assertStringArray(value, options);
  if (new Set(value).size !== value.length) reject(options.code ?? "SHAPE_INVALID");
}

function decodeUtf8(bytes, code = "UTF8_INVALID") {
  try {
    const text = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: false,
    }).decode(bytes);
    if (text.startsWith("\uFEFF")) reject(code);
    return text;
  } catch (error) {
    if (error instanceof PublicDogfoodError) throw error;
    reject(code);
  }
}

async function readRegularNoFollow(filename, maximumBytes = maximumBundleBytes) {
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
    if (!before.isFile() || before.size > maximumBytes) reject("PATH_UNSAFE");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      bytes.length !== before.size ||
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs
    ) {
      reject("PATH_UNSAFE");
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

async function readJson(filename, { canonical = false } = {}) {
  try {
    return parseStrictJson(await readRegularNoFollow(filename), { canonical });
  } catch (error) {
    if (error?.code) reject(error.code, path.basename(filename));
    throw error;
  }
}

async function listFiles(root) {
  const rootStat = await lstat(root).catch(() => reject("BUNDLE_ROOT_INVALID"));
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    reject("BUNDLE_ROOT_INVALID");
  }
  const files = [];
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      assertSafeRelativePath(relative);
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink()) reject("PATH_UNSAFE");
      if (stat.isDirectory()) await visit(filename, relative);
      else if (stat.isFile()) files.push(relative);
      else reject("PATH_UNSAFE");
    }
  }
  await visit(root, "");
  return files;
}

function lineAtByte(bytes, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (bytes[index] === 0x0a) line += 1;
  }
  return line;
}

function indexAfter(text, marker, start = 0) {
  const found = text.indexOf(marker, start);
  if (found < 0) reject("EVIDENCE_MARKER_MISSING");
  return found;
}

function mediaTypeFor(relativePath) {
  if (relativePath.endsWith(".md")) return "text/markdown; charset=utf-8";
  if (relativePath.endsWith(".py")) return "text/x-python; charset=utf-8";
  return "application/octet-stream";
}

function sourceBundlePath(artifact) {
  return `sources/${artifact.horizonId}/${artifact.path}`;
}

function sourceIdFor(artifact) {
  const name = artifact.path
    .replaceAll("/", ".")
    .replaceAll("_", "-")
    .replace(/[^A-Za-z0-9.-]/g, "-");
  return `source.${artifact.horizonId.toLowerCase()}.${name}`;
}

function validateSourceManifest(manifest) {
  assertExactKeys(manifest, [
    "format",
    "identity",
    "status",
    "owningIssue",
    "upstream",
    "horizons",
    "timeBoundary",
    "artifacts",
    "closedInventory",
  ]);
  if (
    manifest.format !== "graphtruth.experimental.public-source-manifest.v1" ||
    manifest.identity !== identity ||
    manifest.status !== "frozen-before-adaptation"
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  if (!Array.isArray(manifest.horizons) || manifest.horizons.length !== 2) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  const horizonIds = new Set();
  for (const horizon of manifest.horizons) {
    assertExactKeys(horizon, [
      "horizonId",
      "commitSha1",
      "parentCommitSha1",
      "authorTimestamp",
      "committerTimestamp",
      "subject",
      "meaning",
    ]);
    assertOpaqueId(horizon.horizonId, "SOURCE_MANIFEST_INVALID");
    assertSha1(horizon.commitSha1, "SOURCE_MANIFEST_INVALID");
    assertSha1(horizon.parentCommitSha1, "SOURCE_MANIFEST_INVALID");
    assertString(horizon.authorTimestamp, "SOURCE_MANIFEST_INVALID");
    assertString(horizon.committerTimestamp, "SOURCE_MANIFEST_INVALID");
    if (horizonIds.has(horizon.horizonId)) reject("SOURCE_MANIFEST_INVALID");
    horizonIds.add(horizon.horizonId);
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 8) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  const retainedPaths = new Set();
  let totalBytes = 0;
  for (const artifact of manifest.artifacts) {
    assertExactKeys(artifact, [
      "horizonId",
      "commitSha1",
      "path",
      "retainedPath",
      "gitBlobSha1",
      "size",
      "sha256",
    ]);
    if (!horizonIds.has(artifact.horizonId)) reject("SOURCE_MANIFEST_INVALID");
    assertSha1(artifact.commitSha1, "SOURCE_MANIFEST_INVALID");
    assertSha1(artifact.gitBlobSha1, "SOURCE_MANIFEST_INVALID");
    assertSafeRelativePath(artifact.path, "SOURCE_MANIFEST_INVALID");
    assertSafeRelativePath(artifact.retainedPath, "SOURCE_MANIFEST_INVALID");
    assertSha256(artifact.sha256, "SOURCE_MANIFEST_INVALID");
    if (
      !Number.isSafeInteger(artifact.size) ||
      artifact.size < 0 ||
      retainedPaths.has(artifact.retainedPath)
    ) {
      reject("SOURCE_MANIFEST_INVALID");
    }
    const horizon = manifest.horizons.find(
      (item) => item.horizonId === artifact.horizonId,
    );
    if (artifact.commitSha1 !== horizon.commitSha1) {
      reject("SOURCE_MANIFEST_INVALID");
    }
    retainedPaths.add(artifact.retainedPath);
    totalBytes += artifact.size;
  }
  assertExactKeys(manifest.closedInventory, [
    "artifactCount",
    "artifactBytes",
    "replacementAllowed",
    "truncationAllowed",
    "additionalUpstreamMaterialAllowed",
  ]);
  if (
    manifest.closedInventory.artifactCount !== manifest.artifacts.length ||
    manifest.closedInventory.artifactBytes !== totalBytes ||
    manifest.closedInventory.replacementAllowed !== false ||
    manifest.closedInventory.truncationAllowed !== false ||
    manifest.closedInventory.additionalUpstreamMaterialAllowed !== false
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
}

function validateProfile(profile, sourceManifest) {
  assertExactKeys(profile, [
    "format",
    "identity",
    "authorityState",
    "horizons",
  ]);
  if (
    profile.format !== profileFormat ||
    profile.identity !== identity ||
    profile.authorityState !== "no-acceptance-decisions" ||
    !Array.isArray(profile.horizons) ||
    profile.horizons.length !== 2
  ) {
    reject("PROFILE_INVALID");
  }
  let previousSequence = 0;
  let previousRecordedAsOf = "";
  for (const profileHorizon of profile.horizons) {
    assertExactKeys(profileHorizon, [
      "horizonId",
      "lastRecordedSequence",
      "recordedAsOf",
      "sourceCommitSha1",
    ]);
    const sourceHorizon = sourceManifest.horizons.find(
      (item) => item.horizonId === profileHorizon.horizonId,
    );
    assertTimestamp(profileHorizon.recordedAsOf, "PROFILE_INVALID");
    assertSha1(profileHorizon.sourceCommitSha1, "PROFILE_INVALID");
    if (
      sourceHorizon === undefined ||
      sourceHorizon.commitSha1 !== profileHorizon.sourceCommitSha1 ||
      !Number.isSafeInteger(profileHorizon.lastRecordedSequence) ||
      profileHorizon.lastRecordedSequence <= previousSequence ||
      profileHorizon.recordedAsOf <= previousRecordedAsOf
    ) {
      reject("PROFILE_INVALID");
    }
    previousSequence = profileHorizon.lastRecordedSequence;
    previousRecordedAsOf = profileHorizon.recordedAsOf;
  }
}

function availableHorizonIds(profile, horizonId) {
  const index = profile.horizons.findIndex((item) => item.horizonId === horizonId);
  if (index < 0) reject("HORIZON_INVALID");
  return new Set(profile.horizons.slice(0, index + 1).map((item) => item.horizonId));
}

function assertReferenceHorizon(reference, event, profile) {
  if (!availableHorizonIds(profile, event.sourceHorizonId).has(reference.sourceHorizonId)) {
    reject("HORIZON_LEAK", event.recordId);
  }
}

function validateCaptureShape(capture, sourceManifest) {
  assertExactKeys(capture, [
    "format",
    "identity",
    "contractSha256",
    "sourceManifestSha256",
    "profile",
    "events",
    "taskViews",
  ]);
  if (
    capture.format !== captureFormat ||
    capture.identity !== identity ||
    capture.contractSha256 !== contractSha256 ||
    capture.sourceManifestSha256 !== sourceManifestSha256
  ) {
    reject("CAPTURE_IDENTITY_MISMATCH");
  }
  validateProfile(capture.profile, sourceManifest);
  if (
    !Array.isArray(capture.events) ||
    capture.events.length === 0 ||
    capture.events.length > maximumRecords
  ) {
    reject("RECORD_LIMIT_EXCEEDED");
  }
}

function materializeRecords(capture, sourceManifest, sourceFiles) {
  const sourceArtifactsByPath = new Map(
    sourceManifest.artifacts.map((artifact) => [artifact.retainedPath, artifact]),
  );
  const sourceRecords = new Map();
  const evidence = new Map();
  const revisions = new Map();
  const latestRevisionByAssertion = new Map();
  const assessments = new Map();
  const questions = new Map();
  const recordIds = new Set();
  const records = [];
  let previousBytes = null;
  let previousRecordedAt = "";

  for (const [index, event] of capture.events.entries()) {
    if (event === null || typeof event !== "object" || Array.isArray(event)) {
      reject("EVENT_SHAPE_INVALID");
    }
    assertOpaqueId(event.recordId, "EVENT_SHAPE_INVALID");
    assertTimestamp(event.recordedAt, "RECORDED_ORDER_INVALID");
    assertOpaqueId(event.sourceHorizonId, "HORIZON_INVALID");
    if (
      recordIds.has(event.recordId) ||
      event.recordedAt <= previousRecordedAt ||
      !capture.profile.horizons.some(
        (horizon) => horizon.horizonId === event.sourceHorizonId,
      )
    ) {
      reject("RECORDED_ORDER_INVALID");
    }
    recordIds.add(event.recordId);
    previousRecordedAt = event.recordedAt;

    let kind;
    let body;
    if (event.event === "source") {
      assertExactKeys(event, [
        "event",
        "recordId",
        "recordedAt",
        "sourceHorizonId",
        "retainedPath",
      ], "EVENT_SHAPE_INVALID");
      assertSafeRelativePath(event.retainedPath, "EVENT_SHAPE_INVALID");
      const artifact = sourceArtifactsByPath.get(event.retainedPath);
      if (
        artifact === undefined ||
        artifact.horizonId !== event.sourceHorizonId ||
        sourceRecords.has(event.recordId)
      ) {
        reject("SOURCE_CLOSURE_INVALID");
      }
      const bytes = sourceFiles.get(event.retainedPath);
      if (
        bytes === undefined ||
        bytes.length !== artifact.size ||
        sha256(bytes) !== artifact.sha256
      ) {
        reject("SOURCE_HASH_MISMATCH", event.retainedPath);
      }
      kind = "SourceSnapshot";
      body = {
        sourceId: sourceIdFor(artifact),
        path: sourceBundlePath(artifact),
        originalPath: artifact.path,
        mediaType: mediaTypeFor(artifact.path),
        size: artifact.size,
        sha256: artifact.sha256,
        gitBlobSha1: artifact.gitBlobSha1,
        sourceCommitSha1: artifact.commitSha1,
      };
      sourceRecords.set(event.recordId, {
        recordId: event.recordId,
        sourceHorizonId: event.sourceHorizonId,
        artifact,
        bytes,
        body,
      });
    } else if (event.event === "evidence") {
      assertExactKeys(event, [
        "event",
        "recordId",
        "recordedAt",
        "sourceHorizonId",
        "body",
      ], "EVENT_SHAPE_INVALID");
      assertExactKeys(event.body, [
        "evidenceId",
        "sourceRecordId",
        "relation",
        "startMarker",
        "endMarker",
        "endMarkerInclusive",
      ], "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.evidenceId, "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.sourceRecordId, "EVENT_SHAPE_INVALID");
      assertString(event.body.startMarker, "EVENT_SHAPE_INVALID");
      assertString(event.body.endMarker, "EVENT_SHAPE_INVALID");
      if (
        !["states", "supports", "limits"].includes(event.body.relation) ||
        typeof event.body.endMarkerInclusive !== "boolean" ||
        evidence.has(event.body.evidenceId)
      ) {
        reject("EVENT_SHAPE_INVALID");
      }
      const source = sourceRecords.get(event.body.sourceRecordId);
      if (source === undefined) reject("REFERENCE_DANGLING");
      assertReferenceHorizon(source, event, capture.profile);
      const text = decodeUtf8(source.bytes);
      const characterStart = indexAfter(text, event.body.startMarker);
      if (text.indexOf(event.body.startMarker, characterStart + 1) >= 0) {
        reject("EVIDENCE_MARKER_AMBIGUOUS", event.recordId);
      }
      const endMarkerStart = indexAfter(
        text,
        event.body.endMarker,
        characterStart + event.body.startMarker.length,
      );
      const characterEnd = event.body.endMarkerInclusive
        ? endMarkerStart + event.body.endMarker.length
        : endMarkerStart;
      if (characterEnd <= characterStart) reject("EVIDENCE_BOUNDS_INVALID");
      const byteStart = Buffer.byteLength(text.slice(0, characterStart), "utf8");
      const byteEnd = Buffer.byteLength(text.slice(0, characterEnd), "utf8");
      const span = source.bytes.subarray(byteStart, byteEnd);
      kind = "EvidenceSpan";
      body = {
        evidenceId: event.body.evidenceId,
        sourceRecordId: event.body.sourceRecordId,
        relation: event.body.relation,
        byteStart,
        byteEnd,
        lineStart: lineAtByte(source.bytes, byteStart),
        lineEnd: lineAtByte(source.bytes, byteEnd),
        sha256: sha256(span),
        text: decodeUtf8(span),
      };
      evidence.set(body.evidenceId, {
        ...body,
        recordId: event.recordId,
        sourceHorizonId: event.sourceHorizonId,
      });
    } else if (event.event === "assertion") {
      assertExactKeys(event, [
        "event",
        "recordId",
        "recordedAt",
        "sourceHorizonId",
        "body",
      ], "EVENT_SHAPE_INVALID");
      assertExactKeys(event.body, [
        "assertionId",
        "revisionId",
        "predecessorRevisionId",
        "statement",
        "scope",
        "evidenceIds",
      ], "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.assertionId, "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.revisionId, "EVENT_SHAPE_INVALID");
      assertString(event.body.statement, "EVENT_SHAPE_INVALID");
      assertString(event.body.scope, "EVENT_SHAPE_INVALID");
      assertUniqueStrings(event.body.evidenceIds);
      if (revisions.has(event.body.revisionId)) reject("RECORD_ID_CONFLICT");
      const previous = latestRevisionByAssertion.get(event.body.assertionId);
      if (
        (previous === undefined && event.body.predecessorRevisionId !== null) ||
        (previous !== undefined &&
          event.body.predecessorRevisionId !== previous.body.revisionId)
      ) {
        reject("REVISION_CHAIN_INVALID", event.body.revisionId);
      }
      for (const evidenceId of event.body.evidenceIds) {
        const reference = evidence.get(evidenceId);
        if (reference === undefined) reject("REFERENCE_DANGLING");
        assertReferenceHorizon(reference, event, capture.profile);
      }
      kind = "AssertionRevision";
      body = { ...event.body };
      const revision = {
        body,
        recordId: event.recordId,
        sourceHorizonId: event.sourceHorizonId,
        recordedAt: event.recordedAt,
      };
      revisions.set(body.revisionId, revision);
      latestRevisionByAssertion.set(body.assertionId, revision);
    } else if (event.event === "assessment") {
      assertExactKeys(event, [
        "event",
        "recordId",
        "recordedAt",
        "sourceHorizonId",
        "body",
      ], "EVENT_SHAPE_INVALID");
      assertExactKeys(event.body, [
        "assessmentId",
        "targetRevisionId",
        "stance",
        "reasonCode",
        "statement",
        "evidenceIds",
        "basisRevisionIds",
        "closureSourceRecordIds",
      ], "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.assessmentId, "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.targetRevisionId, "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.reasonCode, "EVENT_SHAPE_INVALID");
      assertString(event.body.statement, "EVENT_SHAPE_INVALID");
      assertUniqueStrings(event.body.evidenceIds);
      assertUniqueStrings(event.body.basisRevisionIds, { empty: true });
      assertUniqueStrings(event.body.closureSourceRecordIds);
      if (
        event.body.stance !== "limit" ||
        assessments.has(event.body.assessmentId)
      ) {
        reject("ASSESSMENT_INVALID");
      }
      const target = revisions.get(event.body.targetRevisionId);
      if (target === undefined) reject("REFERENCE_DANGLING");
      assertReferenceHorizon(target, event, capture.profile);
      for (const evidenceId of event.body.evidenceIds) {
        const reference = evidence.get(evidenceId);
        if (reference === undefined) reject("REFERENCE_DANGLING");
        assertReferenceHorizon(reference, event, capture.profile);
      }
      for (const revisionId of event.body.basisRevisionIds) {
        const reference = revisions.get(revisionId);
        if (reference === undefined) reject("REFERENCE_DANGLING");
        assertReferenceHorizon(reference, event, capture.profile);
      }
      for (const recordId of event.body.closureSourceRecordIds) {
        const reference = sourceRecords.get(recordId);
        if (reference === undefined) reject("REFERENCE_DANGLING");
        assertReferenceHorizon(reference, event, capture.profile);
      }
      kind = "Assessment";
      body = { ...event.body };
      assessments.set(body.assessmentId, {
        body,
        recordId: event.recordId,
        sourceHorizonId: event.sourceHorizonId,
        recordedAt: event.recordedAt,
      });
    } else if (event.event === "question") {
      assertExactKeys(event, [
        "event",
        "recordId",
        "recordedAt",
        "sourceHorizonId",
        "body",
      ], "EVENT_SHAPE_INVALID");
      assertExactKeys(event.body, [
        "questionId",
        "status",
        "question",
        "reasonCode",
        "basisSourceRecordIds",
        "missingEvidence",
      ], "EVENT_SHAPE_INVALID");
      assertOpaqueId(event.body.questionId, "QUESTION_INVALID");
      assertOpaqueId(event.body.reasonCode, "QUESTION_INVALID");
      assertString(event.body.question, "QUESTION_INVALID");
      assertUniqueStrings(event.body.basisSourceRecordIds);
      assertUniqueStrings(event.body.missingEvidence);
      if (event.body.status !== "open" || questions.has(event.body.questionId)) {
        reject("QUESTION_INVALID");
      }
      for (const recordId of event.body.basisSourceRecordIds) {
        const reference = sourceRecords.get(recordId);
        if (reference === undefined) reject("REFERENCE_DANGLING");
        assertReferenceHorizon(reference, event, capture.profile);
      }
      kind = "Question";
      body = { ...event.body };
      questions.set(body.questionId, {
        body,
        recordId: event.recordId,
        sourceHorizonId: event.sourceHorizonId,
        recordedAt: event.recordedAt,
      });
    } else {
      reject("UNKNOWN_FORMAT", String(event.event));
    }

    if (!recordKinds.has(kind)) reject("UNKNOWN_FORMAT");
    const record = {
      format: recordFormat,
      recordId: event.recordId,
      recordedSequence: index + 1,
      recordedAt: event.recordedAt,
      sourceHorizonId: event.sourceHorizonId,
      previousRecordSha256: previousBytes === null ? null : sha256(previousBytes),
      kind,
      body,
    };
    const bytes = canonicalJson(record);
    records.push({ value: record, bytes });
    previousBytes = bytes;
  }

  if (
    sourceRecords.size !== sourceManifest.artifacts.length ||
    sourceRecords.size !== 8
  ) {
    reject("SOURCE_CLOSURE_INVALID");
  }
  const retainedSourcePaths = new Set(
    [...sourceRecords.values()].map((source) => source.artifact.retainedPath),
  );
  if (
    sourceManifest.artifacts.some(
      (artifact) => !retainedSourcePaths.has(artifact.retainedPath),
    )
  ) {
    reject("SOURCE_CLOSURE_INVALID");
  }
  if (questions.size === 0) reject("QUESTION_REQUIRED");

  for (const horizon of capture.profile.horizons) {
    const record = records[horizon.lastRecordedSequence - 1]?.value;
    if (
      record === undefined ||
      record.recordedAt !== horizon.recordedAsOf ||
      record.sourceHorizonId !== horizon.horizonId
    ) {
      reject("PROFILE_INVALID");
    }
  }
  if (
    capture.profile.horizons.at(-1).lastRecordedSequence !== records.length
  ) {
    reject("PROFILE_INVALID");
  }

  validateTaskViews(capture, {
    sourceRecords,
    revisions,
    assessments,
    questions,
  });
  return {
    records,
    sourceRecords,
    evidence,
    revisions,
    assessments,
    questions,
    recordHeadSha256: sha256(previousBytes),
  };
}

function validateTaskViews(capture, context) {
  if (!Array.isArray(capture.taskViews) || capture.taskViews.length !== 3) {
    reject("TASK_VIEW_INVALID");
  }
  const taskIds = new Set();
  for (const view of capture.taskViews) {
    assertExactKeys(view, [
      "taskId",
      "horizonId",
      "assertionIds",
      "assessmentIds",
      "questionIds",
      "sourceRecordIds",
    ], "TASK_VIEW_INVALID");
    assertOpaqueId(view.taskId, "TASK_VIEW_INVALID");
    assertOpaqueId(view.horizonId, "TASK_VIEW_INVALID");
    assertUniqueStrings(view.assertionIds, { empty: true, code: "TASK_VIEW_INVALID" });
    assertUniqueStrings(view.assessmentIds, { empty: true, code: "TASK_VIEW_INVALID" });
    assertUniqueStrings(view.questionIds, { empty: true, code: "TASK_VIEW_INVALID" });
    assertUniqueStrings(view.sourceRecordIds, { empty: true, code: "TASK_VIEW_INVALID" });
    if (
      taskIds.has(view.taskId) ||
      !capture.profile.horizons.some((item) => item.horizonId === view.horizonId)
    ) {
      reject("TASK_VIEW_INVALID");
    }
    taskIds.add(view.taskId);
    const isVisible = (reference) =>
      availableHorizonIds(capture.profile, view.horizonId).has(
        reference.sourceHorizonId,
      );
    for (const assertionId of view.assertionIds) {
      const candidates = [...context.revisions.values()].filter(
        (revision) =>
          revision.body.assertionId === assertionId && isVisible(revision),
      );
      if (candidates.length === 0) reject("TASK_VIEW_INVALID");
    }
    for (const assessmentId of view.assessmentIds) {
      const reference = context.assessments.get(assessmentId);
      if (reference === undefined || !isVisible(reference)) {
        reject("TASK_VIEW_INVALID");
      }
    }
    for (const questionId of view.questionIds) {
      const reference = context.questions.get(questionId);
      if (reference === undefined || !isVisible(reference)) {
        reject("TASK_VIEW_INVALID");
      }
    }
    for (const sourceRecordId of view.sourceRecordIds) {
      const reference = context.sourceRecords.get(sourceRecordId);
      if (reference === undefined || !isVisible(reference)) {
        reject("TASK_VIEW_INVALID");
      }
    }
  }
  const expected = new Set([
    "task.pre-fix-bounds",
    "task.post-fix-safeguards",
    "task.residual-unknowns",
  ]);
  if (
    taskIds.size !== expected.size ||
    [...expected].some((taskId) => !taskIds.has(taskId))
  ) {
    reject("TASK_VIEW_INVALID");
  }
}

function publicProfile(capture, sourceManifest, captureSha256) {
  return {
    format: profileFormat,
    identity,
    authorityState: "no-acceptance-decisions",
    contractSha256,
    sourceManifestSha256,
    captureSha256,
    horizons: capture.profile.horizons.map((horizon) => {
      const source = sourceManifest.horizons.find(
        (item) => item.horizonId === horizon.horizonId,
      );
      return {
        horizonId: horizon.horizonId,
        lastRecordedSequence: horizon.lastRecordedSequence,
        recordedAsOf: horizon.recordedAsOf,
        sourceCommitSha1: horizon.sourceCommitSha1,
        sourceCommitSubject: source.subject,
        gitAuthorTimestamp: source.authorTimestamp,
        gitCommitterTimestamp: source.committerTimestamp,
        sourceAvailabilityObservedAt: sourceManifest.upstream.publicObservedAt,
        eventTimeState: "unknown-unless-stated-by-source",
      };
    }),
    taskViews: capture.taskViews,
  };
}

async function loadJourney(journeyRoot) {
  const contractPath = path.join(journeyRoot, "DOGFOOD-CONTRACT.json");
  const sourceManifestPath = path.join(journeyRoot, "SOURCE-MANIFEST.json");
  const capturePath = path.join(journeyRoot, "CAPTURE.json");
  const [contractBytes, sourceManifestBytes, captureBytes] = await Promise.all([
    readRegularNoFollow(contractPath),
    readRegularNoFollow(sourceManifestPath),
    readRegularNoFollow(capturePath),
  ]);
  if (sha256(contractBytes) !== contractSha256) {
    reject("CONTRACT_IDENTITY_MISMATCH");
  }
  if (sha256(sourceManifestBytes) !== sourceManifestSha256) {
    reject("SOURCE_MANIFEST_IDENTITY_MISMATCH");
  }
  const contract = parseStrictJson(contractBytes);
  const sourceManifest = parseStrictJson(sourceManifestBytes);
  const capture = parseStrictJson(captureBytes);
  if (
    contract.identity !== identity ||
    contract.status !== "frozen-before-adaptation"
  ) {
    reject("CONTRACT_IDENTITY_MISMATCH");
  }
  validateSourceManifest(sourceManifest);
  validateCaptureShape(capture, sourceManifest);
  const sourceFiles = new Map();
  for (const artifact of sourceManifest.artifacts) {
    const bytes = await readRegularNoFollow(
      path.join(journeyRoot, artifact.retainedPath),
    );
    if (bytes.length !== artifact.size || sha256(bytes) !== artifact.sha256) {
      reject("SOURCE_HASH_MISMATCH", artifact.retainedPath);
    }
    sourceFiles.set(artifact.retainedPath, bytes);
  }
  const licensePath = sourceManifest.upstream.license.path;
  const licenseBytes = await readRegularNoFollow(path.join(journeyRoot, licensePath));
  if (
    licenseBytes.length !== sourceManifest.upstream.license.size ||
    sha256(licenseBytes) !== sourceManifest.upstream.license.sha256
  ) {
    reject("LICENSE_HASH_MISMATCH");
  }
  const materialized = materializeRecords(capture, sourceManifest, sourceFiles);
  return {
    contract,
    contractBytes,
    sourceManifest,
    sourceManifestBytes,
    capture,
    captureBytes,
    captureSha256: sha256(captureBytes),
    sourceFiles,
    licenseBytes,
    materialized,
  };
}

async function writeNew(filename, bytes) {
  await mkdir(path.dirname(filename), { recursive: true, mode: 0o755 });
  await writeFile(filename, bytes, { flag: "wx", mode: 0o644 });
}

async function createStagingDirectory(outputRoot) {
  const parent = path.dirname(outputRoot);
  await mkdir(parent, { recursive: true });
  const stage = path.join(
    parent,
    `.${path.basename(outputRoot)}.stage-${process.pid}-${randomUUID()}`,
  );
  await mkdir(stage, { mode: 0o755 });
  return stage;
}

export async function buildJourneyBundle(journeyRoot, outputRoot) {
  const journey = await loadJourney(journeyRoot);
  const stage = await createStagingDirectory(outputRoot);
  try {
    const entries = [];
    async function add(relative, role, mediaType, bytes) {
      assertSafeRelativePath(relative);
      await writeNew(path.join(stage, relative), bytes);
      entries.push({
        path: relative,
        role,
        mediaType,
        size: bytes.length,
        sha256: sha256(bytes),
      });
    }

    const profile = publicProfile(
      journey.capture,
      journey.sourceManifest,
      journey.captureSha256,
    );
    await add(
      "profile.json",
      "profile",
      "application/json",
      canonicalJson(profile),
    );
    await add(
      "control/DOGFOOD-CONTRACT.json",
      "control",
      "application/json",
      journey.contractBytes,
    );
    await add(
      "control/SOURCE-MANIFEST.json",
      "control",
      "application/json",
      journey.sourceManifestBytes,
    );
    await add(
      "licenses/MurmurMark-MIT.txt",
      "license",
      "text/plain; charset=utf-8",
      journey.licenseBytes,
    );

    for (const artifact of journey.sourceManifest.artifacts) {
      await add(
        sourceBundlePath(artifact),
        "source",
        mediaTypeFor(artifact.path),
        journey.sourceFiles.get(artifact.retainedPath),
      );
    }
    for (const { value, bytes } of journey.materialized.records) {
      await add(
        `records/${String(value.recordedSequence).padStart(4, "0")}-${value.recordId}.json`,
        "record",
        "application/json",
        bytes,
      );
    }
    entries.sort((left, right) => left.path.localeCompare(right.path));
    const payloadBytes = entries.reduce((total, entry) => total + entry.size, 0);
    if (
      entries.length + 1 > maximumBundleFiles ||
      payloadBytes > maximumBundleBytes
    ) {
      reject("BUNDLE_LIMIT_EXCEEDED");
    }
    const manifest = {
      format: bundleFormat,
      identity,
      contractSha256,
      sourceManifestSha256,
      captureSha256: journey.captureSha256,
      recordCount: journey.materialized.records.length,
      recordHeadSha256: journey.materialized.recordHeadSha256,
      fileCount: entries.length + 1,
      payloadBytes,
      files: entries,
    };
    const manifestBytes = canonicalJson(manifest);
    if (payloadBytes + manifestBytes.length > maximumBundleBytes) {
      reject("BUNDLE_LIMIT_EXCEEDED");
    }
    await writeNew(path.join(stage, "manifest.json"), manifestBytes);
    await rename(stage, outputRoot);
    return {
      status: "bundle-built",
      identity,
      manifestSha256: sha256(manifestBytes),
      recordCount: manifest.recordCount,
      fileCount: manifest.fileCount,
      bundleBytes: payloadBytes + manifestBytes.length,
      captureSha256: journey.captureSha256,
      recordHeadSha256: manifest.recordHeadSha256,
    };
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
}

function validateManifest(manifest) {
  assertExactKeys(manifest, [
    "format",
    "identity",
    "contractSha256",
    "sourceManifestSha256",
    "captureSha256",
    "recordCount",
    "recordHeadSha256",
    "fileCount",
    "payloadBytes",
    "files",
  ], "MANIFEST_INVALID");
  if (
    manifest.format !== bundleFormat ||
    manifest.identity !== identity ||
    manifest.contractSha256 !== contractSha256 ||
    manifest.sourceManifestSha256 !== sourceManifestSha256
  ) {
    reject("MANIFEST_INVALID");
  }
  assertSha256(manifest.captureSha256, "MANIFEST_INVALID");
  assertSha256(manifest.recordHeadSha256, "MANIFEST_INVALID");
  if (
    !Number.isSafeInteger(manifest.recordCount) ||
    manifest.recordCount < 1 ||
    manifest.recordCount > maximumRecords ||
    !Number.isSafeInteger(manifest.fileCount) ||
    manifest.fileCount < 2 ||
    manifest.fileCount > maximumBundleFiles ||
    !Number.isSafeInteger(manifest.payloadBytes) ||
    manifest.payloadBytes < 1 ||
    manifest.payloadBytes > maximumBundleBytes ||
    !Array.isArray(manifest.files) ||
    manifest.files.length + 1 !== manifest.fileCount
  ) {
    reject("BUNDLE_LIMIT_EXCEEDED");
  }
  const paths = new Set();
  let payloadBytes = 0;
  for (const entry of manifest.files) {
    assertExactKeys(entry, ["path", "role", "mediaType", "size", "sha256"],
      "MANIFEST_INVALID");
    assertSafeRelativePath(entry.path);
    assertString(entry.mediaType, "MANIFEST_INVALID");
    assertSha256(entry.sha256, "MANIFEST_INVALID");
    if (
      entry.path === "manifest.json" ||
      paths.has(entry.path) ||
      !["profile", "control", "license", "source", "record"].includes(entry.role) ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 0
    ) {
      reject("MANIFEST_INVALID");
    }
    paths.add(entry.path);
    payloadBytes += entry.size;
  }
  if (payloadBytes !== manifest.payloadBytes) reject("MANIFEST_INVALID");
}

function parseAndValidateProfile(profile, manifest, sourceManifest) {
  assertExactKeys(profile, [
    "format",
    "identity",
    "authorityState",
    "contractSha256",
    "sourceManifestSha256",
    "captureSha256",
    "horizons",
    "taskViews",
  ], "PROFILE_INVALID");
  if (
    profile.format !== profileFormat ||
    profile.identity !== identity ||
    profile.authorityState !== "no-acceptance-decisions" ||
    profile.contractSha256 !== contractSha256 ||
    profile.sourceManifestSha256 !== sourceManifestSha256 ||
    profile.captureSha256 !== manifest.captureSha256 ||
    !Array.isArray(profile.horizons) ||
    profile.horizons.length !== 2 ||
    !Array.isArray(profile.taskViews) ||
    profile.taskViews.length !== 3
  ) {
    reject("PROFILE_INVALID");
  }
  for (const horizon of profile.horizons) {
    assertExactKeys(horizon, [
      "horizonId",
      "lastRecordedSequence",
      "recordedAsOf",
      "sourceCommitSha1",
      "sourceCommitSubject",
      "gitAuthorTimestamp",
      "gitCommitterTimestamp",
      "sourceAvailabilityObservedAt",
      "eventTimeState",
    ], "PROFILE_INVALID");
    const sourceHorizon = sourceManifest.horizons.find(
      (item) => item.horizonId === horizon.horizonId,
    );
    if (
      sourceHorizon === undefined ||
      sourceHorizon.commitSha1 !== horizon.sourceCommitSha1 ||
      sourceHorizon.subject !== horizon.sourceCommitSubject ||
      sourceHorizon.authorTimestamp !== horizon.gitAuthorTimestamp ||
      sourceHorizon.committerTimestamp !== horizon.gitCommitterTimestamp ||
      sourceManifest.upstream.publicObservedAt !==
        horizon.sourceAvailabilityObservedAt ||
      horizon.eventTimeState !== "unknown-unless-stated-by-source"
    ) {
      reject("PROFILE_INVALID");
    }
    assertTimestamp(horizon.recordedAsOf, "PROFILE_INVALID");
  }
}

function verifyRecordBody(record, context) {
  const body = record.body;
  if (record.kind === "SourceSnapshot") {
    assertExactKeys(body, [
      "sourceId",
      "path",
      "originalPath",
      "mediaType",
      "size",
      "sha256",
      "gitBlobSha1",
      "sourceCommitSha1",
    ], "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.sourceId, "RECORD_SHAPE_INVALID");
    assertSafeRelativePath(body.path, "RECORD_SHAPE_INVALID");
    assertSafeRelativePath(body.originalPath, "RECORD_SHAPE_INVALID");
    assertString(body.mediaType, "RECORD_SHAPE_INVALID");
    assertSha256(body.sha256, "RECORD_SHAPE_INVALID");
    assertSha1(body.gitBlobSha1, "RECORD_SHAPE_INVALID");
    assertSha1(body.sourceCommitSha1, "RECORD_SHAPE_INVALID");
    if (
      !Number.isSafeInteger(body.size) ||
      body.size < 0 ||
      context.sourcesByRecordId.has(record.recordId) ||
      context.sourcePaths.has(body.path)
    ) {
      reject("RECORD_SHAPE_INVALID");
    }
    const source = context.sourceFiles.get(body.path);
    const artifact = context.artifactsByBundlePath.get(body.path);
    if (
      source === undefined ||
      artifact === undefined ||
      artifact.path !== body.originalPath ||
      artifact.horizonId !== record.sourceHorizonId ||
      artifact.commitSha1 !== body.sourceCommitSha1 ||
      artifact.gitBlobSha1 !== body.gitBlobSha1 ||
      artifact.size !== body.size ||
      artifact.sha256 !== body.sha256 ||
      source.length !== body.size ||
      sha256(source) !== body.sha256
    ) {
      reject("SOURCE_HASH_MISMATCH");
    }
    context.sourcesByRecordId.set(record.recordId, {
      body,
      sourceHorizonId: record.sourceHorizonId,
      bytes: source,
    });
    context.sourcePaths.add(body.path);
    return;
  }

  if (record.kind === "EvidenceSpan") {
    assertExactKeys(body, [
      "evidenceId",
      "sourceRecordId",
      "relation",
      "byteStart",
      "byteEnd",
      "lineStart",
      "lineEnd",
      "sha256",
      "text",
    ], "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.evidenceId, "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.sourceRecordId, "RECORD_SHAPE_INVALID");
    assertSha256(body.sha256, "RECORD_SHAPE_INVALID");
    if (
      !["states", "supports", "limits"].includes(body.relation) ||
      context.evidence.has(body.evidenceId)
    ) {
      reject("RECORD_SHAPE_INVALID");
    }
    const source = context.sourcesByRecordId.get(body.sourceRecordId);
    if (source === undefined) reject("REFERENCE_DANGLING");
    assertReferenceHorizon(source, record, context.profile);
    if (
      !Number.isSafeInteger(body.byteStart) ||
      !Number.isSafeInteger(body.byteEnd) ||
      !Number.isSafeInteger(body.lineStart) ||
      !Number.isSafeInteger(body.lineEnd) ||
      body.byteStart < 0 ||
      body.byteEnd <= body.byteStart ||
      body.byteEnd > source.bytes.length ||
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
    context.evidence.set(body.evidenceId, {
      body,
      recordId: record.recordId,
      sourceHorizonId: record.sourceHorizonId,
    });
    return;
  }

  if (record.kind === "AssertionRevision") {
    assertExactKeys(body, [
      "assertionId",
      "revisionId",
      "predecessorRevisionId",
      "statement",
      "scope",
      "evidenceIds",
    ], "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.assertionId, "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.revisionId, "RECORD_SHAPE_INVALID");
    assertString(body.statement, "RECORD_SHAPE_INVALID");
    assertString(body.scope, "RECORD_SHAPE_INVALID");
    assertUniqueStrings(body.evidenceIds);
    if (context.revisions.has(body.revisionId)) reject("RECORD_ID_CONFLICT");
    const previous = context.latestRevisionByAssertion.get(body.assertionId);
    if (
      (previous === undefined && body.predecessorRevisionId !== null) ||
      (previous !== undefined &&
        body.predecessorRevisionId !== previous.body.revisionId)
    ) {
      reject("REVISION_CHAIN_INVALID");
    }
    for (const evidenceId of body.evidenceIds) {
      const reference = context.evidence.get(evidenceId);
      if (reference === undefined) reject("REFERENCE_DANGLING");
      assertReferenceHorizon(reference, record, context.profile);
    }
    const revision = {
      body,
      recordId: record.recordId,
      sourceHorizonId: record.sourceHorizonId,
      recordedAt: record.recordedAt,
    };
    context.revisions.set(body.revisionId, revision);
    context.latestRevisionByAssertion.set(body.assertionId, revision);
    return;
  }

  if (record.kind === "Assessment") {
    assertExactKeys(body, [
      "assessmentId",
      "targetRevisionId",
      "stance",
      "reasonCode",
      "statement",
      "evidenceIds",
      "basisRevisionIds",
      "closureSourceRecordIds",
    ], "RECORD_SHAPE_INVALID");
    assertOpaqueId(body.assessmentId, "ASSESSMENT_INVALID");
    assertOpaqueId(body.targetRevisionId, "ASSESSMENT_INVALID");
    assertOpaqueId(body.reasonCode, "ASSESSMENT_INVALID");
    assertString(body.statement, "ASSESSMENT_INVALID");
    assertUniqueStrings(body.evidenceIds);
    assertUniqueStrings(body.basisRevisionIds, { empty: true });
    assertUniqueStrings(body.closureSourceRecordIds);
    if (
      body.stance !== "limit" ||
      context.assessments.has(body.assessmentId)
    ) {
      reject("ASSESSMENT_INVALID");
    }
    const references = [
      context.revisions.get(body.targetRevisionId),
      ...body.evidenceIds.map((id) => context.evidence.get(id)),
      ...body.basisRevisionIds.map((id) => context.revisions.get(id)),
      ...body.closureSourceRecordIds.map((id) =>
        context.sourcesByRecordId.get(id)),
    ];
    if (references.some((reference) => reference === undefined)) {
      reject("REFERENCE_DANGLING");
    }
    for (const reference of references) {
      assertReferenceHorizon(reference, record, context.profile);
    }
    context.assessments.set(body.assessmentId, {
      body,
      recordId: record.recordId,
      sourceHorizonId: record.sourceHorizonId,
      recordedAt: record.recordedAt,
    });
    return;
  }

  if (record.kind === "Question") {
    assertExactKeys(body, [
      "questionId",
      "status",
      "question",
      "reasonCode",
      "basisSourceRecordIds",
      "missingEvidence",
    ], "QUESTION_INVALID");
    assertOpaqueId(body.questionId, "QUESTION_INVALID");
    assertOpaqueId(body.reasonCode, "QUESTION_INVALID");
    assertString(body.question, "QUESTION_INVALID");
    assertUniqueStrings(body.basisSourceRecordIds);
    assertUniqueStrings(body.missingEvidence);
    if (body.status !== "open" || context.questions.has(body.questionId)) {
      reject("QUESTION_INVALID");
    }
    for (const recordId of body.basisSourceRecordIds) {
      const source = context.sourcesByRecordId.get(recordId);
      if (source === undefined) reject("REFERENCE_DANGLING");
      assertReferenceHorizon(source, record, context.profile);
    }
    context.questions.set(body.questionId, {
      body,
      recordId: record.recordId,
      sourceHorizonId: record.sourceHorizonId,
      recordedAt: record.recordedAt,
    });
    return;
  }
  reject("UNKNOWN_FORMAT", record.kind);
}

function verifyRecords(recordsWithBytes, profile, sourceFiles, sourceManifest) {
  const context = {
    profile,
    sourceFiles,
    artifactsByBundlePath: new Map(
      sourceManifest.artifacts.map((artifact) => [
        sourceBundlePath(artifact),
        artifact,
      ]),
    ),
    sourcesByRecordId: new Map(),
    sourcePaths: new Set(),
    evidence: new Map(),
    revisions: new Map(),
    latestRevisionByAssertion: new Map(),
    assessments: new Map(),
    questions: new Map(),
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
      "sourceHorizonId",
      "previousRecordSha256",
      "kind",
      "body",
    ], "RECORD_SHAPE_INVALID");
    if (record.format !== recordFormat || !recordKinds.has(record.kind)) {
      reject("UNKNOWN_FORMAT");
    }
    assertOpaqueId(record.recordId, "RECORD_SHAPE_INVALID");
    assertTimestamp(record.recordedAt, "RECORDED_ORDER_INVALID");
    assertOpaqueId(record.sourceHorizonId, "HORIZON_INVALID");
    if (
      recordIds.has(record.recordId) ||
      record.recordedSequence !== index + 1 ||
      record.recordedAt <= previousRecordedAt ||
      !profile.horizons.some(
        (horizon) => horizon.horizonId === record.sourceHorizonId,
      )
    ) {
      reject("RECORDED_ORDER_INVALID");
    }
    const expectedPath =
      `records/${String(index + 1).padStart(4, "0")}-${record.recordId}.json`;
    if (item.path !== expectedPath) reject("RECORD_PATH_INVALID");
    if (index === 0) {
      if (record.previousRecordSha256 !== null) reject("RECORD_CHAIN_INVALID");
    } else if (record.previousRecordSha256 !== sha256(previousBytes)) {
      reject("RECORD_CHAIN_INVALID");
    }
    recordIds.add(record.recordId);
    previousRecordedAt = record.recordedAt;
    verifyRecordBody(record, context);
    previousBytes = item.bytes;
  }
  if (
    context.sourcesByRecordId.size !== 8 ||
    context.sourcePaths.size !== sourceManifest.artifacts.length ||
    context.questions.size === 0
  ) {
    reject("SOURCE_CLOSURE_INVALID");
  }
  for (const horizon of profile.horizons) {
    const record = recordsWithBytes[horizon.lastRecordedSequence - 1]?.value;
    if (
      record === undefined ||
      record.recordedAt !== horizon.recordedAsOf ||
      record.sourceHorizonId !== horizon.horizonId
    ) {
      reject("PROFILE_INVALID");
    }
  }
  validateTaskViews(
    {
      profile,
      taskViews: profile.taskViews,
    },
    {
      sourceRecords: context.sourcesByRecordId,
      revisions: context.revisions,
      assessments: context.assessments,
      questions: context.questions,
    },
  );
  return {
    ...context,
    records: recordsWithBytes.map((item) => item.value),
    recordHeadSha256: sha256(previousBytes),
  };
}

export async function verifyBundle(bundleRoot, expectedManifestSha256) {
  assertSha256(expectedManifestSha256, "MANIFEST_IDENTITY_INVALID");
  const manifestBytes = await readRegularNoFollow(
    path.join(bundleRoot, "manifest.json"),
  );
  if (sha256(manifestBytes) !== expectedManifestSha256) {
    reject("MANIFEST_IDENTITY_MISMATCH");
  }
  const manifest = parseStrictJson(manifestBytes, { canonical: true });
  validateManifest(manifest);
  const actualFiles = await listFiles(bundleRoot);
  const expectedFiles = [
    "manifest.json",
    ...manifest.files.map((entry) => entry.path),
  ].sort((left, right) => left.localeCompare(right));
  if (
    actualFiles.length !== expectedFiles.length ||
    actualFiles.some((item, index) => item !== expectedFiles[index])
  ) {
    reject("BUNDLE_INVENTORY_MISMATCH");
  }
  const bytesByPath = new Map();
  for (const entry of manifest.files) {
    const bytes = await readRegularNoFollow(path.join(bundleRoot, entry.path));
    if (bytes.length !== entry.size || sha256(bytes) !== entry.sha256) {
      reject("BUNDLE_ENTRY_HASH_MISMATCH", entry.path);
    }
    bytesByPath.set(entry.path, bytes);
  }
  const contractBytes = bytesByPath.get("control/DOGFOOD-CONTRACT.json");
  const sourceManifestBytes = bytesByPath.get("control/SOURCE-MANIFEST.json");
  if (
    contractBytes === undefined ||
    sourceManifestBytes === undefined ||
    sha256(contractBytes) !== contractSha256 ||
    sha256(sourceManifestBytes) !== sourceManifestSha256
  ) {
    reject("CONTROL_IDENTITY_MISMATCH");
  }
  const sourceManifest = parseStrictJson(sourceManifestBytes);
  validateSourceManifest(sourceManifest);
  const profileBytes = bytesByPath.get("profile.json");
  if (profileBytes === undefined) reject("PROFILE_INVALID");
  const profile = parseStrictJson(profileBytes, { canonical: true });
  parseAndValidateProfile(profile, manifest, sourceManifest);

  const sourceFiles = new Map(
    manifest.files
      .filter((entry) => entry.role === "source")
      .map((entry) => [entry.path, bytesByPath.get(entry.path)]),
  );
  const recordEntries = manifest.files
    .filter((entry) => entry.role === "record")
    .sort((left, right) => left.path.localeCompare(right.path));
  if (recordEntries.length !== manifest.recordCount) {
    reject("MANIFEST_INVALID");
  }
  const recordsWithBytes = recordEntries.map((entry) => ({
    path: entry.path,
    bytes: bytesByPath.get(entry.path),
    value: parseStrictJson(bytesByPath.get(entry.path), { canonical: true }),
  }));
  const context = verifyRecords(
    recordsWithBytes,
    profile,
    sourceFiles,
    sourceManifest,
  );
  if (context.recordHeadSha256 !== manifest.recordHeadSha256) {
    reject("RECORD_CHAIN_INVALID");
  }
  return {
    status: "bundle-valid",
    identity,
    manifest,
    manifestSha256: expectedManifestSha256,
    profile,
    sourceManifest,
    records: context.records,
    context,
  };
}

function latestVisibleRevision(context, assertionId, sequence) {
  return context.records
    .filter(
      (record) =>
        record.recordedSequence <= sequence &&
        record.kind === "AssertionRevision" &&
        record.body.assertionId === assertionId,
    )
    .at(-1) ?? null;
}

function evidenceView(context, evidenceId) {
  const evidence = context.evidence.get(evidenceId);
  if (evidence === undefined) reject("REFERENCE_DANGLING");
  const source = context.sourcesByRecordId.get(evidence.body.sourceRecordId);
  return {
    evidenceId,
    relation: evidence.body.relation,
    sourceRecordId: evidence.body.sourceRecordId,
    path: source.body.originalPath,
    sourceHorizonId: source.sourceHorizonId,
    lines: `${evidence.body.lineStart}-${evidence.body.lineEnd}`,
    byteStart: evidence.body.byteStart,
    byteEnd: evidence.body.byteEnd,
    sha256: evidence.body.sha256,
  };
}

export function deriveViews(verification) {
  const { profile, context } = verification;
  const horizons = profile.horizons.map((horizon) => {
    const tasks = profile.taskViews
      .filter((view) => view.horizonId === horizon.horizonId)
      .map((view) => {
        const assertions = view.assertionIds.map((assertionId) => {
          const record = latestVisibleRevision(
            context,
            assertionId,
            horizon.lastRecordedSequence,
          );
          if (record === null) reject("TASK_VIEW_INVALID");
          return {
            assertionId,
            revisionId: record.body.revisionId,
            predecessorRevisionId: record.body.predecessorRevisionId,
            statement: record.body.statement,
            scope: record.body.scope,
            evidence: record.body.evidenceIds.map((id) =>
              evidenceView(context, id)),
          };
        });
        const assessments = view.assessmentIds.map((assessmentId) => {
          const assessment = context.assessments.get(assessmentId);
          return {
            assessmentId,
            targetRevisionId: assessment.body.targetRevisionId,
            stance: assessment.body.stance,
            reasonCode: assessment.body.reasonCode,
            statement: assessment.body.statement,
            evidence: assessment.body.evidenceIds.map((id) =>
              evidenceView(context, id)),
            closureSourceRecordIds: assessment.body.closureSourceRecordIds,
          };
        });
        const questions = view.questionIds.map((questionId) => {
          const question = context.questions.get(questionId);
          return {
            questionId,
            status: question.body.status,
            question: question.body.question,
            reasonCode: question.body.reasonCode,
            missingEvidence: question.body.missingEvidence,
            basisSourceRecordIds: question.body.basisSourceRecordIds,
          };
        });
        const sources = view.sourceRecordIds.map((recordId) => {
          const source = context.sourcesByRecordId.get(recordId);
          return {
            sourceRecordId: recordId,
            path: source.body.originalPath,
            sourceHorizonId: source.sourceHorizonId,
            sha256: source.body.sha256,
          };
        });
        return {
          taskId: view.taskId,
          assertions,
          assessments,
          questions,
          sources,
        };
      });
    return {
      horizonId: horizon.horizonId,
      recordedAsOf: horizon.recordedAsOf,
      sourceCommitSha1: horizon.sourceCommitSha1,
      sourceCommitSubject: horizon.sourceCommitSubject,
      gitAuthorTimestamp: horizon.gitAuthorTimestamp,
      gitCommitterTimestamp: horizon.gitCommitterTimestamp,
      sourceAvailabilityObservedAt: horizon.sourceAvailabilityObservedAt,
      eventTimeState: horizon.eventTimeState,
      recordHeadSha256: sha256(
        canonicalJson(context.records[horizon.lastRecordedSequence - 1]),
      ),
      tasks,
    };
  });
  return {
    format: viewFormat,
    identity,
    authorityState: "no-acceptance-decisions",
    manifestSha256: verification.manifestSha256,
    horizons,
  };
}

function taskTitle(taskId) {
  return {
    "task.pre-fix-bounds": "Pre-fix bounds",
    "task.post-fix-safeguards": "Post-fix safeguards",
    "task.residual-unknowns": "Residual unknowns",
  }[taskId] ?? taskId;
}

export function renderDossier(views) {
  const lines = [
    "# MurmurMark echo-lab correction dossier",
    "",
    `Identity: \`${views.identity}\`.`,
    "",
    `Bundle manifest SHA-256: \`${views.manifestSha256}\`.`,
    "",
    "Authority: no acceptance decision is present. Statements below are",
    "provisional assertions, limitations, and open questions derived from the",
    "retained public source snapshots.",
    "",
  ];
  for (const horizon of views.horizons) {
    lines.push(
      `## ${horizon.horizonId}`,
      "",
      `Recorded as of: \`${horizon.recordedAsOf}\`. Source commit:`,
      `\`${horizon.sourceCommitSha1}\`. Commit subject:`,
      `\`${horizon.sourceCommitSubject}\`. The subject names the change; it is`,
      "not an incident report. Git author and committer time are retained",
      "metadata; publication, execution, and incident time are not inferred.",
      "",
    );
    for (const task of horizon.tasks) {
      lines.push(`### ${taskTitle(task.taskId)}`, "");
      for (const assertion of task.assertions) {
        lines.push(
          `- **${assertion.revisionId}:** ${assertion.statement}`,
          `  Scope: ${assertion.scope}`,
        );
        for (const evidence of assertion.evidence) {
          lines.push(
            `  Evidence: \`${evidence.sourceHorizonId}:${evidence.path}:${evidence.lines}\``,
            `  (span SHA-256 \`${evidence.sha256}\`).`,
          );
        }
      }
      for (const assessment of task.assessments) {
        lines.push(
          `- **Limit — ${assessment.reasonCode}:** ${assessment.statement}`,
        );
        for (const evidence of assessment.evidence) {
          lines.push(
            `  Evidence: \`${evidence.sourceHorizonId}:${evidence.path}:${evidence.lines}\``,
            `  (span SHA-256 \`${evidence.sha256}\`).`,
          );
        }
        if (assessment.closureSourceRecordIds.length > 0) {
          lines.push(
            `  Closed-file basis: ${assessment.closureSourceRecordIds
              .map((item) => `\`${item}\``)
              .join(", ")}.`,
          );
        }
      }
      for (const question of task.questions) {
        lines.push(
          `- **Open question — ${question.questionId}:** ${question.question}`,
          `  Reason: ${question.reasonCode}. Missing: ${question.missingEvidence.join("; ")}.`,
        );
      }
      for (const source of task.sources) {
        lines.push(
          `- **Source boundary:** \`${source.sourceHorizonId}:${source.path}\``,
          `  (file SHA-256 \`${source.sha256}\`).`,
        );
      }
      lines.push("");
    }
  }
  lines.push(
    "## Boundary",
    "",
    "The selected files support a qualified account of local safeguards. They do",
    "not establish an observed incident, its cause or impact, actual test",
    "execution, production safety, power-loss behavior, cross-host exclusion,",
    "or complete resource bounds.",
    "",
  );
  return `${lines.join("\n")}\n`;
}

export function renderSemanticDigest(views) {
  const lines = [
    `identity=${views.identity}`,
    `manifestSha256=${views.manifestSha256}`,
    `authorityState=${views.authorityState}`,
  ];
  for (const horizon of views.horizons) {
    lines.push(
      `horizon=${horizon.horizonId} recordedAsOf=${horizon.recordedAsOf} head=${horizon.recordHeadSha256}`,
    );
    for (const task of horizon.tasks) {
      for (const assertion of task.assertions) {
        lines.push(
          `assertion=${horizon.horizonId}/${assertion.assertionId}/${assertion.revisionId}`,
        );
      }
      for (const assessment of task.assessments) {
        lines.push(
          `limit=${horizon.horizonId}/${assessment.assessmentId}/${assessment.reasonCode}`,
        );
      }
      for (const question of task.questions) {
        lines.push(
          `question=${horizon.horizonId}/${question.questionId}/${question.status}`,
        );
      }
    }
  }
  return `${lines.join("\n")}\n`;
}

export async function writeProjectionDirectory(outputRoot, verification) {
  const views = deriveViews(verification);
  const stage = await createStagingDirectory(outputRoot);
  try {
    await writeNew(path.join(stage, "views.json"), canonicalJson(views));
    await writeNew(
      path.join(stage, "dossier.md"),
      Buffer.from(renderDossier(views), "utf8"),
    );
    await writeNew(
      path.join(stage, "semantic-digest.txt"),
      Buffer.from(renderSemanticDigest(views), "utf8"),
    );
    await rename(stage, outputRoot);
    const files = await listFiles(outputRoot);
    const hashes = {};
    for (const file of files) {
      hashes[file] = sha256(await readRegularNoFollow(path.join(outputRoot, file)));
    }
    return {
      status: "projections-built",
      identity,
      manifestSha256: verification.manifestSha256,
      files,
      hashes,
    };
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
}
