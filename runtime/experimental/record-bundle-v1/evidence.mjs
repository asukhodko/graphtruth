import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  buildBundleFromContract,
  buildFrozenJourneyBundle,
  canonicalJson,
  loadFrozenContract,
  parseStrictJson,
  RecordBundleError,
  sha256,
  verifyBundle,
  writeProjectionDirectory,
} from "./core.mjs";

const execFileAsync = promisify(execFile);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function readManifest(bundleRoot) {
  return parseStrictJson(await readFile(path.join(bundleRoot, "manifest.json")), {
    canonical: true,
  });
}

async function writeManifest(bundleRoot, manifest) {
  const bytes = canonicalJson(manifest);
  await writeFile(path.join(bundleRoot, "manifest.json"), bytes);
  return sha256(bytes);
}

async function refreshManifestFiles(bundleRoot, manifest) {
  for (const entry of manifest.files) {
    const bytes = await readFile(path.join(bundleRoot, ...entry.path.split("/")));
    entry.size = bytes.length;
    entry.sha256 = sha256(bytes);
  }
  return writeManifest(bundleRoot, manifest);
}

async function readRecordItems(bundleRoot, manifest) {
  const entries = manifest.files
    .filter((entry) => entry.role === "record")
    .sort((left, right) => left.path.localeCompare(right.path));
  return Promise.all(
    entries.map(async (entry) => {
      const bytes = await readFile(path.join(bundleRoot, ...entry.path.split("/")));
      return { entry, bytes, value: parseStrictJson(bytes, { canonical: true }) };
    }),
  );
}

async function rewriteExistingRecords(bundleRoot, mutate) {
  const manifest = await readManifest(bundleRoot);
  const items = await readRecordItems(bundleRoot, manifest);
  await mutate(items.map((item) => item.value));
  let previous = null;
  for (const item of items) {
    item.value.previousRecordSha256 = previous === null ? null : sha256(previous);
    item.bytes = canonicalJson(item.value);
    await writeFile(path.join(bundleRoot, ...item.entry.path.split("/")), item.bytes);
    previous = item.bytes;
  }
  manifest.recordHeadSha256 = sha256(previous);
  return refreshManifestFiles(bundleRoot, manifest);
}

async function rewriteRecordSet(bundleRoot, select) {
  const manifest = await readManifest(bundleRoot);
  const items = (await readRecordItems(bundleRoot, manifest)).filter((item) =>
    select(item.value),
  );
  const recordsRoot = path.join(bundleRoot, "records");
  await rm(recordsRoot, { recursive: true });
  await mkdir(recordsRoot);
  const recordEntries = [];
  let previous = null;
  for (const [index, item] of items.entries()) {
    item.value.recordedSequence = index + 1;
    item.value.previousRecordSha256 = previous === null ? null : sha256(previous);
    const bytes = canonicalJson(item.value);
    const relative = `records/${String(index + 1).padStart(4, "0")}-${
      item.value.recordId
    }.json`;
    await writeFile(path.join(bundleRoot, ...relative.split("/")), bytes);
    recordEntries.push({
      path: relative,
      role: "record",
      mediaType: "application/json",
      size: bytes.length,
      sha256: sha256(bytes),
    });
    previous = bytes;
  }
  manifest.recordCount = recordEntries.length;
  manifest.recordHeadSha256 = sha256(previous);
  manifest.files = [
    ...manifest.files.filter((entry) => entry.role !== "record"),
    ...recordEntries,
  ].sort((left, right) => left.path.localeCompare(right.path));
  return writeManifest(bundleRoot, manifest);
}

async function mutateRawLastRecord(bundleRoot, transform) {
  const manifest = await readManifest(bundleRoot);
  const recordEntries = manifest.files
    .filter((entry) => entry.role === "record")
    .sort((left, right) => left.path.localeCompare(right.path));
  const entry = recordEntries.at(-1);
  const filename = path.join(bundleRoot, ...entry.path.split("/"));
  const original = await readFile(filename);
  const changed = transform(original);
  await writeFile(filename, changed);
  entry.size = changed.length;
  entry.sha256 = sha256(changed);
  manifest.recordHeadSha256 = sha256(changed);
  return writeManifest(bundleRoot, manifest);
}

