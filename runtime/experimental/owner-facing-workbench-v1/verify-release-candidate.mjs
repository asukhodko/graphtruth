#!/usr/bin/env node

import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultRepositoryRoot = path.resolve(moduleRoot, "../../..");
const defaultManifestPath = path.join(moduleRoot, "RELEASE-CANDIDATE.json");
const sha256Pattern = /^[a-f0-9]{64}$/;
const candidatePrefix = "owner-facing-workbench-v1-rc1-sha256-";

const expectedFiles = Object.freeze([
  {
    path: "runtime/experimental/owner-facing-workbench-v1/FORMAT.md",
    role: "serialization-contract",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/cli.mjs",
    role: "command-entry-point",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/core.mjs",
    role: "workbench-core",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/core.test.mjs",
    role: "qualification-tests",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/qualify.mjs",
    role: "qualification-runner",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/release-candidate.test.mjs",
    role: "release-verifier-tests",
  },
  {
    path: "runtime/experimental/owner-facing-workbench-v1/verify-release-candidate.mjs",
    role: "release-verifier",
  },
]);

export class ReleaseCandidateError extends Error {
  constructor(code) {
    super(code);
    this.name = "ReleaseCandidateError";
    this.code = code;
  }
}

function reject(code) {
  throw new ReleaseCandidateError(code);
}

function compareUtf8(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function normalized(value) {
  if (Array.isArray(value)) return value.map(normalized);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareUtf8)
        .map((key) => [key, normalized(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return Buffer.from(`${JSON.stringify(normalized(value))}\n`, "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, keys, code) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  ) {
    reject(code);
  }
}

function safePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    value.startsWith("/") ||
    path.posix.normalize(value) !== value ||
    value.split("/").some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    reject("MANIFEST_PATH_INVALID");
  }
}

function validFileIdentity(value, code) {
  exactKeys(value, ["path", "sha256", "size"], code);
  safePath(value.path);
  if (
    typeof value.sha256 !== "string" ||
    !sha256Pattern.test(value.sha256) ||
    !Number.isSafeInteger(value.size) ||
    value.size < 0
  ) {
    reject(code);
  }
}

async function readStrictJson(filename) {
  const bytes = await readFile(filename).catch(() => reject("MANIFEST_NOT_FOUND"));
  let value;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    reject("MANIFEST_INVALID");
  }
  if (!bytes.equals(canonicalJson(value))) reject("MANIFEST_NOT_CANONICAL");
  return { bytes, value };
}

async function verifyFile(repositoryRoot, expected) {
  const filename = path.join(repositoryRoot, ...expected.path.split("/"));
  let stat;
  try {
    stat = await lstat(filename);
  } catch {
    reject("COMPONENT_NOT_FOUND");
  }
  if (!stat.isFile() || stat.isSymbolicLink()) reject("COMPONENT_UNSAFE");
  const bytes = await readFile(filename);
  if (bytes.length !== expected.size || sha256(bytes) !== expected.sha256) {
    reject("COMPONENT_IDENTITY_MISMATCH");
  }
}

