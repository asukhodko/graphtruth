import { createHash } from "node:crypto";
import {
  constants,
  lstat,
  open,
  readFile,
  readdir,
  realpath,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

import {
  parseToolEventTrace,
  validateToolEventTrace,
} from "./codex-sandbox-preflight.mjs";
import { parseStrictJson } from "./private-pack-lock.mjs";

const modulePath = fileURLToPath(import.meta.url);
const toolingDirectory = path.dirname(modulePath);
const repositoryRoot = path.dirname(toolingDirectory);
const packDirectory = path.join(
  repositoryRoot,
  "examples",
  "experiments",
  "author-call-qualification-v1",
  "exploratory-learning-v1",
);
const manifestPath = path.join(packDirectory, "EXECUTION-PACK-MANIFEST.json");
const markerFilename = "READ-SLOT-COMMITTED";
const decoder = new TextDecoder("utf-8", { fatal: true });

export const exploratoryLearningBoundarySha256 =
  "4065f91cd930181eae6eeed520b978fb31361b636944e4bed4b8b7b11b02d58e";
export const exploratoryLearningIdentity =
  "author-call-result-schema-exploratory-learning-v1";
export const exploratoryLearningPackIdentity =
  "author-call-result-schema-exploratory-learning-execution-pack-v1";
export const retainedStdoutBytes = 38_920;
export const retainedStdoutSha256 =
  "75c118902a7b5104e642a3e1ae028e0dcff63f6f2431a67cf4fc575b48d72c0a";
export const maximumFinalMessageBytes = 65_536;
export const maximumReaderWallTimeMilliseconds = 60_000;
export const maximumSyntheticInputBytes = 1_048_576;

export const acceptedLearningAnchors = Object.freeze({
  boundary: Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/EXPLORATORY-LEARNING-BOUNDARY.md",
    sha256: exploratoryLearningBoundarySha256,
    exports: Object.freeze([]),
  }),
  qualificationResult: Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/CODEX-AUTHOR-CALL-QUALIFICATION.json",
    sha256: "aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94",
    exports: Object.freeze([]),
  }),
  qualificationController: Object.freeze({
    path: "tooling/codex-author-call-qualification-v1.mjs",
    sha256: "83f446d225dd8da6d86df1b5d0b4e409157937df9db211913b879e796dfd8f5f",
    exports: Object.freeze([]),
  }),
  qualificationToolingManifest: Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/TOOLING-MANIFEST.json",
    sha256: "bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200",
    exports: Object.freeze([]),
  }),
  syntheticManifest: Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/SYNTHETIC-MANIFEST.json",
    sha256: "ba2b8e825f05179b66ce874fc03a7540b59c15e96495b95764189bec33da1bda",
    exports: Object.freeze([]),
  }),
  strictJsonParser: Object.freeze({
    path: "tooling/private-pack-lock.mjs",
    sha256: "603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b",
    exports: Object.freeze(["parseStrictJson"]),
  }),
  traceParser: Object.freeze({
    path: "tooling/codex-sandbox-preflight.mjs",
    sha256: "28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025",
    exports: Object.freeze(["parseToolEventTrace", "validateToolEventTrace"]),
  }),
});

const expectedFixedSubject = Object.freeze({
  identity: exploratoryLearningIdentity,
  qualificationToolingManifestSha256:
    "bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200",
  qualificationResultSha256:
    "aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94",
  outcomeStatus: "not-qualified",
  outcomeClass: "result-schema",
  retainedStdoutBytes,
  retainedStdoutSha256,
  retainedStderrBytes: 0,
  retainedStderrSha256:
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  expectedPayloadBytes: 32_768,
  expectedPayloadSha256:
    "45f850be04f0c4bf0959754e8dd26f980ff23188b61f9460ed72de0fbb18631f",
  controllerSha256:
    "83f446d225dd8da6d86df1b5d0b4e409157937df9db211913b879e796dfd8f5f",
  strictJsonParserSha256:
    "603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b",
  traceParserSha256:
    "28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025",
  syntheticManifestSha256:
    "ba2b8e825f05179b66ce874fc03a7540b59c15e96495b95764189bec33da1bda",
  qualificationOutputSchemaSha256:
    "fc53db78d5f4c04b0e0c5d94675771b4c2ddd22fd708c5a624952ee6a3edc23e",
});