async function runPythonReader(pythonPath, readerPath, bundleRoot, manifestSha256, cwd) {
  try {
    const { stdout, stderr } = await execFileAsync(
      pythonPath,
      [
        readerPath,
        "--bundle-root",
        bundleRoot,
        "--manifest-sha256",
        manifestSha256,
      ],
      {
        cwd,
        encoding: "buffer",
        maxBuffer: 65536,
        timeout: 60000,
      },
    );
    if (stderr.length !== 0) return { code: "PYTHON_STDERR", stdout, stderr };
    return {
      code: "ACCEPTED",
      stdout,
      semantic: parseStrictJson(stdout, { canonical: true }),
    };
  } catch (error) {
    const stderr = Buffer.from(error.stderr ?? "").toString("utf8").trim();
    return {
      code: stderr.split(/\r?\n/).at(-1) || "PYTHON_UNEXPECTED_FAILURE",
      stdout: Buffer.from(error.stdout ?? ""),
      stderr: Buffer.from(error.stderr ?? ""),
    };
  }
}

async function runNodeReader(bundleRoot, manifestSha256) {
  try {
    const result = await verifyBundle(bundleRoot, manifestSha256);
    return {
      code: "ACCEPTED",
      semantic: result.semanticOutput,
      stdout: result.semanticBytes,
    };
  } catch (error) {
    return {
      code: error instanceof RecordBundleError ? error.code : "NODE_UNEXPECTED_FAILURE",
    };
  }
}

function expectedSemanticOutput(contract) {
  const horizons = new Map(
    contract.horizons.map((horizon) => [horizon.horizonId, horizon]),
  );
  return {
    format: contract.semanticOutput.format,
    identity: contract.identity,
    views: contract.expectedLogicalViews.map((view) => ({
      horizonId: view.horizonId,
      recordedAsOf: horizons.get(view.horizonId).recordedAsOf,
      validAt: horizons.get(view.horizonId).validAt,
      policyId: view.policyId,
      status: view.status,
      value: view.value,
      unit: view.unit,
      revisionId: view.revisionId,
      acceptanceDecisionId: view.acceptanceDecisionId,
      assessmentIds: view.assessmentIds,
      evidenceIds: view.evidenceIds,
      reasonCode: view.reasonCode,
    })),
  };
}

function semanticEqual(left, right) {
  return canonicalJson(left).equals(canonicalJson(right));
}

async function copyBundle(source, destination) {
  await cp(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });
}

async function mutationRoot(root, mutationId, baseBundle) {
  const destination = path.join(root, `mutation-${mutationId}`);
  await copyBundle(baseBundle, destination);
  return destination;
}

async function runRejectingMutation({
  root,
  baseBundle,
  mutationId,
  expectedCode,
  mutate,
  pythonPath,
  readerPath,
  originalManifestSha256,
}) {
  const bundleRoot = await mutationRoot(root, mutationId, baseBundle);
  let manifestSha256 = originalManifestSha256;
  try {
    const replacement = await mutate(bundleRoot);
    if (replacement !== undefined) manifestSha256 = replacement;
    const node = await runNodeReader(bundleRoot, manifestSha256);
    const python = await runPythonReader(
      pythonPath,
      readerPath,
      bundleRoot,
      manifestSha256,
      root,
    );
    return {
      mutationId,
      expectedCode,
      nodeCode: node.code,
      pythonCode: python.code,
      passed: node.code === expectedCode && python.code === expectedCode,
    };
  } finally {
    await rm(bundleRoot, { recursive: true, force: true });
  }
}

