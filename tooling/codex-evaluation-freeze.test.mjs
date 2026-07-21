import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import {
  acceptedProjectionManifestSha256,
  acceptedProjectionReceiptSha256,
  admittedRgSha256,
  admittedRgVersion,
  auditChecklistIds,
  buildAuditPrompt,
  buildAuditOutputSchema,
  buildAuthorPrompt,
  buildAuthorOutputSchema,
  evaluationArms,
  evaluationAuditKind,
  evaluationContractKind,
  evaluationExperimentId,
  evaluationHorizons,
  evaluationTaskIds,
  evaluationOwnerAuthorizationRecord,
  evaluationProjectionId,
  parseArguments,
  parseProviderPayload,
  providerOutputEnvelopeSchema,
  requiredCoverageTags,
  rubricDimensions,
  runEvaluationFreeze,
  validateAuditResult,
  validateEvaluationContract,
  validateProjectionFiles,
} from "./codex-evaluation-freeze.mjs";
import {
  admittedCodexSha256,
  admittedCodexVersion,
} from "./codex-sandbox-preflight.mjs";
import { parseStrictJson } from "./private-pack-lock.mjs";

const execFileAsync = promisify(execFile);
const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.dirname(toolingDirectory);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function evidence(sourceItem, suffix) {
  return { sourceItem, locator: "L000001-L000001", claim: `synthetic claim ${suffix}` };
}

const fixtureLineCounts = Object.freeze(Object.fromEntries(
  Array.from({ length: 4 }, (_, index) => [
    `item-${String(index + 1).padStart(4, "0")}.rst`,
    1,
  ]),
));

