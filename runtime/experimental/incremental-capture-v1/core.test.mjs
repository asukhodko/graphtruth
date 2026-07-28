import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import {
  appendAssertion,
  appendEvidenceSpan,
  appendQuestion,
  appendSourceHorizon,
  buildProjection,
  canonicalJson,
  closeHorizon,
  IncrementalCaptureError,
  initializeStore,
  rebuildProjectionExact,
  sha256,
  verifyStore,
} from "./core.mjs";

const runtimeRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(runtimeRoot, "../../..");
const frozenBaseCommit = "015e48769002be53531208dee5c9f86a3eb91b69";
const cliPath = path.join(runtimeRoot, "cli.mjs");
const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      rm(root, { recursive: true, force: true }),
    ),
  );
});

async function expectCode(promise, code) {
  await assert.rejects(
    promise,
    (error) => error instanceof IncrementalCaptureError && error.code === code,
  );
}

async function fixture() {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "graphtruth-incremental-capture-"),
  );
  temporaryRoots.push(root);
  const sources = path.join(root, "sources");
  await mkdir(path.join(sources, "H1"), { recursive: true });
  await mkdir(path.join(sources, "H2"), { recursive: true });
  const h1Note = Buffer.from("alpha\nstale value\n", "utf8");
  const h2Note = Buffer.from("alpha\ncorrected value\n", "utf8");
  const h2Added = Buffer.from("new evidence\n", "utf8");
  await writeFile(path.join(sources, "H1", "note.md"), h1Note);
  await writeFile(path.join(sources, "H2", "note.md"), h2Note);
  await writeFile(path.join(sources, "H2", "added.txt"), h2Added);
  const manifest = {
    closedCorpus: {
      horizonOrder: ["H1", "H2"],
      inventory: [
        {
          commitSha1: "1".repeat(40),
          files: [
            {
              gitBlobSha1: "2".repeat(40),
              path: "note.md",
              sha256: sha256(h1Note),
              sizeBytes: h1Note.length,
              snapshotPath: "sources/H1/note.md",
              state: "present",
            },
            {
              path: "added.txt",
              state: "absent",
            },
          ],
          horizonId: "H1",
        },
        {
          commitSha1: "3".repeat(40),
          files: [
            {
              gitBlobSha1: "4".repeat(40),
              path: "note.md",
              sha256: sha256(h2Note),
              sizeBytes: h2Note.length,
              snapshotPath: "sources/H2/note.md",
              state: "present",
            },
            {
              gitBlobSha1: "5".repeat(40),
              path: "added.txt",
              sha256: sha256(h2Added),
              sizeBytes: h2Added.length,
              snapshotPath: "sources/H2/added.txt",
              state: "present",
            },
          ],
          horizonId: "H2",
        },
      ],
      paths: ["note.md", "added.txt"],
      totalPresentBytes: h1Note.length + h2Note.length + h2Added.length,
      totalPresentFiles: 3,
    },
    identity: "synthetic-incremental-capture-sources-v1",
    status: "frozen",
  };
  const manifestPath = path.join(root, "SOURCE-MANIFEST.json");
  const manifestBytes = canonicalJson(manifest);
  await writeFile(manifestPath, manifestBytes);
  return {
    h1Note,
    manifestPath,
    manifestSha256: sha256(manifestBytes),
    outputRoot: path.join(root, "store"),
    root,
    sources,
  };
}

async function initialize(item) {
  await initializeStore({
    contractSha256: "a".repeat(64),
    identity: "synthetic-incremental-capture-v1",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:00Z",
    sourceManifestPath: item.manifestPath,
    sourceManifestSha256: item.manifestSha256,
  });
}

async function appendH1(item) {
  await appendSourceHorizon({
    horizonId: "H1",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:01Z",
    sourceManifestPath: item.manifestPath,
    sourceRoot: path.join(item.sources, "H1"),
  });
  await appendEvidenceSpan({
    horizonId: "H1",
    lineEnd: 2,
    lineStart: 1,
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:02Z",
    sourcePath: "note.md",
    spanId: "evidence.h1.note",
  });
  await appendAssertion({
    assertionId: "assertion.value",
    evidenceIds: ["evidence.h1.note"],
    horizonId: "H1",
    outputRoot: item.outputRoot,
    predecessorRevisionId: null,
    recordedAt: "2026-07-28T10:00:03Z",
    revisionId: "revision.value.01",
    text: "The value is stale.",
  });
  await closeHorizon({
    final: false,
    horizonId: "H1",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:04Z",
  });
}