async function mutationMatrix({
  root,
  baseBundle,
  manifestSha256,
  expected,
  pythonPath,
  readerPath,
}) {
  const results = [];
  const rejecting = async (definition) => {
    results.push(
      await runRejectingMutation({
        root,
        baseBundle,
        pythonPath,
        readerPath,
        originalManifestSha256: manifestSha256,
        ...definition,
      }),
    );
  };

  await rejecting({
    mutationId: "M01-source-byte-changed",
    expectedCode: "SOURCE_HASH_MISMATCH",
    mutate: async (bundleRoot) => {
      const filename = path.join(bundleRoot, "sources", "0001-runbook-v1.md");
      const bytes = await readFile(filename);
      await writeFile(filename, Buffer.from(bytes.toString("utf8").replace("3 attempts", "4 attempts")));
      return refreshManifestFiles(bundleRoot, await readManifest(bundleRoot));
    },
  });
  await rejecting({
    mutationId: "M02-evidence-bounds-invalid",
    expectedCode: "EVIDENCE_BOUNDS_INVALID",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[1].body.byteEnd = 999;
      }),
  });
  await rejecting({
    mutationId: "M03-evidence-hash-invalid",
    expectedCode: "EVIDENCE_HASH_MISMATCH",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[1].body.sha256 = "0".repeat(64);
      }),
  });
  await rejecting({
    mutationId: "M04-declared-file-missing",
    expectedCode: "BUNDLE_FILE_MISSING",
    mutate: async (bundleRoot) => {
      await unlink(path.join(bundleRoot, "sources", "0001-runbook-v1.md"));
    },
  });
  await rejecting({
    mutationId: "M05-undeclared-file-added",
    expectedCode: "BUNDLE_FILE_UNDECLARED",
    mutate: async (bundleRoot) => {
      await writeFile(path.join(bundleRoot, "unexpected.txt"), "unexpected\n");
    },
  });
  await rejecting({
    mutationId: "M06-unsafe-entry",
    expectedCode: "BUNDLE_ENTRY_UNSAFE",
    mutate: async (bundleRoot) => {
      const filename = path.join(bundleRoot, "sources", "0001-runbook-v1.md");
      await unlink(filename);
      await symlink("0002-observation.md", filename);
    },
  });
  await rejecting({
    mutationId: "M07-invalid-utf8",
    expectedCode: "UTF8_INVALID",
    mutate: (bundleRoot) =>
      mutateRawLastRecord(bundleRoot, (bytes) =>
        Buffer.concat([bytes.subarray(0, bytes.length - 1), Buffer.from([0xff])]),
      ),
  });
  await rejecting({
    mutationId: "M08-duplicate-json-key",
    expectedCode: "JSON_DUPLICATE_KEY",
    mutate: (bundleRoot) =>
      mutateRawLastRecord(bundleRoot, (bytes) =>
        Buffer.from(bytes.toString("utf8").replace('{"body":', '{"body":null,"body":')),
      ),
  });
  await rejecting({
    mutationId: "M09-record-id-conflict",
    expectedCode: "RECORD_ID_CONFLICT",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[13].recordId = records[12].recordId;
      }),
  });
  await rejecting({
    mutationId: "M10-dangling-reference",
    expectedCode: "REFERENCE_DANGLING",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[11].body.evidenceIds = ["evidence.absent"];
      }),
  });
  await rejecting({
    mutationId: "M11-revision-chain-invalid",
    expectedCode: "REVISION_CHAIN_INVALID",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[11].body.predecessorRevisionId = records[11].body.revisionId;
      }),
  });
  await rejecting({
    mutationId: "M12-historical-record-overwritten",
    expectedCode: "MANIFEST_HASH_MISMATCH",
    mutate: async (bundleRoot) => {
      await rewriteExistingRecords(bundleRoot, async (records) => {
        records[2].body.value = 4;
      });
      return manifestSha256;
    },
  });
  await rejecting({
    mutationId: "M13-recorded-order-invalid",
    expectedCode: "RECORDED_ORDER_INVALID",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[11].recordedSequence = records[10].recordedSequence;
      }),
  });

  {
    const mutationId = "M14-assessment-cannot-decide";
    const bundleRoot = await mutationRoot(root, mutationId, baseBundle);
    try {
      const alteredManifestSha256 = await rewriteRecordSet(
        bundleRoot,
        (record) =>
          record.recordId !== "record.decision.document-accept.01" &&
          record.recordId !== "record.decision.document-revoke.01",
      );
      const node = await runNodeReader(bundleRoot, alteredManifestSha256);
      const python = await runPythonReader(
        pythonPath,
        readerPath,
        bundleRoot,
        alteredManifestSha256,
        root,
      );
      const nodeH2 = node.semantic?.views.find(
        (view) =>
          view.horizonId === "H2" && view.policyId === "document-authority-v0",
      );
      const pythonH2 = python.semantic?.views.find(
        (view) =>
          view.horizonId === "H2" && view.policyId === "document-authority-v0",
      );
      const nodeCode =
        node.code === "ACCEPTED" && nodeH2?.status === "abstain"
          ? "EXPECTED_ABSTENTION"
          : node.code;
      const pythonCode =
        python.code === "ACCEPTED" && pythonH2?.status === "abstain"
          ? "EXPECTED_ABSTENTION"
          : python.code;
      results.push({
        mutationId,
        expectedCode: "EXPECTED_ABSTENTION",
        nodeCode,
        pythonCode,
        passed:
          nodeCode === "EXPECTED_ABSTENTION" &&
          pythonCode === "EXPECTED_ABSTENTION",
      });
    } finally {
      await rm(bundleRoot, { recursive: true, force: true });
    }
  }

  await rejecting({
    mutationId: "M15-decision-invalid",
    expectedCode: "DECISION_INVALID",
    mutate: (bundleRoot) =>
      rewriteExistingRecords(bundleRoot, async (records) => {
        records[12].body.revokesDecisionId = "decision.observed-accept.01";
      }),
  });

  {
    const mutationId = "M16-boundary-leak-or-unknown-version";
    const baselineNode = await runNodeReader(baseBundle, manifestSha256);
    const baselinePython = await runPythonReader(
      pythonPath,
      readerPath,
      baseBundle,
      manifestSha256,
      root,
    );
    const earlyViewsPass =
      baselineNode.code === "ACCEPTED" &&
      baselinePython.code === "ACCEPTED" &&
      semanticEqual(baselineNode.semantic, expected) &&
      semanticEqual(baselinePython.semantic, expected);
    const bundleRoot = await mutationRoot(root, mutationId, baseBundle);
    try {
      const alteredManifestSha256 = await rewriteExistingRecords(
        bundleRoot,
        async (records) => {
          records[13].format = "graphtruth.experimental.record.unknown";
        },
      );
      const node = await runNodeReader(bundleRoot, alteredManifestSha256);
      const python = await runPythonReader(
        pythonPath,
        readerPath,
        bundleRoot,
        alteredManifestSha256,
        root,
      );
      const expectedCode = "NO_FUTURE_LEAK_AND_UNKNOWN_FORMAT_REJECTED";
      const nodeCode =
        earlyViewsPass && node.code === "UNKNOWN_FORMAT" ? expectedCode : node.code;
      const pythonCode =
        earlyViewsPass && python.code === "UNKNOWN_FORMAT"
          ? expectedCode
          : python.code;
      results.push({
        mutationId,
        expectedCode,
        nodeCode,
        pythonCode,
        passed: nodeCode === expectedCode && pythonCode === expectedCode,
      });
    } finally {
      await rm(bundleRoot, { recursive: true, force: true });
    }
  }

  return results;
}