function contractFixture() {
  const severeErrorClasses = [
    {
      id: "future-source-leak", condition: "uses evidence unavailable at the cell horizon",
      scope: "experiment", scoringConsequence: "invalidate-experiment", decisionConsequence: "force-stop",
    },
    {
      id: "unsupported-current-python", condition: "claims current Python semantics without evidence",
      scope: "task", scoringConsequence: "zero-task-score", decisionConsequence: "block-keep",
    },
    {
      id: "oracle-exposure", condition: "a primary answerer sees oracle material",
      scope: "experiment", scoringConsequence: "invalidate-experiment", decisionConsequence: "force-stop",
    },
  ];
  const tasks = Array.from({ length: 8 }, (_, taskIndex) => {
    const taskId = `task-${String(taskIndex + 1).padStart(8, "0")}`;
    const horizonRules = evaluationHorizons.map((horizon, horizonIndex) => {
      const allowedSourceItems = evaluationHorizons
        .slice(0, horizonIndex + 1)
        .map((_, itemIndex) => `item-${String(itemIndex + 1).padStart(4, "0")}.rst`);
      return {
        horizon,
        allowedSourceItems,
        requiredElements: [`required ${taskIndex}-${horizonIndex}`],
        supportingEvidence: [evidence(allowedSourceItems[0], `${taskIndex}-${horizonIndex}-support`)],
        counterevidence: [],
        correctAbstention: `abstain only if synthetic evidence ${taskIndex}-${horizonIndex} is insufficient`,
        requiredDisposition: "answer",
        withheldRetrospectiveClaims: [],
        uncertaintyRequired: false,
        severeErrors: severeErrorClasses.map((item) => item.id),
        scoringRule: `apply the frozen rubric ${taskIndex}-${horizonIndex}`,
      };
    });
    return {
      taskId,
      workingNeed: `synthetic working need ${taskIndex}`,
      question: `synthetic question ${taskIndex}`,
      earliestAnswerHorizon: "pep-3107",
      coverageTags: requiredCoverageTags.filter((_, index) => index % 8 === taskIndex),
      futureParticipantFamiliarity: {
        graphtruthOperator: "unknown", baselineOperator: "unknown", scorer: "unknown",
      },
      horizonRules,
      cells: evaluationHorizons.flatMap((horizon) => evaluationArms.map((arm) => ({
        horizon, arm, included: true, requiredDisposition: "answer",
      }))),
    };
  });
  const judgments = tasks.map((task, taskIndex) => ({
    taskId: task.taskId,
    horizons: evaluationHorizons.map((horizon, horizonIndex) => {
      const sourceItem = `item-${String(1).padStart(4, "0")}.rst`;
      return {
        horizon,
        mandatory: [`mandatory ${taskIndex}-${horizonIndex}`],
        forbidden: [`forbidden ${taskIndex}-${horizonIndex}`],
        sufficientEvidence: [evidence(sourceItem, `oracle-${taskIndex}-${horizonIndex}`)],
        necessaryCounterevidence: [],
        correctAbstention: `oracle abstention ${taskIndex}-${horizonIndex}`,
        partialAnswer: `oracle partial ${taskIndex}-${horizonIndex}`,
        severeErrors: severeErrorClasses.map((item) => item.id),
      };
    }),
    scoreGuide: `synthetic score guide ${taskIndex}`,
  }));
  return {
    documentKind: evaluationContractKind,
    experimentId: evaluationExperimentId,
    projectionId: evaluationProjectionId,
    hypothesis: {
      decisionQuestion: "whether the sequential GraphTruth lane should proceed",
      allowedClaims: ["a narrow result on the fixed corpus and order"],
      nonClaims: [
        "representative-corpus", "complete-python-annotation-history",
        "current-arbitrary-python-semantics", "historical-causality",
        "personal-graphtruth-utility", "source-order-robustness",
      ],
      inabilityConditions: ["no comparable baseline can be formed"],
    },
    comparison: {
      graphtruthArmBoundary: "future-deterministic-implementation-conforming-to-this-freeze",
      rgBaselineArm: "pinned-rg-direct-search",
      commonInputAndTaskParity: true,
      comparisonUnit: "task-across-four-horizons",
      primaryEndpointReference: "rubric.primaryEndpoint",
      implementationIdentity: "pending-not-authorized",
    },
    temporalModel: {
      eventOrApplicabilityTime: "the time to which a claim applies",
      publicationOrAvailabilityTime: "the time evidence became available",
      syntheticRevealStep: "the fixed 3107 to 563 to 649 to 749 step",
      graphtruthRecordTime: "the later time GraphTruth records the claim",
      retrospectiveChangeRule: "later retrospective text is unavailable at earlier steps",
      unknownPublicationTreatment: "preserve uncertainty and abstain",
    },
    horizons: [...evaluationHorizons],
    arms: [...evaluationArms],
    tasks,
    oracle: { isolated: true, futureRespondentAccess: false, judgments },
    rubric: {
      dimensions: rubricDimensions.map((id, index) => ({
        id, weight: [20, 20, 15, 15, 15, 15][index], rule: `score ${id}`,
      })),
      resultClasses: [
        "correct", "partial", "incorrect", "correct-abstention", "missing", "late",
        "timeout", "interrupted", "invalid", "contaminated",
      ],
      severeErrorEffect: "apply the declared scoring and decision consequence",
      cellSuccessRule: "a cell succeeds only when all mandatory dimensions pass",
      taskSuccessAggregation: "a task succeeds only under the predeclared four-horizon rule",
      primaryEndpoint: "successful task count after capture tax",
      medianTimePopulation: "all valid non-missing cells in the complete denominator",
      nonApplicableCounterevidenceRule: "score as satisfied only when explicitly marked not applicable",
      disagreementProcedure: "preserve raw scores and resolve before arm reveal",
      allResultClassesRemainInDenominator: true,
    },
    baseline: {
      binaryVersion: admittedRgVersion,
      binarySha256: admittedRgSha256,
      argvPrefix: [
        "/opt/homebrew/bin/rg", "--no-config", "--line-number", "--column",
        "--with-filename", "--color", "never", "--",
      ],
      queryArgument: "QUERY",
      visibleFileArguments: "VISIBLE_HORIZON_FILES_ONLY",
      shellUsed: false,
      sameProjectionBytes: true,
      sameHorizons: true,
      timeLimitSecondsPerCell: 600,
      maximumQueriesPerCell: 12,
      maximumAttemptsPerCell: 1,
      allowedHelp: ["none"],
      answerFormat: "one frozen structured answer per cell",
      presentationOrder: "fixed task order with predeclared arm order",
      crossCellKnowledgePolicy: "no transfer across primary cells",
      captureTaxIncluded: true,
      captureTaxMeasurementRule: "add all GraphTruth capture and verification time to its arm",
    },
    roles: {
      curator: "current-graphtruth-session",
      taskAuthor: "author-codex-session",
      oracleAuthor: "author-codex-session",
      auditor: "auditor-codex-session",
      graphtruthOperator: "an-unbound-future-primary-answerer-slot",
      baselineOperator: "an-unbound-future-primary-answerer-slot",
      scorer: "an-unbound-future-blind-scorer-slot",
      decisionOwner: "asukhodko",
      designOnlyActors: ["asukhodko", "current-graphtruth-session"],
      excludedFromPrimaryAnswers: [
        "author-codex-session", "auditor-codex-session", "asukhodko", "current-graphtruth-session",
      ],
      excludedFromBlindScoring: [
        "author-codex-session", "auditor-codex-session", "asukhodko", "current-graphtruth-session",
      ],
      firstExposureRules: "a fresh session gives one primary answer before any peer answer",
      modelTrainingFamiliarity: "training inclusion is unknown and substantial prior familiarity is likely",
      futureSlotsUnbound: true,
      taskOrOracleAuthorMayAnswer: false,
      taskOrOracleAuthorMayScore: false,
      crossArmAnswerExposureBeforePrimaryResponse: false,
      actorBindingPolicy: "bind named fresh actors before any task text is exposed",
      firstExposureAllocation: "one task-arm sequence per fresh session under the frozen allocation",
      armOrder: "predeclared and unchanged",
      answerToArmBlinding: "the scorer sees raw answers without arm labels",
      oracleIsolation: "only the scorer receives the oracle after both primary answers",
      futureSourceIsolation: "each answerer sees only the horizon prefix",
      rawScoreBeforeArmReveal: "raw scores are sealed before arm labels are revealed",
      contaminationRule: "any cross-arm exposure invalidates the affected cell",
      disagreementProcedure: "record both scores and resolve blind before arm reveal",
      exposureRecordPolicy: "append every first exposure before showing task bytes",
    },
    budgets: {
      ownerPreparationMinutes: 60, taskAuthorMinutes: 180, oracleAuthorMinutes: 180,
      auditorMinutes: 120, graphtruthOperatorSecondsPerCell: 600,
      baselineOperatorSecondsPerCell: 600, scoringSecondsPerCell: 300,
      freezeAuthorCalls: 1, freezeAuditorCalls: 1, freezeExternalCalls: 2,
      futurePrimaryAnswerSessions: 16, futureBlindScorerSessions: 1,
      futureExternalCallCeiling: 17, totalExternalCallCeiling: 19,
      futureCallsAuthorized: false, authorAttempts: 1, auditorAttempts: 1, retries: 0,
      memoryMiB: 1024, diskMiB: 1024, derivedStateMiB: 512,
      manualInterventions: 0, corrections: 0, maximumCopies: 2,
      retentionDaysAfterIssueClose: 30,
      failureConsequences: {
        timeout: "record-timeout-and-retain-in-denominator",
        failure: "record-invalid-and-retain-in-denominator",
        omission: "record-missing-and-retain-in-denominator",
        interruption: "record-interrupted-and-retain-in-denominator",
        boundaryViolation: "record-contaminated-and-stop",
        budgetExhaustion: "record-invalid-and-stop-without-retry",
        unfavorableResult: "retain-declared-result-class-without-retry",
      },
    },
    severeErrorClasses,
    decision: {
      precedence: ["stop", "keep", "shrink"], mutuallyExclusiveAndExhaustive: true,
      keep: {
        maximumSevereRegressions: 0, additionalSuccessfulTasks: 2,
        alternativeMedianTimeReductionPercent: 25,
        equalSuccessfulTaskCountForTimeAlternative: true, captureTaxIncluded: true,
      },
      shrink: {
        eligibleOnlyBeforeAnyOutput: true, comparableBaselineImpossible: true,
        roleConflictBeforeRun: true, budgetRequiresPredeclaredScopeReduction: true,
        requiresNewPredeclaredIdentity: true, winningSubsetSelectionAllowed: false,
      },
      stop: {
        severeRegressionCountAtLeast: 1, boundaryViolation: true, oracleLeak: true,
        denominatorInvalid: true, auditReject: true, budgetExhausted: true,
        hardStopReached: true, unapprovedInputChange: true,
        keepThresholdNotMetAfterOutputs: true,
      },
      postHocSubsetSelectionAllowed: false,
    },
    runCard: Object.fromEntries([
      "implementation", "syntheticRehearsal", "baselineRun", "evaluatedRun", "scoring",
    ].map((key) => [key, "pending-not-authorized"])),
    attestations: {
      implementationPerformed: false, rehearsalPerformed: false, baselineExecuted: false,
      sutExecuted: false, scoringPerformed: false, evaluatedRunPerformed: false,
    },
  };
}