export async function verifyReleaseCandidate({
  manifestPath = defaultManifestPath,
  repositoryRoot = defaultRepositoryRoot,
} = {}) {
  repositoryRoot = path.resolve(repositoryRoot);
  const { bytes: manifestBytes, value: manifest } = await readStrictJson(manifestPath);
  exactKeys(
    manifest,
    [
      "candidateSha256",
      "components",
      "contract",
      "episode",
      "identity",
      "ownerWalkthrough",
      "qualification",
      "runtime",
      "schema",
      "status",
    ],
    "MANIFEST_INVALID",
  );
  if (
    manifest.schema !== "owner-facing-workbench-v1-release-candidate/1" ||
    manifest.status !== "qualified" ||
    manifest.ownerWalkthrough !== "pending"
  ) {
    reject("MANIFEST_INVALID");
  }
  validFileIdentity(manifest.contract, "CONTRACT_IDENTITY_INVALID");
  validFileIdentity(manifest.episode, "EPISODE_IDENTITY_INVALID");
  if (
    manifest.contract.path !==
      "runtime/experimental/owner-facing-workbench-v1/README.md" ||
    manifest.contract.sha256 !==
      "1e6428fe7912481893b833ede69711fed2b85f5dd6cf179bc9faffb346254fbe" ||
    manifest.episode.path !==
      "runtime/experimental/owner-facing-workbench-v1/EPISODE.md" ||
    manifest.episode.sha256 !==
      "2156bbc089825dd36d38f86f85707d821d1f8f1dcb777149506356126fb48f59"
  ) {
    reject("FROZEN_INPUT_MISMATCH");
  }

  exactKeys(
    manifest.runtime,
    ["builtinsOnly", "modelCalls", "networkCalls", "nodeVersion"],
    "RUNTIME_INVALID",
  );
  if (
    manifest.runtime.builtinsOnly !== true ||
    manifest.runtime.modelCalls !== 0 ||
    manifest.runtime.networkCalls !== 0 ||
    manifest.runtime.nodeVersion !== "24.4.1"
  ) {
    reject("RUNTIME_INVALID");
  }

  exactKeys(
    manifest.qualification,
    ["command", "expected", "testFiles"],
    "QUALIFICATION_INVALID",
  );
  exactKeys(
    manifest.qualification.expected,
    ["cancelled", "fail", "pass", "skipped", "tests", "todo"],
    "QUALIFICATION_INVALID",
  );
  if (
    manifest.qualification.command !==
      "node runtime/experimental/owner-facing-workbench-v1/qualify.mjs" ||
    !Array.isArray(manifest.qualification.testFiles) ||
    manifest.qualification.testFiles.length !== 2 ||
    manifest.qualification.testFiles[0] !==
      "runtime/experimental/owner-facing-workbench-v1/core.test.mjs" ||
    manifest.qualification.testFiles[1] !==
      "runtime/experimental/owner-facing-workbench-v1/release-candidate.test.mjs"
  ) {
    reject("QUALIFICATION_INVALID");
  }
  for (const key of ["cancelled", "fail", "pass", "skipped", "tests", "todo"]) {
    const value = manifest.qualification.expected[key];
    if (!Number.isSafeInteger(value) || value < 0) reject("QUALIFICATION_INVALID");
  }
  if (
    manifest.qualification.expected.fail !== 0 ||
    manifest.qualification.expected.cancelled !== 0 ||
    manifest.qualification.expected.tests !== manifest.qualification.expected.pass +
      manifest.qualification.expected.skipped ||
    manifest.qualification.expected.todo !== 0
  ) {
    reject("QUALIFICATION_INVALID");
  }

  if (
    !Array.isArray(manifest.components) ||
    manifest.components.length !== expectedFiles.length
  ) {
    reject("COMPONENT_INVENTORY_INVALID");
  }
  for (const [index, component] of manifest.components.entries()) {
    exactKeys(component, ["path", "role", "sha256", "size"], "COMPONENT_INVENTORY_INVALID");
    safePath(component.path);
    const expected = expectedFiles[index];
    if (
      component.path !== expected.path ||
      component.role !== expected.role ||
      !sha256Pattern.test(component.sha256) ||
      !Number.isSafeInteger(component.size) ||
      component.size < 0 ||
      (index > 0 && compareUtf8(manifest.components[index - 1].path, component.path) >= 0)
    ) {
      reject("COMPONENT_INVENTORY_INVALID");
    }
  }

  const candidateCore = {
    components: manifest.components,
    contract: manifest.contract,
    episode: manifest.episode,
    ownerWalkthrough: manifest.ownerWalkthrough,
    qualification: manifest.qualification,
    runtime: manifest.runtime,
    schema: manifest.schema,
    status: manifest.status,
  };
  const candidateSha256 = sha256(canonicalJson(candidateCore));
  if (
    manifest.candidateSha256 !== candidateSha256 ||
    manifest.identity !== `${candidatePrefix}${candidateSha256}`
  ) {
    reject("CANDIDATE_IDENTITY_MISMATCH");
  }

  await verifyFile(repositoryRoot, manifest.contract);
  await verifyFile(repositoryRoot, manifest.episode);
  for (const component of manifest.components) {
    await verifyFile(repositoryRoot, component);
  }
  return {
    candidateSha256,
    componentCount: manifest.components.length,
    identity: manifest.identity,
    manifestSha256: sha256(manifestBytes),
    nodeVersion: manifest.runtime.nodeVersion,
    qualification: manifest.qualification.expected,
    status: "verified",
  };
}

async function main() {
  try {
    const result = await verifyReleaseCandidate();
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    const code =
      error instanceof ReleaseCandidateError
        ? error.code
        : "RELEASE_VERIFIER_INTERNAL";
    process.stderr.write(`${code}\n`);
    process.exitCode = 1;
  }
}

const invokedAsScript =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) await main();
