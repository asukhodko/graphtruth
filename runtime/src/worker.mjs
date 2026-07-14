import { parseArgs } from "node:util";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  canonicalJson,
  extractAnchoredCandidates,
  maxSourceBytes,
  prettyJson,
  readJson,
  readRegularFile,
  sha256,
  tokenize,
  writeJsonAtomic,
  writeJsonNew,
} from "./lib.mjs";

export const faultSignal = "SIGKILL";
const projectedTaskKeys = [
  "allowedInterpretation",
  "evaluatedAtStep",
  "id",
  "question",
  "sutAllowedTools",
  "timeoutSeconds",
];

function checkpointPayload(value) {
  const { head: _head, ...payload } = value;
  return payload;
}

function commitDirectoryName(sequence, eventId) {
  return `${String(sequence).padStart(6, "0")}-${eventId}`;
}

function isProjectedTask(task, order) {
  return (
    task !== null &&
    typeof task === "object" &&
    !Array.isArray(task) &&
    canonicalJson(Object.keys(task).sort()) === canonicalJson(projectedTaskKeys) &&
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.question === "string" &&
    typeof task.allowedInterpretation === "string" &&
    task.evaluatedAtStep === order &&
    Array.isArray(task.sutAllowedTools) &&
    task.sutAllowedTools.every((tool) => typeof tool === "string") &&
    Number.isFinite(task.timeoutSeconds) &&
    task.timeoutSeconds > 0
  );
}

