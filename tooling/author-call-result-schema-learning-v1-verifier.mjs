import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
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
const manifestRelativePath =
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/EXECUTION-PACK-MANIFEST.json";
const auditRelativePath =
  "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/PACK-AUDIT-RESULT.json";
const decoder = new TextDecoder("utf-8", { fatal: true });
const sha256Pattern = /^[a-f0-9]{64}$/;

export const executionPackIdentity =
  "author-call-result-schema-exploratory-learning-execution-pack-v1";
export const executionPackBoundarySha256 =
  "4065f91cd930181eae6eeed520b978fb31361b636944e4bed4b8b7b11b02d58e";
export const executionPackSubjectContract = Object.freeze({
  identity: "author-call-result-schema-exploratory-learning-v1",
  qualificationToolingManifestSha256:
    "bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200",
  qualificationResultSha256:
    "aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94",
  outcomeStatus: "not-qualified",
  outcomeClass: "result-schema",
  retainedStdoutBytes: 38_920,
  retainedStdoutSha256:
    "75c118902a7b5104e642a3e1ae028e0dcff63f6f2431a67cf4fc575b48d72c0a",
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

export const executionPackFileContract = Object.freeze([
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/README.md",
    role: "pack-documentation",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/RUN-CARD.template.md",
    role: "run-card-template",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.example.json",
    role: "safe-result-example",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.schema.json",
    role: "safe-result-schema",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SYNTHETIC-TRACE.jsonl",
    role: "synthetic-positive-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/duplicate-key-jsonl.jsonl",
    role: "negative-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/leaking-result.json",
    role: "negative-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/malformed-jsonl.jsonl",
    role: "negative-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/missing-final-message.jsonl",
    role: "negative-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path:
      "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/fixtures/negative/tool-event-jsonl.jsonl",
    role: "negative-fixture",
    mode: "0644",
  }),
  Object.freeze({
    path: "tooling/author-call-result-schema-learning-v1",
    role: "reader-wrapper",
    mode: "0755",
  }),
  Object.freeze({
    path: "tooling/author-call-result-schema-learning-v1-validator.mjs",
    role: "semantic-validator",
    mode: "0644",
  }),
  Object.freeze({
    path: "tooling/author-call-result-schema-learning-v1-verifier.mjs",
    role: "independent-verifier",
    mode: "0644",
  }),
  Object.freeze({
    path: "tooling/author-call-result-schema-learning-v1.mjs",
    role: "one-use-reader",
    mode: "0644",
  }),
  Object.freeze({
    path: "tooling/author-call-result-schema-learning-v1.test.mjs",
    role: "mutation-tests",
    mode: "0644",
  }),
]);

export const executionPackAnchorContract = Object.freeze([
  Object.freeze({
    id: "qualificationResult",
    path:
      "examples/experiments/author-call-qualification-v1/CODEX-AUTHOR-CALL-QUALIFICATION.json",
    sha256: "aa07980cd8b9a05d699f5a491733ea2dd2a710955d13a783249a4e9721979b94",
    exports: Object.freeze([]),
  }),
  Object.freeze({
    id: "boundary",
    path:
      "examples/experiments/author-call-qualification-v1/EXPLORATORY-LEARNING-BOUNDARY.md",
    sha256: executionPackBoundarySha256,
    exports: Object.freeze([]),
  }),
  Object.freeze({
    id: "syntheticManifest",
    path:
      "examples/experiments/author-call-qualification-v1/SYNTHETIC-MANIFEST.json",
    sha256: "ba2b8e825f05179b66ce874fc03a7540b59c15e96495b95764189bec33da1bda",
    exports: Object.freeze([]),
  }),
  Object.freeze({
    id: "qualificationToolingManifest",
    path:
      "examples/experiments/author-call-qualification-v1/TOOLING-MANIFEST.json",
    sha256: "bf6e7f671c60fb3a3748ff5a03aeca93500cb40fe2664c388634287049290200",
    exports: Object.freeze([]),
  }),
  Object.freeze({
    id: "traceParser",
    path: "tooling/codex-sandbox-preflight.mjs",
    sha256: "28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025",
    exports: Object.freeze(["parseToolEventTrace", "validateToolEventTrace"]),
  }),
  Object.freeze({
    id: "strictJsonParser",
    path: "tooling/private-pack-lock.mjs",
    sha256: "603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b",
    exports: Object.freeze(["parseStrictJson"]),
  }),
  Object.freeze({
    id: "qualificationController",
    path: "tooling/codex-author-call-qualification-v1.mjs",
    sha256: "83f446d225dd8da6d86df1b5d0b4e409157937df9db211913b879e796dfd8f5f",
    exports: Object.freeze([]),
  }),
]);

