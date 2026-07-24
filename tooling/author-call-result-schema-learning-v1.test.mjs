import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmod,
  link,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  acceptedLearningAnchors,
  maximumSyntheticInputBytes,
  readOneUseTrace,
  verifyAcceptedAnchorBytes,
} from "./author-call-result-schema-learning-v1.mjs";
import {
  classifyLearningMessage,
  LearningMessageClassificationError,
  LearningResultValidationError,
  validateLearningResult,
  validateLearningResultTransition,
} from "./author-call-result-schema-learning-v1-validator.mjs";
import {
  executionPackMutationMatrix,
  readExecutionPackEvidence,
  verifyExecutionPackEvidence,
} from "./author-call-result-schema-learning-v1-verifier.mjs";
import {
  parseToolEventTrace,
  validateToolEventTrace,
} from "./codex-sandbox-preflight.mjs";
import { parseStrictJson } from "./private-pack-lock.mjs";

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.dirname(toolingDirectory);
const packRoot = path.join(
  repositoryRoot,
  "examples",
  "experiments",
  "author-call-qualification-v1",
  "exploratory-learning-v1",
);
const manifestPath = path.join(packRoot, "EXECUTION-PACK-MANIFEST.json");
const authorizationRecord =
  "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-9999999999999999999";

const declaredMutationCases = [
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
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalJson(value) {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
  return structuredClone(value);
}

function fourEventTrace(message) {
  return [
    { type: "thread.started", thread_id: "artificial-thread" },
    { type: "turn.started" },
    { type: "item.completed", item: { type: "agent_message", text: message } },
    { type: "turn.completed", usage: { input_tokens: 1, output_tokens: 1 } },
  ]
    .map((event) => JSON.stringify(event))
    .join("\n")
    .concat("\n");
}

async function manifestSha256() {
  return sha256(await readFile(manifestPath));
}

async function makeReaderCase(t, traceText = fourEventTrace('{"payloadJson":"artificial"}')) {
  const canonicalTemporaryRoot = await realpath(os.tmpdir());
  const root = await mkdtemp(path.join(canonicalTemporaryRoot, "graphtruth-learning-artificial-"));
  const diagnosticRoot = path.join(root, "diagnostic");
  const workRoot = path.join(root, "work");
  await mkdir(diagnosticRoot, { mode: 0o700 });
  await chmod(diagnosticRoot, 0o700);
  await mkdir(workRoot, { mode: 0o700 });
  await chmod(workRoot, 0o700);
  const stdoutPath = path.join(diagnosticRoot, "stdout.bin");
  const bytes = Buffer.from(traceText, "utf8");
  await writeFile(stdoutPath, bytes, { mode: 0o600 });
  await chmod(stdoutPath, 0o400);
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
  });
  return {
    root,
    diagnosticRoot,
    workRoot,
    stdoutPath,
    bytes,
    options: {
      stdoutPath,
      workRoot,
      executionPackManifestSha256: await manifestSha256(),
      processingAuthorizationRecord: authorizationRecord,
      expectedInput: {
        bytes: bytes.length,
        sha256: sha256(bytes),
      },
    },
  };
}

async function loadSafeExample() {
  return parseStrictJson(
    await readFile(path.join(packRoot, "SAFE-RESULT.example.json"), "utf8"),
  );
}

function recordFromObservation(example, observation) {
  return {
    ...clone(example),
    predicates: observation.predicates,
    firstFailure: observation.firstFailure,
    measurements: observation.measurements,
  };
}

function assertValidationCode(callback, code) {
  assert.throws(callback, (error) => {
    assert.ok(error instanceof LearningResultValidationError);
    assert.ok(error.codes.includes(code), `expected ${code}; got ${error.codes.join(",")}`);
    return true;
  });
}

test("the declared mutation matrix is closed", () => {
  assert.deepEqual([...executionPackMutationMatrix], declaredMutationCases);
  assert.equal(new Set(declaredMutationCases).size, declaredMutationCases.length);
});

test("valid-zero-tool-jsonl: the artificial four-event trace is accepted", async () => {
  const source = await readFile(path.join(packRoot, "SYNTHETIC-TRACE.jsonl"), "utf8");
  const result = validateToolEventTrace(parseToolEventTrace(source));
  assert.equal(result.summary.eventCount, 4);
  assert.equal(result.summary.toolEventCount, 0);
  assert.equal(typeof result.finalMessage, "string");
});

