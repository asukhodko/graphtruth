import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cp,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

import {
  PublicDogfoodError,
  buildJourneyBundle,
  canonicalJson,
  deriveViews,
  sha256,
  verifyBundle,
  writeProjectionDirectory,
} from "./core.mjs";

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(runtimeRoot, "../../..");
const journeyRoot = path.join(
  repositoryRoot,
  "examples/experiments/murmurmark-echo-lab-correction-v1",
);
const frozenBaseCommit = "c08de89164795a6ecf29cc9c7a7e7fb06f23fe33";
let temporaryRoot;
let pristineBundle;
let manifestSha256;

before(async () => {
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-dogfood-test-"));
  pristineBundle = path.join(temporaryRoot, "bundle");
  ({ manifestSha256 } = await buildJourneyBundle(journeyRoot, pristineBundle));
});

after(async () => {
  await rm(temporaryRoot, { recursive: true, force: true });
});

async function expectCode(promise, code) {
  await assert.rejects(
    promise,
    (error) => error instanceof PublicDogfoodError && error.code === code,
  );
}

async function cloneBundle(name) {
  const target = path.join(temporaryRoot, name);
  await cp(pristineBundle, target, { recursive: true, errorOnExist: true });
  return target;
}

async function rewriteManifest(bundleRoot, mutate) {
  const filename = path.join(bundleRoot, "manifest.json");
  const manifest = JSON.parse(await readFile(filename, "utf8"));
  await mutate(manifest);
  const bytes = canonicalJson(manifest);
  await writeFile(filename, bytes);
  return sha256(bytes);
}

async function mutateRecord(name, sequence, mutate) {
  const bundleRoot = await cloneBundle(name);
  let recordPath;
  const nextManifestSha256 = await rewriteManifest(bundleRoot, async (manifest) => {
    const records = manifest.files
      .filter((entry) => entry.role === "record")
      .sort((left, right) => left.path.localeCompare(right.path));
    recordPath = records[sequence - 1].path;
    const record = JSON.parse(
      await readFile(path.join(bundleRoot, recordPath), "utf8"),
    );
    mutate(record);
    const bytes = canonicalJson(record);
    await writeFile(path.join(bundleRoot, recordPath), bytes);
    records[sequence - 1].size = bytes.length;
    records[sequence - 1].sha256 = sha256(bytes);
    manifest.payloadBytes = manifest.files.reduce(
      (total, entry) => total + entry.size,
      0,
    );
  });
  return { bundleRoot, manifestSha256: nextManifestSha256, recordPath };
}

async function directoryBytes(root) {
  const entries = await readdir(root);
  entries.sort();
  return Object.fromEntries(
    await Promise.all(
      entries.map(async (entry) => [
        entry,
        await readFile(path.join(root, entry)),
      ]),
    ),
  );
}

test("builds and verifies the closed real-public bundle", async () => {
  const verification = await verifyBundle(pristineBundle, manifestSha256);
  assert.equal(verification.manifest.recordCount, 27);
  assert.equal(verification.manifest.fileCount, 40);
  assert.ok(verification.manifest.payloadBytes < 1024 * 1024);
  assert.equal(
    verification.sourceManifest.closedInventory.artifactCount,
    8,
  );
  assert.equal(
    verification.sourceManifest.closedInventory.artifactBytes,
    199242,
  );
  assert.equal(
    verification.records.some((record) => record.kind === "AcceptanceDecision"),
    false,
  );
});

test("reconstructs stable H1 and additive H2 views", async () => {
  const verification = await verifyBundle(pristineBundle, manifestSha256);
  const views = deriveViews(verification);
  const h1 = views.horizons.find((horizon) => horizon.horizonId === "H1");
  const h2 = views.horizons.find((horizon) => horizon.horizonId === "H2");
  assert.equal(
    h1.tasks[0].assertions.find(
      (assertion) => assertion.assertionId === "assertion.prepare-bounds",
    ).revisionId,
    "revision.prepare-bounds.01",
  );
  assert.equal(
    h2.tasks[0].assertions.find(
      (assertion) => assertion.assertionId === "assertion.prepare-bounds",
    ).revisionId,
    "revision.prepare-bounds.02",
  );
  assert.equal(
    h2.tasks
      .find((task) => task.taskId === "task.residual-unknowns")
      .questions[0].questionId,
    "question.incident-report",
  );
});