export const executionPackMutationMatrix = Object.freeze([
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

export class ExecutionPackVerificationError extends Error {
  constructor(codes) {
    const normalized = [...new Set(codes)].sort();
    super(`execution pack rejected (${normalized.join(",")})`);
    this.name = "ExecutionPackVerificationError";
    this.codes = normalized;
  }
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function add(errors, code) {
  if (!errors.includes(code)) errors.push(code);
}

function parseStrict(bytes, code, errors) {
  try {
    return parseStrictJson(decoder.decode(bytes));
  } catch {
    add(errors, code);
    return null;
  }
}

function validateManifest(manifest, errors) {
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
    manifest.identity !== executionPackIdentity ||
    manifest.boundarySha256 !== executionPackBoundarySha256 ||
    !sameJson(manifest.subject, executionPackSubjectContract)
  ) {
    add(errors, "manifest-shape");
    return;
  }
  const expectedAnchors = executionPackAnchorContract.map((entry) => ({
    id: entry.id,
    path: entry.path,
    sha256: entry.sha256,
    exports: [...entry.exports],
  }));
  if (!sameJson(manifest.anchors, expectedAnchors)) add(errors, "anchor-contract");
  if (
    !Array.isArray(manifest.files) ||
    manifest.files.length !== executionPackFileContract.length
  ) {
    add(errors, "inventory-contract");
  } else {
    manifest.files.forEach((entry, index) => {
      const expected = executionPackFileContract[index];
      if (
        !hasExactKeys(entry, ["path", "role", "mode", "sha256"]) ||
        entry.path !== expected.path ||
        entry.role !== expected.role ||
        entry.mode !== expected.mode ||
        typeof entry.sha256 !== "string" ||
        !sha256Pattern.test(entry.sha256)
      ) {
        add(errors, "inventory-contract");
      }
    });
  }
  const expectedBudgets = {
    protectedInputBytes: 38_920,
    protectedFilePasses: 1,
    readerRunsAfterCommit: 1,
    maximumFinalMessageBytes: 65_536,
    maximumWallTimeSeconds: 60,
    maximumMemoryBytes: 134_217_728,
    maximumDerivedStateBytes: 131_072,
    maximumPublicRecordBytes: 16_384,
    networkRequests: 0,
    retries: 0,
    resumes: 0,
  };
  if (!sameJson(manifest.budgets, expectedBudgets)) add(errors, "budget-contract");
  const expectedClaims = {
    artificialFixturesOnly: true,
    readerNotRunOnRetainedOutput: true,
    newModelCallPerformed: false,
    terminalCandidateUsed: false,
    corpusOrProjectionRead: false,
    graphTruthRunPerformed: false,
  };
  if (!sameJson(manifest.claims, expectedClaims)) add(errors, "claim-contract");
  if (!sameJson(manifest.mutationMatrix, [...executionPackMutationMatrix])) {
    add(errors, "mutation-matrix-contract");
  }
}

function validateSchema(schema, errors) {
  if (
    !isPlainObject(schema) ||
    schema.type !== "object" ||
    schema.additionalProperties !== false ||
    schema.properties?.documentKind?.const !==
      "graphtruth.author-call-result-schema-exploratory-learning-result/1" ||
    schema.properties?.identity?.const !==
      "author-call-result-schema-exploratory-learning-v1"
  ) {
    add(errors, "schema-root");
    return;
  }
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isPlainObject(node)) return;
    if (
      node.type === "object" &&
      (node.additionalProperties !== false ||
        !Array.isArray(node.required) ||
        !isPlainObject(node.properties) ||
        !sameJson([...node.required].sort(), Object.keys(node.properties).sort()))
    ) {
      add(errors, "schema-object-open");
    }
    Object.values(node).forEach(visit);
  };
  visit(schema);
  const routes = schema.$defs?.route?.enum;
  if (
    !sameJson(routes, [
      "prompt-schema-adjustment",
      "reduced-echo-contract",
      "alternate-execution",
      "stop",
    ])
  ) {
    add(errors, "schema-routes");
  }
  if (
    !sameJson(schema.$defs?.firstFailure?.properties?.code?.enum, [
      "strict-json",
      "closed-object-shape",
      "payload-json-type",
      "payload-json-byte-mismatch",
      "evidence-inconsistent",
    ])
  ) {
    add(errors, "schema-failures");
  }
  const serialized = JSON.stringify(schema);
  for (const forbidden of [
    '"raw"',
    '"messageDigest"',
    '"errorText"',
    '"privatePath"',
    '"threadId"',
    '"sessionId"',
    '"environment"',
  ]) {
    if (serialized.includes(forbidden)) add(errors, "schema-disclosure-field");
  }
}

