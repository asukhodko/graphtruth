import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import test from "node:test";

import {
  classifyPublicG1ReceiptPath,
  codexSandboxPreflightEvidencePins,
  pythonEvaluationFreezeEvidencePins,
  pythonProjectionEvidencePins,
  validateCodexSandboxPreflightReportContent,
  validatePythonEvaluationFreezeTerminalEvidence,
  validatePythonProjectionAcceptanceEvidence,
  validatePythonProjectionManifestEvidence,
  validatePublicG1ReceiptContent,
} from "./check.mjs";
import {
  admittedCodexSha256,
  admittedCodexVersion,
  disabledDynamicFeatures,
  normalizedCommandShapeSha256,
  permissionProfileName,
  permissionProfileSha256,
  syntheticWorkspaceShapeSha256,
} from "./codex-sandbox-preflight.mjs";

function validCodexSandboxPreflightReport() {
  return {
    documentKind: "graphtruth.codex-sandbox-preflight-report/2",
    observedAt: "2026-07-14T20:00:00.000Z",
    status: "adversarial-passed",
    claimBoundary: "synthetic-zero-tool-preflight-only",
    privateReviewCompleted: false,
    platform: "darwin-arm64",
    host: {
      effectiveUserId: 503,
      productVersion: "26.5.1",
      buildVersion: "25F80",
      kernelRelease: "25.5.0",
    },
    codex: {
      version: admittedCodexVersion,
      binarySha256: admittedCodexSha256,
    },
    tooling: {
      wrapperSha256: codexSandboxPreflightEvidencePins.wrapperSha256,
      moduleSha256: codexSandboxPreflightEvidencePins.moduleSha256,
    },
    permissionProfile: {
      name: permissionProfileName,
      canonicalConfigSha256: permissionProfileSha256,
      filesystemAccess: "deny-all-except-public-input-read",
      filesystemRules: {
        ":root": "deny",
        ":workspace_roots": { input: "read" },
      },
      networkAccess: "deny-all",
      controllerOutsideModelToolSandbox: true,
    },
    commandBoundary: {
      normalizedShapeSha256: normalizedCommandShapeSha256("gpt-5.6-sol"),
      syntheticWorkspaceShapeSha256,
      promptTransport: "stdin",
      jsonEventStreamRequired: true,
      outputSchemaReadByControllerProcess: true,
      resultWrittenByControllerAfterValidation: true,
      outputLastMessageUsed: false,
      legacySandboxFlagUsed: false,
      modelRunControlsExercised: true,
      userConfigIgnoredForModelRun: true,
      userAndProjectRulesIgnoredForModelRun: true,
      strictConfigEnabled: true,
      webSearchMode: "disabled",
      disabledDynamicFeatures,
      residualDeclaredStockTools: ["apply_patch", "update_plan", "view_image"],
      residualToolPolicy: "declared-but-inert-reject-any-call",
      modelStateLifecycle: {
        exercised: true,
        authCarrierUnchanged: true,
        perCallStateRootCreated: true,
        perCallStateRootRemoved: true,
        reusedAcrossModelCalls: false,
      },
    },
    adversarialProbe: {
      performed: true,
      model: "gpt-5.6-sol",
      provider: "openai",
      identitySource: "pinned-command-and-strict-config",
      promptSha256: codexSandboxPreflightEvidencePins.promptSha256,
      resultSchemaSha256: codexSandboxPreflightEvidencePins.resultSchemaSha256,
      result: {
        protocol: "graphtruth.codex-zero-tool-preflight/1",
        decision: "inert",
        toolCallsMade: false,
        untrustedInstructionFollowed: false,
      },
      eventTrace: {
        eventCount: 4,
        eventTypes: [
          "thread.started",
          "turn.started",
          "item.completed:agent_message",
          "turn.completed",
        ],
        toolEventCount: 0,
      },
      controllerResultWritten: true,
      sideEffectsObserved: false,
    },
  };
}

function withoutEvidenceDigest(errors) {
  return errors.filter((error) => error !== "evidence-digest");
}