function trace(value, threadId, { lifecycle, rawEnvelope = false } = {}) {
  const modelValue = rawEnvelope ? value : { payloadJson: JSON.stringify(value) };
  const events = [
    { type: "thread.started", thread_id: threadId },
    { type: "turn.started" },
    { type: "item.completed", item: { type: "agent_message", text: JSON.stringify(modelValue) } },
    { type: "turn.completed", usage: {} },
  ];
  const stdout = `${events.map((event) => JSON.stringify(event)).join("\n")}\n`;
  return {
    value: {
      stdout, stderr: "", stdoutBytes: Buffer.from(stdout), stderrBytes: Buffer.alloc(0),
    },
    lifecycle: lifecycle ?? {
      authCarrierUnchanged: true, perCallStateRootCreated: true,
      perCallStateRootRemoved: true, reusedAcrossModelCalls: false,
    },
  };
}

async function fixture() {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "graphtruth-evaluation-test-")));
  await chmod(root, 0o700);
  const projection = path.join(root, "projection-v1");
  await mkdir(projection, { mode: 0o700 });
  const expected = [];
  for (let index = 0; index < 4; index += 1) {
    const name = `item-${String(index + 1).padStart(4, "0")}.rst`;
    const bytes = Buffer.from(`synthetic projection item ${index + 1}\n`);
    await writeFile(path.join(projection, name), bytes, { mode: 0o600 });
    expected.push({ id: evaluationHorizons[index], name, sha256: sha256(bytes), bytes: bytes.length });
  }
  return {
    root, projection, expected, privateRoot: path.join(root, "private-release"),
    async cleanup() {
      await execFileAsync("/bin/chmod", ["-R", "u+w", root]);
      await rm(root, { recursive: true, force: true });
    },
  };
}