function validateSafeExample(example, errors) {
  const rootKeys = [
    "documentKind",
    "identity",
    "bindings",
    "budgets",
    "predicates",
    "firstFailure",
    "measurements",
    "routes",
    "attestations",
    "deletion",
  ];
  if (
    !hasExactKeys(example, rootKeys) ||
    example.documentKind !==
      "graphtruth.author-call-result-schema-exploratory-learning-result/1" ||
    example.identity !== "author-call-result-schema-exploratory-learning-v1" ||
    !hasExactKeys(example.deletion, ["stdout", "stderr", "workRoot"]) ||
    Object.values(example.deletion).some((state) => state !== "pending") ||
    example.firstFailure?.code !== "closed-object-shape" ||
    example.predicates?.strictJson?.state !== "passed" ||
    example.predicates?.closedObjectShape?.state !== "failed" ||
    example.predicates?.payloadJsonString?.state !== "not-evaluated" ||
    example.predicates?.expectedPayloadBytes?.state !== "not-evaluated" ||
    !["prompt-schema-adjustment", "reduced-echo-contract", "alternate-execution", "stop"].includes(
      example.routes?.recommended,
    ) ||
    !Array.isArray(example.routes?.alternatives) ||
    example.routes.alternatives.length > 2
  ) {
    add(errors, "safe-example-contract");
  }
  const serialized = JSON.stringify(example);
  for (const forbidden of [
    ["/Us", "ers/"].join(""),
    ["/pri", "vate/tmp/"].join(""),
    [".graphtruth-evaluation-", "freeze"].join(""),
    [
      "45820302417fa577d89cfce46d3c3b6e",
      "a6e18ec4c891661a1af67404f423951d",
    ].join(""),
  ]) {
    if (serialized.includes(forbidden)) add(errors, "safe-example-disclosure");
  }
  if (Buffer.byteLength(`${JSON.stringify(example, null, 2)}\n`, "utf8") > 16_384) {
    add(errors, "safe-example-size");
  }
}