async function appendH2(item) {
  await appendSourceHorizon({
    horizonId: "H2",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:05Z",
    sourceManifestPath: item.manifestPath,
    sourceRoot: path.join(item.sources, "H2"),
  });
  await appendEvidenceSpan({
    horizonId: "H2",
    lineEnd: 2,
    lineStart: 1,
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:06Z",
    sourcePath: "note.md",
    spanId: "evidence.h2.note",
  });
  await appendEvidenceSpan({
    horizonId: "H2",
    lineEnd: 1,
    lineStart: 1,
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:07Z",
    sourcePath: "added.txt",
    spanId: "evidence.h2.added",
  });
  await appendAssertion({
    assertionId: "assertion.value",
    evidenceIds: ["evidence.h2.note", "evidence.h2.added"],
    horizonId: "H2",
    outputRoot: item.outputRoot,
    predecessorRevisionId: "revision.value.01",
    recordedAt: "2026-07-28T10:00:08Z",
    revisionId: "revision.value.02",
    text: "The value is corrected; an external guarantee remains unknown.",
  });
  await appendQuestion({
    evidenceIds: ["evidence.h2.added"],
    horizonId: "H2",
    outputRoot: item.outputRoot,
    questionId: "question.external-guarantee",
    recordedAt: "2026-07-28T10:00:09Z",
    text: "Does the external dependency preserve the corrected behavior?",
  });
  await closeHorizon({
    final: true,
    horizonId: "H2",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:10Z",
  });
}

async function directoryBytes(root) {
  const names = await readdir(root);
  names.sort();
  return Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [name, await readFile(path.join(root, name))]),
    ),
  );
}

