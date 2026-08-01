import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import { canonicalJson } from "./core.mjs";
import {
  ReleaseCandidateError,
  verifyReleaseCandidate,
} from "./verify-release-candidate.mjs";

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleRoot, "../../..");
const manifestPath = path.join(moduleRoot, "RELEASE-CANDIDATE.json");
const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      rm(root, { force: true, recursive: true }),
    ),
  );
});

async function copyCandidate() {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "graphtruth-workbench-candidate-"),
  );
  temporaryRoots.push(root);
  const destination = path.join(
    root,
    "runtime/experimental/owner-facing-workbench-v1",
  );
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(moduleRoot, destination, { recursive: true });
  return {
    manifestPath: path.join(destination, "RELEASE-CANDIDATE.json"),
    moduleRoot: destination,
    repositoryRoot: root,
  };
}

async function expectCode(promise, code) {
  await assert.rejects(
    promise,
    (error) => error instanceof ReleaseCandidateError && error.code === code,
  );
}

test("verifies the exact frozen candidate and all component bytes", async () => {
  const result = await verifyReleaseCandidate({ manifestPath, repositoryRoot });
  assert.equal(result.status, "verified");
  assert.equal(result.componentCount, 7);
  assert.match(
    result.identity,
    /^owner-facing-workbench-v1-rc1-sha256-[a-f0-9]{64}$/,
  );
  assert.equal(result.qualification.tests, result.qualification.pass);
});

test("rejects a canonical manifest with a changed candidate identity", async () => {
  const copy = await copyCandidate();
  const manifest = JSON.parse(await readFile(copy.manifestPath, "utf8"));
  manifest.identity = `${manifest.identity.slice(0, -1)}${
    manifest.identity.endsWith("0") ? "1" : "0"
  }`;
  await writeFile(copy.manifestPath, canonicalJson(manifest));
  await expectCode(
    verifyReleaseCandidate(copy),
    "CANDIDATE_IDENTITY_MISMATCH",
  );
});

test("rejects a changed qualification denominator before component use", async () => {
  const copy = await copyCandidate();
  const manifest = JSON.parse(await readFile(copy.manifestPath, "utf8"));
  manifest.qualification.expected.fail = 1;
  await writeFile(copy.manifestPath, canonicalJson(manifest));
  await expectCode(verifyReleaseCandidate(copy), "QUALIFICATION_INVALID");
});

test("rejects changed or symlinked candidate components", async () => {
  const changed = await copyCandidate();
  await writeFile(path.join(changed.moduleRoot, "core.mjs"), "changed\n");
  await expectCode(
    verifyReleaseCandidate(changed),
    "COMPONENT_IDENTITY_MISMATCH",
  );

  const linked = await copyCandidate();
  const cli = path.join(linked.moduleRoot, "cli.mjs");
  await rm(cli);
  await symlink("core.mjs", cli);
  await expectCode(verifyReleaseCandidate(linked), "COMPONENT_UNSAFE");
});