function validateReaderSource(source, errors) {
  const importSpecifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
  const allowed = new Set([
    "node:crypto",
    "node:fs/promises",
    "node:os",
    "node:path",
    "node:process",
    "node:util",
    "node:url",
    "./codex-sandbox-preflight.mjs",
    "./private-pack-lock.mjs",
  ]);
  if (importSpecifiers.some((specifier) => !allowed.has(specifier))) {
    add(errors, "reader-import-surface");
  }
  if (
    !/import\s+\{\s*parseToolEventTrace,\s*validateToolEventTrace,\s*\}\s+from\s+"\.\/codex-sandbox-preflight\.mjs";/s.test(
      source,
    ) ||
    !/import\s+\{\s*parseStrictJson\s*\}\s+from\s+"\.\/private-pack-lock\.mjs";/s.test(
      source,
    )
  ) {
    add(errors, "reader-parser-exports");
  }
  for (const forbidden of [
    "node:child_process",
    "node:http",
    "node:https",
    "node:net",
    "node:tls",
    "node:dgram",
    "node:dns",
    "process.env",
    "fetch(",
    "execFile(",
    "spawn(",
    "opendir(",
    "glob(",
  ]) {
    if (source.includes(forbidden)) add(errors, "reader-forbidden-capability");
  }
  const count = (needle) => source.split(needle).length - 1;
  if (
    count("const protectedBytes = await protectedHandle.readFile();") !== 1 ||
    count("process.stdout.write(finalMessage);") !== 1 ||
    count("await commitReadSlot(workRoot, executionPackManifestSha256);") !== 1 ||
    source.indexOf("await commitReadSlot(workRoot, executionPackManifestSha256);") >
      source.indexOf("protectedHandle = await open(\n      stdoutPath,") ||
    !source.includes("constants.O_NOFOLLOW") ||
    !source.includes("constants.O_EXCL") ||
    !source.includes("stat.nlink !== 1n") ||
    !source.includes("sameFingerprint(initialStat, openedStat)") ||
    !source.includes("sameFingerprint(openedStat, finalStat)") ||
    !source.includes("ARTIFICIAL_INPUT_BOUNDARY") ||
    !source.includes("bytes: retainedStdoutBytes") ||
    !source.includes("sha256: retainedStdoutSha256")
  ) {
    add(errors, "reader-one-pass-contract");
  }
  if (
    /function\s+(?:retry|resume|repair|normalize)/i.test(source) ||
    /(?:retry|resume|repair|fallback)[A-Za-z0-9_]*\s*\(/i.test(source)
  ) {
    add(errors, "reader-recovery-capability");
  }
}

function validateValidatorSource(source, errors) {
  const importSpecifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
  if (!sameJson(importSpecifiers, ["node:buffer", "./private-pack-lock.mjs"])) {
    add(errors, "validator-import-surface");
  }
  for (const required of [
    "parseStrictJson(finalMessage)",
    "classifyLearningMessage",
    "hasExactKeys",
    "closed-object-shape",
    "predicate-order",
    "measurement-order",
    "non-deletion-field-changed",
    "transition-source-not-pending",
    "transition-target-not-terminal",
    "public-record-size",
  ]) {
    if (!source.includes(required)) add(errors, "validator-contract");
  }
}

function validateVerifierSource(source, errors) {
  const importSpecifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map(
    (match) => match[1],
  );
  if (
    !sameJson(importSpecifiers, [
      "node:crypto",
      "node:fs/promises",
      "node:path",
      "node:process",
      "node:util",
      "node:url",
      "./codex-sandbox-preflight.mjs",
      "./private-pack-lock.mjs",
    ])
  ) {
    add(errors, "verifier-forbidden-capability");
  }
  if (
    /from\s+"\.\/author-call-result-schema-learning-v1(?:\.mjs)?"/.test(source) ||
    /import\s*\(\s*["']\.\/author-call-result-schema-learning-v1/.test(source)
  ) {
    add(errors, "verifier-reader-dependency");
  }
}

function validateTestSource(source, errors) {
  for (const caseId of executionPackMutationMatrix) {
    if (!source.includes(`"${caseId}"`)) add(errors, "mutation-case-missing");
  }
  for (const required of [
    "assert.rejects",
    "validateLearningResultTransition",
    "verifyExecutionPackEvidence",
    "afterMarkerBeforeOpen",
    "symlink",
    "link",
  ]) {
    if (!source.includes(required)) add(errors, "test-mechanism-missing");
  }
}

function validateFixtures(fileBytes, errors) {
  const fixtureRoot =
    "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/";
  const positivePath = `${fixtureRoot}SYNTHETIC-TRACE.jsonl`;
  try {
    const trace = validateToolEventTrace(
      parseToolEventTrace(decoder.decode(fileBytes.get(positivePath))),
    );
    if (
      trace.summary.eventCount !== 4 ||
      trace.summary.toolEventCount !== 0 ||
      typeof trace.finalMessage !== "string"
    ) {
      add(errors, "positive-fixture");
    }
  } catch {
    add(errors, "positive-fixture");
  }
  for (const filename of [
    "duplicate-key-jsonl.jsonl",
    "malformed-jsonl.jsonl",
    "missing-final-message.jsonl",
    "tool-event-jsonl.jsonl",
  ]) {
    const fixturePath = `${fixtureRoot}fixtures/negative/${filename}`;
    let rejected = false;
    try {
      validateToolEventTrace(parseToolEventTrace(decoder.decode(fileBytes.get(fixturePath))));
    } catch {
      rejected = true;
    }
    if (!rejected) add(errors, "negative-fixture-accepted");
  }
  const leakingPath = `${fixtureRoot}fixtures/negative/leaking-result.json`;
  const leaking = parseStrict(fileBytes.get(leakingPath), "negative-fixture-json", errors);
  if (
    !isPlainObject(leaking) ||
    leaking.path !== "/artificial/not-a-real-private-path" ||
    !Object.hasOwn(leaking, "errorText") ||
    !Object.hasOwn(leaking, "instruction")
  ) {
    add(errors, "negative-disclosure-fixture");
  }
}

function validateNoProtectedMaterial(fileBytes, errors) {
  const excludedIdentity = [
    "45820302417fa577d89cfce46d3c3b6e",
    "a6e18ec4c891661a1af67404f423951d",
  ].join("");
  const privateHomePrefix = ["/Users/a.", "sukhodko/"].join("");
  const privateRunRoot = [".graphtruth-evaluation-", "freeze.nosync"].join("");
  for (const [filePath, bytes] of fileBytes) {
    const text = bytes.toString("utf8");
    if (
      text.includes(excludedIdentity) ||
      text.includes(privateHomePrefix) ||
      text.includes(privateRunRoot) ||
      /run-[0-9A-F]{8}-[0-9A-F-]{27,}/.test(text)
    ) {
      add(errors, "protected-material-reference");
    }
    if (
      filePath.includes("/fixtures/") &&
      !text.toLowerCase().includes("artificial") &&
      !filePath.endsWith("duplicate-key-jsonl.jsonl") &&
      !filePath.endsWith("malformed-jsonl.jsonl")
    ) {
      add(errors, "fixture-not-artificial");
    }
  }
}

export function verifyExecutionPackEvidence(evidence, expectedManifestSha256) {
  const errors = [];
  if (
    !isPlainObject(evidence) ||
    !Buffer.isBuffer(evidence.manifestBytes) ||
    !(evidence.fileBytes instanceof Map) ||
    !(evidence.fileModes instanceof Map) ||
    !(evidence.anchorBytes instanceof Map) ||
    typeof expectedManifestSha256 !== "string" ||
    !sha256Pattern.test(expectedManifestSha256)
  ) {
    throw new ExecutionPackVerificationError(["evidence-shape"]);
  }
  const actualManifestSha256 = sha256Bytes(evidence.manifestBytes);
  if (actualManifestSha256 !== expectedManifestSha256) add(errors, "manifest-digest");
  const manifest = parseStrict(evidence.manifestBytes, "manifest-strict-json", errors);
  if (manifest !== null) validateManifest(manifest, errors);

  for (const anchor of executionPackAnchorContract) {
    const bytes = evidence.anchorBytes.get(anchor.path);
    if (!Buffer.isBuffer(bytes) || sha256Bytes(bytes) !== anchor.sha256) {
      add(errors, "anchor-digest");
    }
  }
  for (let index = 0; index < executionPackFileContract.length; index += 1) {
    const contract = executionPackFileContract[index];
    const bytes = evidence.fileBytes.get(contract.path);
    const manifestEntry = manifest?.files?.[index];
    if (
      !Buffer.isBuffer(bytes) ||
      evidence.fileModes.get(contract.path) !== contract.mode ||
      manifestEntry?.sha256 !== sha256Bytes(bytes)
    ) {
      add(errors, "component-identity");
    }
  }
  if (
    evidence.fileBytes.size !== executionPackFileContract.length ||
    evidence.fileModes.size !== executionPackFileContract.length ||
    evidence.anchorBytes.size !== executionPackAnchorContract.length
  ) {
    add(errors, "closed-evidence-inventory");
  }

  const text = (relativePath) => {
    const bytes = evidence.fileBytes.get(relativePath);
    try {
      return decoder.decode(bytes);
    } catch {
      add(errors, "component-utf8");
      return "";
    }
  };
  const schemaPath =
    "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.schema.json";
  const examplePath =
    "examples/experiments/author-call-qualification-v1/exploratory-learning-v1/SAFE-RESULT.example.json";
  const schema = parseStrict(evidence.fileBytes.get(schemaPath), "schema-strict-json", errors);
  const example = parseStrict(evidence.fileBytes.get(examplePath), "example-strict-json", errors);
  if (schema !== null) validateSchema(schema, errors);
  if (example !== null) validateSafeExample(example, errors);
  validateReaderSource(text("tooling/author-call-result-schema-learning-v1.mjs"), errors);
  validateValidatorSource(
    text("tooling/author-call-result-schema-learning-v1-validator.mjs"),
    errors,
  );
  validateVerifierSource(
    text("tooling/author-call-result-schema-learning-v1-verifier.mjs"),
    errors,
  );
  validateTestSource(text("tooling/author-call-result-schema-learning-v1.test.mjs"), errors);
  validateFixtures(evidence.fileBytes, errors);
  validateNoProtectedMaterial(evidence.fileBytes, errors);

  if (errors.length > 0) throw new ExecutionPackVerificationError(errors);
  const verifierPath = "tooling/author-call-result-schema-learning-v1-verifier.mjs";
  return {
    documentKind:
      "graphtruth.author-call-result-schema-exploratory-learning-pack-audit/1",
    identity: executionPackIdentity,
    manifestSha256: actualManifestSha256,
    verifierSha256: sha256Bytes(evidence.fileBytes.get(verifierPath)),
    status: "pass",
    componentCount: executionPackFileContract.length,
    anchorCount: executionPackAnchorContract.length,
    fixtureCount: 6,
    mutationCaseCount: executionPackMutationMatrix.length,
    checks: {
      manifestAndInventoryClosed: true,
      componentHashesAndModesValid: true,
      acceptedParserExportsBound: true,
      readerOnePassAndNoRecovery: true,
      readerHasNoNetworkOrDiscovery: true,
      schemaObjectsClosed: true,
      routeAndFailureCodesClosed: true,
      syntheticMatrixDeclared: true,
      safeExampleValid: true,
      verifierIndependentFromReader: true,
      protectedMaterialAbsent: true,
    },
    boundaries: {
      artificialPublicDataOnly: true,
      retainedOutputRead: false,
      terminalCandidateRead: false,
      corpusOrProjectionRead: false,
      newModelCallPerformed: false,
      graphTruthRunPerformed: false,
      repairRetryOrResumePerformed: false,
    },
  };
}

export async function readExecutionPackEvidence(root = repositoryRoot) {
  const fileBytes = new Map();
  const fileModes = new Map();
  const anchorBytes = new Map();
  const manifestBytes = await readFile(path.join(root, manifestRelativePath));
  for (const contract of executionPackFileContract) {
    const absolute = path.join(root, contract.path);
    const [bytes, stat] = await Promise.all([
      readFile(absolute),
      lstat(absolute, { bigint: true }),
    ]);
    fileBytes.set(contract.path, bytes);
    fileModes.set(
      contract.path,
      (stat.mode & 0o777n).toString(8).padStart(4, "0"),
    );
  }
  for (const anchor of executionPackAnchorContract) {
    anchorBytes.set(anchor.path, await readFile(path.join(root, anchor.path)));
  }
  return { manifestBytes, fileBytes, fileModes, anchorBytes };
}

export async function verifyCurrentExecutionPack(expectedManifestSha256) {
  return verifyExecutionPackEvidence(
    await readExecutionPackEvidence(repositoryRoot),
    expectedManifestSha256,
  );
}

export async function verifyCheckedInAudit(expectedManifestSha256, expectedAuditSha256) {
  const generated = await verifyCurrentExecutionPack(expectedManifestSha256);
  const auditBytes = await readFile(path.join(repositoryRoot, auditRelativePath));
  if (
    sha256Bytes(auditBytes) !== expectedAuditSha256 ||
    `${JSON.stringify(generated, null, 2)}\n` !== decoder.decode(auditBytes)
  ) {
    throw new ExecutionPackVerificationError(["audit-receipt"]);
  }
  return generated;
}

async function main() {
  if (
    process.argv.length !== 4 ||
    process.argv[2] !== "--manifest-sha256" ||
    !sha256Pattern.test(process.argv[3])
  ) {
    process.stderr.write(
      "usage: node author-call-result-schema-learning-v1-verifier.mjs --manifest-sha256 SHA256\n",
    );
    process.exitCode = 2;
    return;
  }
  try {
    const audit = await verifyCurrentExecutionPack(process.argv[3]);
    process.stdout.write(`${JSON.stringify(audit, null, 2)}\n`);
  } catch (error) {
    const codes =
      error instanceof ExecutionPackVerificationError
        ? error.codes.join(",")
        : "unexpected-failure";
    process.stderr.write(`execution-pack-verifier: rejected (${codes})\n`);
    process.exitCode = 1;
  }
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === modulePath;
if (invokedAsScript) await main();
