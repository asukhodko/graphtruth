import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildFrozenJourneyBundle,
  contractSha256,
  parseStrictJson,
  RecordBundleError,
  sha256,
} from "./core.mjs";
import { runGoldenJourneyEvidence } from "./evidence.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const journeyRoot = path.join(
  repositoryRoot,
  "examples",
  "experiments",
  "record-and-bundle-golden-journey-v1",
);

test("the frozen contract identity binds the exact public bytes", async () => {
  const bytes = await readFile(path.join(journeyRoot, "JOURNEY-CONTRACT.json"));
  assert.equal(sha256(bytes), contractSha256);
  const contract = parseStrictJson(bytes);
  assert.equal(contract.sources.length, 3);
  assert.equal(contract.records.length, 14);
  assert.equal(contract.denominator.cellCount, 18);
  assert.equal(contract.mutations.length, 16);
});

test("strict JSON rejects duplicate keys and non-canonical bundle JSON", () => {
  assert.throws(
    () => parseStrictJson(Buffer.from('{"a":1,"a":2}\n')),
    (error) =>
      error instanceof RecordBundleError && error.code === "JSON_DUPLICATE_KEY",
  );
  assert.throws(
    () => parseStrictJson(Buffer.from('{"a": 1}\n'), { canonical: true }),
    (error) =>
      error instanceof RecordBundleError && error.code === "JSON_NOT_CANONICAL",
  );
});

test("the complete golden journey evidence is closed and reproducible", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "graphtruth-record-bundle-test-"));
  const workRoot = path.join(parent, "evidence");
  try {
    const { report } = await runGoldenJourneyEvidence({
      journeyRoot,
      workRoot,
      pythonPath: process.env.PYTHON ?? "python3",
    });
    assert.equal(report.cleanBuilds.byteIdentical, true);
    assert.equal(report.cleanBuilds.fileCount, 19);
    assert.equal(report.semantic.nodeWriterMatches, true);
    assert.equal(report.semantic.nodeRebuildMatches, true);
    assert.equal(report.semantic.pythonDetachedMatches, true);
    assert.equal(report.semantic.nodePythonBytesEqual, true);
    assert.equal(report.denominator.observedCells, 18);
    assert.equal(report.denominator.passedCells, 18);
    assert.equal(report.projectionRebuild.deletedBeforeRebuild, true);
    assert.equal(report.projectionRebuild.rebuiltExactly, true);
    assert.deepEqual(report.detachedReader.rootInventory, ["bundle", "reader.py"]);
    assert.equal(report.detachedReader.contractPresent, false);
    assert.equal(report.detachedReader.expectedResultsPresent, false);
    assert.equal(report.detachedReader.exitCode, "ACCEPTED");
    assert.ok(report.detachedReader.outputBytes <= 65536);
    assert.equal(report.mutations.observedCases, 16);
    assert.equal(report.mutations.passedCases, 16);
    assert.equal(report.hardcodingVariant.passed, true);
    assert.equal(report.hardcodingVariant.nodePythonBytesEqual, true);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test("a bundle build refuses to replace an existing output root", async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "graphtruth-record-bundle-output-"));
  const outputRoot = path.join(parent, "bundle");
  try {
    await buildFrozenJourneyBundle(journeyRoot, outputRoot);
    await assert.rejects(
      buildFrozenJourneyBundle(journeyRoot, outputRoot),
      (error) => error instanceof RecordBundleError && error.code === "OUTPUT_EXISTS",
    );
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
