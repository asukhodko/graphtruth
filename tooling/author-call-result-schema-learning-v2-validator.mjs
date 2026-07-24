import { Buffer } from "node:buffer";

import { parseStrictJson } from "./private-pack-lock.mjs";

export const learningResultDocumentKind =
  "graphtruth.author-call-result-schema-exploratory-learning-result/1";
export const learningIdentity =
  "author-call-result-schema-exploratory-learning-v1";

export const learningPredicateNames = Object.freeze([
  "strictJson",
  "closedObjectShape",
  "payloadJsonString",
  "expectedPayloadBytes",
]);

export const learningFailureCodes = Object.freeze([
  "strict-json",
  "closed-object-shape",
  "payload-json-type",
  "payload-json-byte-mismatch",
  "evidence-inconsistent",
]);

export const learningRouteCodes = Object.freeze([
  "prompt-schema-adjustment",
  "reduced-echo-contract",
  "alternate-execution",
  "stop",
]);

export const learningBasisCodes = Object.freeze([
  "directly-observed",
  "deterministically-derived",
  "conjectural",
]);

export const learningDeletionStates = Object.freeze({
  stdout: Object.freeze([
    "pending",
    "deleted",
    "identity-mismatch",
    "unlink-failed",
    "not-attempted",
  ]),
  stderr: Object.freeze([
    "pending",
    "deleted-unread",
    "metadata-mismatch",
    "unlink-failed",
    "not-attempted",
  ]),
  workRoot: Object.freeze([
    "pending",
    "deleted",
    "unexpected-entry",
    "remove-failed",
    "not-attempted",
  ]),
});

const sha256Pattern = /^[a-f0-9]{64}$/;
const authorizationPattern =
  /^https:\/\/github\.com\/asukhodko\/graphtruth\/issues\/24#issuecomment-[1-9][0-9]{0,19}$/;

export class LearningResultValidationError extends Error {
  constructor(codes) {
    const normalized = [...new Set(codes)].sort();
    super(`exploratory learning result rejected (${normalized.join(",")})`);
    this.name = "LearningResultValidationError";
    this.codes = normalized;
  }
}

export class LearningMessageClassificationError extends Error {
  constructor(code) {
    super(`exploratory learning message rejected (${code})`);
    this.name = "LearningMessageClassificationError";
    this.code = code;
  }
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function isSha256(value) {
  return typeof value === "string" && sha256Pattern.test(value);
}

function isIntegerOrNull(value, minimum, maximum) {
  return (
    value === null ||
    (Number.isInteger(value) && value >= minimum && value <= maximum)
  );
}

function deepEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => deepEqual(value, right[index]))
    );
  }
  if (!isPlainObject(left) || !isPlainObject(right)) return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] && deepEqual(left[key], right[key]),
    )
  );
}

function add(errors, code) {
  if (!errors.includes(code)) errors.push(code);
}

function validateBindings(bindings, expectedBindings, errors) {
  const keys = [
    "boundarySha256",
    "executionPackManifestSha256",
    "readerSha256",
    "resultSchemaSha256",
    "toolingManifestSha256",
    "qualificationResultSha256",
    "traceParserSha256",
    "strictJsonParserSha256",
    "syntheticManifestSha256",
    "qualificationOutputSchemaSha256",
    "processingAuthorizationRecord",
  ];
  if (!hasExactKeys(bindings, keys)) {
    add(errors, "closed-object-shape");
    return;
  }
  for (const key of keys.filter((key) => key !== "processingAuthorizationRecord")) {
    if (!isSha256(bindings[key])) add(errors, "binding-format");
  }
  if (!authorizationPattern.test(bindings.processingAuthorizationRecord)) {
    add(errors, "authorization-record");
  }
  if (expectedBindings !== undefined) {
    if (!hasExactKeys(expectedBindings, keys)) {
      add(errors, "expected-bindings");
    } else {
      for (const key of keys) {
        if (bindings[key] !== expectedBindings[key]) add(errors, "binding-mismatch");
      }
    }
  }
}

function validateBudgets(budgets, errors) {
  const expected = {
    protectedInputFilesOpened: 1,
    admittedInputBytes: 38_920,
    protectedFilePasses: 1,
    readerRunsCommitted: 1,
    currentSessionMessageExposures: 1,
    currentSessionProcessingEpisodes: 1,
    otherRawReaders: 0,
    separatelyLaunchedModelSessions: 0,
    retries: 0,
    resumes: 0,
    stderrReads: 0,
    corpusReads: 0,
    projectionReads: 0,
    privateM1Reads: 0,
    localReaderNetworkRequests: 0,
    readerWallTimeLimitSeconds: 60,
    readerMemoryLimitBytes: 134_217_728,
    derivedStateLimitBytes: 131_072,
    publicRecordLimitBytes: 16_384,
  };
  if (!hasExactKeys(budgets, Object.keys(expected))) {
    add(errors, "closed-object-shape");
    return;
  }
  for (const [key, value] of Object.entries(expected)) {
    if (budgets[key] !== value) add(errors, "budget-mismatch");
  }
}