function fakeDependencies(value, {
  auditDecision = "accept",
  afterCoreFreeze = async () => {},
  afterAuditFreeze = async () => {},
} = {}) {
  const roles = [];
  return {
    roles,
    dependencies: {
      expectedProjectionItems: value.expected,
      randomUUID: () => "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      now: () => "2026-07-21T12:00:00.000Z",
      preflight: async () => ({
        status: "identity-and-config-passed",
        codex: { version: admittedCodexVersion, binarySha256: admittedCodexSha256 },
        privateReviewCompleted: false,
        adversarialProbe: { performed: false },
      }),
      verifyRg: async () => ({
        version: admittedRgVersion, sha256: admittedRgSha256,
        argv0: "/opt/homebrew/bin/rg", verifiedWithoutCorpusAccess: true,
      }),
      validateAuthCarrier: async () => "/synthetic/auth-carrier",
      afterCoreFreeze,
      afterAuditFreeze,
      modelCall: async ({ role, prompt }) => {
        roles.push(role);
        if (role === "author") return trace(contractFixture(), "author-fresh-thread");
        const input = parseStrictJson(prompt);
        const failedId = auditChecklistIds[0];
        return trace({
          documentKind: evaluationAuditKind,
          experimentId: evaluationExperimentId,
          coreManifestSha256: input.frozenCore.packManifestSha256,
          decision: auditDecision,
          checklist: Object.fromEntries(auditChecklistIds.map((id) => [
            id, auditDecision === "accept" || id !== failedId,
          ])),
          counts: {
            tasks: 8, cells: 64, horizons: 4, arms: 2,
            oracleJudgments: 32, coreArtifacts: 7, severeErrorClasses: 3,
          },
          issues: auditDecision === "accept" ? [] : [
            { checkId: failedId, code: "identity-mismatch" },
          ],
          repairPerformed: false,
          runPerformed: false,
        }, "auditor-fresh-thread");
      },
    },
  };
}

