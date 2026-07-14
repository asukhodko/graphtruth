import { execFile as execFileCallback } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  access,
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { defaultPackDirectory, validatePack } from "../../tooling/preflight.mjs";
import { generateSyntheticPack } from "./generated-pack.mjs";
import {
  assertNoSymlinks,
  assertSafeRelativePath,
  canonicalJson,
  listRegularFiles,
  maxAnchors,
  opaqueId,
  prettyJson,
  randomToken,
  readRegularFile,
  sha256,
} from "./lib.mjs";
import {
  activeSandboxChildren,
  assertIsolationAvailable,
  isolationProfileVersion,
  runSandboxedWorker,
} from "./sandbox.mjs";

const execFile = promisify(execFileCallback);
const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(sourceDirectory, "../..");
const runtimeRoot = path.join(repositoryRoot, "runtime");
const globallyReadableSandboxRoots = [
  "/System",
  "/usr/lib",
  "/usr/share",
  "/Library/Apple",
  "/opt/homebrew/Cellar",
  "/opt/homebrew/opt",
];

const runtimeIdentitySources = [
  ["runtime/replay", path.join(runtimeRoot, "replay")],
  ["runtime/replay.mjs", path.join(runtimeRoot, "replay.mjs")],
  ["runtime/sandbox.sb", path.join(runtimeRoot, "sandbox.sb")],
  ["runtime/src/controller.mjs", path.join(runtimeRoot, "src/controller.mjs")],
  ["runtime/src/generated-pack.mjs", path.join(runtimeRoot, "src/generated-pack.mjs")],
  ["runtime/src/lib.mjs", path.join(runtimeRoot, "src/lib.mjs")],
  ["runtime/src/sandbox.mjs", path.join(runtimeRoot, "src/sandbox.mjs")],
  ["runtime/src/worker.mjs", path.join(runtimeRoot, "src/worker.mjs")],
  ["tooling/preflight.mjs", path.join(repositoryRoot, "tooling/preflight.mjs")],
];

const runtimeConfiguration = {
  format: "graphtruth.experimental.runtime-configuration/0",
  isolationProfileVersion,
  candidateProducer: "anchored-passage-v0",
  projection: "lexical-v0",
  maximumSourceBytes: 1024 * 1024,
  maximumAnchors: maxAnchors,
  maximumCandidateBytes: 2 * 1024 * 1024,
  faults: ["before-publication", "after-publication"],
};

function parseJsonBytes(files, relative) {
  const content = files.get(relative);
  if (!content) throw new Error(`frozen pack is missing ${relative}`);
  return JSON.parse(content.toString("utf8"));
}

async function assertPackOutsideGlobalSandboxRoots(packRoot) {
  const resolvedPackRoot = await realpath(packRoot);
  for (const candidate of globallyReadableSandboxRoots) {
    const resolvedCandidate = await realpath(candidate).catch(() => candidate);
    if (
      resolvedPackRoot === resolvedCandidate ||
      resolvedPackRoot.startsWith(`${resolvedCandidate}${path.sep}`)
    ) {
      throw new Error("frozen pack overlaps a globally readable sandbox root");
    }
  }
  return resolvedPackRoot;
}

export async function materializePackFiles(files, targetRoot) {
  await mkdir(targetRoot, { recursive: true, mode: 0o700 });
  for (const [relative, content] of files) {
    assertSafeRelativePath(relative, "pack path");
    const filename = path.join(targetRoot, relative);
    await mkdir(path.dirname(filename), { recursive: true, mode: 0o700 });
    await writeFile(filename, content, { flag: "wx", mode: 0o600 });
  }
}

export async function snapshotFrozenPack(packRoot) {
  const resolvedPackRoot = await assertPackOutsideGlobalSandboxRoots(packRoot);
  await assertNoSymlinks(packRoot);
  const relativeFiles = await listRegularFiles(packRoot);
  const files = new Map();
  for (const relative of relativeFiles) {
    assertSafeRelativePath(relative, "pack path");
    files.set(relative, await readRegularFile(path.join(packRoot, relative), {
      label: "pack file",
    }));
  }
  for (const relative of relativeFiles) {
    const repeated = await readRegularFile(path.join(packRoot, relative), { label: "pack file" });
    if (!files.get(relative).equals(repeated)) {
      throw new Error("frozen pack bytes changed during capture");
    }
  }
  await assertNoSymlinks(packRoot);
  const finalRelativeFiles = await listRegularFiles(packRoot);
  if (canonicalJson(finalRelativeFiles) !== canonicalJson(relativeFiles)) {
    throw new Error("frozen pack inventory changed during capture");
  }
  if (await realpath(packRoot) !== resolvedPackRoot) {
    throw new Error("frozen pack root changed during capture");
  }

  const validationParent = await mkdtemp(path.join(os.tmpdir(), "graphtruth-pack-snapshot-"));
  const validationRoot = path.join(validationParent, "pack");
  try {
    await materializePackFiles(files, validationRoot);
    const validation = await validatePack(validationRoot);
    if (!validation.ok) {
      throw new Error(`static preflight failed: ${validation.diagnostics.map(({ code }) => code).join(", ")}`);
    }
  } finally {
    await rm(validationParent, { recursive: true, force: true });
  }

  const lock = parseJsonBytes(files, "pack-lock.json");
  const declared = new Set([lock.selfExcludedPath]);
  for (const entry of lock.immutableFiles) {
    declared.add(entry.path);
    const content = files.get(entry.path);
    if (!content || sha256(content) !== entry.sha256) throw new Error("frozen immutable digest changed");
  }
  for (const entry of lock.mutableFiles) {
    declared.add(entry.path);
    const content = files.get(entry.path);
    if (
      !content ||
      content.byteLength < entry.initialBytes ||
      sha256(content.subarray(0, entry.initialBytes)) !== entry.initialSha256
    ) {
      throw new Error("frozen mutable prefix changed");
    }
  }
  if (
    declared.size !== relativeFiles.length ||
    relativeFiles.some((relative) => !declared.has(relative))
  ) {
    throw new Error("frozen pack inventory changed during snapshot");
  }
  const manifest = parseJsonBytes(files, "corpus-manifest.json");
  const taskPack = parseJsonBytes(files, "task-pack.json");
  const sandboxPolicy = parseJsonBytes(files, "sandbox-policy.json");
  const dataHandling = parseJsonBytes(files, "data-handling.json");
  const items = [...manifest.items].sort((left, right) => left.order - right.order);
  return {
    capturedFrom: resolvedPackRoot,
    files,
    lock,
    lockDigest: sha256(files.get("pack-lock.json")),
    manifest,
    taskPack,
    sandboxPolicy,
    dataHandling,
    items,
  };
}