function validatePredicate(value, errors) {
  if (!hasExactKeys(value, ["state", "basis"])) {
    add(errors, "closed-object-shape");
    return;
  }
  if (!["passed", "failed", "not-evaluated"].includes(value.state)) {
    add(errors, "predicate-state");
  }
  if (!learningBasisCodes.includes(value.basis)) add(errors, "basis-code");
  if (value.state === "not-evaluated" && value.basis !== "deterministically-derived") {
    add(errors, "predicate-basis");
  }
  if (value.state === "failed" && value.basis !== "directly-observed") {
    add(errors, "predicate-basis");
  }
}

function validatePredicates(predicates, errors) {
  if (!hasExactKeys(predicates, learningPredicateNames)) {
    add(errors, "closed-object-shape");
    return;
  }
  for (const name of learningPredicateNames) validatePredicate(predicates[name], errors);
}

function validateMeasurement(value, { minimum, maximum, nullable }, errors) {
  if (!hasExactKeys(value, ["value", "basis"])) {
    add(errors, "closed-object-shape");
    return;
  }
  if (!learningBasisCodes.includes(value.basis)) add(errors, "basis-code");
  const permittedNull = nullable === true && value.value === null;
  if (!permittedNull && !isIntegerOrNull(value.value, minimum, maximum)) {
    add(errors, "measurement-range");
  }
  if (!nullable && value.value === null) add(errors, "measurement-range");
  if (value.value === null && value.basis !== "deterministically-derived") {
    add(errors, "measurement-basis");
  }
  if (value.value !== null && value.basis === "conjectural") {
    add(errors, "measurement-basis");
  }
}

function validateMeasurements(measurements, errors) {
  const keys = [
    "finalMessageBytes",
    "rootKeyCount",
    "missingRootKeyCount",
    "unexpectedRootKeyCount",
    "payloadJsonBytes",
    "expectedObservedByteDelta",
  ];
  if (!hasExactKeys(measurements, keys)) {
    add(errors, "closed-object-shape");
    return;
  }
  validateMeasurement(
    measurements.finalMessageBytes,
    { minimum: 0, maximum: 65_536, nullable: false },
    errors,
  );
  for (const key of ["rootKeyCount", "missingRootKeyCount", "unexpectedRootKeyCount"]) {
    validateMeasurement(
      measurements[key],
      { minimum: 0, maximum: 4_096, nullable: true },
      errors,
    );
  }
  validateMeasurement(
    measurements.payloadJsonBytes,
    { minimum: 0, maximum: 65_536, nullable: true },
    errors,
  );
  validateMeasurement(
    measurements.expectedObservedByteDelta,
    { minimum: -32_768, maximum: 32_768, nullable: true },
    errors,
  );
}

function validateRoutes(routes, errors) {
  if (!hasExactKeys(routes, ["recommended", "alternatives"])) {
    add(errors, "closed-object-shape");
    return;
  }
  if (!learningRouteCodes.includes(routes.recommended)) add(errors, "route-code");
  if (
    !Array.isArray(routes.alternatives) ||
    routes.alternatives.length > 2 ||
    routes.alternatives.some((route) => !learningRouteCodes.includes(route)) ||
    new Set(routes.alternatives).size !== routes.alternatives.length ||
    routes.alternatives.includes(routes.recommended)
  ) {
    add(errors, "route-set");
  }
}

function validateAttestations(attestations, errors) {
  const expected = {
    boundaryRespected: true,
    noRepair: true,
    noRetry: true,
    noResume: true,
    noFallbackParsing: true,
    noNormalization: true,
    noExperimentalRun: true,
    finalMessageTreatedAsUntrusted: true,
    noMessageDigestPublished: true,
    noProtectedPathPublished: true,
    providerCopiesUnverified: true,
  };
  if (!hasExactKeys(attestations, Object.keys(expected))) {
    add(errors, "closed-object-shape");
    return;
  }
  for (const [key, value] of Object.entries(expected)) {
    if (attestations[key] !== value) add(errors, "attestation-mismatch");
  }
}

function validateDeletion(deletion, errors) {
  if (!hasExactKeys(deletion, ["stdout", "stderr", "workRoot"])) {
    add(errors, "closed-object-shape");
    return;
  }
  for (const key of ["stdout", "stderr", "workRoot"]) {
    if (!learningDeletionStates[key].includes(deletion[key])) add(errors, "deletion-state");
  }
  const values = Object.values(deletion);
  const pending = values.filter((value) => value === "pending").length;
  if (pending !== 0 && pending !== values.length) add(errors, "deletion-phase");
}