function runOptions(value) {
  return {
    repositoryRoot,
    projectionRoot: value.projection,
    privateRoot: value.privateRoot,
    codexPath: "/synthetic/codex",
    authCarrier: "/synthetic/auth-carrier",
    rgPath: "/opt/homebrew/bin/rg",
    confirmOpenAIProcessingAuthorized: true,
    confirmNoRunAuthorized: true,
  };
}

test("schemas and semantic validators admit one exact 8-task contract", () => {
  const contract = contractFixture();
  assert.equal(validateEvaluationContract(contract, fixtureLineCounts), contract);
  const exactEnvelope = {
    type: "object",
    additionalProperties: false,
    required: ["payloadJson"],
    properties: { payloadJson: { type: "string" } },
  };
  assert.deepEqual(buildAuthorOutputSchema(), exactEnvelope);
  assert.deepEqual(buildAuditOutputSchema(), exactEnvelope);
  assert.deepEqual(providerOutputEnvelopeSchema, exactEnvelope);
  const serialized = JSON.stringify(buildAuthorOutputSchema());
  assert.equal(Buffer.byteLength(serialized) < 256, true);
  for (const forbidden of ["const", "pattern", "minimum", "maximum", "minItems", "maxItems", "enum"]) {
    assert.equal(serialized.includes(`\"${forbidden}\"`), false, forbidden);
  }
  assert.deepEqual(parseProviderPayload({ payloadJson: JSON.stringify({ ok: true }) }), { ok: true });
});

test("projection validation checks exact inventory, sizes and digests", async () => {
  const value = await fixture();
  try {
    const validated = await validateProjectionFiles(value.projection, value.expected);
    assert.equal(validated.items.length, 4);
    await chmod(path.join(value.projection, "item-0004.rst"), 0o644);
    await assert.rejects(
      validateProjectionFiles(value.projection, value.expected),
      (error) => error.code === "PROJECTION_ITEM",
    );
  } finally {
    await value.cleanup();
  }
});

test("a fake two-session run freezes split CORE, audit and success RELEASE", async () => {
  const value = await fixture();
  const roles = [];
  try {
    const result = await runEvaluationFreeze({
      repositoryRoot,
      projectionRoot: value.projection,
      privateRoot: value.privateRoot,
      codexPath: "/synthetic/codex",
      authCarrier: "/synthetic/auth-carrier",
      rgPath: "/opt/homebrew/bin/rg",
      confirmOpenAIProcessingAuthorized: true,
      confirmNoRunAuthorized: true,
    }, {
      expectedProjectionItems: value.expected,
      randomUUID: () => "11111111-2222-4333-8444-555555555555",
      now: () => "2026-07-21T12:00:00.000Z",
      preflight: async () => ({
        status: "identity-and-config-passed",
        codex: { version: admittedCodexVersion, binarySha256: admittedCodexSha256 },
        privateReviewCompleted: false,
        adversarialProbe: { performed: false },
      }),
      verifyRg: async () => ({
        version: admittedRgVersion, sha256: admittedRgSha256,
        argv0: "/opt/homebrew/bin/rg", verifiedWithoutCorpusAccess: true,
      }),
      validateAuthCarrier: async () => "/synthetic/auth-carrier",
      modelCall: async ({ role, prompt }) => {
        roles.push(role);
        if (role === "author") return trace(contractFixture(), "author-fresh-thread");
        const input = parseStrictJson(prompt);
        const audit = {
          documentKind: evaluationAuditKind,
          experimentId: evaluationExperimentId,
          coreManifestSha256: input.frozenCore.packManifestSha256,
          decision: "accept",
          checklist: Object.fromEntries(auditChecklistIds.map((id) => [id, true])),
          counts: {
            tasks: 8, cells: 64, horizons: 4, arms: 2,
            oracleJudgments: 32, coreArtifacts: 7, severeErrorClasses: 3,
          },
          issues: [], repairPerformed: false, runPerformed: false,
        };
        return trace(audit, "auditor-fresh-thread");
      },
    });
    assert.equal(result.status, "accepted");
    assert.equal(result.auditDecision, "accept");
    assert.equal(result.counts.tasks, 8);
    assert.equal(result.counts.cells, 64);
    assert.deepEqual(roles, ["author", "auditor"]);
    assert.match(result.evaluationIdentity, /evaluation-sha256-[a-f0-9]{64}$/);
    assert.equal(result.ownerAuthorizationRecord, evaluationOwnerAuthorizationRecord);
    assert.equal(result.projectionManifestSha256, acceptedProjectionManifestSha256);
    assert.equal(result.projectionReceiptSha256, acceptedProjectionReceiptSha256);
    assert.equal(result.releaseSha256.length, 64);
    assert.equal(result.terminalSha256, null);
    const coreNames = (await readdir(path.join(value.privateRoot, "core"))).sort();
    assert.deepEqual(coreNames, [
      "PACK-MANIFEST.json", "artifact-roles.json", "cells.json", "evaluation-contract.json",
      "oracle.json", "run-card.json", "tasks.json",
    ]);
    const tasks = JSON.parse(await readFile(path.join(value.privateRoot, "core", "tasks.json"), "utf8"));
    assert.equal(Object.hasOwn(tasks.tasks[0], "horizonRules"), false);
    const coreManifest = JSON.parse(
      await readFile(path.join(value.privateRoot, "core", "PACK-MANIFEST.json"), "utf8"),
    );
    assert.equal(coreManifest.authorStateLifecycle.perCallStateRootRemoved, true);
    const auditManifest = JSON.parse(
      await readFile(path.join(value.privateRoot, "audit", "AUDIT-MANIFEST.json"), "utf8"),
    );
    assert.equal(auditManifest.auditorStateLifecycle.reusedAcrossModelCalls, false);
    assert.equal(await readdir(path.join(value.privateRoot, "release")).then((items) => items.includes("RELEASE.json")), true);
  } finally {
    await value.cleanup();
  }
});