const expectedPackFiles = Object.freeze([
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/README.md",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/RUN-CARD.template.md",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.example.json",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.schema.json",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SYNTHETIC-TRACE.jsonl",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/duplicate-key-jsonl.jsonl",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/leaking-result.json",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/malformed-jsonl.jsonl",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/missing-final-message.jsonl",
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/tool-event-jsonl.jsonl",
  "tooling/author-call-result-schema-learning-v1",
  "tooling/author-call-result-schema-learning-v1-validator.mjs",
  "tooling/author-call-result-schema-learning-v1-verifier.mjs",
  "tooling/author-call-result-schema-learning-v1.mjs",
  "tooling/author-call-result-schema-learning-v1.test.mjs",
]);

const expectedMutationMatrix = Object.freeze([
  "valid-zero-tool-jsonl",
  "malformed-jsonl",
  "duplicate-json-key",
  "extra-event",
  "tool-event",
  "missing-final-message",
  "duplicate-final-message",
  "non-strict-result-json",
  "missing-root-key",
  "extra-root-key",
  "payload-json-wrong-type",
  "payload-byte-mismatch",
  "all-predicates-pass-evidence-inconsistent",
  "input-size-limit",
  "message-size-limit",
  "reader-wall-time-limit",
  "public-record-size-limit",
  "parser-module-tamper",
  "stdout-symlink",
  "stdout-hardlink",
  "work-root-symlink",
  "file-race-before-open",
  "marker-replay",
  "no-retry",
  "one-protected-pass",
  "leak-instruction",
  "leak-path",
  "leak-error-text",
  "undeclared-field",
  "valid-deletion-transition",
  "invalid-deletion-transition",
  "verifier-manifest-mutation",
  "verifier-source-mutation",
]);

export class ExploratoryLearningReaderError extends Error {
  constructor(code) {
    super(`exploratory learning reader rejected (${code})`);
    this.name = "ExploratoryLearningReaderError";
    this.code = code;
  }
}