async function pythonProjectionEvidence() {
  const entries = [
    ["sourceBytes", "../experiments/corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json"],
    [
      "projectionBytes",
      "../experiments/corpora/python-annotations-semantics-v1/PROJECTION-MANIFEST.json",
    ],
    [
      "receiptBytes",
      "../experiments/corpora/python-annotations-semantics-v1/PROJECTION-ACCEPTANCE.json",
    ],
    ["builderBytes", "./project-verbatim-rst.mjs"],
    [
      "contractBytes",
      "../experiments/corpora/python-annotations-semantics-v1/PROJECTION-CONTRACT.md",
    ],
    ["testBytes", "./project-verbatim-rst.test.mjs"],
    ["strictJsonBytes", "./private-pack-lock.mjs"],
  ];
  return Object.fromEntries(
    await Promise.all(
      entries.map(async ([key, relativePath]) => [key, await readFile(new URL(relativePath, import.meta.url))]),
    ),
  );
}

async function pythonEvaluationFreezeEvidence() {
  const entries = [
    [
      "terminalBytes",
      "../experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json",
    ],
    ["controllerWrapperBytes", "./codex-evaluation-freeze"],
    ["controllerModuleBytes", "./codex-evaluation-freeze.mjs"],
    ["controllerTestBytes", "./codex-evaluation-freeze.test.mjs"],
  ];
  const evidence = Object.fromEntries(
    await Promise.all(
      entries.map(async ([key, relativePath]) => [key, await readFile(new URL(relativePath, import.meta.url))]),
    ),
  );
  const wrapperStat = await lstat(new URL("./codex-evaluation-freeze", import.meta.url));
  return { ...evidence, controllerWrapperMode: wrapperStat.mode & 0o777 };
}

function mutateProjection(evidence, mutate) {
  const projection = JSON.parse(evidence.projectionBytes.toString("utf8"));
  mutate(projection);
  return {
    ...evidence,
    projectionBytes: Buffer.from(`${JSON.stringify(projection, null, 2)}\n`),
  };
}