test("audit rejection is terminal and never creates a success RELEASE", async () => {
  const expected = {
    coreManifestSha256: "a".repeat(64), taskCount: 8, cellCount: 64, severeErrorClassCount: 3,
  };
  const rejected = {
    documentKind: evaluationAuditKind,
    experimentId: evaluationExperimentId,
    coreManifestSha256: expected.coreManifestSha256,
    decision: "reject",
    checklist: Object.fromEntries(auditChecklistIds.map((id, index) => [id, index !== 0])),
    counts: {
      tasks: 8, cells: 64, horizons: 4, arms: 2,
      oracleJudgments: 32, coreArtifacts: 7, severeErrorClasses: 3,
    },
    issues: [{ checkId: auditChecklistIds[0], code: "identity-mismatch" }],
    repairPerformed: false,
    runPerformed: false,
  };
  assert.equal(validateAuditResult(rejected, expected).decision, "reject");
});

test("a full audit rejection writes TERMINAL and no release directory", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value, { auditDecision: "reject" });
    const result = await runEvaluationFreeze(runOptions(value), fake.dependencies);
    assert.equal(result.status, "rejected");
    assert.equal(result.exitCode, 3);
    assert.equal(result.releaseSha256, null);
    assert.match(result.terminalSha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(fake.roles, ["author", "auditor"]);
    await assert.rejects(readFile(path.join(value.privateRoot, "release", "RELEASE.json")));
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
  } finally {
    await value.cleanup();
  }
});

test("same-uid mutation after CORE freeze is terminal before the auditor call", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value, {
      afterCoreFreeze: async ({ privateRoot }) => {
        const tasksPath = path.join(privateRoot, "core", "tasks.json");
        await chmod(tasksPath, 0o600);
        await writeFile(tasksPath, "mutated synthetic core\n");
      },
    });
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "FROZEN_CORE_CHANGED",
    );
    assert.deepEqual(fake.roles, ["author"]);
    await assert.rejects(readFile(path.join(value.privateRoot, "release", "RELEASE.json")));
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
  } finally {
    await value.cleanup();
  }
});

test("CLI arguments are exact and include the pinned rg path", () => {
  const parsed = parseArguments([
    "--repository", "/repo", "--projection", "/projection", "--private-root", "/private",
    "--codex", "/codex", "--auth-carrier", "/auth", "--rg", "/opt/homebrew/bin/rg",
    "--confirm-openai-processing-authorized", "--confirm-no-run-authorized",
  ]);
  assert.equal(parsed.rgPath, "/opt/homebrew/bin/rg");
  assert.throws(
    () => parseArguments([]),
    (error) => error.code === "USAGE",
  );
});

