#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseStrictJson,
  sha256,
} from "../../../runtime/experimental/record-bundle-v1/core.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const sha256Pattern = /^[a-f0-9]{64}$/;
const sha1Pattern = /^[a-f0-9]{40}$/;

function fail(code) {
  throw new Error(code);
}

function assert(condition, code) {
  if (!condition) fail(code);
}

function safeRelative(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("\\") &&
    !path.posix.isAbsolute(value) &&
    path.posix.normalize(value) === value &&
    value.split("/").every((part) => part !== "" && part !== "." && part !== "..")
  );
}

async function readRegular(relative, maximumBytes = 1024 * 1024) {
  assert(safeRelative(relative), "PATH_UNSAFE");
  const filename = path.join(root, ...relative.split("/"));
  const stat = await lstat(filename).catch(() => fail("FILE_MISSING"));
  assert(stat.isFile() && !stat.isSymbolicLink(), "FILE_UNSAFE");
  assert(stat.size <= maximumBytes, "FILE_TOO_LARGE");
  const bytes = await readFile(filename);
  assert(bytes.length === stat.size, "FILE_CHANGED");
  return bytes;
}

function gitBlobSha1(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8");
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

async function walkFiles(relative) {
  const result = [];
  async function visit(current) {
    const directory = path.join(root, ...current.split("/"));
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const child = `${current}/${entry.name}`;
      const stat = await lstat(path.join(root, ...child.split("/")));
      assert(!stat.isSymbolicLink(), "FILE_UNSAFE");
      if (stat.isDirectory()) await visit(child);
      else if (stat.isFile()) result.push(child);
      else fail("FILE_UNSAFE");
    }
  }
  await visit(relative);
  return result;
}

const manifestBytes = await readRegular("SOURCE-MANIFEST.json");
const manifest = parseStrictJson(manifestBytes);
const contractBytes = await readRegular("DOGFOOD-CONTRACT.json");
const contract = parseStrictJson(contractBytes);

assert(
  manifest?.format === "graphtruth.experimental.public-source-manifest.v1" &&
    manifest.identity === "murmurmark-echo-lab-correction-v1" &&
    manifest.status === "frozen-before-adaptation",
  "SOURCE_MANIFEST_INVALID",
);
assert(
  contract?.format === "graphtruth.experimental.public-dogfood-contract.v1" &&
    contract.identity === manifest.identity &&
    contract.status === "frozen-before-adaptation" &&
    contract.zone === 3,
  "CONTRACT_INVALID",
);
assert(
  contract.sourceManifest?.path === "SOURCE-MANIFEST.json" &&
    contract.sourceManifest.sha256 === sha256(manifestBytes),
  "SOURCE_MANIFEST_IDENTITY_MISMATCH",
);

const horizonById = new Map();
for (const horizon of manifest.horizons ?? []) {
  assert(
    typeof horizon?.horizonId === "string" &&
      sha1Pattern.test(horizon.commitSha1) &&
      sha1Pattern.test(horizon.parentCommitSha1),
    "HORIZON_INVALID",
  );
  assert(!horizonById.has(horizon.horizonId), "HORIZON_DUPLICATE");
  horizonById.set(horizon.horizonId, horizon);
}
assert(horizonById.size === 2, "HORIZON_COUNT_INVALID");
assert(
  horizonById.get("H2")?.parentCommitSha1 === horizonById.get("H1")?.commitSha1,
  "HORIZON_CHAIN_INVALID",
);

const licenseBytes = await readRegular(manifest.upstream?.license?.path);
assert(
  manifest.upstream?.license?.spdx === "MIT" &&
    manifest.upstream.license.size === licenseBytes.length &&
    manifest.upstream.license.sha256 === sha256(licenseBytes),
  "LICENSE_IDENTITY_MISMATCH",
);