function transformIds(value) {
  const prefixes = [
    "source.",
    "record.",
    "evidence.",
    "assertion.",
    "revision.",
    "assessment.",
    "decision.",
  ];
  if (Array.isArray(value)) return value.map(transformIds);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, transformIds(item)]),
    );
  }
  if (typeof value === "string" && prefixes.some((prefix) => value.startsWith(prefix))) {
    return `variant.${value}`;
  }
  return value;
}

async function buildHardcodingVariant(contract, journeyRoot, root) {
  const variantRoot = path.join(root, "hardcoding-variant-input");
  const bundleRoot = path.join(root, "hardcoding-variant-bundle");
  await mkdir(path.join(variantRoot, "sources"), { recursive: true });
  const variant = transformIds(clone(contract));
  variant.identity = `${contract.identity}/retry-limit-remap-v1`;
  variant.profile.identity = variant.identity;
  for (const source of variant.sources) {
    const original = await readFile(path.join(journeyRoot, ...source.path.split("/")), "utf8");
    const changed = original.replaceAll("3 attempts", "2 attempts").replaceAll("5 attempts", "7 attempts");
    const bytes = Buffer.from(changed, "utf8");
    await writeFile(path.join(variantRoot, ...source.path.split("/")), bytes);
    source.size = bytes.length;
    source.sha256 = sha256(bytes);
  }
  for (const record of variant.records) {
    if (record.kind === "SourceSnapshot") {
      const source = variant.sources.find((item) => item.path === record.body.path);
      record.body.size = source.size;
      record.body.sha256 = source.sha256;
    } else if (record.kind === "EvidenceSpan") {
      const sourceRecord = variant.records.find(
        (item) => item.recordId === record.body.sourceRecordId,
      );
      const source = variant.sources.find((item) => item.path === sourceRecord.body.path);
      const sourceBytes = await readFile(path.join(variantRoot, ...source.path.split("/")));
      const span = sourceBytes.subarray(record.body.byteStart, record.body.byteEnd);
      record.body.text = span.toString("utf8");
      record.body.sha256 = sha256(span);
    } else if (record.kind === "AssertionRevision") {
      if (record.body.value === 3) record.body.value = 2;
      else if (record.body.value === 5) record.body.value = 7;
    }
  }
  const verification = await buildBundleFromContract(variant, variantRoot, bundleRoot);
  return { variant, variantRoot, bundleRoot, verification };
}