function runCli(args) {
  return JSON.parse(
    execFileSync(process.execPath, [cliPath, ...args], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
  );
}

test("captures two horizons additively and rebuilds exact projections", async () => {
  const item = await fixture();
  await initialize(item);
  await appendH1(item);
  const firstH1 = path.join(item.outputRoot, "projections", "H1-first");
  await buildProjection({
    asOfHorizon: "H1",
    outputRoot: item.outputRoot,
    projectionRoot: firstH1,
  });
  const firstH1Bytes = await directoryBytes(firstH1);

  await appendH2(item);
  const rebuiltH1 = path.join(item.outputRoot, "projections", "H1-after-H2");
  await buildProjection({
    asOfHorizon: "H1",
    outputRoot: item.outputRoot,
    projectionRoot: rebuiltH1,
  });
  const rebuiltH1Bytes = await directoryBytes(rebuiltH1);
  assert.deepEqual(Object.keys(rebuiltH1Bytes), Object.keys(firstH1Bytes));
  for (const name of Object.keys(firstH1Bytes)) {
    assert.deepEqual(rebuiltH1Bytes[name], firstH1Bytes[name]);
  }

  const h2 = path.join(item.outputRoot, "projections", "H2");
  await buildProjection({
    asOfHorizon: "H2",
    outputRoot: item.outputRoot,
    projectionRoot: h2,
  });
  const rebuilt = await rebuildProjectionExact({
    asOfHorizon: "H2",
    outputRoot: item.outputRoot,
    projectionRoot: h2,
  });
  assert.equal(rebuilt.status, "projection-rebuilt-exactly");

  const verification = await verifyStore(item.outputRoot);
  assert.equal(verification.records.length, 14);
  assert.equal(verification.state.corpusClosed, true);
  assert.equal(
    verification.state.assertions.get("assertion.value").body.revisionId,
    "revision.value.02",
  );
  assert.equal(
    verification.state.questions.get("question.external-guarantee").body.status,
    "open",
  );
  assert.ok(verification.files.length <= 96);
  assert.ok(verification.bytes <= 2 * 1024 * 1024);
});

test("exercises the complete command interface on synthetic sources", async () => {
  const item = await fixture();
  assert.equal(
    runCli([
      "init",
      "--output-root",
      item.outputRoot,
      "--identity",
      "synthetic-incremental-capture-v1",
      "--source-manifest",
      item.manifestPath,
      "--source-manifest-sha256",
      item.manifestSha256,
      "--contract-sha256",
      "a".repeat(64),
      "--recorded-at",
      "2026-07-28T11:00:00Z",
    ]).status,
    "initialized",
  );
  runCli([
    "add-horizon",
    "--output-root",
    item.outputRoot,
    "--source-manifest",
    item.manifestPath,
    "--source-root",
    path.join(item.sources, "H1"),
    "--horizon",
    "H1",
    "--recorded-at",
    "2026-07-28T11:00:01Z",
  ]);
  runCli([
    "add-span",
    "--output-root",
    item.outputRoot,
    "--id",
    "evidence.h1.note",
    "--horizon",
    "H1",
    "--path",
    "note.md",
    "--line-start",
    "1",
    "--line-end",
    "2",
    "--recorded-at",
    "2026-07-28T11:00:02Z",
  ]);
  runCli([
    "add-assertion",
    "--output-root",
    item.outputRoot,
    "--assertion-id",
    "assertion.value",
    "--revision-id",
    "revision.value.01",
    "--predecessor-revision-id",
    "none",
    "--horizon",
    "H1",
    "--text",
    "The value is stale.",
    "--evidence",
    "evidence.h1.note",
    "--recorded-at",
    "2026-07-28T11:00:03Z",
  ]);
  runCli([
    "close-horizon",
    "--output-root",
    item.outputRoot,
    "--horizon",
    "H1",
    "--final",
    "false",
    "--recorded-at",
    "2026-07-28T11:00:04Z",
  ]);
  runCli([
    "add-horizon",
    "--output-root",
    item.outputRoot,
    "--source-manifest",
    item.manifestPath,
    "--source-root",
    path.join(item.sources, "H2"),
    "--horizon",
    "H2",
    "--recorded-at",
    "2026-07-28T11:00:05Z",
  ]);
  runCli([
    "add-span",
    "--output-root",
    item.outputRoot,
    "--id",
    "evidence.h2.note",
    "--horizon",
    "H2",
    "--path",
    "note.md",
    "--line-start",
    "1",
    "--line-end",
    "2",
    "--recorded-at",
    "2026-07-28T11:00:06Z",
  ]);
  runCli([
    "add-assertion",
    "--output-root",
    item.outputRoot,
    "--assertion-id",
    "assertion.value",
    "--revision-id",
    "revision.value.02",
    "--predecessor-revision-id",
    "revision.value.01",
    "--horizon",
    "H2",
    "--text",
    "The value is corrected.",
    "--evidence",
    "evidence.h2.note",
    "--recorded-at",
    "2026-07-28T11:00:07Z",
  ]);
  runCli([
    "add-question",
    "--output-root",
    item.outputRoot,
    "--question-id",
    "question.external-guarantee",
    "--horizon",
    "H2",
    "--text",
    "Does the external dependency preserve the correction?",
    "--evidence",
    "evidence.h2.note",
    "--recorded-at",
    "2026-07-28T11:00:08Z",
  ]);
  runCli([
    "close-horizon",
    "--output-root",
    item.outputRoot,
    "--horizon",
    "H2",
    "--final",
    "true",
    "--recorded-at",
    "2026-07-28T11:00:09Z",
  ]);
  assert.equal(
    runCli(["verify", "--output-root", item.outputRoot]).status,
    "verified",
  );
  const projectionRoot = path.join(item.outputRoot, "projections", "H2");
  runCli([
    "project",
    "--output-root",
    item.outputRoot,
    "--horizon",
    "H2",
    "--projection-root",
    projectionRoot,
  ]);
  assert.equal(
    runCli([
      "rebuild-exact",
      "--output-root",
      item.outputRoot,
      "--horizon",
      "H2",
      "--projection-root",
      projectionRoot,
    ]).status,
    "projection-rebuilt-exactly",
  );
});

test("rejects source drift before a horizon is appended", async () => {
  const item = await fixture();
  await initialize(item);
  await writeFile(path.join(item.sources, "H1", "note.md"), "changed\n");
  await expectCode(
    appendSourceHorizon({
      horizonId: "H1",
      outputRoot: item.outputRoot,
      recordedAt: "2026-07-28T10:00:01Z",
      sourceManifestPath: item.manifestPath,
      sourceRoot: path.join(item.sources, "H1"),
    }),
    "SOURCE_HASH_MISMATCH",
  );
});

test("rejects a source snapshot outside the closed inventory", async () => {
  const item = await fixture();
  await initialize(item);
  await appendH1(item);
  await writeFile(
    path.join(item.outputRoot, "snapshots", "H1", "extra.txt"),
    "undeclared\n",
  );
  await expectCode(verifyStore(item.outputRoot), "SOURCE_INVENTORY_MISMATCH");
});

test("rejects additions to a closed source horizon", async () => {
  const item = await fixture();
  await initialize(item);
  await appendH1(item);
  await expectCode(
    appendEvidenceSpan({
      horizonId: "H1",
      lineEnd: 1,
      lineStart: 1,
      outputRoot: item.outputRoot,
      recordedAt: "2026-07-28T10:00:05Z",
      sourcePath: "note.md",
      spanId: "evidence.h1.too-late",
    }),
    "HORIZON_CLOSED",
  );
});

test("rejects revision-chain rewrites and future evidence", async () => {
  const item = await fixture();
  await initialize(item);
  await appendH1(item);
  await appendSourceHorizon({
    horizonId: "H2",
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:05Z",
    sourceManifestPath: item.manifestPath,
    sourceRoot: path.join(item.sources, "H2"),
  });
  await appendEvidenceSpan({
    horizonId: "H2",
    lineEnd: 2,
    lineStart: 1,
    outputRoot: item.outputRoot,
    recordedAt: "2026-07-28T10:00:06Z",
    sourcePath: "note.md",
    spanId: "evidence.h2.note",
  });
  await expectCode(
    appendAssertion({
      assertionId: "assertion.value",
      evidenceIds: ["evidence.h2.note"],
      horizonId: "H2",
      outputRoot: item.outputRoot,
      predecessorRevisionId: null,
      recordedAt: "2026-07-28T10:00:07Z",
      revisionId: "revision.value.rewrite",
      text: "Rewrite the prior claim.",
    }),
    "REVISION_CHAIN_INVALID",
  );
  await expectCode(
    appendAssertion({
      assertionId: "assertion.future",
      evidenceIds: ["evidence.h2.note"],
      horizonId: "H1",
      outputRoot: item.outputRoot,
      predecessorRevisionId: null,
      recordedAt: "2026-07-28T10:00:07Z",
      revisionId: "revision.future.01",
      text: "Leak future evidence.",
    }),
    "HORIZON_REOPENED",
  );
});

test("rejects projection writes outside the store projection root", async () => {
  const item = await fixture();
  await initialize(item);
  await appendH1(item);
  await expectCode(
    buildProjection({
      asOfHorizon: "H1",
      outputRoot: item.outputRoot,
      projectionRoot: path.join(item.root, "outside"),
    }),
    "OUTPUT_PATH_UNSAFE",
  );
});

test("keeps M8, M9, specifications, schemas, and RFCs byte-identical", () => {
  const protectedPaths = [
    "examples/experiments/record-and-bundle-golden-journey-v1",
    "runtime/experimental/record-bundle-v1",
    "examples/experiments/murmurmark-echo-lab-correction-v1",
    "runtime/experimental/public-dogfood-v1",
    "spec",
    "schemas",
    "rfcs",
  ];
  assert.equal(
    execFileSync("git", ["status", "--porcelain", "--", ...protectedPaths], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
    "",
  );
  execFileSync(
    "git",
    ["diff", "--quiet", frozenBaseCommit, "--", ...protectedPaths],
    { cwd: repositoryRoot },
  );
});
