import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as qualification from "./codex-author-call-qualification-v1.mjs";

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.dirname(toolingDirectory);
const modulePath = path.join(
  toolingDirectory,
  "codex-author-call-qualification-v1.mjs",
);

const expectedOutcomeClasses = Object.freeze([
  "qualified",
  "preflight-identity",
  "auth-carrier",
  "workspace-setup",
  "ephemeral-state-setup",
  "process-spawn",
  "stdin-write",
  "timeout",
  "output-limit",
  "nonzero-exit",
  "signal",
  "process-group-cleanup",
  "output-utf8",
  "jsonl-trace",
  "model-identity",
  "result-schema",
  "state-cleanup",
  "auth-carrier-changed",
  "unknown-terminal-failure",
]);

const expectedStageIds = Object.freeze([
  "preflight-identity",
  "synthetic-prompt-build",
  "workspace-setup",
  "auth-carrier-precheck",
  "ephemeral-state-setup",
  "call-slot-commit",
  "process-spawn",
  "stdin-write",
  "process-wait",
  "output-budget",
  "process-exit",
  "process-group-cleanup",
  "output-utf8",
  "jsonl-trace",
  "model-identity",
  "result-schema",
  "state-cleanup",
  "auth-carrier-recheck",
]);

const safeOwnerAuthorizationRecord =
  "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-9999999999";
const fakeCodexPath = "/synthetic/fake-codex-that-must-never-run";
const fakeWorkspacePath =
  `/private/tmp/graphtruth-author-call-qualification-test-${process.pid}-never-created`;
const syntheticManifestComponent =
  "examples/experiments/author-call-qualification-v1/SYNTHETIC-MANIFEST.json";