export async function computeRuntimeIdentity(packLockDigest) {
  const inventory = [];
  for (const [label, filename] of runtimeIdentitySources) {
    const content = await readFile(filename);
    inventory.push({ path: label, sha256: sha256(content), bytes: content.byteLength });
  }
  const codeDigest = sha256(canonicalJson(inventory));
  const configurationDigest = sha256(canonicalJson(runtimeConfiguration));
  const identity = {
    packLockDigest,
    codeDigest,
    configurationDigest,
    isolationProfileVersion,
  };
  return {
    runId: `runtime-${sha256(canonicalJson(identity)).slice(0, 20)}`,
    ...identity,
    files: inventory,
  };
}

async function assertRuntimeIdentityUnchanged(identity) {
  const current = await computeRuntimeIdentity(identity.packLockDigest);
  if (canonicalJson(current) !== canonicalJson(identity)) {
    throw new Error("runtime implementation changed after identity capture");
  }
}

async function assertStagedRuntimeMatchesIdentity(workerRuntime, identity) {
  const staged = [
    ["runtime/src/worker.mjs", path.join(workerRuntime, "worker.mjs")],
    ["runtime/src/lib.mjs", path.join(workerRuntime, "lib.mjs")],
    ["runtime/sandbox.sb", path.join(workerRuntime, "sandbox.sb")],
  ];
  const byPath = new Map(identity.files.map((entry) => [entry.path, entry]));
  for (const [label, filename] of staged) {
    const content = await readFile(filename);
    const expected = byPath.get(label);
    if (!expected || expected.sha256 !== sha256(content) || expected.bytes !== content.byteLength) {
      throw new Error("staged worker runtime does not match the recorded identity");
    }
  }
}