function projectionInventory(root) {
  return readdir(root).then((items) => items.sort());
}

async function directoryFingerprint(root) {
  const results = [];
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(path.join(directory, entry.name), relative);
      else {
        const bytes = await readFile(path.join(directory, entry.name));
        results.push({ path: relative, size: bytes.length, sha256: sha256(bytes) });
      }
    }
  }
  await visit(root, "");
  return results;
}

export async function runGoldenJourneyEvidence({
  journeyRoot,
  workRoot,
  pythonPath = "python3",
}) {
  const resolvedJourneyRoot = path.resolve(journeyRoot);
  const resolvedWorkRoot = path.resolve(workRoot);
  await mkdir(resolvedWorkRoot, { recursive: false });
  const contract = await loadFrozenContract(resolvedJourneyRoot);
  const expected = expectedSemanticOutput(contract);
  const buildOneRoot = path.join(resolvedWorkRoot, "build-one");
  const buildTwoRoot = path.join(resolvedWorkRoot, "build-two");
  const projectionRoot = path.join(resolvedWorkRoot, "projections");
  const first = await buildFrozenJourneyBundle(resolvedJourneyRoot, buildOneRoot);
  const second = await buildFrozenJourneyBundle(resolvedJourneyRoot, buildTwoRoot);
  const fingerprintsEqual =
    canonicalJson(await directoryFingerprint(buildOneRoot)).equals(
      canonicalJson(await directoryFingerprint(buildTwoRoot)),
    );
  await writeProjectionDirectory(projectionRoot, first);
  const firstProjectionFingerprint = await directoryFingerprint(projectionRoot);
  await rm(projectionRoot, { recursive: true });
  const rebuilt = await verifyBundle(buildOneRoot, first.manifestSha256);
  await writeProjectionDirectory(projectionRoot, rebuilt);
  const secondProjectionFingerprint = await directoryFingerprint(projectionRoot);
  const projectionsRebuiltExactly = canonicalJson(firstProjectionFingerprint).equals(
    canonicalJson(secondProjectionFingerprint),
  );

  const detachedRoot = path.join(resolvedWorkRoot, "detached");
  const detachedBundle = path.join(detachedRoot, "bundle");
  const detachedReader = path.join(detachedRoot, "reader.py");
  await mkdir(detachedRoot);
  await copyBundle(buildOneRoot, detachedBundle);
  await cp(path.join(resolvedJourneyRoot, "detached_reader.py"), detachedReader);
  const detachedInventory = (await readdir(detachedRoot)).sort();
  const python = await runPythonReader(
    pythonPath,
    "reader.py",
    "bundle",
    first.manifestSha256,
    detachedRoot,
  );
  const nodeWriterMatches = semanticEqual(first.semanticOutput, expected);
  const nodeRebuildMatches = semanticEqual(rebuilt.semanticOutput, expected);
  const pythonMatches =
    python.code === "ACCEPTED" && semanticEqual(python.semantic, expected);
  const denominator = [];
  for (const materialization of [
    ["node-writer", first.semanticOutput],
    ["node-rebuild", rebuilt.semanticOutput],
    ["python-detached-reader", python.semantic],
  ]) {
    for (const expectedView of expected.views) {
      const observed = materialization[1]?.views?.find(
        (view) =>
          view.horizonId === expectedView.horizonId &&
          view.policyId === expectedView.policyId,
      );
      denominator.push({
        cellId: `${expectedView.horizonId}:${expectedView.policyId}:${materialization[0]}`,
        horizonId: expectedView.horizonId,
        policyId: expectedView.policyId,
        materialization: materialization[0],
        status:
          observed !== undefined && semanticEqual(observed, expectedView)
            ? "pass"
            : "fail",
      });
    }
  }

  const mutations = await mutationMatrix({
    root: resolvedWorkRoot,
    baseBundle: buildOneRoot,
    manifestSha256: first.manifestSha256,
    expected,
    pythonPath,
    readerPath: path.join(resolvedJourneyRoot, "detached_reader.py"),
  });

  const variant = await buildHardcodingVariant(
    contract,
    resolvedJourneyRoot,
    resolvedWorkRoot,
  );
  const variantPython = await runPythonReader(
    pythonPath,
    path.join(resolvedJourneyRoot, "detached_reader.py"),
    variant.bundleRoot,
    variant.verification.manifestSha256,
    resolvedWorkRoot,
  );
  const variantValues = Object.fromEntries(
    variant.verification.semanticOutput.views.map((view) => [
      `${view.horizonId}:${view.policyId}`,
      view.value,
    ]),
  );
  const hardcodingVariantPassed =
    variantPython.code === "ACCEPTED" &&
    variant.verification.semanticBytes.equals(variantPython.stdout) &&
    variantValues["H1:document-authority-v0"] === 2 &&
    variantValues["H2:document-authority-v0"] === 2 &&
    variantValues["H3:document-authority-v0"] === 7 &&
    variantValues["H1:observed-state-v0"] === null &&
    variantValues["H2:observed-state-v0"] === 7 &&
    variantValues["H3:observed-state-v0"] === 7;

  const report = {
    format: "graphtruth.experimental.record-bundle-evidence.v1",
    identity: contract.identity,
    contractSha256:
      "5365c408abf4a21d6be0523b7e1bd7dea39382241e316384c8b06c042603bf96",
    cleanBuilds: {
      count: 2,
      byteIdentical: fingerprintsEqual,
      manifestSha256: first.manifestSha256,
      fileCount: first.fileCount,
      totalBytes: first.totalBytes,
    },
    semantic: {
      digest: first.semanticDigest,
      nodeWriterMatches,
      nodeRebuildMatches,
      pythonDetachedMatches: pythonMatches,
      nodePythonBytesEqual:
        python.code === "ACCEPTED" && first.semanticBytes.equals(python.stdout),
    },
    denominator: {
      expectedCells: 18,
      observedCells: denominator.length,
      passedCells: denominator.filter((cell) => cell.status === "pass").length,
      cells: denominator,
    },
    projectionRebuild: {
      deletedBeforeRebuild: true,
      rebuiltExactly: projectionsRebuiltExactly,
      inventory: await projectionInventory(projectionRoot),
    },
    detachedReader: {
      rootInventory: detachedInventory,
      contractPresent: detachedInventory.includes("JOURNEY-CONTRACT.json"),
      expectedResultsPresent: detachedInventory.some((item) =>
        item.startsWith("EXPECTED"),
      ),
      outputBytes: python.stdout.length,
      exitCode: python.code,
    },
    mutations: {
      expectedCases: 16,
      observedCases: mutations.length,
      passedCases: mutations.filter((item) => item.passed).length,
      cases: mutations,
    },
    hardcodingVariant: {
      variantId: contract.hardcodingVariant.variantId,
      passed: hardcodingVariantPassed,
      nodePythonBytesEqual:
        variantPython.code === "ACCEPTED" &&
        variant.verification.semanticBytes.equals(variantPython.stdout),
      semanticDigest: variant.verification.semanticDigest,
      values: variantValues,
    },
  };
  return {
    report,
    expected,
    bundleRoot: buildOneRoot,
    projectionRoot,
    semanticBytes: first.semanticBytes,
  };
}

export function freshEvidenceWorkRoot(parent) {
  return path.join(
    parent,
    `graphtruth-record-bundle-evidence-${process.pid}-${randomBytes(8).toString("hex")}`,
  );
}