test("semantic mutations cannot weaken horizons, budgets, decisions or roles", () => {
  const mutations = [
    (value) => {
      value.tasks[0].horizonRules[0].supportingEvidence[0].sourceItem = "item-0004.rst";
    },
    (value) => {
      value.budgets.memoryMiB = 0;
    },
    (value) => {
      value.decision.precedence = ["stop", "shrink", "keep"];
    },
    (value) => {
      value.roles.graphtruthOperator = "author-codex-session";
    },
    (value) => {
      value.horizons = ["pep-0563", "pep-3107", "pep-0649", "pep-0749"];
    },
    (value) => {
      value.tasks[0].taskId = evaluationTaskIds[1];
    },
    (value) => {
      value.tasks[0].horizonRules[0].supportingEvidence[0].locator = "L000001-L000002";
    },
  ];
  for (const mutate of mutations) {
    const value = structuredClone(contractFixture());
    mutate(value);
    assert.throws(
      () => validateEvaluationContract(value, fixtureLineCounts),
      (error) => error.code?.startsWith("AUTHOR_"),
    );
  }
});

test("the provider envelope is strict and bounded outside provider schema", () => {
  for (const value of [
    { payloadJson: "{}", extra: true },
    { payloadJson: 42 },
    { payloadJson: '{"a":1,"a":2}' },
    { payloadJson: "x".repeat(1024 * 1024 + 1) },
  ]) {
    assert.throws(
      () => parseProviderPayload(value),
      (error) => error.code === "MODEL_PAYLOAD_INVALID",
    );
  }
});

test("both prompts repeat source and projection anchors plus exact author grammars", () => {
  const items = Array.from({ length: 4 }, (_, index) => ({
    id: evaluationHorizons[index],
    name: `item-${String(index + 1).padStart(4, "0")}.rst`,
    sha256: String(index + 1).repeat(64),
    bytes: 20 + index,
    lineCount: 1,
    text: `synthetic ${index + 1}\n`,
  }));
  const author = parseStrictJson(buildAuthorPrompt(items));
  const audit = parseStrictJson(buildAuditPrompt(items, { "tasks.json": "{}\n" }, "{}\n"));
  for (const prompt of [author, audit]) {
    assert.equal(prompt.fixedIdentities.sourceManifestSha256,
      "c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b");
    assert.equal(prompt.fixedIdentities.sourcePreAcceptanceSha256,
      "ad63ca3cad51ec67b6e5d8fd2c62dcdfc3ed6a291f47a6809a819eadfa29ff99");
    assert.deepEqual(
      prompt.fixedIdentities.expectedProjectionItems.map((item) => item.sha256),
      items.map((item) => item.sha256),
    );
  }
  assert.deepEqual(author.requiredValidationConstants.taskIdsInExactOrder, evaluationTaskIds);
  assert.match(author.requiredValidationConstants.evidenceLocatorGrammar, /L\[0-9\]/);
  assert.match(author.requiredValidationConstants.severeErrorIdGrammar, /a-z0-9/);
  assert.equal(audit.auditRequirements.some((item) => item.includes("source pre-acceptance SHA")), true);
  assert.match(author.payloadContractSchemaRole, /non-normative shape reference/);
  assert.match(audit.payloadAuditSchemaRole, /non-normative shape reference/);
  assert.deepEqual(
    [...author.payloadContractSchema.required].sort(),
    Object.keys(contractFixture()).sort(),
  );
  assert.equal(
    author.payloadContractSchema.properties.tasks.items.properties
      .horizonRules.items.properties.supportingEvidence.items.properties.locator.pattern,
    "^L[0-9]{6}-L[0-9]{6}$",
  );
  assert.deepEqual(
    author.payloadContractSchema.properties.tasks.items.properties.taskId.enum,
    evaluationTaskIds,
  );
  assert.equal(
    author.payloadContractSchema.properties.runCard.properties.implementation.const,
    "pending-not-authorized",
  );
  const auditValue = {
    documentKind: evaluationAuditKind,
    experimentId: evaluationExperimentId,
    coreManifestSha256: "a".repeat(64),
    decision: "accept",
    checklist: Object.fromEntries(auditChecklistIds.map((id) => [id, true])),
    counts: {
      tasks: 8, cells: 64, horizons: 4, arms: 2,
      oracleJudgments: 32, coreArtifacts: 7, severeErrorClasses: 3,
    },
    issues: [], repairPerformed: false, runPerformed: false,
  };
  assert.deepEqual([...audit.payloadAuditSchema.required].sort(), Object.keys(auditValue).sort());
  assert.equal(validateEvaluationContract(contractFixture(), fixtureLineCounts).tasks.length, 8);
  assert.equal(validateAuditResult(auditValue, {
    coreManifestSha256: "a".repeat(64), taskCount: 8, cellCount: 64,
    severeErrorClassCount: 3,
  }).decision, "accept");
});