test("malformed-jsonl and duplicate-json-key fail closed", async () => {
  for (const filename of ["malformed-jsonl.jsonl", "duplicate-key-jsonl.jsonl"]) {
    const source = await readFile(
      path.join(packRoot, "fixtures", "negative", filename),
      "utf8",
    );
    assert.throws(() => parseToolEventTrace(source));
  }
});

test("extra-event, tool-event, missing-final-message and duplicate-final-message fail", async () => {
  const valid = fourEventTrace("artificial");
  const events = parseToolEventTrace(valid);
  assert.throws(() =>
    validateToolEventTrace([
      ...events.slice(0, 3),
      { type: "item.completed", item: { type: "reasoning", text: "artificial" } },
      events[3],
    ]),
  );
  assert.throws(() =>
    validateToolEventTrace([
      events[0],
      events[1],
      { type: "item.completed", item: { type: "function_call", name: "artificial" } },
      events[3],
    ]),
  );
  assert.throws(() =>
    validateToolEventTrace([
      events[0],
      events[1],
      { type: "item.completed", item: { type: "reasoning", text: "artificial" } },
      events[3],
    ]),
  );
  assert.throws(() =>
    validateToolEventTrace([
      events[0],
      events[1],
      events[2],
      { type: "item.completed", item: { type: "agent_message", text: "artificial-2" } },
      events[3],
    ]),
  );
});

test("non-strict-result-json is the first observable failure", () => {
  const expected = "p".repeat(32_768);
  for (const message of [
    '{"payloadJson":"artificial",}',
    '{"payloadJson":"artificial","payloadJson":"duplicate"}',
    "not json",
  ]) {
    const observation = classifyLearningMessage(message, expected);
    assert.equal(observation.firstFailure.code, "strict-json");
    assert.equal(observation.predicates.strictJson.state, "failed");
    assert.equal(observation.predicates.closedObjectShape.state, "not-evaluated");
  }
});

test("missing-root-key and extra-root-key stop at the closed object shape", () => {
  const expected = "p".repeat(32_768);
  for (const message of [
    "{}",
    '{"payloadJson":"artificial","extra":"artificial"}',
    "[]",
  ]) {
    const observation = classifyLearningMessage(message, expected);
    assert.equal(observation.firstFailure.code, "closed-object-shape");
    assert.equal(observation.predicates.strictJson.state, "passed");
    assert.equal(observation.predicates.closedObjectShape.state, "failed");
    assert.equal(observation.predicates.payloadJsonString.state, "not-evaluated");
  }
});

test("payload-json-wrong-type stops before byte comparison", () => {
  const observation = classifyLearningMessage(
    '{"payloadJson":{"artificial":true}}',
    "p".repeat(32_768),
  );
  assert.equal(observation.firstFailure.code, "payload-json-type");
  assert.equal(observation.predicates.payloadJsonString.state, "failed");
  assert.equal(observation.predicates.expectedPayloadBytes.state, "not-evaluated");
  assert.equal(observation.measurements.payloadJsonBytes.value, null);
});

test("payload-byte-mismatch records only bounded counts", () => {
  const expected = "p".repeat(32_768);
  const observed = "q".repeat(32_767);
  const observation = classifyLearningMessage(JSON.stringify({ payloadJson: observed }), expected);
  assert.equal(observation.firstFailure.code, "payload-json-byte-mismatch");
  assert.equal(observation.measurements.payloadJsonBytes.value, 32_767);
  assert.equal(observation.measurements.expectedObservedByteDelta.value, -1);
  assert.equal(observation.predicates.expectedPayloadBytes.state, "failed");
});

test("all-predicates-pass-evidence-inconsistent is the only all-pass result", async () => {
  const expected = "p".repeat(32_768);
  const observation = classifyLearningMessage(JSON.stringify({ payloadJson: expected }), expected);
  assert.equal(observation.firstFailure.code, "evidence-inconsistent");
  assert.ok(
    Object.values(observation.predicates).every((predicate) => predicate.state === "passed"),
  );
  const record = recordFromObservation(await loadSafeExample(), observation);
  assert.equal(validateLearningResult(record), record);
});