function expectedFailureIndex(code) {
  return {
    "strict-json": 0,
    "closed-object-shape": 1,
    "payload-json-type": 2,
    "payload-json-byte-mismatch": 3,
    "evidence-inconsistent": 4,
  }[code];
}

function validateFirstFailureSemantics(record, errors) {
  const { firstFailure, predicates, measurements } = record;
  if (!hasExactKeys(firstFailure, ["code", "basis"])) {
    add(errors, "closed-object-shape");
    return;
  }
  if (!learningFailureCodes.includes(firstFailure.code)) add(errors, "failure-code");
  if (!learningBasisCodes.includes(firstFailure.basis)) add(errors, "basis-code");
  if (!learningFailureCodes.includes(firstFailure.code) || !isPlainObject(predicates)) return;
  const measurementNames = [
    "finalMessageBytes",
    "rootKeyCount",
    "missingRootKeyCount",
    "unexpectedRootKeyCount",
    "payloadJsonBytes",
    "expectedObservedByteDelta",
  ];
  if (
    !hasExactKeys(measurements, measurementNames) ||
    measurementNames.some(
      (name) => !hasExactKeys(measurements[name], ["value", "basis"]),
    )
  ) {
    return;
  }

  const failureIndex = expectedFailureIndex(firstFailure.code);
  for (let index = 0; index < learningPredicateNames.length; index += 1) {
    const predicate = predicates[learningPredicateNames[index]];
    if (!isPlainObject(predicate)) continue;
    const expectedState =
      failureIndex === 4 ? "passed" : index < failureIndex ? "passed" : index === failureIndex ? "failed" : "not-evaluated";
    if (predicate.state !== expectedState) add(errors, "predicate-order");
  }
  const expectedBasis =
    firstFailure.code === "evidence-inconsistent"
      ? "deterministically-derived"
      : "directly-observed";
  if (firstFailure.basis !== expectedBasis) add(errors, "failure-basis");

  const rootEvaluated = failureIndex >= 1;
  const payloadEvaluated = failureIndex >= 3;
  for (const key of ["rootKeyCount", "missingRootKeyCount", "unexpectedRootKeyCount"]) {
    if (measurements?.[key]?.value === null ? rootEvaluated : !rootEvaluated) {
      add(errors, "measurement-order");
    }
  }
  for (const key of ["payloadJsonBytes", "expectedObservedByteDelta"]) {
    if (measurements?.[key]?.value === null ? payloadEvaluated : !payloadEvaluated) {
      add(errors, "measurement-order");
    }
  }
  if (rootEvaluated) {
    const rootKeys = measurements.rootKeyCount.value;
    const missing = measurements.missingRootKeyCount.value;
    const unexpected = measurements.unexpectedRootKeyCount.value;
    if (
      rootKeys !== 1 - missing + unexpected ||
      ![0, 1].includes(missing)
    ) {
      add(errors, "root-counts");
    }
  }
  if (payloadEvaluated) {
    if (
      measurements.payloadJsonBytes.value - 32_768 !==
      measurements.expectedObservedByteDelta.value
    ) {
      add(errors, "payload-counts");
    }
  }
}

function predicateState(state, basis) {
  return { state, basis };
}

function measurement(value, basis) {
  return { value, basis };
}