const artifactPaths = new Set();
let artifactBytes = 0;
for (const artifact of manifest.artifacts ?? []) {
  assert(horizonById.has(artifact?.horizonId), "ARTIFACT_HORIZON_INVALID");
  assert(
    artifact.commitSha1 === horizonById.get(artifact.horizonId).commitSha1,
    "ARTIFACT_COMMIT_INVALID",
  );
  assert(
    safeRelative(artifact.path) &&
      safeRelative(artifact.retainedPath) &&
      sha1Pattern.test(artifact.gitBlobSha1) &&
      sha256Pattern.test(artifact.sha256) &&
      Number.isSafeInteger(artifact.size) &&
      artifact.size >= 0,
    "ARTIFACT_INVALID",
  );
  assert(!artifactPaths.has(artifact.retainedPath), "ARTIFACT_DUPLICATE");
  const bytes = await readRegular(artifact.retainedPath);
  assert(
    bytes.length === artifact.size &&
      sha256(bytes) === artifact.sha256 &&
      gitBlobSha1(bytes) === artifact.gitBlobSha1,
    "ARTIFACT_IDENTITY_MISMATCH",
  );
  artifactPaths.add(artifact.retainedPath);
  artifactBytes += bytes.length;
}

assert(
  manifest.closedInventory?.artifactCount === artifactPaths.size &&
    manifest.closedInventory.artifactBytes === artifactBytes &&
    manifest.closedInventory.replacementAllowed === false &&
    manifest.closedInventory.truncationAllowed === false &&
    manifest.closedInventory.additionalUpstreamMaterialAllowed === false,
  "SOURCE_INVENTORY_INVALID",
);
assert(
  contract.budgets?.source?.artifactCount === artifactPaths.size &&
    contract.budgets.source.artifactBytes === artifactBytes &&
    contract.budgets.source.replacementAllowed === false &&
    contract.budgets.source.additionalUpstreamMaterialAllowed === false,
  "CONTRACT_SOURCE_BUDGET_INVALID",
);

const retainedUpstreamFiles = [
  ...(await walkFiles("upstream/H1")),
  ...(await walkFiles("upstream/H2")),
].sort();
const declaredUpstreamFiles = [...artifactPaths].sort();
assert(
  retainedUpstreamFiles.length === declaredUpstreamFiles.length &&
    retainedUpstreamFiles.every(
      (filename, index) => filename === declaredUpstreamFiles[index],
    ),
  "SOURCE_INVENTORY_OPEN",
);

const taskIds = (contract.tasks ?? []).map((task) => task.taskId);
const denominatorTaskIds = contract.denominator?.taskIds ?? [];
const branches = contract.denominator?.branches ?? [];
assert(
  taskIds.length === 3 &&
    new Set(taskIds).size === 3 &&
    denominatorTaskIds.length === 3 &&
    taskIds.every((taskId) => denominatorTaskIds.includes(taskId)) &&
    branches.length === 2 &&
    new Set(branches).size === 2 &&
    contract.denominator.cellCount === taskIds.length * branches.length,
  "DENOMINATOR_INVALID",
);
assert(
  Array.isArray(contract.scoring?.severeErrors) &&
    contract.scoring.severeErrors.length > 0 &&
    new Set(contract.scoring.severeErrors.map((item) => item.code)).size ===
      contract.scoring.severeErrors.length,
  "SEVERE_ERRORS_INVALID",
);
assert(
  contract.decision?.keep &&
    contract.decision?.shrink?.predeclaredSubset &&
    contract.decision?.stop &&
    contract.decision?.ownerGate,
  "DECISION_INVALID",
);

const contractHashBytes = await readRegular("DOGFOOD-CONTRACT.sha256", 256);
const expectedContractHash = `${sha256(contractBytes)}  DOGFOOD-CONTRACT.json\n`;
assert(
  contractHashBytes.equals(Buffer.from(expectedContractHash, "utf8")),
  "CONTRACT_HASH_MISMATCH",
);

process.stdout.write(
  `${JSON.stringify({
    status: "frozen-inputs-valid",
    identity: contract.identity,
    sourceManifestSha256: sha256(manifestBytes),
    contractSha256: sha256(contractBytes),
    artifacts: artifactPaths.size,
    artifactBytes,
    denominatorCells: contract.denominator.cellCount,
  })}\n`,
);