test("the artificial safe example satisfies the semantic contract", async () => {
  const example = await loadSafeExample();
  assert.equal(validateLearningResult(example), example);
});

test("input-size-limit rejects before a read slot can be committed", async (t) => {
  const subject = await makeReaderCase(t);
  await assert.rejects(
    readOneUseTrace({
      ...subject.options,
      expectedInput: {
        bytes: maximumSyntheticInputBytes + 1,
        sha256: "0".repeat(64),
      },
    }),
    (error) => error.code === "EXPECTED_INPUT",
  );
  await assert.rejects(lstat(path.join(subject.workRoot, "READ-SLOT-COMMITTED")));
});

test("message-size-limit is terminal after one artificial pass", async (t) => {
  const subject = await makeReaderCase(t, fourEventTrace("x".repeat(65_537)));
  await assert.rejects(
    readOneUseTrace(subject.options),
    (error) => error.code === "FINAL_MESSAGE_BOUNDARY",
  );
  assert.equal((await lstat(path.join(subject.workRoot, "READ-SLOT-COMMITTED"))).isFile(), true);
});

test("reader-wall-time-limit is deterministic and terminal", async (t) => {
  const subject = await makeReaderCase(t);
  const times = [0, 60_001];
  await assert.rejects(
    readOneUseTrace(subject.options, {
      now: () => times.shift() ?? 60_001,
    }),
    (error) => error.code === "READER_WALL_TIME",
  );
});

test("public-record-size-limit rejects an attempted oversized extension", async () => {
  const example = await loadSafeExample();
  example.unexpected = "x".repeat(20_000);
  assertValidationCode(() => validateLearningResult(example), "public-record-size");
});

test("parser-module-tamper is rejected by exact accepted identity", async () => {
  for (const [name, anchor] of Object.entries(acceptedLearningAnchors)) {
    if (!["strictJsonParser", "traceParser"].includes(name)) continue;
    const bytes = await readFile(path.join(repositoryRoot, anchor.path));
    assert.equal(verifyAcceptedAnchorBytes(name, bytes), true);
    assert.throws(
      () => verifyAcceptedAnchorBytes(name, Buffer.concat([bytes, Buffer.from("\n")])),
      (error) => error.code === "PUBLIC_ANCHOR_IDENTITY",
    );
  }
});

test("stdout-symlink is rejected before slot commitment", async (t) => {
  const canonicalTemporaryRoot = await realpath(os.tmpdir());
  const root = await mkdtemp(path.join(canonicalTemporaryRoot, "graphtruth-learning-artificial-"));
  const diagnosticRoot = path.join(root, "diagnostic");
  const workRoot = path.join(root, "work");
  await mkdir(diagnosticRoot, { mode: 0o700 });
  await chmod(diagnosticRoot, 0o700);
  await mkdir(workRoot, { mode: 0o700 });
  await chmod(workRoot, 0o700);
  const bytes = Buffer.from(fourEventTrace("artificial"));
  const target = path.join(root, "artificial-target");
  await writeFile(target, bytes, { mode: 0o600 });
  await chmod(target, 0o400);
  const stdoutPath = path.join(diagnosticRoot, "stdout.bin");
  await symlink(target, stdoutPath);
  t.after(async () => rm(root, { recursive: true, force: true }));
  await assert.rejects(
    readOneUseTrace({
      stdoutPath,
      workRoot,
      executionPackManifestSha256: await manifestSha256(),
      processingAuthorizationRecord: authorizationRecord,
      expectedInput: { bytes: bytes.length, sha256: sha256(bytes) },
    }),
    (error) => ["PATH_IDENTITY", "PATH_TYPE"].includes(error.code),
  );
});