async function loadCommits(stateRoot, options = {}) {
  const { allowSelectorLag = false } = options;
  const commitsRoot = path.join(stateRoot, "vault", "commits");
  let entries;
  try {
    entries = await readdir(commitsRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") entries = [];
    else throw error;
  }
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const commits = [];
  let expectedPreviousHead = null;
  let expectedRunId = null;
  for (const [index, entry] of entries.entries()) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error("vault contains an unsafe commit entry");
    const commitRoot = path.join(commitsRoot, entry.name);
    const children = await readdir(commitRoot, { withFileTypes: true });
    if (
      children.some((child) => child.isSymbolicLink()) ||
      children.some((child) => !child.isFile()) ||
      children.map(({ name }) => name).sort().join(",") !== "candidates.json,checkpoint.json,source.md"
    ) {
      throw new Error("commit inventory is not closed");
    }
    const checkpoint = await readJson(path.join(commitRoot, "checkpoint.json"));
    const source = await readRegularFile(path.join(commitRoot, "source.md"), {
      maxBytes: maxSourceBytes,
      label: "vault source",
    });
    const candidatesBytes = await readRegularFile(path.join(commitRoot, "candidates.json"), {
      maxBytes: maxSourceBytes * 2,
      label: "vault candidates",
    });
    const candidates = JSON.parse(candidatesBytes.toString("utf8"));
    const expectedSequence = index + 1;
    const expectedHead = sha256(canonicalJson(checkpointPayload(checkpoint)));
    const extractedCandidates = extractAnchoredCandidates(
      source,
      checkpoint.sourceSha256,
      checkpoint.revealId,
    );
    const reconstructedInput = {
      runId: checkpoint.runId,
      revealId: checkpoint.revealId,
      order: checkpoint.sequence,
      sourceSha256: checkpoint.sourceSha256,
      sourceBytes: checkpoint.sourceBytes,
      candidatesSha256: checkpoint.candidatesSha256,
      tasksSha256: checkpoint.tasksSha256,
      taskIds: checkpoint.taskIds,
    };
    const expectedInputDigest = sha256(canonicalJson(reconstructedInput));
    const expectedEventId = `event-${expectedInputDigest.slice(0, 24)}`;
    if (
      checkpoint.format !== "graphtruth.experimental.runtime-checkpoint/0" ||
      checkpoint.sequence !== expectedSequence ||
      typeof checkpoint.runId !== "string" ||
      checkpoint.runId.length === 0 ||
      (expectedRunId !== null && checkpoint.runId !== expectedRunId) ||
      checkpoint.previousHead !== expectedPreviousHead ||
      checkpoint.head !== expectedHead ||
      checkpoint.sourceSha256 !== sha256(source) ||
      checkpoint.sourceBytes !== source.byteLength ||
      checkpoint.candidatesSha256 !== sha256(candidatesBytes) ||
      checkpoint.inputDigest !== expectedInputDigest ||
      checkpoint.eventId !== expectedEventId ||
      !/^[a-f0-9]{64}$/.test(checkpoint.tasksSha256) ||
      !Array.isArray(checkpoint.taskIds) ||
      checkpoint.taskIds.some((id) => typeof id !== "string") ||
      canonicalJson(checkpoint.taskIds) !== canonicalJson([...new Set(checkpoint.taskIds)].sort()) ||
      canonicalJson(candidates) !== canonicalJson(extractedCandidates) ||
      !Array.isArray(candidates) ||
      entry.name !== commitDirectoryName(checkpoint.sequence, checkpoint.eventId)
    ) {
      throw new Error("vault hash chain verification failed");
    }
    for (const candidate of candidates) {
      const evidence = candidate?.evidence?.[0];
      const span = source.subarray(evidence?.byteStart, evidence?.byteEnd);
      if (
        candidate?.format !== "graphtruth.experimental.runtime-candidate/0" ||
        evidence?.snapshotSha256 !== checkpoint.sourceSha256 ||
        sha256(span) !== evidence?.spanSha256 ||
        span.toString("utf8") !== candidate?.payload?.text
      ) {
        throw new Error("candidate evidence verification failed");
      }
    }
    commits.push({ root: commitRoot, checkpoint, source, candidates });
    expectedPreviousHead = checkpoint.head;
    expectedRunId = checkpoint.runId;
  }
  let selector = null;
  try {
    selector = await readJson(path.join(stateRoot, "vault", "head.json"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const terminal = commits.at(-1)?.checkpoint ?? null;
  let selectorLag = false;
  if (terminal === null && selector !== null) {
    throw new Error("vault terminal head verification failed");
  }
  if (terminal !== null) {
    const exact =
      selector?.format === "graphtruth.experimental.runtime-head/0" &&
      selector.runId === terminal.runId &&
      selector.sequence === terminal.sequence &&
      selector.head === terminal.head;
    const onePublicationBehind =
      allowSelectorLag &&
      ((terminal.sequence === 1 && selector === null) ||
        (selector?.format === "graphtruth.experimental.runtime-head/0" &&
          selector.runId === terminal.runId &&
          selector.sequence === terminal.sequence - 1 &&
          selector.head === terminal.previousHead));
    if (!exact && !onePublicationBehind) throw new Error("vault terminal head verification failed");
    selectorLag = onePublicationBehind;
  }
  Object.defineProperty(commits, "selectorLag", { value: selectorLag, enumerable: false });
  return commits;
}

function dossierFor(commits, asOfStep) {
  const visible = commits.filter(({ checkpoint }) => checkpoint.sequence <= asOfStep);
  const byCandidate = new Map();
  for (const { checkpoint, candidates } of visible) {
    for (const candidate of candidates) {
      const semantic = {
        status: candidate.status,
        role: candidate.role,
        producer: candidate.producer,
        payload: candidate.payload,
        evidence: candidate.evidence,
      };
      const existing = byCandidate.get(candidate.candidateId);
      if (existing) {
        if (canonicalJson(existing.semantic) !== canonicalJson(semantic)) {
          throw new Error("candidate identity collision across checkpoints");
        }
        existing.occurrences.push({ revealId: checkpoint.revealId, step: checkpoint.sequence });
      } else {
        byCandidate.set(candidate.candidateId, {
          semantic,
          passage: {
            candidateId: candidate.candidateId,
            firstRevealId: checkpoint.revealId,
            firstStep: checkpoint.sequence,
            status: candidate.status,
            role: candidate.role,
            payload: candidate.payload,
            evidence: candidate.evidence,
          },
          occurrences: [{ revealId: checkpoint.revealId, step: checkpoint.sequence }],
        });
      }
    }
  }
  const passages = [...byCandidate.values()]
    .map(({ passage, occurrences }) => ({ ...passage, occurrences }))
    .sort((left, right) => left.firstStep - right.firstStep || left.candidateId.localeCompare(right.candidateId));
  return {
    format: "graphtruth.experimental.runtime-dossier/0",
    asOfStep,
    head: visible.at(-1)?.checkpoint.head ?? null,
    passages,
  };
}

export async function rebuildProjection(stateRoot) {
  const commits = await loadCommits(stateRoot);
  const projectionRoot = path.join(stateRoot, "projection");
  await rm(projectionRoot, { recursive: true, force: true });
  await mkdir(path.join(projectionRoot, "dossiers"), { recursive: true });
  await mkdir(path.join(projectionRoot, "deltas"), { recursive: true });

  const completeDossier = dossierFor(commits, commits.length);
  const lexicalEntries = completeDossier.passages.map((candidate) => ({
    candidateId: candidate.candidateId,
    firstStep: candidate.firstStep,
    occurrences: candidate.occurrences,
    tokens: tokenize(candidate.payload.text),
    evidence: candidate.evidence,
  }));
  lexicalEntries.sort((left, right) => left.candidateId.localeCompare(right.candidateId));
  const lexical = {
    format: "graphtruth.experimental.runtime-lexical-projection/0",
    head: commits.at(-1)?.checkpoint.head ?? null,
    entries: lexicalEntries,
  };
  await writeJsonAtomic(path.join(projectionRoot, "lexical.json"), lexical);

  let previousIds = new Set();
  let previousOccurrenceCounts = new Map();
  const deltas = [];
  for (let step = 1; step <= commits.length; step += 1) {
    const dossier = dossierFor(commits, step);
    await writeJsonAtomic(
      path.join(projectionRoot, "dossiers", `as-of-${String(step).padStart(6, "0")}.json`),
      dossier,
    );
    const currentIds = new Set(dossier.passages.map(({ candidateId }) => candidateId));
    const currentOccurrenceCounts = new Map(
      dossier.passages.map(({ candidateId, occurrences }) => [candidateId, occurrences.length]),
    );
    const delta = {
      format: "graphtruth.experimental.runtime-step-delta/0",
      step,
      head: dossier.head,
      addedCandidateIds: [...currentIds].filter((id) => !previousIds.has(id)).sort(),
      removedCandidateIds: [...previousIds].filter((id) => !currentIds.has(id)).sort(),
      changedCandidateIds: [...currentIds]
        .filter((id) => currentOccurrenceCounts.get(id) !== previousOccurrenceCounts.get(id))
        .sort(),
    };
    deltas.push(delta);
    await writeJsonAtomic(
      path.join(projectionRoot, "deltas", `step-${String(step).padStart(6, "0")}.json`),
      delta,
    );
    previousIds = currentIds;
    previousOccurrenceCounts = currentOccurrenceCounts;
  }
  const current = dossierFor(commits, commits.length);
  await writeJsonAtomic(path.join(projectionRoot, "dossiers", "current.json"), current);
  const persistedAsOf = [];
  const persistedDeltas = [];
  for (let step = 1; step <= commits.length; step += 1) {
    persistedAsOf.push(await readJson(
      path.join(projectionRoot, "dossiers", `as-of-${String(step).padStart(6, "0")}.json`),
    ));
    persistedDeltas.push(await readJson(
      path.join(projectionRoot, "deltas", `step-${String(step).padStart(6, "0")}.json`),
    ));
  }
  const persistedLexical = await readJson(path.join(projectionRoot, "lexical.json"));
  const persistedCurrent = await readJson(path.join(projectionRoot, "dossiers", "current.json"));
  const semantic = {
    head: persistedCurrent.head,
    lexical: persistedLexical,
    current: persistedCurrent,
    asOf: persistedAsOf,
    deltas: persistedDeltas,
  };
  return {
    head: persistedCurrent.head,
    commitCount: commits.length,
    candidateCount: lexicalEntries.length,
    semanticDigest: sha256(canonicalJson(semantic)),
  };
}

async function ingest(bundleRoot, stateRoot, fault) {
  const bundle = await readJson(path.join(bundleRoot, "bundle.json"));
  const source = await readRegularFile(path.join(bundleRoot, "source.md"), {
    maxBytes: maxSourceBytes,
    label: "source",
  });
  const tasksBytes = await readRegularFile(path.join(bundleRoot, "tasks.json"), {
    maxBytes: maxSourceBytes,
    label: "tasks",
  });
  const tasks = JSON.parse(tasksBytes.toString("utf8"));
  if (
    bundle.format !== "graphtruth.experimental.reveal-bundle/0" ||
    !/^runtime-[a-f0-9]{20}$/.test(bundle.runId) ||
    !/^reveal-[a-f0-9]{20}$/.test(bundle.revealId) ||
    !Number.isInteger(bundle.order) ||
    bundle.order < 1 ||
    bundle.sourceSha256 !== sha256(source) ||
    bundle.sourceBytes !== source.byteLength ||
    bundle.tasksSha256 !== sha256(tasksBytes) ||
    !Array.isArray(tasks) ||
    tasks.some((task) => !isProjectedTask(task, bundle.order)) ||
    new Set(tasks.map(({ id }) => id)).size !== tasks.length
  ) {
    throw new Error("reveal bundle integrity check failed");
  }
  const candidates = extractAnchoredCandidates(source, bundle.sourceSha256, bundle.revealId);
  const candidatesBytes = Buffer.from(prettyJson(candidates));
  if (candidatesBytes.byteLength > maxSourceBytes * 2) {
    throw new Error("candidate output exceeds the experimental size limit");
  }
  const candidatesSha256 = sha256(candidatesBytes);
  const input = {
    runId: bundle.runId,
    revealId: bundle.revealId,
    order: bundle.order,
    sourceSha256: bundle.sourceSha256,
    sourceBytes: source.byteLength,
    candidatesSha256,
    tasksSha256: bundle.tasksSha256,
    taskIds: tasks.map(({ id }) => id).sort(),
  };
  const inputDigest = sha256(canonicalJson(input));
  const eventId = `event-${inputDigest.slice(0, 24)}`;
  let commits = await loadCommits(stateRoot, { allowSelectorLag: true });
  const stateRunId = commits[0]?.checkpoint.runId;
  if (stateRunId && stateRunId !== bundle.runId) throw new Error("vault run identity mismatch");
  const existing = commits.find(({ checkpoint }) => checkpoint.eventId === eventId);
  if (commits.selectorLag) {
    if (existing !== commits.at(-1)) throw new Error("cannot recover an unrecognized published commit");
    await writeJsonAtomic(path.join(stateRoot, "vault", "head.json"), {
      format: "graphtruth.experimental.runtime-head/0",
      runId: existing.checkpoint.runId,
      sequence: existing.checkpoint.sequence,
      head: existing.checkpoint.head,
    });
  }
  if (existing) {
    if (existing.checkpoint.inputDigest !== inputDigest) throw new Error("event identity collision");
    const projection = await rebuildProjection(stateRoot);
    return { action: "exact-redelivery", eventId, ...projection };
  }
  if (bundle.order !== commits.length + 1) throw new Error("reveal is out of order");

  const previousHead = commits.at(-1)?.checkpoint.head ?? null;
  const checkpoint = {
    format: "graphtruth.experimental.runtime-checkpoint/0",
    runId: bundle.runId,
    sequence: bundle.order,
    revealId: bundle.revealId,
    eventId,
    inputDigest,
    sourceSha256: bundle.sourceSha256,
    sourceBytes: source.byteLength,
    candidatesSha256,
    tasksSha256: bundle.tasksSha256,
    taskIds: input.taskIds,
    previousHead,
  };
  checkpoint.head = sha256(canonicalJson(checkpoint));

  const vaultRoot = path.join(stateRoot, "vault");
  const stagingRoot = path.join(vaultRoot, "staging");
  const stage = path.join(stagingRoot, eventId);
  await rm(stagingRoot, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  await writeFile(path.join(stage, "source.md"), source, { flag: "wx", mode: 0o600 });
  await writeFile(path.join(stage, "candidates.json"), candidatesBytes, { flag: "wx", mode: 0o600 });
  await writeJsonNew(path.join(stage, "checkpoint.json"), checkpoint);
  if (fault === "before-publication") process.kill(process.pid, faultSignal);

  const commitsRoot = path.join(vaultRoot, "commits");
  await mkdir(commitsRoot, { recursive: true });
  const commitRoot = path.join(commitsRoot, commitDirectoryName(bundle.order, eventId));
  await rename(stage, commitRoot);
  await rm(stagingRoot, { recursive: true, force: true });
  if (fault === "after-publication") process.kill(process.pid, faultSignal);
  await writeJsonAtomic(path.join(vaultRoot, "head.json"), {
    format: "graphtruth.experimental.runtime-head/0",
    runId: bundle.runId,
    sequence: bundle.order,
    head: checkpoint.head,
  });

  commits = await loadCommits(stateRoot);
  if (commits.length !== bundle.order) throw new Error("published commit is not visible");
  const projection = await rebuildProjection(stateRoot);
  return { action: "published", eventId, ...projection };
}

function connectProbe(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(1000, () => finish({ connected: false, code: "TIMEOUT" }));
    socket.on("connect", () => finish({ connected: true, code: null }));
    socket.on("error", (error) => finish({ connected: false, code: error.code ?? "ERROR" }));
  });
}

async function attempt(label, operation) {
  try {
    await operation();
    return { label, denied: false, code: null };
  } catch (error) {
    return { label, denied: true, code: error.code ?? "ERROR" };
  }
}

async function probe(bundleRoot) {
  const config = await readJson(path.join(bundleRoot, "probe.json"));
  const reads = [];
  for (const target of config.forbiddenReads) {
    reads.push(await attempt(target.label, () => readFile(target.path)));
  }
  const inputWrite = await attempt("input-write", () => writeFile(path.join(bundleRoot, "source.md"), "changed"));
  const outsideWrite = await attempt("outside-write", () => writeFile(config.outsideWrite, "changed"));
  const symlinkWrite = await attempt("symlink-write", () => writeFile(config.symlinkWrite, "changed"));
  const network = await connectProbe(config.listenerPort);
  return {
    action: "boundary-probe",
    reads,
    inputWrite,
    outsideWrite,
    symlinkWrite,
    network,
    environment: {
      credentialCanaryVisible: Object.hasOwn(process.env, "GT_SECRET_CANARY"),
      homeIsScrubbed: process.env.HOME === "/nonexistent",
    },
  };
}

export async function runWorker(options) {
  if (options.action === "ingest") return ingest(options.bundle, options.state, options.fault);
  if (options.action === "rebuild") return rebuildProjection(options.state);
  if (options.action === "probe") return probe(options.bundle);
  throw new Error("unknown worker action");
}

async function main() {
  const { values } = parseArgs({
    options: {
      action: { type: "string" },
      bundle: { type: "string" },
      state: { type: "string" },
      fault: { type: "string" },
    },
    strict: true,
  });
  try {
    const result = await runWorker(values);
    process.stdout.write(`${canonicalJson(result)}\n`);
  } catch (error) {
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