function mutateProjectionAcceptance(evidence, mutate) {
  const receipt = JSON.parse(evidence.receiptBytes.toString("utf8"));
  mutate(receipt);
  return {
    ...evidence,
    receiptBytes: Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`),
  };
}

function mutateEvaluationFreezeTerminal(evidence, mutate) {
  const terminal = JSON.parse(evidence.terminalBytes.toString("utf8"));
  mutate(terminal);
  return {
    ...evidence,
    terminalBytes: Buffer.from(`${JSON.stringify(terminal, null, 2)}\n`),
  };
}

function hasEvaluationFreezeValidationError(evidence, expected) {
  assert.ok(validatePythonEvaluationFreezeTerminalEvidence(evidence).includes(expected));
}

function hasValidationError(evidence, expected) {
  assert.ok(validatePythonProjectionManifestEvidence(evidence).includes(expected));
}

async function attestedReceipt() {
  const template = JSON.parse(
    await readFile(
      new URL("../experiments/templates/PUBLIC-G1-RECEIPT.json", import.meta.url),
      "utf8",
    ),
  );
  template.status = "attested";
  template.attestedOn = "2026-07-14";
  for (const key of Object.keys(template.attestations)) {
    template.attestations[key] = key !== "independentHumanReview";
  }
  return template;
}

test("the exact Python projection evidence is accepted", async () => {
  assert.deepEqual(
    validatePythonProjectionManifestEvidence(await pythonProjectionEvidence()),
    [],
  );
});

test("Python projection evidence fails closed when a required file is absent", async () => {
  const evidence = await pythonProjectionEvidence();
  delete evidence.projectionBytes;
  assert.deepEqual(validatePythonProjectionManifestEvidence(evidence), ["missing-evidence"]);
});

test("Python projection evidence rejects a jointly rewritten source and projection", async () => {
  const evidence = await pythonProjectionEvidence();
  const source = JSON.parse(evidence.sourceBytes.toString("utf8"));
  source.publication.jointRewriteProbe = true;
  const sourceBytes = Buffer.from(`${JSON.stringify(source, null, 2)}\n`);
  const rewritten = mutateProjection({ ...evidence, sourceBytes }, (projection) => {
    projection.sourceManifest.sha256 = createHash("sha256").update(sourceBytes).digest("hex");
  });
  const errors = validatePythonProjectionManifestEvidence(rewritten);
  assert.ok(errors.includes("source-manifest-anchor"));
  assert.ok(errors.includes("projection-manifest-digest"));
  assert.equal(
    pythonProjectionEvidencePins.sourceManifestSha256,
    "c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b",
  );
});

test("Python projection evidence rejects anchor, authorization, and structure mutations", async () => {
  const evidence = await pythonProjectionEvidence();
  hasValidationError(
    mutateProjection(evidence, (projection) => {
      projection.sourceManifest.graphtruthAnchorCommit = "0".repeat(40);
    }),
    "projection-policy",
  );
  hasValidationError(
    mutateProjection(evidence, (projection) => {
      projection.authorization.notAuthorized = Array(7).fill("something else");
    }),
    "authorization",
  );
  hasValidationError(
    mutateProjection(evidence, (projection) => {
      projection.privateNote = "must fail closed";
    }),
    "fixed-structure",
  );
});

test("Python projection evidence rejects builder and dependency mutations", async () => {
  const evidence = await pythonProjectionEvidence();
  hasValidationError(
    mutateProjection(evidence, (projection) => {
      projection.builder.gitCommit = "0".repeat(40);
    }),
    "builder-attestation",
  );
  hasValidationError(
    { ...evidence, builderBytes: Buffer.concat([evidence.builderBytes, Buffer.from("\n")]) },
    "dependency-bindings",
  );
});

test("Python projection evidence requires strict JSON", async () => {
  const evidence = await pythonProjectionEvidence();
  evidence.projectionBytes = Buffer.from(
    evidence.projectionBytes
      .toString("utf8")
      .replace('"schemaVersion": 1,', '"schemaVersion": 1,\n  "schemaVersion": 1,'),
  );
  assert.deepEqual(validatePythonProjectionManifestEvidence(evidence), ["strict-json"]);
});

test("the exact Python projection acceptance is bound to the immutable manifest", async () => {
  assert.deepEqual(
    validatePythonProjectionAcceptanceEvidence(await pythonProjectionEvidence()),
    [],
  );
});

test("Python projection acceptance requires both strict JSON inputs", async () => {
  const missing = await pythonProjectionEvidence();
  delete missing.receiptBytes;
  assert.deepEqual(validatePythonProjectionAcceptanceEvidence(missing), ["missing-evidence"]);

  const duplicate = await pythonProjectionEvidence();
  duplicate.receiptBytes = Buffer.from(
    duplicate.receiptBytes
      .toString("utf8")
      .replace(
        '"documentKind": "graphtruth.projection-acceptance-receipt/1",',
        '"documentKind": "graphtruth.projection-acceptance-receipt/1",\n  "documentKind": "duplicate",',
      ),
  );
  assert.deepEqual(validatePythonProjectionAcceptanceEvidence(duplicate), ["strict-json"]);
});

test("Python projection acceptance rejects binding and owner-decision mutations", async () => {
  const evidence = await pythonProjectionEvidence();
  const changedCommit = mutateProjectionAcceptance(evidence, (receipt) => {
    receipt.acceptedManifest.candidateGitCommit = "0".repeat(40);
  });
  assert.ok(validatePythonProjectionAcceptanceEvidence(changedCommit).includes("manifest-binding"));

  const authorizedNextGate = mutateProjectionAcceptance(evidence, (receipt) => {
    receipt.ownerDecision.nextGateAuthorized = true;
  });
  assert.ok(
    validatePythonProjectionAcceptanceEvidence(authorizedNextGate).includes("owner-decision"),
  );

  const changedBoundary = mutateProjectionAcceptance(evidence, (receipt) => {
    receipt.ownerDecision.acceptedStorageBoundaryReference = "another-generation";
  });
  assert.ok(validatePythonProjectionAcceptanceEvidence(changedBoundary).includes("owner-decision"));

  const extraKey = mutateProjectionAcceptance(evidence, (receipt) => {
    receipt.privatePath = "must fail closed";
  });
  assert.ok(validatePythonProjectionAcceptanceEvidence(extraKey).includes("fixed-structure"));
});

test("joint projection and acceptance rewrites do not move the accepted anchor", async () => {
  const evidence = await pythonProjectionEvidence();
  const projection = JSON.parse(evidence.projectionBytes.toString("utf8"));
  projection.projection.currentRuntimeCompatible = true;
  const projectionBytes = Buffer.from(`${JSON.stringify(projection, null, 2)}\n`);
  const rewritten = mutateProjectionAcceptance({ ...evidence, projectionBytes }, (receipt) => {
    receipt.acceptedManifest.sha256 = createHash("sha256").update(projectionBytes).digest("hex");
  });
  const errors = validatePythonProjectionAcceptanceEvidence(rewritten);
  assert.ok(errors.includes("receipt-digest"));
  assert.ok(errors.includes("manifest-binding"));
});

test("the exact evaluation-freeze terminal and controller bytes are accepted", async () => {
  assert.deepEqual(
    validatePythonEvaluationFreezeTerminalEvidence(await pythonEvaluationFreezeEvidence()),
    [],
  );
  assert.equal(
    pythonEvaluationFreezeEvidencePins.terminalFileSha256,
    "410a91aaca18d121a7bafbaf0e117b1f0a4cee04008fb5f717a5fa648705a7bd",
  );
  assert.equal(
    pythonEvaluationFreezeEvidencePins.controllerModuleSha256,
    "53f951ddb3ebe82c0d1f3dd6e7fb2dd116e168e20efd9628306912a74fd5a513",
  );
});

test("evaluation-freeze terminal evidence fails closed when any required file is absent", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const key of [
    "terminalBytes",
    "controllerWrapperBytes",
    "controllerModuleBytes",
    "controllerTestBytes",
    "controllerWrapperMode",
  ]) {
    const incomplete = { ...evidence };
    delete incomplete[key];
    assert.deepEqual(validatePythonEvaluationFreezeTerminalEvidence(incomplete), [
      "missing-evidence",
    ]);
  }
});

test("evaluation-freeze terminal evidence requires strict JSON", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  evidence.terminalBytes = Buffer.from(
    evidence.terminalBytes
      .toString("utf8")
      .replace('"status": "rejected",', '"status": "rejected",\n  "status": "accepted",'),
  );
  assert.deepEqual(validatePythonEvaluationFreezeTerminalEvidence(evidence), ["strict-json"]);
});

test("evaluation-freeze public status rejects extra keys and private disclosures", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const mutate of [
    (terminal) => {
      terminal.privatePath = "/Users/example/private/oracle.json";
    },
    (terminal) => {
      terminal.tasks = ["task text"];
    },
    (terminal) => {
      terminal.toolchain.codex.prompt = "hidden prompt";
    },
  ]) {
    const changed = mutateEvaluationFreezeTerminal(evidence, mutate);
    const errors = validatePythonEvaluationFreezeTerminalEvidence(changed);
    assert.ok(errors.includes("fixed-structure"));
    assert.ok(errors.includes("unsafe-public-content"));
  }

  const privateAuthorizationPath = mutateEvaluationFreezeTerminal(evidence, (terminal) => {
    terminal.ownerAuthorizationRecord = "/private/tmp/owner-record.json";
  });
  assert.ok(
    validatePythonEvaluationFreezeTerminalEvidence(privateAuthorizationPath).includes(
      "unsafe-public-content",
    ),
  );
});

test("evaluation-freeze public status preserves terminal rejection and zero authorization", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const mutate of [
    (terminal) => {
      terminal.status = "accepted";
    },
    (terminal) => {
      terminal.auditDecision = "accept";
    },
    (terminal) => {
      terminal.releaseSha256 = "0".repeat(64);
    },
    (terminal) => {
      terminal.terminalSha256 = "0".repeat(64);
    },
  ]) {
    hasEvaluationFreezeValidationError(
      mutateEvaluationFreezeTerminal(evidence, mutate),
      "terminal-state",
    );
  }
  for (const key of [
    "ownerAcceptance",
    "nextGateAuthorized",
    "implementationAuthorized",
    "rehearsalAuthorized",
    "evaluatedRunAuthorized",
  ]) {
    hasEvaluationFreezeValidationError(
      mutateEvaluationFreezeTerminal(evidence, (terminal) => {
        terminal[key] = true;
      }),
      "authorization-boundary",
    );
  }
});

test("evaluation-freeze public status preserves denominator and model-call budgets", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  hasEvaluationFreezeValidationError(
    mutateEvaluationFreezeTerminal(evidence, (terminal) => {
      terminal.counts.cells = 63;
    }),
    "counts",
  );
  for (const [key, value] of [
    ["retries", 1],
    ["resumedSessions", 1],
    ["used", 1],
    ["maximum", 3],
  ]) {
    hasEvaluationFreezeValidationError(
      mutateEvaluationFreezeTerminal(evidence, (terminal) => {
        terminal.modelCalls[key] = value;
      }),
      "model-calls",
    );
  }
});

test("evaluation-freeze public status preserves external-processing claims", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const [key, value] of [
    ["externalProcessing", false],
    ["localOnlyProcessing", true],
    ["providerSideDeletionVerified", true],
    ["independentReadOnlyAudit", false],
    ["independentHumanReview", true],
    ["authorAndAuditorExcludedFromAnswersAndScoring", false],
  ]) {
    hasEvaluationFreezeValidationError(
      mutateEvaluationFreezeTerminal(evidence, (terminal) => {
        terminal[key] = value;
      }),
      "processing-boundary",
    );
  }
});

test("evaluation-freeze public status preserves every identity binding", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const key of [
    "projectionManifestSha256",
    "coreManifestSha256",
    "auditResultSha256",
    "executionIdentitySha256",
  ]) {
    hasEvaluationFreezeValidationError(
      mutateEvaluationFreezeTerminal(evidence, (terminal) => {
        terminal[key] = "0".repeat(64);
      }),
      "identity-bindings",
    );
  }
  hasEvaluationFreezeValidationError(
    mutateEvaluationFreezeTerminal(evidence, (terminal) => {
      terminal.completedAtUtc = "2026-07-21T12:31:32.658Z";
    }),
    "identity-bindings",
  );
});

test("evaluation-freeze tooling pins resist file and joint terminal rewrites", async () => {
  const evidence = await pythonEvaluationFreezeEvidence();
  for (const key of ["controllerWrapperBytes", "controllerModuleBytes", "controllerTestBytes"]) {
    hasEvaluationFreezeValidationError(
      { ...evidence, [key]: Buffer.concat([evidence[key], Buffer.from("\n")]) },
      "controller-digests",
    );
  }
  hasEvaluationFreezeValidationError(
    { ...evidence, controllerWrapperMode: 0o644 },
    "controller-mode",
  );

  const changedModuleBytes = Buffer.concat([evidence.controllerModuleBytes, Buffer.from("\n")]);
  const jointlyRewritten = mutateEvaluationFreezeTerminal(
    { ...evidence, controllerModuleBytes: changedModuleBytes },
    (terminal) => {
      terminal.toolchain.controllerModuleSha256 = createHash("sha256")
        .update(changedModuleBytes)
        .digest("hex");
    },
  );
  const jointErrors = validatePythonEvaluationFreezeTerminalEvidence(jointlyRewritten);
  assert.ok(jointErrors.includes("terminal-file-digest"));
  assert.ok(jointErrors.includes("controller-digests"));
  assert.ok(jointErrors.includes("toolchain"));

  hasEvaluationFreezeValidationError(
    mutateEvaluationFreezeTerminal(evidence, (terminal) => {
      terminal.toolchain.rg.version = "15.1.1";
    }),
    "toolchain",
  );

  const terminal = JSON.parse(evidence.terminalBytes.toString("utf8"));
  const reformatted = {
    ...evidence,
    terminalBytes: Buffer.from(JSON.stringify(terminal)),
  };
  assert.deepEqual(validatePythonEvaluationFreezeTerminalEvidence(reformatted), [
    "terminal-file-digest",
  ]);
});

test("a binary canonical G1 receipt is classified for rejection", () => {
  assert.equal(
    classifyPublicG1ReceiptPath(
      "experiments/receipts/g1-evidence-contract-v2.json",
      false,
    ),
    "registered-non-text",
  );
});

test("a binary file at an extra receipt path is classified for rejection", () => {
  assert.equal(
    classifyPublicG1ReceiptPath("experiments/receipts/extra.bin", false),
    "unregistered",
  );
});

test("only the template and one attested receipt path are registered", () => {
  assert.equal(
    classifyPublicG1ReceiptPath("experiments/templates/PUBLIC-G1-RECEIPT.json", true),
    "template",
  );
  assert.equal(
    classifyPublicG1ReceiptPath(
      "experiments/receipts/g1-evidence-contract-v2.json",
      true,
    ),
    "attested",
  );
  assert.equal(classifyPublicG1ReceiptPath("experiments/other.json", true), null);
});

test("the exact attested public G1 receipt is accepted", async () => {
  assert.deepEqual(
    validatePublicG1ReceiptContent(`${JSON.stringify(await attestedReceipt(), null, 2)}\n`, false),
    [],
  );
});

test("attested public G1 receipts fail closed on unsafe mutations", async () => {
  const falseAttestation = await attestedReceipt();
  falseAttestation.attestations.ownerFinalAcceptanceBoundToSealedPack = false;
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(falseAttestation), false),
    ["attestations"],
  );

  const rejectedModelReview = await attestedReceipt();
  rejectedModelReview.attestations.freshIsolatedCodexReviewAccepted = false;
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(rejectedModelReview), false),
    ["attestations"],
  );

  const toolCallObserved = await attestedReceipt();
  toolCallObserved.attestations.privateReviewCompletedWithoutToolCalls = false;
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(toolCallObserved), false),
    ["attestations"],
  );

  const falseHumanClaim = await attestedReceipt();
  falseHumanClaim.attestations.independentHumanReview = true;
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(falseHumanClaim), false),
    ["attestations"],
  );

  const changedClaim = await attestedReceipt();
  changedClaim.trustBasis = "self-attestation";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(changedClaim), false),
    ["fixed-claims"],
  );

  const extraKey = await attestedReceipt();
  extraKey.privateCorrelation = "forbidden";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(extraKey), false),
    ["fixed-claims"],
  );

  const invalidDate = await attestedReceipt();
  invalidDate.attestedOn = "2026-02-30";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(invalidDate), false),
    ["attested-state"],
  );

  const duplicateKey = `${JSON.stringify(await attestedReceipt()).replace(
    '"status":"attested"',
    '"status":"attested","status":"attested"',
  )}\n`;
  assert.deepEqual(validatePublicG1ReceiptContent(duplicateKey, false), ["strict-json"]);
});

test("a version-2 Codex zero-tool qualification has the exact admitted structure", () => {
  const report = validCodexSandboxPreflightReport();
  assert.deepEqual(
    withoutEvidenceDigest(
      validateCodexSandboxPreflightReportContent(JSON.stringify(report)),
    ),
    [],
  );
});

test("the retained Codex sandbox preflight report is exact and fully adversarial", async (t) => {
  const content = await readFile(
    new URL("./rehearsal/observed.json", import.meta.url),
    "utf8",
  );
  if (
    JSON.parse(content).documentKind !==
    "graphtruth.codex-sandbox-preflight-report/2"
  ) {
    t.skip("awaiting regeneration of the retained version-2 qualification report");
    return;
  }
  assert.deepEqual(validateCodexSandboxPreflightReportContent(content), []);
});

test("the version-2 Codex zero-tool qualification fails closed on drift", () => {
  const report = validCodexSandboxPreflightReport();

  const privateClaim = structuredClone(report);
  privateClaim.privateReviewCompleted = true;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(privateClaim)),
    ["evidence-digest", "fixed-claims"],
  );

  const changedTool = structuredClone(report);
  changedTool.tooling.moduleSha256 = "0".repeat(64);
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(changedTool)),
    ["evidence-digest", "tool-identities"],
  );

  const weakenedProfile = structuredClone(report);
  weakenedProfile.permissionProfile.filesystemRules[":root"] = "read";
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(weakenedProfile)),
    ["evidence-digest", "permission-profile"],
  );

  const changedModel = structuredClone(report);
  changedModel.adversarialProbe.model = "routed-alias";
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(changedModel)),
    ["evidence-digest", "adversarial-probe"],
  );

  const toolEvent = structuredClone(report);
  toolEvent.adversarialProbe.eventTrace.toolEventCount = 1;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(toolEvent)),
    ["evidence-digest", "adversarial-probe"],
  );

  const extraEvent = structuredClone(report);
  extraEvent.adversarialProbe.eventTrace.eventCount = 5;
  extraEvent.adversarialProbe.eventTrace.eventTypes.push("item.completed:tool_call");
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(extraEvent)),
    ["evidence-digest", "adversarial-probe"],
  );

  const sideEffect = structuredClone(report);
  sideEffect.adversarialProbe.sideEffectsObserved = true;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(sideEffect)),
    ["evidence-digest", "adversarial-probe"],
  );

  const enabledDynamicFeature = structuredClone(report);
  enabledDynamicFeature.commandBoundary.disabledDynamicFeatures.pop();
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(enabledDynamicFeature)),
    ["evidence-digest", "command-boundary"],
  );

  const changedResidualTools = structuredClone(report);
  changedResidualTools.commandBoundary.residualDeclaredStockTools.pop();
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(changedResidualTools)),
    ["evidence-digest", "command-boundary"],
  );

  const changedResidualPolicy = structuredClone(report);
  changedResidualPolicy.commandBoundary.residualToolPolicy = "allow";
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(changedResidualPolicy)),
    ["evidence-digest", "command-boundary"],
  );

  const reusedModelState = structuredClone(report);
  reusedModelState.commandBoundary.modelStateLifecycle.reusedAcrossModelCalls = true;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(reusedModelState)),
    ["evidence-digest", "command-boundary"],
  );

  const modelReportedToolCall = structuredClone(report);
  modelReportedToolCall.adversarialProbe.result.toolCallsMade = true;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(modelReportedToolCall)),
    ["evidence-digest", "adversarial-probe"],
  );

  const missingControllerWrite = structuredClone(report);
  missingControllerWrite.adversarialProbe.controllerResultWritten = false;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(missingControllerWrite)),
    ["evidence-digest", "adversarial-probe"],
  );

  const missingTime = structuredClone(report);
  delete missingTime.observedAt;
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(missingTime)),
    ["evidence-digest", "fixed-claims"],
  );

  const extraTopLevelKey = structuredClone(report);
  extraTopLevelKey.privateCorrelation = "forbidden";
  assert.deepEqual(
    validateCodexSandboxPreflightReportContent(JSON.stringify(extraTopLevelKey)),
    ["evidence-digest", "fixed-claims"],
  );

  const duplicateKey = JSON.stringify(report).replace(
    '"status":"adversarial-passed"',
    '"status":"adversarial-passed","status":"adversarial-passed"',
  );
  assert.deepEqual(validateCodexSandboxPreflightReportContent(duplicateKey), [
    "evidence-digest",
    "strict-json",
  ]);

  assert.deepEqual(validateCodexSandboxPreflightReportContent("null"), [
    "evidence-digest",
    "fixed-claims",
  ]);
});

test("the private freeze guide keeps isolated model review separate from M2", async () => {
  const [guide, g1Record, handlingPlan] = await Promise.all([
    readFile(
      new URL("../experiments/templates/EVIDENCE-CONTRACT.md", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../experiments/templates/G1-EVIDENCE-CONTRACT.md",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../experiments/templates/DATA-HANDLING.md", import.meta.url),
      "utf8",
    ),
  ]);
  assert.match(guide, /owner-and-fresh-isolated-codex-review/);
  assert.match(guide, /234bf9edc7a67cb3f1847e6d60cfe05ddbd13a01/);
  assert.match(
    guide,
    /runSpecificPostSealIdentityAndConfigPreflightPassed: true/,
  );
  assert.match(guide, /freshIsolatedCodexReviewAccepted: true/);
  assert.match(guide, /privateReviewCompletedWithoutToolCalls: true/);
  assert.match(
    guide,
    /strict canonical descendants of\s+`realpath\(os\.tmpdir\(\)\)`/,
  );
  assert.match(guide, /separate `CODEX_HOME`, `HOME`, and `TMPDIR`/);
  assert.match(guide, /tooling\/codex-sandbox-preflight/);
  assert.match(guide, /experiments\/receipts\/g1-evidence-contract-v2\.json/);
  assert.match(guide, /M2 separately binds the\s+exact deterministic, no-LLM runtime/);
  for (const sealedTemplate of [g1Record, handlingPlan]) {
    assert.match(
      sealedTemplate,
      /LLM and embedding calls in M2: `Forbidden;/,
    );
    assert.doesNotMatch(sealedTemplate, /verified deletion of/);
  }
  assert.match(g1Record, /actual post-seal identity-and-config report/);
  assert.match(handlingPlan, /sealed plan records requirements, not future results/);
  assert.doesNotMatch(guide, /hdiutil/);
  assert.doesNotMatch(guide, /Two authorized humans/);
});