const toolingComponentPaths = Object.freeze([
  "tooling/codex-author-call-qualification-v1",
  "tooling/codex-author-call-qualification-v1.mjs",
  "tooling/codex-author-call-qualification-v1.test.mjs",
  syntheticManifestComponent,
  "examples/experiments/author-call-qualification-v1/QUALIFICATION-RESULT.schema.json",
  "tooling/codex-sandbox-preflight.mjs",
  "tooling/private-pack-lock.mjs",
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function traceJsonl(finalMessage, {
  threadId = "synthetic-qualification-thread",
  mutate = (events) => events,
} = {}) {
  const events = mutate([
    { type: "thread.started", thread_id: threadId },
    { type: "turn.started" },
    {
      type: "item.completed",
      item: { type: "agent_message", text: finalMessage },
    },
    { type: "turn.completed", usage: {} },
  ]);
  return `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
}

function fakeToolingEvidence() {
  const items = qualification.buildSyntheticProjectionItems();
  const prompt = qualification.buildAuthorCallQualificationPrompt();
  const schema = qualification.buildAuthorCallQualificationOutputSchema();
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const components = Object.fromEntries(
    toolingComponentPaths.map((relative) => [
      relative,
      sha256(Buffer.from(`synthetic-component:${relative}`, "utf8")),
    ]),
  );
  const manifestSha256 = sha256(
    Buffer.from("synthetic-tooling-manifest", "utf8"),
  );
  return {
    manifestSha256,
    components,
    manifest: {
      synthetic: {
        manifestSha256: components[syntheticManifestComponent],
        seed: qualification.authorCallQualificationSeed,
        items: items.map(({ id, filename, bytes, sha256: digest }) => ({
          id,
          filename,
          bytes,
          sha256: digest,
        })),
        prompt: {
          bytes: Buffer.byteLength(prompt, "utf8"),
          sha256: sha256(Buffer.from(prompt, "utf8")),
        },
        payload: {
          bytes: Buffer.byteLength(payloadJson, "utf8"),
          sha256: sha256(Buffer.from(payloadJson, "utf8")),
        },
        outputSchema: {
          sha256: sha256(Buffer.from(canonicalJson(schema), "utf8")),
        },
      },
    },
  };
}

function qualificationOptions(evidence = fakeToolingEvidence()) {
  return {
    repository: repositoryRoot,
    diagnosticRoot: "/synthetic/diagnostic-root",
    codex: fakeCodexPath,
    authCarrier: "/synthetic/auth-carrier",
    toolingManifest: "/synthetic/tooling-manifest.json",
    toolingManifestSha256: evidence.manifestSha256,
    ownerCallAuthorizationRecord: safeOwnerAuthorizationRecord,
    openaiProcessingAuthorized: true,
    syntheticOnlyConfirmed: true,
    noFreezeAuthorized: true,
  };
}

function qualifiedObservation({
  resultClass = "qualified",
  stdout,
  stderr = "",
  spawnAttempted = true,
  spawnSucceeded = true,
  stdinWritten = true,
  exitKind = "exit-code",
  exitCode = 0,
  signal = null,
  timeoutTriggered = false,
  terminationRequested = false,
  sigtermSent = false,
  sigkillSent = false,
  processGroupAbsent = true,
  stdoutLimitExceeded = false,
  stderrLimitExceeded = false,
  stdoutTruncated = false,
  stderrTruncated = false,
  stdoutUtf8Valid = true,
  stderrUtf8Valid = true,
} = {}) {
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const normalizedStdout =
    stdout ?? traceJsonl(JSON.stringify({ payloadJson }));
  const stdoutBuffer = Buffer.from(normalizedStdout ?? "", "utf8");
  const stderrBuffer = Buffer.from(stderr ?? "", "utf8");
  return {
    resultClass,
    spawnAttempted,
    spawnSucceeded,
    stdinWritten,
    exitKind,
    exitCode,
    signal,
    timeoutTriggered,
    terminationRequested,
    sigtermSent,
    sigkillSent,
    processGroupAbsent,
    stdoutBuffer,
    stderrBuffer,
    stdout: stdoutUtf8Valid === false ? null : normalizedStdout,
    stderr: stderrUtf8Valid === false ? null : stderr,
    stdoutObservedBytes: stdoutBuffer.length,
    stderrObservedBytes: stderrBuffer.length,
    stdoutLimitExceeded,
    stderrLimitExceeded,
    stdoutTruncated,
    stderrTruncated,
    stdoutUtf8Valid,
    stderrUtf8Valid,
  };
}

function defaultQualificationDependencies(evidence = fakeToolingEvidence()) {
  return {
    now: () => new Date("2026-07-23T00:00:00.000Z"),
    verifyToolingManifest: async () => evidence,
    runIdentityPreflight: async (executable) => {
      assert.equal(executable, fakeCodexPath);
    },
    createDiagnosticRoot: async () => "/synthetic/diagnostic-root-created",
    validateAuthCarrier: async () => {},
    createModelWorkspace: async () => ({
      workspace: fakeWorkspacePath,
      schemaPath: path.join(
        fakeWorkspacePath,
        "input",
        "qualification-result.schema.json",
      ),
    }),
    removeModelWorkspace: async () => {},
    withEphemeralState: async (_authCarrier, _workspace, action) => ({
      value: await action({
        home: "/synthetic/home",
        codexHome: "/synthetic/codex-home",
        tmpdir: "/synthetic/tmp",
      }),
      lifecycle: {
        perCallStateRootRemoved: true,
        authCarrierUnchanged: true,
      },
    }),
    commitCallSlot: async () => {},
    processRunner: async (executable) => {
      assert.equal(executable, fakeCodexPath);
      return qualifiedObservation();
    },
    writePrivateDiagnostics: async () => {},
  };
}

async function runQualificationScenario(overrides = {}) {
  const evidence = fakeToolingEvidence();
  return await qualification.runAuthorCallQualification(
    qualificationOptions(evidence),
    {
      ...defaultQualificationDependencies(evidence),
      ...overrides,
    },
  );
}

function errorWithCode(code) {
  return Object.assign(new Error(`synthetic failure: ${code}`), { code });
}

async function runLocalNode(source, {
  timeout = 5_000,
  maxBuffer = qualification.authorCallQualificationMaximumBuffer,
  input = "synthetic-input\n",
} = {}) {
  return await qualification.runQualifiedProcess(
    process.execPath,
    ["-e", source],
    {
      cwd: repositoryRoot,
      env: {
        LANG: "C",
        LC_ALL: "C",
        PATH: "/usr/bin:/bin",
      },
      input,
      timeout,
      maxBuffer,
    },
  );
}

function fakeChild({ stdinError = false } = {}) {
  const child = new EventEmitter();
  child.pid = 424242;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdin = new EventEmitter();
  child.kill = () => true;
  child.stdin.end = (_input, _encoding, callback) => {
    queueMicrotask(() => {
      child.emit("spawn");
      if (stdinError) child.stdin.emit("error", new Error("synthetic stdin"));
      else callback();
      child.emit("close", 0, null);
    });
  };
  return child;
}

function assertNoUnsafePublicText(value) {
  const serialized = canonicalJson(value);
  for (const forbidden of [
    "/Users/private",
    "/private/secret",
    "gho_SYNTHETIC_SECRET",
    "Bearer synthetic-secret",
    "synthetic-auth-target",
    "thread_id",
    "rawStdout",
    "rawStderr",
    "CODEX_HOME",
    "TMPDIR",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
}

test("the public API exposes one closed 19-class qualification contract", () => {
  assert.deepEqual(
    [...qualification.authorCallQualificationResultClasses],
    expectedOutcomeClasses,
  );
  assert.deepEqual(
    [...qualification.authorCallQualificationStageIds],
    expectedStageIds,
  );
  for (const name of [
    "buildSyntheticProjectionItems",
    "buildAuthorCallQualificationPrompt",
    "buildAuthorCallQualificationOutputSchema",
    "runQualifiedProcess",
    "runAuthorCallQualification",
    "verifyAuthorCallQualificationTooling",
    "validateAuthorCallQualificationExecution",
    "validateAuthorCallQualificationReport",
    "parseAuthorCallQualificationArguments",
    "AuthorCallQualificationError",
  ]) {
    assert.equal(typeof qualification[name], "function", name);
  }
});

test("the synthetic projection is deterministic, four-item, and contains no PEP material", () => {
  const first = qualification.buildSyntheticProjectionItems();
  const second = qualification.buildSyntheticProjectionItems();
  assert.deepEqual(second, first);
  assert.equal(first.length, 4);
  assert.deepEqual(
    first.map((item) => item.filename),
    [
      "synthetic-0001.rst",
      "synthetic-0002.rst",
      "synthetic-0003.rst",
      "synthetic-0004.rst",
    ],
  );

  const serialized = canonicalJson(first);
  for (const forbidden of [
    "PEP 3107",
    "PEP 563",
    "PEP 649",
    "PEP 749",
    "python-annotations-semantics-v1",
  ]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  for (const item of first) {
    assert.match(item.sha256, /^[0-9a-f]{64}$/);
    assert.equal(item.bytes > 0, true);
    assert.equal(Buffer.byteLength(item.content, "utf8"), item.bytes);
    assert.equal(item.mediaType, "text/x-rst");
  }
});

test("the prompt and structured-output schema are deterministic and closed", () => {
  const prompt = qualification.buildAuthorCallQualificationPrompt();
  const schema = qualification.buildAuthorCallQualificationOutputSchema();

  assert.equal(prompt, qualification.buildAuthorCallQualificationPrompt());
  assert.match(prompt, /untrusted/i);
  assert.match(prompt, /Do not call tools/);
  assert.equal(prompt.includes("/Users/"), false);
  assert.equal(prompt.includes("PEP 3107"), false);
  assert.equal(prompt.includes(safeOwnerAuthorizationRecord), false);
  assert.equal(prompt.includes("issuecomment-"), false);
  assert.equal(
    Buffer.byteLength(prompt, "utf8"),
    qualification.authorCallQualificationPromptBytes,
  );

  assert.equal(schema.type, "object");
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.required, ["payloadJson"]);
  assert.deepEqual(Object.keys(schema.properties), ["payloadJson"]);
  assert.equal(schema.properties.payloadJson.type, "string");
  assert.equal(
    schema.properties.payloadJson.minLength,
    qualification.authorCallQualificationPayloadBytes,
  );
  assert.equal(
    schema.properties.payloadJson.maxLength,
    qualification.authorCallQualificationPayloadBytes,
  );
});

test("the accepted source has no corpus/projection argument or live provider test hook", async () => {
  const source = await readFile(modulePath, "utf8");
  for (const forbidden of [
    "--projection",
    "--corpus",
    "projectionRoot",
    "corpusRoot",
    "EVALUATION-FREEZE-TERMINAL",
    ".graphtruth-evaluation-freeze",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.doesNotMatch(
    source,
    /from\s+["']\.\/codex-evaluation-freeze-v2\.mjs["']/,
    "the qualification must not import the real v2 prompt or contract",
  );
});

test("trace fixture itself is the exact four-event, zero-tool JSONL shape", () => {
  const finalMessage = JSON.stringify({ payloadJson: "{}" });
  const trace = traceJsonl(finalMessage);
  const lines = trace.trimEnd().split("\n").map((line) => JSON.parse(line));
  assert.deepEqual(
    lines.map((event) =>
      event.type === "item.completed"
        ? `${event.type}:${event.item.type}`
        : event.type
    ),
    [
      "thread.started",
      "turn.started",
      "item.completed:agent_message",
      "turn.completed",
    ],
  );
  assert.equal(sha256(Buffer.from(trace)).length, 64);
});

test("public-text guard rejects representative path, token, trace, and environment leaks", () => {
  assertNoUnsafePublicText({
    documentKind: "graphtruth.codex-author-call-qualification-result/1",
    outcomeClass: "qualified",
    stdoutSha256: sha256(Buffer.alloc(0)),
    stderrSha256: sha256(Buffer.alloc(0)),
  });
  for (const leaked of [
    { path: "/Users/private/secret" },
    { error: "gho_SYNTHETIC_SECRET" },
    { thread_id: "synthetic-qualification-thread" },
    { environment: "CODEX_HOME=/private/secret" },
  ]) {
    assert.throws(() => assertNoUnsafePublicText(leaked));
  }
});

test("argument parser has no corpus input and requires a separate future authorization", async () => {
  assert.throws(
    () => qualification.parseAuthorCallQualificationArguments([]),
    (error) => error instanceof qualification.AuthorCallQualificationError,
  );
  assert.throws(
    () =>
      qualification.parseAuthorCallQualificationArguments([
        "--projection",
        "/synthetic/forbidden",
      ]),
    (error) => error instanceof qualification.AuthorCallQualificationError,
  );

  const parsed = qualification.parseAuthorCallQualificationArguments([
    "--repository",
    "/synthetic/repository",
    "--diagnostic-root",
    "/synthetic/diagnostic-root",
    "--codex",
    "/synthetic/codex",
    "--auth-carrier",
    "/synthetic/auth-carrier",
    "--tooling-manifest",
    "/synthetic/tooling-manifest.json",
    "--tooling-manifest-sha256",
    "a".repeat(64),
    "--owner-call-authorization-record",
    safeOwnerAuthorizationRecord,
    "--confirm-openai-processing-authorized",
    "--confirm-synthetic-only",
    "--confirm-no-freeze-authorized",
  ]);
  assert.equal(parsed.ownerCallAuthorizationRecord, safeOwnerAuthorizationRecord);
  assert.equal(parsed.openaiProcessingAuthorized, true);
  assert.equal(parsed.syntheticOnlyConfirmed, true);
  assert.equal(parsed.noFreezeAuthorized, true);
  assert.equal("projectionRoot" in parsed, false);
  assert.equal("corpusRoot" in parsed, false);

  for (const oldRecord of [
    "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5050785383",
    "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5054344754",
  ]) {
    await assert.rejects(
      qualification.runAuthorCallQualification(
        {
          ...qualificationOptions(),
          ownerCallAuthorizationRecord: oldRecord,
        },
        defaultQualificationDependencies(),
      ),
      (error) =>
        error instanceof qualification.AuthorCallQualificationError &&
        error.code === "USAGE",
    );
  }
});

test("all 19 terminal result classes are reachable without a live Codex call", async (t) => {
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const outputLimitObservation = qualifiedObservation({
    resultClass: "output-limit",
    stdout: "x".repeat(qualification.authorCallQualificationMaximumBuffer),
    terminationRequested: true,
    sigtermSent: true,
    stdoutLimitExceeded: true,
    stdoutTruncated: true,
    stdoutUtf8Valid: null,
    stderrUtf8Valid: null,
  });
  outputLimitObservation.stdoutObservedBytes += 1;
  outputLimitObservation.stdout = null;
  outputLimitObservation.stderr = null;

  const invalidUtf8Observation = qualifiedObservation({
    resultClass: "output-utf8",
    stdout: "",
    stdoutUtf8Valid: false,
    stderrUtf8Valid: false,
  });
  invalidUtf8Observation.stdoutBuffer = Buffer.from([0xff]);
  invalidUtf8Observation.stdoutObservedBytes = 1;
  invalidUtf8Observation.stdout = null;
  invalidUtf8Observation.stderr = null;

  const scenarios = [
    {
      expectedClass: "qualified",
      expectedStage: "completed",
      consumed: 1,
      overrides: {},
    },
    {
      expectedClass: "preflight-identity",
      expectedStage: "preflight-identity",
      consumed: 0,
      overrides: {
        runIdentityPreflight: async () => {
          throw new Error("synthetic preflight failure");
        },
      },
    },
    {
      expectedClass: "auth-carrier",
      expectedStage: "auth-carrier-precheck",
      consumed: 0,
      overrides: {
        validateAuthCarrier: async () => {
          throw new Error("synthetic auth failure");
        },
      },
    },
    {
      expectedClass: "workspace-setup",
      expectedStage: "workspace-setup",
      consumed: 0,
      overrides: {
        createModelWorkspace: async () => {
          throw new Error("synthetic workspace failure");
        },
      },
    },
    {
      expectedClass: "ephemeral-state-setup",
      expectedStage: "ephemeral-state-setup",
      consumed: 0,
      overrides: {
        withEphemeralState: async () => {
          throw new Error("synthetic ephemeral-state failure");
        },
      },
    },
    {
      expectedClass: "process-spawn",
      expectedStage: "process-spawn",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "process-spawn",
            stdout: "",
            spawnSucceeded: false,
            stdinWritten: false,
            exitKind: "not-started",
            exitCode: null,
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "stdin-write",
      expectedStage: "stdin-write",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "stdin-write",
            stdout: "",
            stdinWritten: false,
            terminationRequested: true,
            sigtermSent: true,
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "timeout",
      expectedStage: "process-wait",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "timeout",
            stdout: "",
            exitKind: "signal",
            exitCode: null,
            signal: "SIGTERM",
            timeoutTriggered: true,
            terminationRequested: true,
            sigtermSent: true,
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "output-limit",
      expectedStage: "output-budget",
      consumed: 1,
      overrides: {
        processRunner: async () => outputLimitObservation,
      },
    },
    {
      expectedClass: "nonzero-exit",
      expectedStage: "process-exit",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "nonzero-exit",
            stdout: "",
            exitCode: 7,
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "signal",
      expectedStage: "process-exit",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "signal",
            stdout: "",
            exitKind: "signal",
            exitCode: null,
            signal: "SIGTERM",
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "process-group-cleanup",
      expectedStage: "process-group-cleanup",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            resultClass: "process-group-cleanup",
            stdout: "",
            terminationRequested: true,
            sigtermSent: true,
            sigkillSent: true,
            processGroupAbsent: false,
            stdoutUtf8Valid: null,
            stderrUtf8Valid: null,
          }),
      },
    },
    {
      expectedClass: "output-utf8",
      expectedStage: "output-utf8",
      consumed: 1,
      overrides: {
        processRunner: async () => invalidUtf8Observation,
      },
    },
    {
      expectedClass: "jsonl-trace",
      expectedStage: "jsonl-trace",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            stdout: traceJsonl(JSON.stringify({ payloadJson }), {
              mutate: (events) => [
                events[0],
                events[1],
                {
                  type: "item.completed",
                  item: { type: "command_execution", text: "synthetic" },
                },
                events[3],
              ],
            }),
          }),
      },
    },
    {
      expectedClass: "model-identity",
      expectedStage: "model-identity",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({ stderr: "synthetic stderr\n" }),
      },
    },
    {
      expectedClass: "result-schema",
      expectedStage: "result-schema",
      consumed: 1,
      overrides: {
        processRunner: async () =>
          qualifiedObservation({
            stdout: traceJsonl(JSON.stringify({ payloadJson: "wrong" })),
          }),
      },
    },
    {
      expectedClass: "state-cleanup",
      expectedStage: "state-cleanup",
      consumed: 1,
      overrides: {
        withEphemeralState: async (_authCarrier, _workspace, action) => {
          await action({
            home: "/synthetic/home",
            codexHome: "/synthetic/codex-home",
            tmpdir: "/synthetic/tmp",
          });
          throw errorWithCode("EPHEMERAL_CODEX_HOME_CLEANUP");
        },
      },
    },
    {
      expectedClass: "auth-carrier-changed",
      expectedStage: "auth-carrier-recheck",
      consumed: 1,
      overrides: {
        withEphemeralState: async (_authCarrier, _workspace, action) => {
          await action({
            home: "/synthetic/home",
            codexHome: "/synthetic/codex-home",
            tmpdir: "/synthetic/tmp",
          });
          throw errorWithCode("AUTH_CARRIER_CHANGED");
        },
      },
    },
    {
      expectedClass: "unknown-terminal-failure",
      expectedStage: "state-cleanup",
      consumed: 1,
      overrides: {
        withEphemeralState: async (_authCarrier, _workspace, action) => ({
          value: await action({
            home: "/synthetic/home",
            codexHome: "/synthetic/codex-home",
            tmpdir: "/synthetic/tmp",
          }),
          lifecycle: {
            perCallStateRootRemoved: false,
            authCarrierUnchanged: false,
          },
        }),
      },
    },
  ];

  const observedClasses = new Set();
  for (const scenario of scenarios) {
    await t.test(scenario.expectedClass, async () => {
      const report = await runQualificationScenario(scenario.overrides);
      observedClasses.add(report.outcome.class);
      assert.equal(report.outcome.class, scenario.expectedClass);
      assert.equal(report.outcome.terminalStage, scenario.expectedStage);
      assert.equal(report.invocation.modelCallsConsumed, scenario.consumed);
      assert.equal(
        report.invocation.callSlotCommitted,
        scenario.consumed === 1,
      );
      assert.deepEqual(
        qualification.validateAuthorCallQualificationExecution(report),
        [],
      );
      qualification.validateAuthorCallQualificationReport(report);
      assertNoUnsafePublicText(report);
    });
  }
  assert.deepEqual(
    [...observedClasses].sort(),
    [...expectedOutcomeClasses].sort(),
  );
});

test("call consumption starts only after the durable slot marker", async () => {
  const beforeMarker = await runQualificationScenario({
    commitCallSlot: async () => {
      throw new Error("synthetic marker failure");
    },
  });
  assert.equal(beforeMarker.outcome.class, "ephemeral-state-setup");
  assert.equal(beforeMarker.outcome.terminalStage, "call-slot-commit");
  assert.equal(beforeMarker.invocation.callSlotCommitted, false);
  assert.equal(beforeMarker.invocation.modelCallsConsumed, 0);
  assert.equal(beforeMarker.invocation.spawnAttempted, false);

  let calls = 0;
  const afterMarker = await runQualificationScenario({
    processRunner: async () => {
      calls += 1;
      throw new Error("synthetic post-marker process failure");
    },
  });
  assert.equal(calls, 1);
  assert.equal(afterMarker.outcome.class, "process-spawn");
  assert.equal(afterMarker.invocation.callSlotCommitted, true);
  assert.equal(afterMarker.invocation.modelCallsConsumed, 1);
  assert.equal(afterMarker.invocation.spawnAttempted, false);
});

test("cleanup failures take precedence, while auth mutation is terminally dominant", async () => {
  const cleanupAfterTimeout = await runQualificationScenario({
    processRunner: async () =>
      qualifiedObservation({
        resultClass: "timeout",
        stdout: "",
        exitKind: "signal",
        exitCode: null,
        signal: "SIGTERM",
        timeoutTriggered: true,
        terminationRequested: true,
        sigtermSent: true,
        stdoutUtf8Valid: null,
        stderrUtf8Valid: null,
      }),
    withEphemeralState: async (_authCarrier, _workspace, action) => {
      await action({
        home: "/synthetic/home",
        codexHome: "/synthetic/codex-home",
        tmpdir: "/synthetic/tmp",
      });
      throw errorWithCode("EPHEMERAL_CODEX_HOME_CLEANUP");
    },
  });
  assert.equal(cleanupAfterTimeout.outcome.class, "state-cleanup");
  assert.equal(cleanupAfterTimeout.invocation.modelCallsConsumed, 1);

  const authAfterTimeoutAndWorkspaceCleanup = await runQualificationScenario({
    processRunner: async () =>
      qualifiedObservation({
        resultClass: "timeout",
        stdout: "",
        exitKind: "signal",
        exitCode: null,
        signal: "SIGTERM",
        timeoutTriggered: true,
        terminationRequested: true,
        sigtermSent: true,
        stdoutUtf8Valid: null,
        stderrUtf8Valid: null,
      }),
    withEphemeralState: async (_authCarrier, _workspace, action) => {
      await action({
        home: "/synthetic/home",
        codexHome: "/synthetic/codex-home",
        tmpdir: "/synthetic/tmp",
      });
      throw errorWithCode("AUTH_CARRIER_CHANGED");
    },
    removeModelWorkspace: async () => {
      throw new Error("synthetic workspace cleanup failure");
    },
  });
  assert.equal(
    authAfterTimeoutAndWorkspaceCleanup.outcome.class,
    "auth-carrier-changed",
  );
  assert.equal(
    authAfterTimeoutAndWorkspaceCleanup.outcome.terminalStage,
    "auth-carrier-recheck",
  );
  assert.equal(authAfterTimeoutAndWorkspaceCleanup.lifecycle.workspaceRemoved, false);
});

test("the checked-in synthetic manifest exactly anchors every generated byte identity", async () => {
  const manifestPath = path.join(
    repositoryRoot,
    "examples",
    "experiments",
    "author-call-qualification-v1",
    "SYNTHETIC-MANIFEST.json",
  );
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const items = qualification.buildSyntheticProjectionItems();
  const prompt = qualification.buildAuthorCallQualificationPrompt();
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const payload = JSON.parse(payloadJson);
  const outputSchema = qualification.buildAuthorCallQualificationOutputSchema();

  assert.equal(
    manifest.documentKind,
    qualification.authorCallQualificationSyntheticManifestKind,
  );
  assert.equal(manifest.seed, qualification.authorCallQualificationSeed);
  assert.deepEqual(manifest.sourceBoundary, {
    generatedOnly: true,
    pythonOrPepMaterial: false,
    corpusOrProjectionInput: false,
    evaluationContract: false,
  });
  assert.deepEqual(
    manifest.items,
    items.map(({ id, filename, mediaType, bytes, sha256: digest }) => ({
      id,
      filename,
      mediaType,
      bytes,
      sha256: digest,
    })),
  );
  assert.deepEqual(manifest.prompt, {
    bytes: Buffer.byteLength(prompt, "utf8"),
    sha256: sha256(Buffer.from(prompt, "utf8")),
  });
  assert.deepEqual(manifest.payload, {
    bytes: Buffer.byteLength(payloadJson, "utf8"),
    sha256: sha256(Buffer.from(payloadJson, "utf8")),
    workUnitCount: payload.workUnits.length,
    matrixCellCount: payload.matrixCells.length,
    checkCount: payload.checks.length,
  });
  assert.deepEqual(manifest.outputSchema, {
    sha256: sha256(Buffer.from(canonicalJson(outputSchema), "utf8")),
  });
});

test("the checked-in tooling manifest verifies every frozen component and v2 anchor", async () => {
  const manifestPath = path.join(
    repositoryRoot,
    "examples/experiments/author-call-qualification-v1/TOOLING-MANIFEST.json",
  );
  const manifestBytes = await readFile(manifestPath);
  const evidence = await qualification.verifyAuthorCallQualificationTooling({
    repository: repositoryRoot,
    toolingManifest: manifestPath,
    toolingManifestSha256: sha256(manifestBytes),
  });
  assert.equal(
    evidence.manifest.identity,
    "codex-author-call-qualification-v1",
  );
  assert.equal(evidence.manifest.components.length, 7);
});

test("runQualifiedProcess accepts exactly 1 MiB and rejects the next byte per stream", async (t) => {
  const limit = qualification.authorCallQualificationMaximumBuffer;
  for (const stream of ["stdout", "stderr"]) {
    await t.test(stream, async () => {
      const writer = stream === "stdout" ? "stdout" : "stderr";
      const exact = await runLocalNode(`
        process.stdin.resume();
        process.stdin.on("end", () => {
          process.${writer}.write(Buffer.alloc(${limit}, 0x61));
        });
      `);
      assert.equal(exact.resultClass, "qualified");
      assert.equal(exact[`${stream}ObservedBytes`], limit);
      assert.equal(exact[`${stream}Buffer`].length, limit);
      assert.equal(exact[`${stream}LimitExceeded`], false);
      assert.equal(exact[`${stream}Truncated`], false);
      assert.equal(exact[`${stream}Utf8Valid`], true);

      const exceeded = await runLocalNode(`
        process.stdin.resume();
        process.stdin.on("end", () => {
          process.${writer}.write(Buffer.alloc(${limit + 1}, 0x61));
        });
      `);
      assert.equal(exceeded.resultClass, "output-limit");
      assert.equal(exceeded[`${stream}ObservedBytes`] > limit, true);
      assert.equal(exceeded[`${stream}Buffer`].length, limit);
      assert.equal(exceeded[`${stream}LimitExceeded`], true);
      assert.equal(exceeded[`${stream}Truncated`], true);
      assert.equal(exceeded.terminationRequested, true);
      assert.equal(exceeded.processGroupAbsent, true);
    });
  }
});

test("runQualifiedProcess classifies local fake-process transport failures", async (t) => {
  await t.test("synchronous spawn failure", async () => {
    const result = await qualification.runQualifiedProcess(
      "/synthetic/never-executed",
      [],
      {
        cwd: repositoryRoot,
        env: {},
        input: "synthetic",
        timeout: 1_000,
        maxBuffer: 1_024,
      },
      {
        spawn: () => {
          throw new Error("synthetic spawn");
        },
      },
    );
    assert.equal(result.resultClass, "process-spawn");
    assert.equal(result.spawnAttempted, true);
    assert.equal(result.spawnSucceeded, false);
    assert.equal(result.stdinWritten, false);
  });

  await t.test("error after spawn is bounded and has an unobserved exit", async () => {
    const child = fakeChild();
    child.stdin.end = (_input, _encoding, callback) => {
      queueMicrotask(() => {
        child.emit("spawn");
        callback();
        child.emit("error", new Error("synthetic post-spawn error"));
      });
    };
    const result = await qualification.runQualifiedProcess(
      "/synthetic/never-executed",
      [],
      {
        cwd: repositoryRoot,
        env: {},
        input: "synthetic",
        timeout: 1_000,
        maxBuffer: 1_024,
      },
      {
        spawn: () => child,
        processGroupExists: () => false,
        signalProcessGroup: () => {},
      },
    );
    assert.equal(result.resultClass, "process-spawn");
    assert.equal(result.spawnSucceeded, true);
    assert.equal(result.exitKind, "unobserved");
    assert.equal(result.exitCode, null);
    assert.equal(result.signal, null);
  });

  await t.test("stdin failure after spawn", async () => {
    const child = fakeChild({ stdinError: true });
    const result = await qualification.runQualifiedProcess(
      "/synthetic/never-executed",
      [],
      {
        cwd: repositoryRoot,
        env: {},
        input: "synthetic",
        timeout: 1_000,
        maxBuffer: 1_024,
      },
      {
        spawn: () => child,
        processGroupExists: () => false,
        signalProcessGroup: () => {},
      },
    );
    assert.equal(result.resultClass, "stdin-write");
    assert.equal(result.spawnSucceeded, true);
    assert.equal(result.stdinWritten, false);
    assert.equal(result.terminationRequested, true);
  });

  await t.test("nonzero exit", async () => {
    const result = await runLocalNode(`
      process.stdin.resume();
      process.stdin.on("end", () => process.exit(7));
    `);
    assert.equal(result.resultClass, "nonzero-exit");
    assert.equal(result.exitKind, "exit-code");
    assert.equal(result.exitCode, 7);
    assert.equal(result.processGroupAbsent, true);
  });

  await t.test("signal", async () => {
    const result = await runLocalNode(`
      process.stdin.resume();
      process.stdin.on("end", () => process.kill(process.pid, "SIGTERM"));
    `);
    assert.equal(result.resultClass, "signal");
    assert.equal(result.exitKind, "signal");
    assert.equal(result.signal, "SIGTERM");
    assert.equal(result.processGroupAbsent, true);
  });

  await t.test("timeout", async () => {
    const result = await runLocalNode(`
      process.stdin.resume();
      setInterval(() => {}, 1000);
    `, { timeout: 50 });
    assert.equal(result.resultClass, "timeout");
    assert.equal(result.timeoutTriggered, true);
    assert.equal(result.terminationRequested, true);
    assert.equal(result.sigtermSent, true);
    assert.equal(result.processGroupAbsent, true);
  });

  await t.test("timeout resolves even when the child never emits close", async () => {
    const child = fakeChild();
    child.stdin.end = (_input, _encoding, callback) => {
      child.emit("spawn");
      callback();
    };
    const signals = [];
    const result = await qualification.runQualifiedProcess(
      "/synthetic/never-executed",
      [],
      {
        cwd: repositoryRoot,
        env: {},
        input: "synthetic",
        timeout: 1,
        maxBuffer: 1_024,
      },
      {
        spawn: () => child,
        setTimer: (callback) => {
          queueMicrotask(callback);
          return Symbol("synthetic-timer");
        },
        clearTimer: () => {},
        terminationGraceMilliseconds: 0,
        finalizationGraceMilliseconds: 0,
        processGroupExists: () => false,
        signalProcessGroup: (_pid, signal) => signals.push(signal),
      },
    );
    assert.equal(result.resultClass, "timeout");
    assert.equal(result.exitKind, "unobserved");
    assert.equal(result.timeoutTriggered, true);
    assert.equal(result.processGroupAbsent, true);
    assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  });

  await t.test("invalid UTF-8", async () => {
    const result = await runLocalNode(`
      process.stdin.resume();
      process.stdin.on("end", () => process.stdout.write(Buffer.from([0xff])));
    `);
    assert.equal(result.resultClass, "output-utf8");
    assert.equal(result.stdoutUtf8Valid, false);
    assert.equal(result.stdout, null);
  });

  await t.test("lingering process group", async () => {
    const child = fakeChild();
    let clock = 0;
    const signals = [];
    const result = await qualification.runQualifiedProcess(
      "/synthetic/never-executed",
      [],
      {
        cwd: repositoryRoot,
        env: {},
        input: "synthetic",
        timeout: 1_000,
        maxBuffer: 1_024,
      },
      {
        spawn: () => child,
        now: () => {
          const value = clock;
          clock += 1_001;
          return value;
        },
        delay: async () => {},
        processGroupExists: () => true,
        signalProcessGroup: (_pid, signal) => signals.push(signal),
      },
    );
    assert.equal(result.resultClass, "process-group-cleanup");
    assert.equal(result.spawnSucceeded, true);
    assert.equal(result.stdinWritten, true);
    assert.equal(result.processGroupAbsent, false);
    assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  });
});

test("JSONL admission rejects malformed, duplicate, extra, and tool-like traces", async (t) => {
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const validFinal = JSON.stringify({ payloadJson });
  const validEvents = traceJsonl(validFinal)
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line));
  const invalidTraces = new Map([
    ["not JSON", "not-json\n"],
    ["missing final newline", traceJsonl(validFinal).trimEnd()],
    [
      "duplicate JSON key",
      `${traceJsonl(validFinal).split("\n")[0]}\n` +
        '{"type":"turn.started","type":"turn.started"}\n' +
        `${traceJsonl(validFinal).split("\n").slice(2).join("\n")}`,
    ],
    [
      "extra event",
      `${[
        ...validEvents.slice(0, 2),
        { type: "item.completed", item: { type: "reasoning", text: "synthetic" } },
        ...validEvents.slice(2),
      ].map((event) => JSON.stringify(event)).join("\n")}\n`,
    ],
    [
      "tool event",
      traceJsonl(validFinal, {
        mutate: (events) => [
          events[0],
          events[1],
          {
            type: "item.completed",
            item: { type: "command_execution", text: "synthetic" },
          },
          events[3],
        ],
      }),
    ],
  ]);

  for (const [name, stdout] of invalidTraces) {
    await t.test(name, async () => {
      const report = await runQualificationScenario({
        processRunner: async () => qualifiedObservation({ stdout }),
      });
      assert.equal(report.outcome.class, "jsonl-trace");
      assert.equal(report.outcome.terminalStage, "jsonl-trace");
      assert.equal(report.jsonl.observed, true);
      assert.equal(report.jsonl.valid, false);
      assert.equal(report.structuredResult.observed, false);
      assertNoUnsafePublicText(report);
    });
  }
});

test("structured result admission is strict and payload-identity preserving", async (t) => {
  const payloadJson = qualification.buildSyntheticPayloadJson();
  const invalidFinalMessages = new Map([
    ["invalid JSON", "not-json"],
    ["duplicate key", `{"payloadJson":"x","payloadJson":"${"y".repeat(32)}"}`],
    [
      "extra key",
      JSON.stringify({ payloadJson, extra: "synthetic" }),
    ],
    ["wrong payload", JSON.stringify({ payloadJson: "x".repeat(32_768) })],
  ]);
  for (const [name, finalMessage] of invalidFinalMessages) {
    await t.test(name, async () => {
      const report = await runQualificationScenario({
        processRunner: async () =>
          qualifiedObservation({ stdout: traceJsonl(finalMessage) }),
      });
      assert.equal(report.outcome.class, "result-schema");
      assert.equal(report.outcome.terminalStage, "result-schema");
      assert.equal(report.jsonl.valid, true);
      assert.equal(report.structuredResult.observed, true);
      assert.equal(report.structuredResult.schemaValid, false);
      assert.equal(report.structuredResult.expectedPayloadMatched, false);
      assertNoUnsafePublicText(report);
    });
  }
});

test("public report validator rejects every nested extension and free-text channel", async (t) => {
  const report = await runQualificationScenario();
  const mutations = new Map([
    ["root extra", (value) => {
      value.extra = true;
    }],
    ["tooling extra", (value) => {
      value.tooling.extra = true;
    }],
    ["runtime extra", (value) => {
      value.runtime.extra = true;
    }],
    ["synthetic input extra", (value) => {
      value.syntheticInput.extra = true;
    }],
    ["timing extra", (value) => {
      value.timing.extra = true;
    }],
    ["invocation extra", (value) => {
      value.invocation.extra = true;
    }],
    ["outcome extra", (value) => {
      value.outcome.extra = true;
    }],
    ["stage extra", (value) => {
      value.outcome.stages.extra = "passed";
    }],
    ["process extra", (value) => {
      value.process.extra = true;
    }],
    ["streams extra", (value) => {
      value.streams.extra = true;
    }],
    ["stdout extra", (value) => {
      value.streams.stdout.extra = true;
    }],
    ["stderr extra", (value) => {
      value.streams.stderr.extra = true;
    }],
    ["JSONL extra", (value) => {
      value.jsonl.extra = true;
    }],
    ["structured result extra", (value) => {
      value.structuredResult.extra = true;
    }],
    ["lifecycle extra", (value) => {
      value.lifecycle.extra = true;
    }],
    ["boundaries extra", (value) => {
      value.boundaries.extra = true;
    }],
    ["nested forbidden key", (value) => {
      value.runtime.rawStdout = "synthetic";
    }],
    ["nested absolute path", (value) => {
      value.runtime.model = "/Users/private/model";
    }],
    ["free-text JSONL event", (value) => {
      value.jsonl.eventTypes[0] = "synthetic.free-text";
    }],
    ["free-text provider", (value) => {
      value.runtime.provider = "synthetic-provider";
    }],
  ]);

  for (const [name, mutate] of mutations) {
    await t.test(name, () => {
      const candidate = structuredClone(report);
      mutate(candidate);
      assert.throws(
        () => qualification.validateAuthorCallQualificationReport(candidate),
        (error) =>
          error instanceof qualification.AuthorCallQualificationError,
      );
    });
  }
});

test("public report validator rejects semantic class, stage, and lifecycle contradictions", async (t) => {
  const report = await runQualificationScenario();
  const mutations = new Map([
    ["class and stage mismatch", (value) => {
      value.outcome.status = "not-qualified";
      value.outcome.class = "timeout";
      value.outcome.terminalStage = "process-wait";
      value.outcome.stages["process-wait"] = "failed";
    }],
    ["consumed without marker", (value) => {
      value.invocation.callSlotCommitted = false;
    }],
    ["spawn success without attempt", (value) => {
      value.invocation.spawnAttempted = false;
    }],
    ["qualified timeout flag", (value) => {
      value.process.timeoutTriggered = true;
    }],
    ["qualified truncated stdout", (value) => {
      value.streams.stdout.truncated = true;
    }],
    ["qualified unknown JSONL type", (value) => {
      value.jsonl.eventTypes[0] = "other";
    }],
    ["qualified missing workspace cleanup", (value) => {
      value.lifecycle.workspaceRemoved = false;
    }],
    ["qualified credential-byte claim", (value) => {
      value.boundaries.controllerCredentialBytesRead = true;
    }],
  ]);

  for (const [name, mutate] of mutations) {
    await t.test(name, () => {
      const candidate = structuredClone(report);
      mutate(candidate);
      assert.throws(
        () => qualification.validateAuthorCallQualificationReport(candidate),
        (error) =>
          error instanceof qualification.AuthorCallQualificationError,
      );
    });
  }
});

test("dependency error details and synthetic paths never enter the public report", async () => {
  const report = await runQualificationScenario({
    runIdentityPreflight: async () => {
      throw new Error(
        "gho_SYNTHETIC_SECRET Bearer synthetic-secret /Users/private/auth.json",
      );
    },
  });
  assert.equal(report.outcome.class, "preflight-identity");
  assertNoUnsafePublicText(report);
  assert.equal(canonicalJson(report).includes("synthetic failure"), false);
});