test("stdout-hardlink is rejected before slot commitment", async (t) => {
  const canonicalTemporaryRoot = await realpath(os.tmpdir());
  const root = await mkdtemp(path.join(canonicalTemporaryRoot, "graphtruth-learning-artificial-"));
  const diagnosticRoot = path.join(root, "diagnostic");
  const workRoot = path.join(root, "work");
  await mkdir(diagnosticRoot, { mode: 0o700 });
  await chmod(diagnosticRoot, 0o700);
  await mkdir(workRoot, { mode: 0o700 });
  await chmod(workRoot, 0o700);
  const bytes = Buffer.from(fourEventTrace("artificial"));
  const target = path.join(root, "artificial-target");
  await writeFile(target, bytes, { mode: 0o600 });
  await chmod(target, 0o400);
  const stdoutPath = path.join(diagnosticRoot, "stdout.bin");
  await link(target, stdoutPath);
  t.after(async () => rm(root, { recursive: true, force: true }));
  await assert.rejects(
    readOneUseTrace({
      stdoutPath,
      workRoot,
      executionPackManifestSha256: await manifestSha256(),
      processingAuthorizationRecord: authorizationRecord,
      expectedInput: { bytes: bytes.length, sha256: sha256(bytes) },
    }),
    (error) => error.code === "PROTECTED_FILE_METADATA",
  );
});

test("work-root-symlink is rejected before slot commitment", async (t) => {
  const subject = await makeReaderCase(t);
  const linkedWorkRoot = path.join(subject.root, "linked-work");
  await symlink(subject.workRoot, linkedWorkRoot);
  await assert.rejects(
    readOneUseTrace({ ...subject.options, workRoot: linkedWorkRoot }),
    (error) => ["PATH_IDENTITY", "PATH_TYPE"].includes(error.code),
  );
});

test("file-race-before-open changes the inode and fails terminally", async (t) => {
  const subject = await makeReaderCase(t);
  await assert.rejects(
    readOneUseTrace(subject.options, {
      afterMarkerBeforeOpen: async () => {
        await rename(subject.stdoutPath, `${subject.stdoutPath}.artificial-old`);
        await writeFile(subject.stdoutPath, subject.bytes, { mode: 0o600 });
        await chmod(subject.stdoutPath, 0o400);
      },
    }),
    (error) => error.code === "PROTECTED_FILE_CHANGED",
  );
});

test("marker-replay rejects a second reader run", async (t) => {
  const message = '{"payloadJson":"artificial"}';
  const subject = await makeReaderCase(t, fourEventTrace(message));
  assert.equal(await readOneUseTrace(subject.options), message);
  await assert.rejects(
    readOneUseTrace(subject.options),
    (error) => error.code === "READ_SLOT_ALREADY_COMMITTED",
  );
});

test("no-retry and one-protected-pass remain structural source invariants", async () => {
  const source = await readFile(
    path.join(toolingDirectory, "author-call-result-schema-learning-v1.mjs"),
    "utf8",
  );
  assert.equal(
    source.split("const protectedBytes = await protectedHandle.readFile();").length - 1,
    1,
  );
  assert.equal(
    source.split("await commitReadSlot(workRoot, executionPackManifestSha256);").length - 1,
    1,
  );
  assert.equal(/function\s+(?:retry|resume|repair|normalize)/i.test(source), false);
});

test("leak-instruction, leak-path, leak-error-text and undeclared-field are rejected", async () => {
  const example = await loadSafeExample();
  for (const [container, key, value] of [
    [example, "instruction", "artificial"],
    [example.bindings, "path", "/artificial/not-a-real-private-path"],
    [example.firstFailure, "errorText", "artificial"],
    [example.routes, "comment", "artificial"],
  ]) {
    const mutated = clone(example);
    const target =
      container === example
        ? mutated
        : container === example.bindings
          ? mutated.bindings
          : container === example.firstFailure
            ? mutated.firstFailure
            : mutated.routes;
    target[key] = value;
    assertValidationCode(() => validateLearningResult(mutated), "closed-object-shape");
  }
  const leaking = parseStrictJson(
    await readFile(
      path.join(packRoot, "fixtures", "negative", "leaking-result.json"),
      "utf8",
    ),
  );
  assertValidationCode(() => validateLearningResult(leaking), "closed-object-shape");
});

test("valid-deletion-transition changes only the three declared flags", async () => {
  const before = await loadSafeExample();
  const after = clone(before);
  after.deletion = {
    stdout: "deleted",
    stderr: "deleted-unread",
    workRoot: "deleted",
  };
  assert.equal(validateLearningResultTransition(before, after), after);
});