function reject(code) {
  throw new ExploratoryLearningReaderError(code);
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function hasExactKeys(value, expected) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function pathIsWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function statFingerprint(stat) {
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
  const leftFingerprint = statFingerprint(left);
  const rightFingerprint = statFingerprint(right);
  return Object.keys(leftFingerprint).every(
    (key) => leftFingerprint[key] === rightFingerprint[key],
  );
}

function assertOwnedDirectory(stat, mode, code) {
  if (
    !stat.isDirectory() ||
    stat.uid !== BigInt(process.getuid()) ||
    (stat.mode & 0o777n) !== BigInt(mode)
  ) {
    reject(code);
  }
}

function assertOwnedProtectedFile(stat, expectedBytes) {
  if (
    !stat.isFile() ||
    stat.uid !== BigInt(process.getuid()) ||
    (stat.mode & 0o777n) !== 0o400n ||
    stat.nlink !== 1n ||
    stat.size !== BigInt(expectedBytes)
  ) {
    reject("PROTECTED_FILE_METADATA");
  }
}

async function assertCanonicalAbsolute(candidate, expectedType) {
  if (typeof candidate !== "string" || !path.isAbsolute(candidate)) {
    reject("ABSOLUTE_PATH_REQUIRED");
  }
  let stat;
  let resolved;
  try {
    [stat, resolved] = await Promise.all([
      lstat(candidate, { bigint: true }),
      realpath(candidate),
    ]);
  } catch {
    reject("PATH_IDENTITY");
  }
  if (resolved !== candidate || stat.isSymbolicLink()) reject("PATH_IDENTITY");
  if (expectedType === "directory" && !stat.isDirectory()) reject("PATH_TYPE");
  if (expectedType === "file" && !stat.isFile()) reject("PATH_TYPE");
  return stat;
}

export function verifyAcceptedAnchorBytes(anchorName, bytes) {
  const anchor = acceptedLearningAnchors[anchorName];
  if (anchor === undefined || !Buffer.isBuffer(bytes)) reject("PUBLIC_ANCHOR_ARGUMENT");
  if (sha256Bytes(bytes) !== anchor.sha256) reject("PUBLIC_ANCHOR_IDENTITY");
  return true;
}

function validateManifestShape(manifest) {
  if (
    !hasExactKeys(manifest, [
      "documentKind",
      "identity",
      "boundarySha256",
      "subject",
      "anchors",
      "files",
      "budgets",
      "claims",
      "mutationMatrix",
    ]) ||
    manifest.documentKind !==
      "graphtruth.author-call-result-schema-exploratory-learning-execution-pack/1" ||
    manifest.identity !== exploratoryLearningPackIdentity ||
    manifest.boundarySha256 !== exploratoryLearningBoundarySha256 ||
    canonicalJson(manifest.subject) !== canonicalJson(expectedFixedSubject) ||
    !Array.isArray(manifest.anchors) ||
    !Array.isArray(manifest.files) ||
    !Array.isArray(manifest.mutationMatrix)
  ) {
    reject("PACK_MANIFEST_SHAPE");
  }
  const expectedAnchors = Object.entries(acceptedLearningAnchors)
    .map(([id, anchor]) => ({
      id,
      path: anchor.path,
      sha256: anchor.sha256,
      exports: [...anchor.exports],
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const actualAnchors = [...manifest.anchors].sort((left, right) =>
    String(left?.path).localeCompare(String(right?.path)),
  );
  if (canonicalJson(actualAnchors) !== canonicalJson(expectedAnchors)) {
    reject("PACK_MANIFEST_ANCHORS");
  }
  const actualPaths = manifest.files.map((entry) => entry?.path);
  if (
    actualPaths.length !== expectedPackFiles.length ||
    actualPaths.some((entry, index) => entry !== expectedPackFiles[index]) ||
    manifest.files.some(
      (entry) =>
        !hasExactKeys(entry, ["path", "role", "mode", "sha256"]) ||
        !isSha256(entry.sha256) ||
        !["0644", "0755"].includes(entry.mode) ||
        typeof entry.role !== "string" ||
        !/^[a-z][a-z0-9-]{0,63}$/.test(entry.role),
    )
  ) {
    reject("PACK_MANIFEST_INVENTORY");
  }
  if (
    !hasExactKeys(manifest.budgets, [
      "protectedInputBytes",
      "protectedFilePasses",
      "readerRunsAfterCommit",
      "maximumFinalMessageBytes",
      "maximumWallTimeSeconds",
      "maximumMemoryBytes",
      "maximumDerivedStateBytes",
      "maximumPublicRecordBytes",
      "networkRequests",
      "retries",
      "resumes",
    ]) ||
    manifest.budgets.protectedInputBytes !== retainedStdoutBytes ||
    manifest.budgets.protectedFilePasses !== 1 ||
    manifest.budgets.readerRunsAfterCommit !== 1 ||
    manifest.budgets.maximumFinalMessageBytes !== maximumFinalMessageBytes ||
    manifest.budgets.maximumWallTimeSeconds !== 60 ||
    manifest.budgets.maximumMemoryBytes !== 134_217_728 ||
    manifest.budgets.maximumDerivedStateBytes !== 131_072 ||
    manifest.budgets.maximumPublicRecordBytes !== 16_384 ||
    manifest.budgets.networkRequests !== 0 ||
    manifest.budgets.retries !== 0 ||
    manifest.budgets.resumes !== 0
  ) {
    reject("PACK_MANIFEST_BUDGETS");
  }
  if (
    !hasExactKeys(manifest.claims, [
      "artificialFixturesOnly",
      "readerNotRunOnRetainedOutput",
      "newModelCallPerformed",
      "terminalCandidateUsed",
      "corpusOrProjectionRead",
      "graphTruthRunPerformed",
    ]) ||
    manifest.claims.artificialFixturesOnly !== true ||
    manifest.claims.readerNotRunOnRetainedOutput !== true ||
    Object.entries(manifest.claims)
      .filter(([key]) => key !== "artificialFixturesOnly" && key !== "readerNotRunOnRetainedOutput")
      .some(([, value]) => value !== false)
  ) {
    reject("PACK_MANIFEST_CLAIMS");
  }
  if (
    manifest.mutationMatrix.length !== expectedMutationMatrix.length ||
    manifest.mutationMatrix.some(
      (caseId, index) => caseId !== expectedMutationMatrix[index],
    )
  ) {
    reject("PACK_MANIFEST_TEST_MATRIX");
  }
}

export async function verifyExecutionPack(expectedManifestSha256) {
  if (!isSha256(expectedManifestSha256)) reject("PACK_MANIFEST_ARGUMENT");
  let manifestBytes;
  let manifest;
  try {
    manifestBytes = await readFile(manifestPath);
    if (sha256Bytes(manifestBytes) !== expectedManifestSha256) {
      reject("PACK_MANIFEST_IDENTITY");
    }
    manifest = parseStrictJson(decoder.decode(manifestBytes));
  } catch (error) {
    if (error instanceof ExploratoryLearningReaderError) throw error;
    reject("PACK_MANIFEST_READ");
  }
  validateManifestShape(manifest);

  for (const [name, anchor] of Object.entries(acceptedLearningAnchors)) {
    let bytes;
    try {
      bytes = await readFile(path.join(repositoryRoot, anchor.path));
    } catch {
      reject("PUBLIC_ANCHOR_READ");
    }
    verifyAcceptedAnchorBytes(name, bytes);
  }
  for (const entry of manifest.files) {
    const absolute = path.join(repositoryRoot, entry.path);
    if (!pathIsWithin(repositoryRoot, absolute)) reject("PACK_FILE_PATH");
    let [bytes, stat] = [null, null];
    try {
      [bytes, stat] = await Promise.all([
        readFile(absolute),
        lstat(absolute, { bigint: true }),
      ]);
    } catch {
      reject("PACK_FILE_READ");
    }
    const expectedMode = entry.mode === "0755" ? 0o755n : 0o644n;
    if (
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      stat.nlink !== 1n ||
      (stat.mode & 0o777n) !== expectedMode ||
      sha256Bytes(bytes) !== entry.sha256
    ) {
      reject("PACK_FILE_IDENTITY");
    }
  }
  return manifest;
}

async function commitReadSlot(workRoot, executionPackManifestSha256) {
  const markerPath = path.join(workRoot, markerFilename);
  const marker = canonicalJson({
    documentKind: "graphtruth.exploratory-learning-read-slot/1",
    identity: exploratoryLearningIdentity,
    boundarySha256: exploratoryLearningBoundarySha256,
    executionPackManifestSha256,
    readerRunsCommitted: 1,
  });
  if (Buffer.byteLength(marker, "utf8") > 4_096) reject("MARKER_SIZE");
  let markerHandle;
  let directoryHandle;
  try {
    markerHandle = await open(
      markerPath,
      constants.O_CREAT |
        constants.O_EXCL |
        constants.O_WRONLY |
        constants.O_NOFOLLOW |
        constants.O_CLOEXEC,
      0o600,
    );
    await markerHandle.writeFile(marker, "utf8");
    await markerHandle.sync();
    await markerHandle.close();
    markerHandle = null;
    directoryHandle = await open(
      workRoot,
      constants.O_RDONLY | constants.O_DIRECTORY | constants.O_CLOEXEC,
    );
    await directoryHandle.sync();
    await directoryHandle.close();
    directoryHandle = null;
  } catch (error) {
    try {
      await markerHandle?.close();
      await directoryHandle?.close();
    } catch {
      // The slot remains terminal after any attempted exclusive marker create.
    }
    if (error?.code === "EEXIST") reject("READ_SLOT_ALREADY_COMMITTED");
    reject("READ_SLOT_COMMIT");
  }
}

async function validatePaths(stdoutPath, workRoot, expectedBytes) {
  const [stdoutStat, workRootStat] = await Promise.all([
    assertCanonicalAbsolute(stdoutPath, "file"),
    assertCanonicalAbsolute(workRoot, "directory"),
  ]);
  const diagnosticRoot = path.dirname(stdoutPath);
  const diagnosticRootStat = await assertCanonicalAbsolute(diagnosticRoot, "directory");
  assertOwnedDirectory(workRootStat, 0o700, "WORK_ROOT_METADATA");
  assertOwnedDirectory(diagnosticRootStat, 0o700, "DIAGNOSTIC_ROOT_METADATA");
  assertOwnedProtectedFile(stdoutStat, expectedBytes);
  if (
    path.basename(stdoutPath) !== "stdout.bin" ||
    pathIsWithin(repositoryRoot, stdoutPath) ||
    pathIsWithin(repositoryRoot, workRoot) ||
    pathIsWithin(diagnosticRoot, workRoot) ||
    pathIsWithin(workRoot, diagnosticRoot)
  ) {
    reject("PATH_BOUNDARY");
  }
  let workEntries;
  try {
    workEntries = await readdir(workRoot);
  } catch {
    reject("WORK_ROOT_READ");
  }
  if (workEntries.includes(markerFilename)) reject("READ_SLOT_ALREADY_COMMITTED");
  if (workEntries.length !== 0) reject("WORK_ROOT_NOT_EMPTY");
  return stdoutStat;
}

export async function readOneUseTrace(
  {
    stdoutPath,
    workRoot,
    executionPackManifestSha256,
    processingAuthorizationRecord,
    expectedInput = Object.freeze({
      bytes: retainedStdoutBytes,
      sha256: retainedStdoutSha256,
    }),
  },
  testHooks = {},
) {
  const now = typeof testHooks.now === "function" ? testHooks.now : Date.now;
  const startedAt = now();
  if (
    !hasExactKeys(expectedInput, ["bytes", "sha256"]) ||
    !Number.isInteger(expectedInput.bytes) ||
    expectedInput.bytes < 1 ||
    expectedInput.bytes > maximumSyntheticInputBytes ||
    !isSha256(expectedInput.sha256)
  ) {
    reject("EXPECTED_INPUT");
  }
  if (
    typeof processingAuthorizationRecord !== "string" ||
    !/^https:\/\/github\.com\/asukhodko\/graphtruth\/issues\/24#issuecomment-[1-9][0-9]{0,19}$/.test(
      processingAuthorizationRecord,
    )
  ) {
    reject("PROCESSING_AUTHORIZATION");
  }
  const productionInput =
    expectedInput.bytes === retainedStdoutBytes &&
    expectedInput.sha256 === retainedStdoutSha256;
  if (!productionInput) {
    let temporaryRoot;
    try {
      temporaryRoot = await realpath(os.tmpdir());
    } catch {
      reject("ARTIFICIAL_INPUT_BOUNDARY");
    }
    const relative = path.relative(temporaryRoot, stdoutPath);
    const firstComponent = relative.split(path.sep)[0];
    if (
      !pathIsWithin(temporaryRoot, stdoutPath) ||
      !pathIsWithin(temporaryRoot, workRoot) ||
      !firstComponent.startsWith("graphtruth-learning-artificial-")
    ) {
      reject("ARTIFICIAL_INPUT_BOUNDARY");
    }
  } else if (processingAuthorizationRecord.endsWith("9999999999999999999")) {
    reject("PROCESSING_AUTHORIZATION");
  }
  await verifyExecutionPack(executionPackManifestSha256);
  const initialStat = await validatePaths(stdoutPath, workRoot, expectedInput.bytes);
  await commitReadSlot(workRoot, executionPackManifestSha256);

  if (typeof testHooks.afterMarkerBeforeOpen === "function") {
    await testHooks.afterMarkerBeforeOpen();
  }

  let protectedHandle;
  try {
    protectedHandle = await open(
      stdoutPath,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_CLOEXEC,
    );
    const openedStat = await protectedHandle.stat({ bigint: true });
    assertOwnedProtectedFile(openedStat, expectedInput.bytes);
    if (!sameFingerprint(initialStat, openedStat)) reject("PROTECTED_FILE_CHANGED");

    const protectedBytes = await protectedHandle.readFile();
    const finalStat = await protectedHandle.stat({ bigint: true });
    if (!sameFingerprint(openedStat, finalStat)) reject("PROTECTED_FILE_CHANGED");
    if (
      protectedBytes.length !== expectedInput.bytes ||
      sha256Bytes(protectedBytes) !== expectedInput.sha256
    ) {
      reject("PROTECTED_FILE_IDENTITY");
    }
    let traceText;
    try {
      traceText = decoder.decode(protectedBytes);
    } catch {
      reject("PROTECTED_FILE_UTF8");
    }
    let trace;
    try {
      trace = validateToolEventTrace(parseToolEventTrace(traceText));
    } catch {
      reject("PROTECTED_TRACE");
    }
    if (
      !hasExactKeys(trace, ["finalMessage", "summary"]) ||
      typeof trace.finalMessage !== "string" ||
      Buffer.byteLength(trace.finalMessage, "utf8") > maximumFinalMessageBytes
    ) {
      reject("FINAL_MESSAGE_BOUNDARY");
    }
    if (now() - startedAt > maximumReaderWallTimeMilliseconds) {
      reject("READER_WALL_TIME");
    }
    try {
      await protectedHandle.close();
      protectedHandle = null;
    } catch {
      reject("PROTECTED_FILE_CLOSE");
    }
    return trace.finalMessage;
  } catch (error) {
    if (error instanceof ExploratoryLearningReaderError) throw error;
    reject("PROTECTED_READ");
  } finally {
    try {
      await protectedHandle?.close();
    } catch {
      // A close failure is terminal and cannot authorize another pass.
    }
  }
}

function parseArguments(argv) {
  const values = new Map();
  const flags = new Set();
  const valueNames = new Set([
    "--stdout",
    "--work-root",
    "--execution-pack-manifest-sha256",
    "--processing-authorization-record",
  ]);
  const flagNames = new Set([
    "--confirm-boundary-accepted",
    "--confirm-pack-accepted",
    "--confirm-one-current-session-exposure-authorized",
    "--confirm-no-separate-model-call",
    "--confirm-no-corpus-processing",
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (valueNames.has(argument)) {
      if (values.has(argument) || index + 1 >= argv.length) reject("ARGUMENTS");
      values.set(argument, argv[index + 1]);
      index += 1;
    } else if (flagNames.has(argument)) {
      if (flags.has(argument)) reject("ARGUMENTS");
      flags.add(argument);
    } else {
      reject("ARGUMENTS");
    }
  }
  if (
    values.size !== valueNames.size ||
    flags.size !== flagNames.size ||
    [...valueNames].some((name) => !values.has(name)) ||
    [...flagNames].some((name) => !flags.has(name))
  ) {
    reject("ARGUMENTS");
  }
  return {
    stdoutPath: values.get("--stdout"),
    workRoot: values.get("--work-root"),
    executionPackManifestSha256: values.get("--execution-pack-manifest-sha256"),
    processingAuthorizationRecord: values.get("--processing-authorization-record"),
  };
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const finalMessage = await readOneUseTrace({
      ...options,
      expectedInput: {
        bytes: retainedStdoutBytes,
        sha256: retainedStdoutSha256,
      },
    });
    process.stdout.write(finalMessage);
  } catch (error) {
    const code =
      error instanceof ExploratoryLearningReaderError
        ? error.code
        : "UNEXPECTED_FAILURE";
    process.stderr.write(`author-call-result-schema-learning-v1: rejected (${code})\n`);
    process.exitCode = 1;
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === modulePath;
if (invokedAsScript) await main();