export function classifyLearningMessage(finalMessage, expectedPayloadJson) {
  if (
    typeof finalMessage !== "string" ||
    typeof expectedPayloadJson !== "string" ||
    Buffer.byteLength(finalMessage, "utf8") > 65_536 ||
    Buffer.byteLength(expectedPayloadJson, "utf8") !== 32_768
  ) {
    throw new LearningMessageClassificationError("CLASSIFICATION_INPUT");
  }
  const finalMessageBytes = Buffer.byteLength(finalMessage, "utf8");
  const predicates = {};
  const measurements = {
    finalMessageBytes: measurement(finalMessageBytes, "directly-observed"),
    rootKeyCount: measurement(null, "deterministically-derived"),
    missingRootKeyCount: measurement(null, "deterministically-derived"),
    unexpectedRootKeyCount: measurement(null, "deterministically-derived"),
    payloadJsonBytes: measurement(null, "deterministically-derived"),
    expectedObservedByteDelta: measurement(null, "deterministically-derived"),
  };
  let parsed;
  try {
    parsed = parseStrictJson(finalMessage);
  } catch {
    predicates.strictJson = predicateState("failed", "directly-observed");
    for (const name of learningPredicateNames.slice(1)) {
      predicates[name] = predicateState("not-evaluated", "deterministically-derived");
    }
    return {
      predicates,
      firstFailure: {
        code: "strict-json",
        basis: "directly-observed",
      },
      measurements,
    };
  }
  predicates.strictJson = predicateState("passed", "directly-observed");
  const rootKeys = isPlainObject(parsed) ? Object.keys(parsed) : [];
  const missingRootKeyCount =
    isPlainObject(parsed) && Object.hasOwn(parsed, "payloadJson") ? 0 : 1;
  const unexpectedRootKeyCount = isPlainObject(parsed)
    ? rootKeys.filter((key) => key !== "payloadJson").length
    : 0;
  measurements.rootKeyCount = measurement(rootKeys.length, "directly-observed");
  measurements.missingRootKeyCount = measurement(
    missingRootKeyCount,
    "deterministically-derived",
  );
  measurements.unexpectedRootKeyCount = measurement(
    unexpectedRootKeyCount,
    "deterministically-derived",
  );
  if (
    !isPlainObject(parsed) ||
    missingRootKeyCount !== 0 ||
    unexpectedRootKeyCount !== 0 ||
    rootKeys.length !== 1
  ) {
    predicates.closedObjectShape = predicateState("failed", "directly-observed");
    for (const name of learningPredicateNames.slice(2)) {
      predicates[name] = predicateState("not-evaluated", "deterministically-derived");
    }
    return {
      predicates,
      firstFailure: {
        code: "closed-object-shape",
        basis: "directly-observed",
      },
      measurements,
    };
  }
  predicates.closedObjectShape = predicateState("passed", "directly-observed");
  if (typeof parsed.payloadJson !== "string") {
    predicates.payloadJsonString = predicateState("failed", "directly-observed");
    predicates.expectedPayloadBytes = predicateState(
      "not-evaluated",
      "deterministically-derived",
    );
    return {
      predicates,
      firstFailure: {
        code: "payload-json-type",
        basis: "directly-observed",
      },
      measurements,
    };
  }
  predicates.payloadJsonString = predicateState("passed", "directly-observed");
  const observedPayloadBytes = Buffer.byteLength(parsed.payloadJson, "utf8");
  measurements.payloadJsonBytes = measurement(observedPayloadBytes, "directly-observed");
  measurements.expectedObservedByteDelta = measurement(
    observedPayloadBytes - 32_768,
    "deterministically-derived",
  );
  if (parsed.payloadJson !== expectedPayloadJson) {
    predicates.expectedPayloadBytes = predicateState("failed", "directly-observed");
    return {
      predicates,
      firstFailure: {
        code: "payload-json-byte-mismatch",
        basis: "directly-observed",
      },
      measurements,
    };
  }
  predicates.expectedPayloadBytes = predicateState("passed", "directly-observed");
  return {
    predicates,
    firstFailure: {
      code: "evidence-inconsistent",
      basis: "deterministically-derived",
    },
    measurements,
  };
}

export function validateLearningResult(record, options = {}) {
  if (!isPlainObject(record)) {
    throw new LearningResultValidationError(["closed-object-shape"]);
  }
  const errors = [];
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
  if (!hasExactKeys(record, rootKeys)) {
    add(errors, "closed-object-shape");
  }
  if (record?.documentKind !== learningResultDocumentKind) add(errors, "document-kind");
  if (record?.identity !== learningIdentity) add(errors, "identity");
  validateBindings(record?.bindings, options.expectedBindings, errors);
  validateBudgets(record?.budgets, errors);
  validatePredicates(record?.predicates, errors);
  validateMeasurements(record?.measurements, errors);
  validateRoutes(record?.routes, errors);
  validateAttestations(record?.attestations, errors);
  validateDeletion(record?.deletion, errors);
  validateFirstFailureSemantics(record, errors);

  let bytes = null;
  try {
    bytes = Buffer.byteLength(`${JSON.stringify(record, null, 2)}\n`, "utf8");
  } catch {
    add(errors, "serialization");
  }
  if (bytes === null || bytes > 16_384) add(errors, "public-record-size");
  if (errors.length > 0) throw new LearningResultValidationError(errors);
  return record;
}

export function validateLearningResultTransition(before, after, options = {}) {
  validateLearningResult(before, options);
  validateLearningResult(after, options);
  const beforeWithoutDeletion = { ...before };
  const afterWithoutDeletion = { ...after };
  delete beforeWithoutDeletion.deletion;
  delete afterWithoutDeletion.deletion;
  const errors = [];
  if (!deepEqual(beforeWithoutDeletion, afterWithoutDeletion)) {
    add(errors, "non-deletion-field-changed");
  }
  if (Object.values(before.deletion).some((value) => value !== "pending")) {
    add(errors, "transition-source-not-pending");
  }
  if (Object.values(after.deletion).some((value) => value === "pending")) {
    add(errors, "transition-target-not-terminal");
  }
  if (errors.length > 0) throw new LearningResultValidationError(errors);
  return after;
}