async function listenLocally() {
  let connections = 0;
  const server = net.createServer((socket) => {
    connections += 1;
    socket.destroy();
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    port: server.address().port,
    connections: () => connections,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

async function scanTree(root, needles) {
  const found = new Set();
  let files;
  try {
    files = await listRegularFiles(root);
  } catch (error) {
    if (error.code === "ENOENT") return found;
    throw error;
  }
  for (const relative of files) {
    const content = await readFile(path.join(root, relative));
    for (const [label, needle] of needles) {
      if (needle.length > 0 && content.includes(needle)) found.add(label);
    }
  }
  return found;
}

async function runBoundaryProbe({ runRoot, workerRuntime, controllerRoot }) {
  const forbiddenRoot = path.join(controllerRoot, "forbidden");
  const probeBundle = path.join(controllerRoot, `probe-${randomToken(8)}`);
  const probeWork = path.join(runRoot, `probe-work-${randomToken(8)}`);
  const outsideTarget = path.join(controllerRoot, "outside-write-target");
  const outsideSymlinkTarget = path.join(controllerRoot, "outside-symlink-target");
  await mkdir(forbiddenRoot, { recursive: true, mode: 0o700 });
  await mkdir(probeBundle, { recursive: true, mode: 0o700 });
  await mkdir(probeWork, { recursive: true, mode: 0o700 });
  const randomCanaries = {
    future: `future-content-${randomToken()}`,
    manifest: `manifest-${randomToken()}`,
    oracle: `oracle-${randomToken()}`,
    credential: `credential-${randomToken()}`,
  };
  const forbidden = [
    ["future", randomCanaries.future],
    ["manifest", randomCanaries.manifest],
    ["oracle", randomCanaries.oracle],
    ["credential", randomCanaries.credential],
  ];
  for (const [label, value] of forbidden) {
    await writeFile(path.join(forbiddenRoot, label), `${value}\n`, { mode: 0o600 });
  }
  await writeFile(path.join(probeBundle, "source.md"), "probe input\n", { mode: 0o400 });
  await writeFile(outsideTarget, "outside sentinel\n", { mode: 0o600 });
  await writeFile(outsideSymlinkTarget, "symlink sentinel\n", { mode: 0o600 });
  const escapeLink = path.join(probeWork, "escape-link");
  await symlink(outsideSymlinkTarget, escapeLink);
  const listener = await listenLocally();
  const forbiddenReads = forbidden.map(([label]) => ({
    label,
    path: path.join(forbiddenRoot, label),
  }));
  await writeFile(
    path.join(probeBundle, "probe.json"),
    prettyJson({
      forbiddenReads,
      outsideWrite: outsideTarget,
      symlinkWrite: escapeLink,
      listenerPort: listener.port,
    }),
    { mode: 0o400 },
  );
  let result;
  const previousCredentialCanary = process.env.GT_SECRET_CANARY;
  process.env.GT_SECRET_CANARY = randomCanaries.credential;
  try {
    result = await runSandboxedWorker({
      action: "probe",
      bundle: probeBundle,
      state: probeWork,
      runRoot,
      workerRuntime,
    });
  } finally {
    if (previousCredentialCanary === undefined) delete process.env.GT_SECRET_CANARY;
    else process.env.GT_SECRET_CANARY = previousCredentialCanary;
    await listener.close();
  }
  const value = result.value;
  const allReadsDenied = value.reads.length === forbiddenReads.length &&
    value.reads.every(({ denied, code }) => denied && code === "EPERM");
  const writesDenied = [value.inputWrite, value.outsideWrite, value.symlinkWrite].every(
    ({ denied, code }) => denied && code === "EPERM",
  );
  const networkDenied = value.network.connected === false && value.network.code === "EPERM" &&
    listener.connections() === 0;
  const environmentScrubbed = value.environment.credentialCanaryVisible === false &&
    value.environment.homeIsScrubbed === true;
  if (!allReadsDenied || !writesDenied || !networkDenied || !environmentScrubbed) {
    throw new Error("sandbox boundary self-test failed closed");
  }
  await rm(escapeLink, { force: true });
  const leaked = await scanTree(probeWork, Object.entries(randomCanaries).map(([label, token]) => [label, Buffer.from(token)]));
  if (leaked.size > 0) throw new Error("controller-only probe canary reached SUT state");
  await rm(probeBundle, { recursive: true, force: true });
  await rm(probeWork, { recursive: true, force: true });
  return {
    passed: true,
    readsDenied: forbiddenReads.map(({ label }) => label),
    writesDenied: ["input", "outside-workdir", "symlink-escape"],
    networkDenied: true,
    environmentScrubbed: true,
    controllerCanariesAbsent: true,
  };
}

async function countCommits(stateRoot) {
  try {
    const entries = await readdir(path.join(stateRoot, "vault", "commits"), { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).length;
  } catch (error) {
    if (error.code === "ENOENT") return 0;
    throw error;
  }
}

async function currentHead(stateRoot) {
  try {
    return (await currentHeadSelector(stateRoot))?.head ?? null;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function currentHeadSelector(stateRoot) {
  try {
    return JSON.parse(await readFile(path.join(stateRoot, "vault", "head.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function commitDirectories(stateRoot) {
  const commitsRoot = path.join(stateRoot, "vault", "commits");
  let entries;
  try {
    entries = await readdir(commitsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (entries.some((entry) => !entry.isDirectory() || entry.isSymbolicLink())) {
    throw new Error("vault commit inventory contains an unsafe entry");
  }
  return entries.map(({ name }) => name).sort();
}

async function inspectCommittedStep(stateRoot, sequence) {
  const prefix = `${String(sequence).padStart(6, "0")}-`;
  const matches = (await commitDirectories(stateRoot)).filter((name) => name.startsWith(prefix));
  if (matches.length !== 1) throw new Error("vault does not contain exactly one commit for the anchored step");
  const commitDirectory = matches[0];
  const commitRoot = path.join(stateRoot, "vault", "commits", commitDirectory);
  const children = (await readdir(commitRoot, { withFileTypes: true }))
    .map((entry) => ({ name: entry.name, regular: entry.isFile() && !entry.isSymbolicLink() }))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (
    children.some(({ regular }) => !regular) ||
    children.map(({ name }) => name).join(",") !== "candidates.json,checkpoint.json,source.md"
  ) {
    throw new Error("anchored commit inventory is not closed");
  }
  const [checkpointBytes, source, candidates] = await Promise.all([
    readRegularFile(path.join(commitRoot, "checkpoint.json"), { label: "checkpoint" }),
    readRegularFile(path.join(commitRoot, "source.md"), { label: "vault source" }),
    readRegularFile(path.join(commitRoot, "candidates.json"), {
      maxBytes: 2 * 1024 * 1024,
      label: "vault candidates",
    }),
  ]);
  const checkpoint = JSON.parse(checkpointBytes.toString("utf8"));
  const { head: checkpointHead, ...checkpointPayload } = checkpoint;
  if (
    checkpoint.sequence !== sequence ||
    checkpointHead !== sha256(canonicalJson(checkpointPayload)) ||
    checkpoint.sourceSha256 !== sha256(source) ||
    checkpoint.candidatesSha256 !== sha256(candidates)
  ) {
    throw new Error("anchored commit bytes do not match its checkpoint");
  }
  return {
    commitDirectory,
    checkpoint,
    checkpointSha256: sha256(checkpointBytes),
    sourceSha256: sha256(source),
    candidatesSha256: sha256(candidates),
  };
}

async function readControllerAnchors(controllerRoot) {
  const anchorsRoot = path.join(controllerRoot, "anchors");
  let entries;
  try {
    entries = await readdir(anchorsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (entries.some((entry) => !entry.isFile() || entry.isSymbolicLink())) {
    throw new Error("controller anchor inventory contains an unsafe entry");
  }
  const names = entries.map(({ name }) => name).sort();
  const expectedNames = names.map((_, index) => `step-${String(index + 1).padStart(6, "0")}.json`);
  if (canonicalJson(names) !== canonicalJson(expectedNames)) {
    throw new Error("controller anchor sequence is not contiguous");
  }
  return Promise.all(names.map(async (name) => JSON.parse(
    await readFile(path.join(anchorsRoot, name), "utf8"),
  )));
}

async function verifyControllerAnchors({ controllerRoot, stateRoot, identity, allowUnanchoredTail = 0 }) {
  const anchors = await readControllerAnchors(controllerRoot);
  const directories = await commitDirectories(stateRoot);
  if (directories.length !== anchors.length + allowUnanchoredTail) {
    throw new Error("vault commit count diverged from controller-only anchors");
  }
  for (const [index, anchor] of anchors.entries()) {
    const sequence = index + 1;
    const committed = await inspectCommittedStep(stateRoot, sequence);
    if (
      anchor.format !== "graphtruth.experimental.runtime-controller-anchor/0" ||
      anchor.runId !== identity.runId ||
      anchor.sequence !== sequence ||
      anchor.head !== committed.checkpoint.head ||
      anchor.commitDirectory !== committed.commitDirectory ||
      anchor.checkpointSha256 !== committed.checkpointSha256 ||
      anchor.sourceSha256 !== committed.sourceSha256 ||
      anchor.candidatesSha256 !== committed.candidatesSha256
    ) {
      throw new Error("vault history diverged from a controller-only anchor");
    }
  }
  const selector = await currentHeadSelector(stateRoot);
  const terminalAnchor = anchors.at(-1) ?? null;
  const selectorMatchesAnchor = terminalAnchor === null
    ? selector === null
    : selector?.format === "graphtruth.experimental.runtime-head/0" &&
      selector.runId === identity.runId &&
      selector.sequence === terminalAnchor.sequence &&
      selector.head === terminalAnchor.head;
  let selectorMatchesTail = false;
  if (allowUnanchoredTail === 1 && directories.length === anchors.length + 1) {
    const tail = await inspectCommittedStep(stateRoot, anchors.length + 1);
    selectorMatchesTail =
      selector?.format === "graphtruth.experimental.runtime-head/0" &&
      selector.runId === identity.runId &&
      selector.sequence === tail.checkpoint.sequence &&
      selector.head === tail.checkpoint.head;
  }
  if (!selectorMatchesAnchor && !selectorMatchesTail) {
    throw new Error("vault head diverged from controller-only anchors");
  }
  return anchors;
}

async function writeControllerAnchor({ controllerRoot, stateRoot, identity, sequence }) {
  const existing = await verifyControllerAnchors({
    controllerRoot,
    stateRoot,
    identity,
    allowUnanchoredTail: 1,
  });
  if (existing.length !== sequence - 1) throw new Error("controller anchor sequence is out of order");
  const committed = await inspectCommittedStep(stateRoot, sequence);
  const selector = await currentHeadSelector(stateRoot);
  if (
    selector?.format !== "graphtruth.experimental.runtime-head/0" ||
    selector.runId !== identity.runId ||
    selector.sequence !== sequence ||
    selector.head !== committed.checkpoint.head
  ) {
    throw new Error("cannot anchor a commit that is not the selected head");
  }
  const anchorsRoot = path.join(controllerRoot, "anchors");
  await mkdir(anchorsRoot, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(anchorsRoot, `step-${String(sequence).padStart(6, "0")}.json`),
    prettyJson({
      format: "graphtruth.experimental.runtime-controller-anchor/0",
      runId: identity.runId,
      sequence,
      head: committed.checkpoint.head,
      commitDirectory: committed.commitDirectory,
      checkpointSha256: committed.checkpointSha256,
      sourceSha256: committed.sourceSha256,
      candidatesSha256: committed.candidatesSha256,
    }),
    { flag: "wx", mode: 0o600 },
  );
  await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
}

function futureNeedles(pack, nextOrder) {
  const needles = [];
  for (const item of pack.items.filter(({ order }) => order > nextOrder)) {
    needles.push([`future-source-${item.order}`, pack.files.get(item.path)]);
    needles.push([`future-filename-${item.order}`, Buffer.from(path.basename(item.path))]);
  }
  const canary = pack.sandboxPolicy.negativeFixtures.find(({ id }) => id === "future-filename-canary");
  needles.push(["future-canary-filename", Buffer.from(path.basename(canary.path))]);
  needles.push(["manifest", pack.files.get("corpus-manifest.json")]);
  needles.push(["oracle", pack.files.get("oracle.json")]);
  return needles;
}

async function makeRevealBundle({ controllerRoot, identity, item, tasks, source }) {
  const revealId = opaqueId("reveal", identity.runId, String(item.order));
  const bundleRoot = path.join(controllerRoot, opaqueId("bundle", identity.runId, String(item.order)));
  await mkdir(bundleRoot, { recursive: false, mode: 0o700 });
  const taskBytes = Buffer.from(prettyJson(tasks));
  await writeFile(path.join(bundleRoot, "source.md"), source, { mode: 0o400 });
  await writeFile(path.join(bundleRoot, "tasks.json"), taskBytes, { mode: 0o400 });
  await writeFile(
    path.join(bundleRoot, "bundle.json"),
    prettyJson({
      format: "graphtruth.experimental.reveal-bundle/0",
      runId: identity.runId,
      revealId,
      order: item.order,
      sourceSha256: item.sha256,
      sourceBytes: item.bytes,
      tasksSha256: sha256(taskBytes),
    }),
    { mode: 0o400 },
  );
  return bundleRoot;
}

export function projectTaskForSut(task) {
  return {
    id: task.id,
    question: task.question,
    allowedInterpretation: task.allowedInterpretation,
    evaluatedAtStep: task.evaluatedAtStep,
    sutAllowedTools: task.sutAllowedTools,
    timeoutSeconds: task.timeoutSeconds,
  };
}

function assertNotCancelled(isCancelled) {
  if (isCancelled?.()) throw new Error("rehearsal interrupted by operator signal");
}

export async function runPackAttempt({
  pack,
  runRoot,
  exerciseFaults = true,
  boundaryProbe = true,
  isCancelled,
}) {
  assertNotCancelled(isCancelled);
  await mkdir(runRoot, { recursive: false, mode: 0o700 });
  const controllerRoot = path.join(runRoot, "controller");
  const stateRoot = path.join(runRoot, "sut");
  const workerRuntime = path.join(runRoot, "worker-runtime");
  await mkdir(controllerRoot, { mode: 0o700 });
  await mkdir(stateRoot, { mode: 0o700 });
  await mkdir(workerRuntime, { mode: 0o700 });
  await copyFile(path.join(sourceDirectory, "worker.mjs"), path.join(workerRuntime, "worker.mjs"));
  await copyFile(path.join(sourceDirectory, "lib.mjs"), path.join(workerRuntime, "lib.mjs"));
  await copyFile(path.join(runtimeRoot, "sandbox.sb"), path.join(workerRuntime, "sandbox.sb"));
  const identity = await computeRuntimeIdentity(pack.lockDigest);
  await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
  await assertRuntimeIdentityUnchanged(identity);
  const attemptId = `attempt-${randomToken(12)}`;
  await writeFile(
    path.join(controllerRoot, "run-identity.json"),
    prettyJson({
      format: "graphtruth.experimental.runtime-attempt/0",
      attemptId,
      packId: pack.lock.packId,
      identity,
    }),
    { mode: 0o600 },
  );
  const observations = [];
  await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
  if (boundaryProbe) {
    observations.push({
      id: "sandbox-boundary",
      ...(await runBoundaryProbe({ runRoot, workerRuntime, controllerRoot })),
    });
    if ((await readdir(stateRoot)).length !== 0) {
      throw new Error("boundary probe contaminated the SUT state");
    }
    await assertRuntimeIdentityUnchanged(identity);
    await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
  }
  const faultByStep = exerciseFaults
    ? new Map([[3, "before-publication"], [4, "after-publication"]])
    : new Map();
  let finalResult = null;
  for (const item of pack.items) {
    assertNotCancelled(isCancelled);
    await assertRuntimeIdentityUnchanged(identity);
    await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
    await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
    const source = pack.files.get(item.path);
    if (sha256(source) !== item.sha256 || source.byteLength !== item.bytes) {
      throw new Error("controller snapshot does not match the frozen source inventory");
    }
    const tasks = pack.taskPack.tasks
      .filter(({ evaluatedAtStep }) => evaluatedAtStep === item.order)
      .map(projectTaskForSut);
    const bundleRoot = await makeRevealBundle({ controllerRoot, identity, item, tasks, source });
    const fault = faultByStep.get(item.order);
    const headBeforeFault = await currentHead(stateRoot);
    const commitsBeforeFault = await countCommits(stateRoot);
    if (fault) {
      const failed = await runSandboxedWorker({
        action: "ingest",
        bundle: bundleRoot,
        state: stateRoot,
        runRoot,
        workerRuntime,
        fault,
      });
      if (!failed.injectedFault) throw new Error(`worker did not stop at ${fault}`);
      const headAfterFault = await currentHead(stateRoot);
      const commitsAfterFault = await countCommits(stateRoot);
      const beforePublicationPreserved =
        fault === "before-publication" &&
        headAfterFault === headBeforeFault &&
        commitsAfterFault === commitsBeforeFault;
      const publishedCommitPreserved =
        fault === "after-publication" &&
        headAfterFault === headBeforeFault &&
        commitsAfterFault === commitsBeforeFault + 1;
      if (fault === "before-publication" && !beforePublicationPreserved) {
        throw new Error("before-publication fault changed published vault state");
      }
      if (fault === "after-publication" && !publishedCommitPreserved) {
        throw new Error("after-publication fault did not preserve exactly one unselected commit");
      }
      if (activeSandboxChildren() !== 0) throw new Error("faulted sandbox child was not joined");
      await verifyControllerAnchors({
        controllerRoot,
        stateRoot,
        identity,
        allowUnanchoredTail: fault === "after-publication" ? 1 : 0,
      });
      observations.push({
        id: `crash-${fault}`,
        passed: true,
        processTermination: failed.signal ?? "SIGKILL",
        priorHeadPreserved: beforePublicationPreserved,
        publishedCommitPreserved,
        selectorAdvancedBeforeRecovery: false,
      });
    }
    const completed = await runSandboxedWorker({
      action: "ingest",
      bundle: bundleRoot,
      state: stateRoot,
      runRoot,
      workerRuntime,
    });
    assertNotCancelled(isCancelled);
    finalResult = completed.value;
    if (finalResult.commitCount !== item.order) throw new Error("resume did not publish exactly one checkpoint");
    if (
      fault === "before-publication" && finalResult.action !== "published" ||
      fault === "after-publication" && finalResult.action !== "exact-redelivery"
    ) {
      throw new Error("fault recovery followed an unexpected publication path");
    }
    await assertRuntimeIdentityUnchanged(identity);
    await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
    await writeControllerAnchor({ controllerRoot, stateRoot, identity, sequence: item.order });
    if (item.order === 1) {
      observations.push({ id: "deterministic-order-and-first-reveal", passed: true });
    }

    if (item.order === 2) {
      const before = {
        head: finalResult.head,
        semanticDigest: finalResult.semanticDigest,
        commits: await countCommits(stateRoot),
      };
      await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
      const redelivery = await runSandboxedWorker({
        action: "ingest",
        bundle: bundleRoot,
        state: stateRoot,
        runRoot,
        workerRuntime,
      });
      const after = {
        head: redelivery.value.head,
        semanticDigest: redelivery.value.semanticDigest,
        commits: await countCommits(stateRoot),
      };
      if (redelivery.value.action !== "exact-redelivery" || canonicalJson(before) !== canonicalJson(after)) {
        throw new Error("exact redelivery changed semantic state");
      }
      await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
      observations.push({ id: "exact-redelivery", passed: true, commitCount: after.commits });
    }

    const leaked = await scanTree(stateRoot, futureNeedles(pack, item.order));
    if (leaked.size > 0) throw new Error(`future boundary leak after step ${item.order}`);
    observations.push({ id: `future-boundary-step-${item.order}`, passed: true });
    await rm(bundleRoot, { recursive: true, force: true });
    try {
      await access(bundleRoot);
      throw new Error("reveal bundle survived cleanup");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  const beforeRebuild = finalResult;
  await assertRuntimeIdentityUnchanged(identity);
  await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
  await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
  const projectionResidue = `projection-residue-${randomToken()}`;
  await writeFile(path.join(stateRoot, "projection", "residue-canary"), projectionResidue);
  const rebuilt = await runSandboxedWorker({
    action: "rebuild",
    state: stateRoot,
    runRoot,
    workerRuntime,
  });
  if (
    rebuilt.value.semanticDigest !== beforeRebuild.semanticDigest ||
    rebuilt.value.head !== beforeRebuild.head ||
    rebuilt.value.commitCount !== beforeRebuild.commitCount
  ) {
    throw new Error("projection rebuild changed semantic state");
  }
  const residue = await scanTree(stateRoot, [["projection-residue", Buffer.from(projectionResidue)]]);
  if (residue.size > 0) throw new Error("projection rebuild retained deleted residue");
  observations.push({ id: "projection-delete-rebuild", passed: true });
  await assertRuntimeIdentityUnchanged(identity);
  await assertStagedRuntimeMatchesIdentity(workerRuntime, identity);
  const anchors = await verifyControllerAnchors({ controllerRoot, stateRoot, identity });
  if (anchors.length !== rebuilt.value.commitCount) throw new Error("controller anchor inventory is incomplete");
  observations.push({ id: "controller-only-history-anchors", passed: true, count: anchors.length });

  const stagingExists = await access(path.join(stateRoot, "vault", "staging"))
    .then(() => true)
    .catch((error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    });
  if (stagingExists) throw new Error("staging state survived completed replay");
  observations.push({ id: "temporary-bundle-cleanup", passed: true });
  if (activeSandboxChildren() !== 0) throw new Error("sandbox child remained after worker completion");
  observations.push({ id: "child-processes-joined", passed: true });
  assertNotCancelled(isCancelled);
  return {
    attemptId,
    identity,
    semanticDigest: rebuilt.value.semanticDigest,
    head: rebuilt.value.head,
    commitCount: rebuilt.value.commitCount,
    candidateCount: rebuilt.value.candidateCount,
    observations,
  };
}

async function removeAndVerify(root) {
  if (activeSandboxChildren() !== 0) throw new Error("cannot delete a run with a live sandbox child");
  await rm(root, { recursive: true, force: true });
  try {
    await lstat(root);
    throw new Error("whole-run deletion did not remove the run root");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function rehearseOnePack({ pack, sessionRoot, label, isCancelled }) {
  const primaryRoot = path.join(sessionRoot, `attempt-${randomToken(12)}`);
  const cleanRoot = path.join(sessionRoot, `attempt-${randomToken(12)}`);
  const primary = await runPackAttempt({
    pack,
    runRoot: primaryRoot,
    exerciseFaults: true,
    boundaryProbe: true,
    isCancelled,
  });
  assertNotCancelled(isCancelled);
  await removeAndVerify(primaryRoot);
  const clean = await runPackAttempt({
    pack,
    runRoot: cleanRoot,
    exerciseFaults: false,
    boundaryProbe: false,
    isCancelled,
  });
  if (
    clean.semanticDigest !== primary.semanticDigest ||
    clean.head !== primary.head ||
    canonicalJson(clean.identity) !== canonicalJson(primary.identity)
  ) {
    throw new Error("clean rerun is not semantically equivalent");
  }
  assertNotCancelled(isCancelled);
  await removeAndVerify(cleanRoot);
  return {
    label,
    packId: pack.lock.packId,
    packLockDigest: pack.lockDigest,
    identity: primary.identity,
    semanticDigest: primary.semanticDigest,
    head: primary.head,
    commitCount: primary.commitCount,
    candidateCount: primary.candidateCount,
    observations: [
      ...primary.observations,
      { id: "whole-run-deletion", passed: true },
      { id: "clean-rerun-equivalence", passed: true },
    ],
  };
}

async function gitHead() {
  try {
    return (await execFile("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot })).stdout.trim();
  } catch {
    return "unavailable";
  }
}

async function gitWorktreeState() {
  try {
    const output = (await execFile(
      "git",
      ["status", "--porcelain=v1", "--untracked-files=all"],
      { cwd: repositoryRoot, maxBuffer: 1024 * 1024 },
    )).stdout;
    const entries = output.split(/\r?\n/).filter(Boolean).sort();
    return {
      dirty: entries.length > 0,
      statusDigest: sha256(canonicalJson(entries)),
      entryCount: entries.length,
    };
  } catch {
    return { dirty: null, statusDigest: "unavailable", entryCount: null };
  }
}

export async function runRecordedRehearsal(options = {}) {
  await assertIsolationAvailable();
  const requestedSessionParent = options.sessionParent ?? "/tmp";
  await mkdir(requestedSessionParent, { recursive: true, mode: 0o700 });
  const [sessionParent, systemTemporaryRoot] = await Promise.all([
    realpath(requestedSessionParent),
    realpath("/tmp"),
  ]);
  if (
    sessionParent !== systemTemporaryRoot &&
    !sessionParent.startsWith(`${systemTemporaryRoot}${path.sep}`)
  ) {
    throw new Error("session parent must be inside the local /tmp isolation root");
  }
  const sessionRoot = await mkdtemp(path.join(sessionParent, "runtime-rehearsal-"));
  const seed = options.seed ?? randomBytes(18).toString("hex");
  let failureIdentity = null;
  try {
    assertNotCancelled(options.isCancelled);
    const checkedPack = await snapshotFrozenPack(options.packRoot ?? defaultPackDirectory);
    assertNotCancelled(options.isCancelled);
    failureIdentity = await computeRuntimeIdentity(checkedPack.lockDigest);
    const capturedTemplateRoot = path.join(sessionRoot, "captured-template");
    await materializePackFiles(checkedPack.files, capturedTemplateRoot);
    const generatedRoot = path.join(sessionRoot, "generated-pack");
    const generatedInfo = await generateSyntheticPack(capturedTemplateRoot, generatedRoot, seed);
    const generatedPack = await snapshotFrozenPack(generatedRoot);
    assertNotCancelled(options.isCancelled);
    await removeAndVerify(capturedTemplateRoot);
    await removeAndVerify(generatedRoot);
    await assertRuntimeIdentityUnchanged(failureIdentity);
    const checked = await rehearseOnePack({
      pack: checkedPack,
      sessionRoot,
      label: "checked",
      isCancelled: options.isCancelled,
    });
    const generated = await rehearseOnePack({
      pack: generatedPack,
      sessionRoot,
      label: "generated",
      isCancelled: options.isCancelled,
    });
    assertNotCancelled(options.isCancelled);
    if (checked.semanticDigest === generated.semanticDigest || checked.head === generated.head) {
      throw new Error("generated pack did not produce an independent semantic state");
    }
    if (
      canonicalJson(checked.identity) !== canonicalJson(failureIdentity) ||
      checked.identity.codeDigest !== generated.identity.codeDigest ||
      checked.identity.configurationDigest !== generated.identity.configurationDigest
    ) {
      throw new Error("runtime implementation changed between pack attempts");
    }
    const worktree = await gitWorktreeState();
    const result = {
      format: "graphtruth.experimental.runtime-rehearsal-report/0",
      observedAt: new Date().toISOString(),
      status: "passed",
      command: `./runtime/replay rehearse --seed ${seed}`,
      environment: {
        node: process.version,
        platform: process.platform,
        architecture: process.arch,
        kernelRelease: os.release(),
        isolationProfileVersion,
        gitHead: await gitHead(),
        gitWorktree: worktree,
      },
      generatedSeed: seed,
      generatedFactsDigest: sha256(canonicalJson({
        projectName: generatedInfo.projectName,
        connector: generatedInfo.connector,
        oldDay: generatedInfo.oldDay,
        newDay: generatedInfo.newDay,
        sourceMarkers: generatedInfo.sourceMarkers,
        futureCanary: generatedInfo.futureCanary,
      })),
      runs: [checked, generated],
      expected: [
        "validate the exact captured pack bytes and reveal sources in declared chronological order",
        "deny future, oracle, manifest, credential, network, and outside-workdir access",
        "publish an exact-evidence hash chain anchored outside the worker boundary",
        "resume both declared crash points without semantic duplication",
        "delete and rebuild the disposable projection without semantic change",
        "delete the complete run and reproduce the same state from a clean rerun",
        "run a freshly generated sealed pack without checked-fixture assumptions",
      ],
      learned: [
        "The checked-in static pack can drive a real isolated reveal loop from a validated byte snapshot.",
        "Anchored passages are sufficient provisional deterministic candidates for the first runtime boundary test.",
        "Controller-only head anchors make self-consistent rewriting of earlier worker commits detectable.",
        "The exercised crash boundary is process termination, not operating-system or power-loss durability.",
        "Projection rebuild has no concurrent reader or atomic generation switch in this first skeleton.",
        "Trusted stable local code and input roots are a precondition; a malicious concurrent same-UID race is outside this rehearsal.",
        "Runtime formats remain Zone 3 laboratory artifacts and carry no protocol authority.",
      ],
      deviations: worktree.dirty === true
        ? ["Recorded from a dirty worktree; runtime identity binds the exact executable bytes, while gitHead alone does not contain them."]
        : [],
      ownerSignoff: {
        isolationAndDeletion: "pending",
        note: "Owner confirmation is required before any private corpus is admitted.",
      },
    };
    assertNotCancelled(options.isCancelled);
    await removeAndVerify(sessionRoot);
    return result;
  } catch (error) {
    try {
      await writeFile(
        path.join(sessionRoot, "failure.json"),
        prettyJson({
          format: "graphtruth.experimental.runtime-failure/0",
          status: "failed",
          observedAt: new Date().toISOString(),
          errorName: error.name,
          errorDigest: sha256(String(error.message)),
          initialIdentity: failureIdentity,
          preserved: true,
          note: "Inspect controller-only attempt identities and artifacts before any retry.",
        }),
        { flag: "wx", mode: 0o600 },
      );
    } catch (recordError) {
      error.failureRecordError = recordError;
    }
    error.preservedAttemptRoot = sessionRoot;
    throw error;
  }
}

function yesNo(value) {
  return value ? "PASS" : "FAIL";
}

export function formatRehearsalMarkdown(report) {
  const lines = [
    "# Synthetic runtime rehearsal",
    "",
    `- Status: \`${report.status}\``,
    `- Observed at: \`${report.observedAt}\``,
    `- Git head: \`${report.environment.gitHead}\``,
    `- Git worktree: \`${report.environment.gitWorktree.dirty ? "dirty" : "clean"}\` (` +
      `\`${report.environment.gitWorktree.statusDigest}\`)`,
    `- Runtime: \`${report.environment.node}\` on \`${report.environment.platform}/${report.environment.architecture}\``,
    `- Kernel release: \`${report.environment.kernelRelease}\``,
    `- Isolation: \`${report.environment.isolationProfileVersion}\``,
    `- Generated seed: \`${report.generatedSeed}\``,
    `- Reproduction: \`${report.command}\``,
    "",
    "## Expected",
    "",
    ...report.expected.map((value) => `- ${value}`),
    "",
    "## Observed",
    "",
    "| Pack | Runtime identity | Commits | Candidates | Semantic digest |",
    "| --- | --- | ---: | ---: | --- |",
    ...report.runs.map(
      (run) => `| ${run.label} | \`${run.identity.runId}\` | ${run.commitCount} | ${run.candidateCount} | \`${run.semanticDigest}\` |`,
    ),
    "",
  ];
  for (const run of report.runs) {
    lines.push(`### ${run.label}`, "");
    for (const observation of run.observations) {
      lines.push(`- ${yesNo(observation.passed)} — \`${observation.id}\``);
    }
    lines.push("");
  }
  lines.push(
    "## Learned",
    "",
    ...report.learned.map((value) => `- ${value}`),
    "",
    "## Deviations",
    "",
    report.deviations.length === 0 ? "None." : report.deviations.map((value) => `- ${value}`).join("\n"),
    "",
    "## Owner sign-off",
    "",
    `- Isolation and deletion: \`${report.ownerSignoff.isolationAndDeletion}\``,
    `- ${report.ownerSignoff.note}`,
  );
  return `${lines.join("\n")}\n`;
}