test("invalid-deletion-transition rejects observation, route and partial-phase changes", async () => {
  const before = await loadSafeExample();
  const changedRoute = clone(before);
  changedRoute.deletion = {
    stdout: "deleted",
    stderr: "deleted-unread",
    workRoot: "deleted",
  };
  changedRoute.routes.recommended = "alternate-execution";
  assertValidationCode(
    () => validateLearningResultTransition(before, changedRoute),
    "non-deletion-field-changed",
  );

  const partial = clone(before);
  partial.deletion.stdout = "deleted";
  assertValidationCode(() => validateLearningResult(partial), "deletion-phase");

  const terminal = clone(before);
  terminal.deletion = {
    stdout: "deleted",
    stderr: "deleted-unread",
    workRoot: "deleted",
  };
  assertValidationCode(
    () => validateLearningResultTransition(terminal, terminal),
    "transition-source-not-pending",
  );
});

test("classification rejects an oversized final message before analysis", () => {
  assert.throws(
    () => classifyLearningMessage("x".repeat(65_537), "p".repeat(32_768)),
    (error) =>
      error instanceof LearningMessageClassificationError &&
      error.code === "CLASSIFICATION_INPUT",
  );
});

function copyEvidence(evidence) {
  return {
    manifestBytes: Buffer.from(evidence.manifestBytes),
    fileBytes: new Map(
      [...evidence.fileBytes].map(([key, value]) => [key, Buffer.from(value)]),
    ),
    fileModes: new Map(evidence.fileModes),
    anchorBytes: new Map(
      [...evidence.anchorBytes].map(([key, value]) => [key, Buffer.from(value)]),
    ),
  };
}

function rebindComponent(evidence, relativePath, newBytes) {
  evidence.fileBytes.set(relativePath, newBytes);
  const manifest = parseStrictJson(evidence.manifestBytes.toString("utf8"));
  const entry = manifest.files.find((candidate) => candidate.path === relativePath);
  entry.sha256 = sha256(newBytes);
  evidence.manifestBytes = canonicalJson(manifest);
  return sha256(evidence.manifestBytes);
}

test("verifier-manifest-mutation is rejected even under its recomputed digest", async () => {
  const evidence = copyEvidence(await readExecutionPackEvidence());
  const manifest = parseStrictJson(evidence.manifestBytes.toString("utf8"));
  manifest.claims.readerNotRunOnRetainedOutput = false;
  evidence.manifestBytes = canonicalJson(manifest);
  assert.throws(
    () => verifyExecutionPackEvidence(evidence, sha256(evidence.manifestBytes)),
    (error) => error.codes.includes("claim-contract"),
  );

  const subjectEvidence = copyEvidence(await readExecutionPackEvidence());
  const changedSubject = parseStrictJson(subjectEvidence.manifestBytes.toString("utf8"));
  changedSubject.subject.expectedPayloadBytes += 1;
  subjectEvidence.manifestBytes = canonicalJson(changedSubject);
  assert.throws(
    () =>
      verifyExecutionPackEvidence(
        subjectEvidence,
        sha256(subjectEvidence.manifestBytes),
      ),
    (error) => error.codes.includes("manifest-shape"),
  );
});

test("verifier-source-mutation detects forbidden reader and verifier capabilities", async () => {
  const original = await readExecutionPackEvidence();
  const readerEvidence = copyEvidence(original);
  const readerPath = "tooling/author-call-result-schema-learning-v1.mjs";
  const readerBytes = Buffer.concat([
    Buffer.from('import "node:http";\n'),
    readerEvidence.fileBytes.get(readerPath),
  ]);
  const readerManifestSha = rebindComponent(readerEvidence, readerPath, readerBytes);
  assert.throws(
    () => verifyExecutionPackEvidence(readerEvidence, readerManifestSha),
    (error) => error.codes.includes("reader-forbidden-capability"),
  );

  const verifierEvidence = copyEvidence(original);
  const verifierPath = "tooling/author-call-result-schema-learning-v1-verifier.mjs";
  const verifierBytes = Buffer.concat([
    Buffer.from(
      'import { readOneUseTrace } from "./author-call-result-schema-learning-v1.mjs";\n',
    ),
    verifierEvidence.fileBytes.get(verifierPath),
  ]);
  const verifierManifestSha = rebindComponent(
    verifierEvidence,
    verifierPath,
    verifierBytes,
  );
  assert.throws(
    () => verifyExecutionPackEvidence(verifierEvidence, verifierManifestSha),
    (error) => error.codes.includes("verifier-reader-dependency"),
  );
});