test("preflight, rg and auth failures consume no model call", async () => {
  for (const failure of ["preflight", "rg", "auth"]) {
    const value = await fixture();
    try {
      const fake = fakeDependencies(value);
      if (failure === "preflight") fake.dependencies.preflight = async () => { throw new Error("synthetic"); };
      if (failure === "rg") fake.dependencies.verifyRg = async () => { throw new Error("synthetic"); };
      if (failure === "auth") fake.dependencies.validateAuthCarrier = async () => { throw new Error("synthetic"); };
      await assert.rejects(runEvaluationFreeze(runOptions(value), fake.dependencies));
      assert.deepEqual(fake.roles, []);
    } finally {
      await value.cleanup();
    }
  }
});

test("invalid author output consumes exactly one call and records terminal state", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value);
    fake.dependencies.modelCall = async ({ role }) => {
      fake.roles.push(role);
      return trace({ documentKind: "invalid" }, "author-invalid-thread");
    };
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "AUTHOR_RESULT_INVALID",
    );
    assert.deepEqual(fake.roles, ["author"]);
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
    await assert.rejects(readFile(path.join(value.privateRoot, "release", "RELEASE.json")));
  } finally {
    await value.cleanup();
  }
});

test("invalid ephemeral lifecycle is rejected after exactly one author call", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value);
    fake.dependencies.modelCall = async ({ role }) => {
      fake.roles.push(role);
      return trace(contractFixture(), "author-bad-lifecycle", {
        lifecycle: {
          authCarrierUnchanged: true,
          perCallStateRootCreated: true,
          perCallStateRootRemoved: false,
          reusedAcrossModelCalls: false,
        },
      });
    };
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "AUTHOR_MODEL_RESULT",
    );
    assert.deepEqual(fake.roles, ["author"]);
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
  } finally {
    await value.cleanup();
  }
});

test("auditor transport failure consumes exactly two calls and creates no RELEASE", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value);
    fake.dependencies.modelCall = async ({ role }) => {
      fake.roles.push(role);
      if (role === "author") return trace(contractFixture(), "author-only-thread");
      throw new Error("synthetic auditor transport failure");
    };
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "AUDITOR_MODEL_CALL",
    );
    assert.deepEqual(fake.roles, ["author", "auditor"]);
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
    await assert.rejects(readFile(path.join(value.privateRoot, "release", "RELEASE.json")));
  } finally {
    await value.cleanup();
  }
});

test("an existing target root rejects before any model call", async () => {
  const value = await fixture();
  try {
    await mkdir(value.privateRoot, { mode: 0o700 });
    const fake = fakeDependencies(value);
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "PRIVATE_ROOT_BOUNDARY",
    );
    assert.deepEqual(fake.roles, []);
  } finally {
    await value.cleanup();
  }
});

test("same-uid mutation of frozen AUDIT is terminal and cannot create RELEASE", async () => {
  const value = await fixture();
  try {
    const fake = fakeDependencies(value, {
      afterAuditFreeze: async ({ privateRoot }) => {
        const resultPath = path.join(privateRoot, "audit", "audit-result.json");
        await chmod(resultPath, 0o600);
        await writeFile(resultPath, "mutated synthetic audit\n");
      },
    });
    await assert.rejects(
      runEvaluationFreeze(runOptions(value), fake.dependencies),
      (error) => error.code === "FROZEN_AUDIT_CHANGED",
    );
    assert.deepEqual(fake.roles, ["author", "auditor"]);
    await assert.rejects(readFile(path.join(value.privateRoot, "release", "RELEASE.json")));
    assert.deepEqual(await readdir(path.join(value.privateRoot, "terminal")), ["TERMINAL.json"]);
  } finally {
    await value.cleanup();
  }
});
