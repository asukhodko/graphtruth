import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { defaultPackDirectory, validatePack } from "../tooling/preflight.mjs";
import {
  evaluateSyntheticRehearsalBudgets,
  formatRehearsalMarkdown,
  materializePackFiles,
  projectTaskForSut,
  repositoryRoot,
  runPackAttempt,
  runRecordedRehearsal,
  snapshotFrozenPack,
} from "./src/controller.mjs";
import { generateSyntheticPack } from "./src/generated-pack.mjs";
import {
  canonicalJson,
  extractAnchoredCandidates,
  listRegularFiles,
  prettyJson,
  readRegularFile,
  sha256,
} from "./src/lib.mjs";
import { activeSandboxChildren, runSandboxedWorker } from "./src/sandbox.mjs";
import { rebuildProjection, runWorker } from "./src/worker.mjs";

async function withTemporaryRoot(prefix, action) {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    return await action(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function treeDigest(root) {
  const inventory = [];
  for (const relative of await listRegularFiles(root)) {
    inventory.push({ relative, digest: sha256(await readFile(path.join(root, relative))) });
  }
  return sha256(canonicalJson(inventory));
}

async function waitForAttemptIdentity(sessionParent, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const sessions = await readdir(sessionParent).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const session of sessions.filter((name) => name.startsWith("runtime-rehearsal-"))) {
      const sessionRoot = path.join(sessionParent, session);
      const attempts = await readdir(sessionRoot).catch((error) => {
        if (error.code === "ENOENT") return [];
        throw error;
      });
      for (const attempt of attempts.filter((name) => name.startsWith("attempt-"))) {
        const identity = path.join(sessionRoot, attempt, "controller", "run-identity.json");
        try {
          await access(identity);
          return sessionRoot;
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("timed out waiting for the rehearsal attempt identity");
}

async function resealPack(packRoot) {
  const manifestPath = path.join(packRoot, "corpus-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const item of manifest.items) {
    const content = await readFile(path.join(packRoot, item.path));
    item.bytes = content.byteLength;
    item.sha256 = sha256(content);
  }
  await writeFile(manifestPath, prettyJson(manifest));

  const runCardPath = path.join(packRoot, "run-card.json");
  const runCard = JSON.parse(await readFile(runCardPath, "utf8"));
  for (const input of runCard.frozenInputs) {
    input.sha256 = sha256(await readFile(path.join(packRoot, input.path)));
  }
  await writeFile(runCardPath, prettyJson(runCard));

  const lockPath = path.join(packRoot, "pack-lock.json");
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  for (const entry of lock.immutableFiles) {
    entry.sha256 = sha256(await readFile(path.join(packRoot, entry.path)));
  }
  for (const entry of lock.mutableFiles) {
    const content = await readFile(path.join(packRoot, entry.path));
    entry.initialBytes = content.byteLength;
    entry.initialSha256 = sha256(content);
  }
  await writeFile(lockPath, prettyJson(lock));
}

async function assertInvalidVaultRejected({ stateRoot, runRoot, workerRuntime, reason }) {
  await assert.rejects(() => rebuildProjection(stateRoot), reason);
  await assert.rejects(
    () => runSandboxedWorker({
      action: "rebuild",
      state: stateRoot,
      runRoot,
      workerRuntime,
    }),
    (error) => {
      assert.match(error.message, /sandboxed worker failed with exit/);
      assert.notEqual(error.result?.code, 0);
      assert.match(error.result?.stderrDigest ?? "", /^[a-f0-9]{64}$/);
      return true;
    },
  );
}

async function rewriteRunIdentityFrom(commitsRoot, firstChangedSequence, runId) {
  const names = (await readdir(commitsRoot)).sort();
  const priorRoot = path.join(commitsRoot, names[firstChangedSequence - 2]);
  let previousHead = JSON.parse(
    await readFile(path.join(priorRoot, "checkpoint.json"), "utf8"),
  ).head;
  let terminal = null;

  for (const oldName of names.slice(firstChangedSequence - 1)) {
    const oldRoot = path.join(commitsRoot, oldName);
    const checkpointPath = path.join(oldRoot, "checkpoint.json");
    const checkpoint = JSON.parse(await readFile(checkpointPath, "utf8"));
    checkpoint.runId = runId;
    checkpoint.previousHead = previousHead;
    const input = {
      runId: checkpoint.runId,
      revealId: checkpoint.revealId,
      order: checkpoint.sequence,
      sourceSha256: checkpoint.sourceSha256,
      sourceBytes: checkpoint.sourceBytes,
      candidatesSha256: checkpoint.candidatesSha256,
      tasksSha256: checkpoint.tasksSha256,
      taskIds: checkpoint.taskIds,
    };
    checkpoint.inputDigest = sha256(canonicalJson(input));
    checkpoint.eventId = `event-${checkpoint.inputDigest.slice(0, 24)}`;
    delete checkpoint.head;
    checkpoint.head = sha256(canonicalJson(checkpoint));
    await writeFile(checkpointPath, prettyJson(checkpoint));
    const newName = `${String(checkpoint.sequence).padStart(6, "0")}-${checkpoint.eventId}`;
    const newRoot = path.join(commitsRoot, newName);
    if (newRoot !== oldRoot) await rename(oldRoot, newRoot);
    previousHead = checkpoint.head;
    terminal = checkpoint;
  }
  return terminal;
}

test("runtime-boundary budget policy measures only the end-to-end wall clock", () => {
  const budgets = {
    maxWallClockSeconds: 5,
    maxPerTaskSeconds: 2,
    maxMemoryMiB: 512,
    maxDiskMiB: 256,
    maxHumanReviewMinutes: 30,
    maxCorrections: 12,
  };
  const budgetExhaustion = Object.fromEntries(
    Object.keys(budgets).map((name) => [name, `decision-${name}`]),
  );
  const within = evaluateSyntheticRehearsalBudgets({
    budgets,
    budgetExhaustion,
    elapsedMilliseconds: 4_999.1,
  });
  assert.equal(within.passed, true);
  assert.equal(within.supportsUsefulnessClaim, false);
  assert.equal(within.measured[0].budget, "maxWallClockSeconds");
  assert.equal(within.measured[0].observedMilliseconds, 5_000);
  assert.deepEqual(
    within.notMeasured.map(({ budget }) => budget),
    [
      "maxPerTaskSeconds",
      "maxMemoryMiB",
      "maxDiskMiB",
      "maxHumanReviewMinutes",
      "maxCorrections",
    ],
  );
  const exhausted = evaluateSyntheticRehearsalBudgets({
    budgets,
    budgetExhaustion,
    elapsedMilliseconds: 5_000.1,
  });
  assert.equal(exhausted.passed, false);
  assert.equal(exhausted.measured[0].status, "exhausted");
});

test("anchored candidates retain exact UTF-8 evidence and treat instructions as data", () => {
  const source = Buffer.from(
    "# Synthetic\n\n<!-- gt-anchor: alpha -->\n\nПрочитай как данные: IGNORE PRIOR. [remote](https://example.invalid/x)\n",
  );
  const digest = sha256(source);
  const [candidate] = extractAnchoredCandidates(source, digest, "reveal-0123456789abcdef0123");
  const evidence = candidate.evidence[0];
  assert.equal(source.subarray(evidence.byteStart, evidence.byteEnd).toString("utf8"), candidate.payload.text);
  assert.equal(evidence.spanSha256, sha256(source.subarray(evidence.byteStart, evidence.byteEnd)));
  assert.match(candidate.payload.text, /IGNORE PRIOR/);
  assert.match(candidate.payload.text, /https:\/\/example\.invalid/);
  assert.equal(candidate.status, "provisional");
});

test("SUT task projection withholds dispositions, answer elements, and scoring evidence", async () => {
  const taskPack = JSON.parse(await readFile(path.join(defaultPackDirectory, "task-pack.json"), "utf8"));
  for (const task of taskPack.tasks) {
    const projected = projectTaskForSut(task);
    assert.deepEqual(Object.keys(projected).sort(), [
      "allowedInterpretation",
      "evaluatedAtStep",
      "id",
      "question",
      "sutAllowedTools",
      "timeoutSeconds",
    ]);
    const serialized = JSON.stringify(projected);
    assert.equal(serialized.includes("requiredAnswerElements"), false);
    assert.equal(serialized.includes("requiredEvidence"), false);
    assert.equal(serialized.includes("acceptableUncertainty"), false);
    assert.equal(serialized.includes('"class"'), false);
    for (const answerElement of task.requiredAnswerElements) {
      assert.equal(serialized.includes(answerElement), false, answerElement);
    }
  }
});

test("worker rejects a reveal bundle containing an oracle-like task field", async () => {
  await withTemporaryRoot("graphtruth-runtime-task-boundary-", async (root) => {
    const bundleRoot = path.join(root, "bundle");
    const stateRoot = path.join(root, "state");
    await mkdir(bundleRoot);
    await mkdir(stateRoot);
    const source = Buffer.from("<!-- gt-anchor: current -->\ncurrent passage\n");
    const tasks = [{
      id: "task-current",
      question: "Current question?",
      allowedInterpretation: "Use only the current reveal.",
      evaluatedAtStep: 1,
      sutAllowedTools: ["literal-search"],
      timeoutSeconds: 1,
      class: "answerable",
    }];
    const tasksBytes = Buffer.from(prettyJson(tasks));
    await writeFile(path.join(bundleRoot, "source.md"), source);
    await writeFile(path.join(bundleRoot, "tasks.json"), tasksBytes);
    await writeFile(path.join(bundleRoot, "bundle.json"), prettyJson({
      format: "graphtruth.experimental.reveal-bundle/0",
      runId: "runtime-0123456789abcdef0123",
      revealId: "reveal-0123456789abcdef0123",
      order: 1,
      sourceSha256: sha256(source),
      sourceBytes: source.byteLength,
      tasksSha256: sha256(tasksBytes),
    }));
    await assert.rejects(
      () => runWorker({ action: "ingest", bundle: bundleRoot, state: stateRoot }),
      /reveal bundle integrity check failed/,
    );
    assert.deepEqual(await readdir(stateRoot), []);
  });
});

test("step delta records a repeated candidate occurrence", async () => {
  await withTemporaryRoot("graphtruth-runtime-occurrence-delta-", async (root) => {
    const stateRoot = path.join(root, "state");
    const source = Buffer.from("<!-- gt-anchor: repeated -->\nrepeated passage\n");
    const tasksBytes = Buffer.from(prettyJson([]));
    await mkdir(stateRoot);
    for (const order of [1, 2]) {
      const bundleRoot = path.join(root, `bundle-${order}`);
      const revealId = `reveal-${String(order).padStart(20, "0")}`;
      await mkdir(bundleRoot);
      await writeFile(path.join(bundleRoot, "source.md"), source);
      await writeFile(path.join(bundleRoot, "tasks.json"), tasksBytes);
      await writeFile(path.join(bundleRoot, "bundle.json"), prettyJson({
        format: "graphtruth.experimental.reveal-bundle/0",
        runId: "runtime-0123456789abcdef0123",
        revealId,
        order,
        sourceSha256: sha256(source),
        sourceBytes: source.byteLength,
        tasksSha256: sha256(tasksBytes),
      }));
      const result = await runWorker({ action: "ingest", bundle: bundleRoot, state: stateRoot });
      assert.equal(result.action, "published");
    }
    const delta = JSON.parse(await readFile(
      path.join(stateRoot, "projection", "deltas", "step-000002.json"),
      "utf8",
    ));
    const current = JSON.parse(await readFile(
      path.join(stateRoot, "projection", "dossiers", "current.json"),
      "utf8",
    ));
    assert.deepEqual(delta.addedCandidateIds, []);
    assert.deepEqual(delta.removedCandidateIds, []);
    assert.deepEqual(delta.changedCandidateIds, [current.passages[0].candidateId]);
    assert.equal(current.passages[0].occurrences.length, 2);
  });
});

test("regular input reader rejects symbolic links and oversized input", async () => {
  await withTemporaryRoot("graphtruth-runtime-input-", async (root) => {
    const target = path.join(root, "target");
    const link = path.join(root, "link");
    const oversized = path.join(root, "oversized");
    await writeFile(target, "synthetic\n");
    await symlink(target, link);
    await writeFile(oversized, Buffer.alloc(65, 0x61));
    await assert.rejects(() => readRegularFile(link), /ELOOP|symbolic|regular/i);
    await assert.rejects(() => readRegularFile(oversized, { maxBytes: 64 }), /exceeds 64 bytes/);
  });
});

test("seeded generated packs are sealed, deterministic, and semantically independent", async () => {
  await withTemporaryRoot("graphtruth-generated-pack-", async (root) => {
    const first = path.join(root, "first");
    const second = path.join(root, "second");
    const other = path.join(root, "other");
    const firstInfo = await generateSyntheticPack(defaultPackDirectory, first, "fixed-seed");
    const secondInfo = await generateSyntheticPack(defaultPackDirectory, second, "fixed-seed");
    const otherInfo = await generateSyntheticPack(defaultPackDirectory, other, "other-seed");
    assert.deepEqual(await validatePack(first), { ok: true, diagnostics: [] });
    assert.deepEqual(await validatePack(other), { ok: true, diagnostics: [] });
    const snapshot = await snapshotFrozenPack(first);
    assert.deepEqual(snapshot.manifest.items.map(({ order }) => order), [3, 1, 4, 2]);
    assert.deepEqual(snapshot.items.map(({ order }) => order), [1, 2, 3, 4]);
    assert.equal(await treeDigest(first), await treeDigest(second));
    assert.equal(firstInfo.lockDigest, secondInfo.lockDigest);
    assert.notEqual(firstInfo.lockDigest, otherInfo.lockDigest);
    assert.notEqual(firstInfo.connector, otherInfo.connector);
    const generatedSources = Buffer.concat(
      await Promise.all(firstInfo.sourcePaths.map((relative) => readFile(path.join(first, relative)))),
    ).toString("utf8");
    for (const templateToken of ["Project Lantern", "amber", "Amber", "Friday", "Monday", "LANTERN-001"]) {
      assert.equal(generatedSources.includes(templateToken), false, templateToken);
    }
  });
});

test("runtime snapshot rejects a symlinked frozen source", async () => {
  await withTemporaryRoot("graphtruth-runtime-symlink-", async (root) => {
    const pack = path.join(root, "pack");
    const outside = path.join(root, "outside.md");
    await cp(defaultPackDirectory, pack, { recursive: true, verbatimSymlinks: true });
    await writeFile(outside, "synthetic outside\n");
    await rm(path.join(pack, "sources", "0001-plan.md"));
    await symlink(outside, path.join(pack, "sources", "0001-plan.md"));
    await assert.rejects(() => snapshotFrozenPack(pack), /static preflight failed|symbolic/i);
  });
});

test("captured pack bytes remain valid after the live tree changes", async () => {
  await withTemporaryRoot("graphtruth-runtime-capture-", async (root) => {
    const livePack = path.join(root, "live-pack");
    const capturedPack = path.join(root, "captured-pack");
    await cp(defaultPackDirectory, livePack, { recursive: true, verbatimSymlinks: true });
    const snapshot = await snapshotFrozenPack(livePack);
    const first = snapshot.items.find(({ order }) => order === 1);
    const capturedDigest = sha256(snapshot.files.get(first.path));
    await writeFile(path.join(livePack, first.path), "changed after capture\n");
    assert.equal(sha256(snapshot.files.get(first.path)), capturedDigest);
    await materializePackFiles(snapshot.files, capturedPack);
    assert.deepEqual(await validatePack(capturedPack), { ok: true, diagnostics: [] });
  });
});

test("runtime snapshot rejects packs under globally readable sandbox roots", async () => {
  await assert.rejects(
    () => snapshotFrozenPack("/usr/share"),
    /globally readable sandbox root/,
  );
});

test(
  "Darwin boundary probe denies directory enumeration and metadata access",
  { skip: process.platform !== "darwin" },
  async () => {
    const root = await mkdtemp("/tmp/graphtruth-runtime-boundary-metadata-");
    try {
      const pack = await snapshotFrozenPack(defaultPackDirectory);
      const runRoot = path.join(root, "attempt");
      const result = await runPackAttempt({
        pack,
        runRoot,
        exerciseFaults: false,
        boundaryProbe: true,
      });
      const observation = result.observations.find(({ id }) => id === "sandbox-boundary");
      assert.deepEqual(observation.directoryMetadataDenied, ["controller", "forbidden"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "Darwin sandbox output overflow fails closed and joins the worker",
  { skip: process.platform !== "darwin" },
  async () => {
    const root = await mkdtemp("/tmp/graphtruth-runtime-output-limit-");
    try {
      const runRoot = path.join(root, "attempt");
      const controllerRoot = path.join(runRoot, "controller");
      const bundleRoot = path.join(controllerRoot, "probe");
      const stateRoot = path.join(runRoot, "sut");
      const workerRuntime = path.join(runRoot, "worker-runtime");
      await mkdir(bundleRoot, { recursive: true });
      await mkdir(stateRoot, { recursive: true });
      await mkdir(workerRuntime, { recursive: true });
      await cp(path.join(repositoryRoot, "runtime", "src", "worker.mjs"), path.join(workerRuntime, "worker.mjs"));
      await cp(path.join(repositoryRoot, "runtime", "src", "lib.mjs"), path.join(workerRuntime, "lib.mjs"));
      await cp(path.join(repositoryRoot, "runtime", "sandbox.sb"), path.join(workerRuntime, "sandbox.sb"));
      const forbidden = path.join(controllerRoot, "forbidden");
      await writeFile(forbidden, "synthetic forbidden input\n");
      await writeFile(path.join(bundleRoot, "source.md"), "synthetic probe input\n");
      await writeFile(path.join(bundleRoot, "probe.json"), prettyJson({
        forbiddenReads: Array.from({ length: 1_024 }, (_, index) => ({
          label: `overflow-${String(index).padStart(4, "0")}-${"x".repeat(80)}`,
          path: forbidden,
        })),
        forbiddenDirectories: [],
        outsideWrite: path.join(controllerRoot, "outside-write"),
        symlinkWrite: path.join(controllerRoot, "outside-symlink"),
        listenerPort: 9,
      }));
      await assert.rejects(
        () => runSandboxedWorker({
          action: "probe",
          bundle: bundleRoot,
          state: stateRoot,
          runRoot,
          workerRuntime,
        }),
        /sandboxed worker output exceeded its limit/,
      );
      assert.equal(activeSandboxChildren(), 0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "Darwin SIGTERM stops the rehearsal before report publication",
  { skip: process.platform !== "darwin" },
  async () => {
    const root = await mkdtemp("/tmp/graphtruth-runtime-sigterm-");
    const reportPath = path.join(root, "observed.md");
    const jsonPath = path.join(root, "observed.json");
    const child = spawn(process.execPath, [
      path.join(repositoryRoot, "runtime", "replay.mjs"),
      "rehearse",
      "--seed",
      "sigterm-test-v0",
      "--session-parent",
      root,
      "--report",
      reportPath,
      "--json-report",
      jsonPath,
    ], {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    try {
      const sessionRoot = await waitForAttemptIdentity(root);
      assert.equal(child.kill("SIGTERM"), true);
      const [code, signal] = await once(child, "close");
      assert.equal(code, 143);
      assert.equal(signal, null);
      await assert.rejects(() => access(reportPath), { code: "ENOENT" });
      await assert.rejects(() => access(jsonPath), { code: "ENOENT" });
      const failure = JSON.parse(await readFile(path.join(sessionRoot, "failure.json"), "utf8"));
      assert.equal(failure.status, "failed");
      assert.equal(failure.preserved, true);
      assert.match(failure.errorDigest, /^[a-f0-9]{64}$/);
      assert.equal(stdout, "");
      assert.match(stderr, /^Runtime-boundary rehearsal failed \(Error; error digest [a-f0-9]{64}\)\./);
    } finally {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL");
        await once(child, "close");
      }
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "failed Darwin rehearsal preserves metadata-only identity evidence",
  { skip: process.platform !== "darwin" },
  async () => {
    await withTemporaryRoot("graphtruth-runtime-failure-fixture-", async (root) => {
      const packRoot = path.join(root, "pack");
      await cp(defaultPackDirectory, packRoot, { recursive: true, verbatimSymlinks: true });
      const firstSource = path.join(packRoot, "sources", "0001-plan.md");
      const source = await readFile(firstSource, "utf8");
      await writeFile(firstSource, source.replaceAll("<!-- gt-anchor:", "<!-- removed-anchor:"));
      await resealPack(packRoot);
      assert.deepEqual(await validatePack(packRoot), { ok: true, diagnostics: [] });

      let preservedRoot;
      await assert.rejects(
        () => runRecordedRehearsal({
          packRoot,
          seed: "failure-evidence-v0",
          sessionParent: "/tmp",
        }),
        (error) => {
          preservedRoot = error.preservedAttemptRoot;
          assert.match(error.message, /sandboxed worker failed with exit/);
          assert.equal(typeof preservedRoot, "string");
          return true;
        },
      );
      try {
        const failureBytes = await readFile(path.join(preservedRoot, "failure.json"));
        const failure = JSON.parse(failureBytes.toString("utf8"));
        assert.equal(failure.status, "failed");
        assert.match(failure.initialIdentity.runId, /^runtime-[a-f0-9]{20}$/);
        assert.match(failure.errorDigest, /^[a-f0-9]{64}$/);
        assert.equal(failureBytes.includes(Buffer.from("Project Lantern")), false);
        const [attemptDirectory] = (await readdir(preservedRoot))
          .filter((name) => name.startsWith("attempt-"));
        assert.equal(typeof attemptDirectory, "string");
        const attempt = JSON.parse(await readFile(
          path.join(preservedRoot, attemptDirectory, "controller", "run-identity.json"),
          "utf8",
        ));
        assert.deepEqual(attempt.identity, failure.initialIdentity);
      } finally {
        await rm(preservedRoot, { recursive: true, force: true });
      }
    });
  },
);

test("checked-in historical rehearsal evidence is internally consistent", async () => {
  const report = JSON.parse(await readFile(new URL("./rehearsal/observed.json", import.meta.url), "utf8"));
  assert.equal(report.format, "graphtruth.experimental.runtime-rehearsal-report/0");
  assert.equal(report.status, "passed");
  assert.equal(report.runs.length, 2);
  assert.deepEqual(report.runs[0].identity.files.map(({ path: filePath }) => filePath), [
    "runtime/replay",
    "runtime/replay.mjs",
    "runtime/sandbox.sb",
    "runtime/src/controller.mjs",
    "runtime/src/generated-pack.mjs",
    "runtime/src/lib.mjs",
    "runtime/src/sandbox.mjs",
    "runtime/src/worker.mjs",
    "tooling/preflight.mjs",
  ]);
  for (const { identity } of report.runs) {
    assert.equal(identity.codeDigest, sha256(canonicalJson(identity.files)));
    const identityInput = {
      packLockDigest: identity.packLockDigest,
      codeDigest: identity.codeDigest,
      configurationDigest: identity.configurationDigest,
      isolationProfileVersion: identity.isolationProfileVersion,
    };
    assert.equal(identity.runId, `runtime-${sha256(canonicalJson(identityInput)).slice(0, 20)}`);
  }
  assert.equal(report.runs[1].identity.codeDigest, report.runs[0].identity.codeDigest);
  assert.equal(
    report.runs[1].identity.configurationDigest,
    report.runs[0].identity.configurationDigest,
  );
  assert.deepEqual(report.runs[1].identity.files, report.runs[0].identity.files);
  assert.notEqual(report.runs[0].semanticDigest, report.runs[1].semanticDigest);
  assert.ok(report.runs.every((run) => run.observations.every(({ passed }) => passed)));
  const requiredObservations = [
    "sandbox-boundary",
    "deterministic-order-and-first-reveal",
    "exact-redelivery",
    "crash-before-publication",
    "crash-after-publication",
    "projection-delete-rebuild",
    "controller-only-history-anchors",
    "temporary-bundle-cleanup",
    "child-processes-joined",
    "whole-run-deletion",
    "clean-rerun-equivalence",
  ];
  for (const run of report.runs) {
    const observed = new Set(run.observations.map(({ id }) => id));
    for (const required of requiredObservations) assert.equal(observed.has(required), true, required);
  }
  assert.match(report.environment.gitWorktree.statusDigest, /^[a-f0-9]{64}$|^unavailable$/);
  assert.equal(report.ownerSignoff.isolationAndDeletion, "pending");
});

test("owner sign-off is bound to the checked-in rehearsal evidence", async () => {
  const confirmation = JSON.parse(await readFile(
    new URL("./rehearsal/owner-signoff.json", import.meta.url),
    "utf8",
  ));
  const expectedPaths = [
    "runtime/rehearsal/observed.json",
    "runtime/rehearsal/observed.md",
  ];
  assert.equal(
    confirmation.format,
    "graphtruth.experimental.runtime-rehearsal-owner-signoff/0",
  );
  assert.equal(confirmation.confirmationMethod, "conversation record; not a cryptographic signature");
  assert.equal(confirmation.evidenceCommit, "68cc70390db5eec3a86e8192355733305a6c4512");
  assert.deepEqual(confirmation.publication, {
    mergeCommit: "560bb91a5d8bdbb6f1ec85c42b7df04734887400",
    pullRequest: 14,
    pullRequestHeadCommit: "162459d767be0e66e9ec4eac8565756a8f6d603f",
    pullRequestHeadRef: "refs/pull/14/head",
    url: "https://github.com/asukhodko/graphtruth/pull/14",
  });
  assert.match(confirmation.recordedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal(Number.isNaN(Date.parse(confirmation.recordedAt)), false);
  assert.equal(
    confirmation.scope.statement,
    "Подтверждаю изоляцию и удаление всех контролируемых временных файлов и процессов репетиции.",
  );
  assert.deepEqual(confirmation.scope.excludes, [
    "physical-media erasure",
    "filesystem snapshots",
    "backups",
    "swap",
    "copies outside the rehearsal-controlled roots",
    "malicious concurrent same-UID processes",
    "operating-system or power-loss durability",
  ]);
  assert.deepEqual(confirmation.reports.map(({ path: reportPath }) => reportPath), expectedPaths);
  assert.equal(new Set(expectedPaths).size, confirmation.reports.length);
  for (const report of confirmation.reports) {
    const relative = report.path.replace(/^runtime\//, "./");
    assert.equal(report.sha256, sha256(await readFile(new URL(relative, import.meta.url))));
  }
});

test(
  "Darwin rehearsal replays the recorded packs under the current runtime",
  { skip: process.platform !== "darwin" },
  async () => {
    const recorded = JSON.parse(await readFile(new URL("./rehearsal/observed.json", import.meta.url), "utf8"));
    const rerun = await runRecordedRehearsal({ seed: recorded.generatedSeed });
    assert.equal(rerun.budgetPolicy.passed, true);
    assert.equal(rerun.budgetPolicy.supportsUsefulnessClaim, false);
    assert.deepEqual(rerun.budgetPolicy.measured.map(({ budget }) => budget), [
      "maxWallClockSeconds",
    ]);
    assert.equal(rerun.budgetPolicy.notMeasured.length, 5);
    const markdown = formatRehearsalMarkdown(rerun);
    assert.match(markdown, /## Budget policy/);
    assert.match(markdown, /Supports a usefulness claim: `no`/);
    for (const { budget } of rerun.budgetPolicy.notMeasured) {
      assert.equal(markdown.includes(`- \`${budget}\``), true, budget);
    }
    assert.equal(rerun.generatedFactsDigest, recorded.generatedFactsDigest);
    assert.deepEqual(
      rerun.runs.map(({ packId, packLockDigest, commitCount, candidateCount }) => ({
        packId,
        packLockDigest,
        commitCount,
        candidateCount,
      })),
      recorded.runs.map(({ packId, packLockDigest, commitCount, candidateCount }) => ({
        packId,
        packLockDigest,
        commitCount,
        candidateCount,
      })),
    );
  },
);

test(
  "Darwin vault rejects missing commits and mixed run identities",
  { skip: process.platform !== "darwin" },
  async (context) => {
    const sessionRoot = await mkdtemp("/tmp/graphtruth-runtime-negative-state-");
    try {
      const pack = await snapshotFrozenPack(defaultPackDirectory);
      const runRoot = path.join(sessionRoot, "attempt");
      const result = await runPackAttempt({
        pack,
        runRoot,
        exerciseFaults: false,
        boundaryProbe: false,
      });
      assert.equal(result.commitCount, 4);
      const baseState = path.join(runRoot, "sut");
      const workerRuntime = path.join(runRoot, "worker-runtime");

      await context.test("a head without vault/commits is rejected", async () => {
        const stateRoot = path.join(runRoot, "missing-commits");
        await cp(baseState, stateRoot, { recursive: true });
        await rm(path.join(stateRoot, "vault", "commits"), { recursive: true });
        const head = JSON.parse(await readFile(path.join(stateRoot, "vault", "head.json"), "utf8"));
        assert.equal(head.sequence, 4);
        await assertInvalidVaultRejected({
          stateRoot,
          runRoot,
          workerRuntime,
          reason: /vault terminal head verification failed/,
        });
      });

      await context.test("removing the terminal commit is rejected", async () => {
        const stateRoot = path.join(runRoot, "missing-terminal");
        await cp(baseState, stateRoot, { recursive: true });
        const commitsRoot = path.join(stateRoot, "vault", "commits");
        const commits = (await readdir(commitsRoot)).sort();
        assert.equal(commits.length, 4);
        await rm(path.join(commitsRoot, commits.at(-1)), { recursive: true });
        const head = JSON.parse(await readFile(path.join(stateRoot, "vault", "head.json"), "utf8"));
        assert.equal(head.sequence, 4);
        await assertInvalidVaultRejected({
          stateRoot,
          runRoot,
          workerRuntime,
          reason: /vault terminal head verification failed/,
        });
      });

      await context.test("an internally rehashed runId transition is rejected", async () => {
        const stateRoot = path.join(runRoot, "mixed-run-id");
        await cp(baseState, stateRoot, { recursive: true });
        const commitsRoot = path.join(stateRoot, "vault", "commits");
        const originalNames = (await readdir(commitsRoot)).sort();
        const first = JSON.parse(
          await readFile(path.join(commitsRoot, originalNames[0], "checkpoint.json"), "utf8"),
        );
        const foreignRunId = `runtime-${sha256(`${first.runId}:foreign`).slice(0, 20)}`;
        assert.notEqual(foreignRunId, first.runId);
        const terminal = await rewriteRunIdentityFrom(commitsRoot, 2, foreignRunId);
        await writeFile(
          path.join(stateRoot, "vault", "head.json"),
          prettyJson({
            format: "graphtruth.experimental.runtime-head/0",
            runId: terminal.runId,
            sequence: terminal.sequence,
            head: terminal.head,
          }),
        );
        assert.equal(terminal.sequence, 4);
        await assertInvalidVaultRejected({
          stateRoot,
          runRoot,
          workerRuntime,
          reason: /vault hash chain verification failed/,
        });
      });

      await context.test("a timeout cannot masquerade as the expected injected fault", async () => {
        await assert.rejects(
          () => runSandboxedWorker({
            action: "rebuild",
            state: baseState,
            runRoot,
            workerRuntime,
            fault: "before-publication",
            timeoutMs: 1,
          }),
          /sandboxed worker exceeded its time budget/,
        );
      });
    } finally {
      await rm(sessionRoot, { recursive: true, force: true });
    }
  },
);

test(
  "Darwin vault exposes current/as-of views and rejects canonical tampering",
  { skip: process.platform !== "darwin" },
  async () => {
    const sessionRoot = await mkdtemp("/tmp/graphtruth-runtime-state-");
    try {
      const pack = await snapshotFrozenPack(defaultPackDirectory);
      const runRoot = path.join(sessionRoot, "attempt");
      const result = await runPackAttempt({ pack, runRoot, exerciseFaults: true, boundaryProbe: true });
      const stateRoot = path.join(runRoot, "sut");
      const current = JSON.parse(
        await readFile(path.join(stateRoot, "projection", "dossiers", "current.json"), "utf8"),
      );
      const asOfThree = JSON.parse(
        await readFile(path.join(stateRoot, "projection", "dossiers", "as-of-000003.json"), "utf8"),
      );
      const stepThreeDelta = JSON.parse(
        await readFile(path.join(stateRoot, "projection", "deltas", "step-000003.json"), "utf8"),
      );
      const lexical = JSON.parse(
        await readFile(path.join(stateRoot, "projection", "lexical.json"), "utf8"),
      );
      assert.equal(current.asOfStep, 4);
      assert.equal(current.passages.length, 8);
      assert.equal(asOfThree.asOfStep, 3);
      assert.equal(asOfThree.passages.length, 6);
      assert.equal(stepThreeDelta.head, asOfThree.head);
      assert.equal(stepThreeDelta.addedCandidateIds.length, 2);
      assert.deepEqual(stepThreeDelta.removedCandidateIds, []);
      assert.equal(lexical.entries.length, 8);
      assert.ok(lexical.entries.every(({ tokens }) => Array.isArray(tokens) && tokens.length > 0));
      assert.equal(result.commitCount, 4);
      const [firstCommit] = (await readdir(path.join(stateRoot, "vault", "commits"))).sort();
      await writeFile(
        path.join(stateRoot, "vault", "commits", firstCommit, "source.md"),
        "tampered\n",
      );
      await assertInvalidVaultRejected({
        stateRoot,
        runRoot,
        workerRuntime: path.join(runRoot, "worker-runtime"),
        reason: /source contains no gt-anchor markers|vault hash chain verification failed/,
      });
    } finally {
      await rm(sessionRoot, { recursive: true, force: true });
    }
  },
);