test("rebuilds every supported projection byte for byte", async () => {
  const verification = await verifyBundle(pristineBundle, manifestSha256);
  const first = path.join(temporaryRoot, "projection-first");
  const rebuilt = path.join(temporaryRoot, "projection-rebuilt");
  await writeProjectionDirectory(first, verification);
  await writeProjectionDirectory(rebuilt, verification);
  const firstBytes = await directoryBytes(first);
  const rebuiltBytes = await directoryBytes(rebuilt);
  assert.deepEqual(Object.keys(firstBytes), [
    "dossier.md",
    "semantic-digest.txt",
    "views.json",
  ]);
  for (const filename of Object.keys(firstBytes)) {
    assert.deepEqual(rebuiltBytes[filename], firstBytes[filename]);
  }
});

test("rejects a changed retained source even with a refreshed bundle manifest", async () => {
  const bundleRoot = await cloneBundle("source-tamper");
  const sourcePath =
    "sources/H1/scripts/controlled-echo-supervision-lab.py";
  const bytes = Buffer.concat([
    await readFile(path.join(bundleRoot, sourcePath)),
    Buffer.from("\n", "utf8"),
  ]);
  await writeFile(path.join(bundleRoot, sourcePath), bytes);
  const changedManifestSha256 = await rewriteManifest(
    bundleRoot,
    async (manifest) => {
      const entry = manifest.files.find((item) => item.path === sourcePath);
      entry.size = bytes.length;
      entry.sha256 = sha256(bytes);
      manifest.payloadBytes = manifest.files.reduce(
        (total, item) => total + item.size,
        0,
      );
    },
  );
  await expectCode(
    verifyBundle(bundleRoot, changedManifestSha256),
    "SOURCE_HASH_MISMATCH",
  );
});

test("rejects evidence text that no longer matches its exact source span", async () => {
  const changed = await mutateRecord("evidence-tamper", 5, (record) => {
    record.body.text = `${record.body.text} `;
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "EVIDENCE_HASH_MISMATCH",
  );
});

test("rejects a dangling evidence reference", async () => {
  const changed = await mutateRecord("dangling-reference", 8, (record) => {
    record.body.evidenceIds = ["evidence.does-not-exist"];
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "REFERENCE_DANGLING",
  );
});

test("rejects rewritten assertion history", async () => {
  const changed = await mutateRecord("history-rewrite", 20, (record) => {
    record.body.predecessorRevisionId = null;
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "REVISION_CHAIN_INVALID",
  );
});

test("rejects future evidence in an earlier source horizon", async () => {
  const changed = await mutateRecord("future-leak", 20, (record) => {
    record.sourceHorizonId = "H1";
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "HORIZON_LEAK",
  );
});

test("rejects a silently closed open question", async () => {
  const changed = await mutateRecord("question-closed", 27, (record) => {
    record.body.status = "closed";
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "QUESTION_INVALID",
  );
});

test("rejects an unknown record kind", async () => {
  const changed = await mutateRecord("unknown-kind", 27, (record) => {
    record.kind = "AcceptanceDecision";
  });
  await expectCode(
    verifyBundle(changed.bundleRoot, changed.manifestSha256),
    "UNKNOWN_FORMAT",
  );
});

test("keeps the M8 example and runtime byte-identical to the frozen base", () => {
  const paths = [
    "examples/experiments/record-and-bundle-golden-journey-v1",
    "runtime/experimental/record-bundle-v1",
  ];
  const status = execFileSync(
    "git",
    ["status", "--porcelain", "--", ...paths],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  assert.equal(status, "");
  execFileSync(
    "git",
    ["diff", "--quiet", frozenBaseCommit, "--", ...paths],
    { cwd: repositoryRoot },
  );
});
