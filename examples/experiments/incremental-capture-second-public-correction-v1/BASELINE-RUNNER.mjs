#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.join(root, "baseline");
const rgPath = "/opt/homebrew/bin/rg";
const rgSha256 =
  "2fb61b6e5b3e2d89b115fe6c18fd8805670fdf4bdfde85954d40855a76830e5f";
const contractSha256 =
  "2926c463a7a19253649b60426dd08fd0e9864549e6da33a7aad84c7d9754efca";
const sourceManifestSha256 =
  "fc374ebf427cb94f500781d1d5c6d4e066e1ae98ee1a09cfcdf7a1ab50f38ba9";
const implementationManifestSha256 =
  "75fd60a377044bc96a59af5534c828b21c26748d601114cc9246fb94594af004";

const phases = {
  H1: [
    {
      args: [
        "--line-number",
        "--context",
        "5",
        "run_chunking|_render_without_metadata|previous_content|include_metadata",
        "sources/H1/adapter.py",
      ],
      queryId: "q1-h1-flow",
    },
    {
      args: [
        "--line-number",
        "--context",
        "4",
        "Overlap Contract|CHNK-CRIT|Removed render|embedded overlap",
        "sources/H1/CHANGELOG.md",
      ],
      queryId: "q2-h1-claims",
    },
    {
      args: [
        "--line-number",
        "chunkana",
        "sources/H1/requirements.txt",
      ],
      queryId: "q3-h1-dependency",
    },
  ],
  H2: [
    {
      args: [
        "--line-number",
        "--context",
        "5",
        "_render_without_metadata|_embed_overlap|previous_content|next_content|except Exception",
        "sources/H2/adapter.py",
      ],
      queryId: "q4-h2-embedding",
    },
    {
      args: [
        "--line-number",
        "--context",
        "4",
        "CRITICAL|Performance|Migration Notes|chunkana 0.1.3|19 new",
        "sources/H2/CHANGELOG.md",
      ],
      queryId: "q5-h2-claims",
    },
    {
      args: [
        "--line-number",
        "--context",
        "3",
        "chunkana|def test_|assert len|substring|heuristic",
        "sources/H2/requirements.txt",
        "sources/H2/tests/test_overlap_embedding.py",
      ],
      queryId: "q6-h2-dependency-tests",
    },
  ],
};

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return Buffer.from(`${JSON.stringify(normalize(value))}\n`, "utf8");
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function requireHash(filename, expected) {
  const bytes = await readFile(filename);
  if (sha256(bytes) !== expected) throw new Error("IDENTITY_MISMATCH");
}

async function executeQueries(phase) {
  const results = [];
  const startedAt = new Date().toISOString();
  const start = process.hrtime.bigint();
  for (const query of phases[phase]) {
    const queryStart = process.hrtime.bigint();
    const result = await execFileAsync(rgPath, query.args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 512 * 1024,
    });
    results.push({
      argv: [rgPath, ...query.args],
      elapsedMilliseconds: Number(process.hrtime.bigint() - queryStart) / 1e6,
      exitCode: 0,
      queryId: query.queryId,
      stderr: result.stderr,
      stdout: result.stdout,
    });
  }
  return {
    completedAt: new Date().toISOString(),
    elapsedMilliseconds: Number(process.hrtime.bigint() - start) / 1e6,
    phase,
    queries: results,
    startedAt,
  };
}

async function h1() {
  await Promise.all([
    requireHash(path.join(root, "EXPERIMENT-CONTRACT.json"), contractSha256),
    requireHash(
      path.join(root, "SOURCE-MANIFEST.json"),
      sourceManifestSha256,
    ),
    requireHash(
      path.join(root, "IMPLEMENTATION-MANIFEST.json"),
      implementationManifestSha256,
    ),
    requireHash(rgPath, rgSha256),
  ]);
  const stage = `${outputRoot}.stage-${randomUUID()}`;
  await mkdir(stage);
  const start = {
    attempt: 1,
    contractSha256,
    implementationManifestSha256,
    phase: "H1",
    queryIds: phases.H1.map((query) => query.queryId),
    retryPolicy: "none",
    rgPath,
    rgSha256,
    sourceManifestSha256,
    startedAt: new Date().toISOString(),
    status: "started",
  };
  await writeFile(path.join(stage, "ATTEMPT-START.json"), canonicalJson(start), {
    flag: "wx",
  });
  const result = await executeQueries("H1");
  await writeFile(path.join(stage, "SEARCH-H1.json"), canonicalJson(result), {
    flag: "wx",
  });
  await writeFile(
    path.join(stage, "PHASE-H1-COMPLETE.json"),
    canonicalJson({
      completedAt: result.completedAt,
      queryCount: result.queries.length,
      searchSha256: sha256(canonicalJson(result)),
      status: "h1-search-complete-answer-required-before-h2",
    }),
    { flag: "wx" },
  );
  await rename(stage, outputRoot);
  return {
    queryCount: result.queries.length,
    status: "h1-search-complete-answer-required-before-h2",
  };
}

async function h2(h1AnswerSha256) {
  if (!/^[a-f0-9]{64}$/.test(h1AnswerSha256)) {
    throw new Error("USAGE_INVALID");
  }
  await Promise.all([
    requireHash(path.join(root, "EXPERIMENT-CONTRACT.json"), contractSha256),
    requireHash(
      path.join(root, "SOURCE-MANIFEST.json"),
      sourceManifestSha256,
    ),
    requireHash(
      path.join(root, "IMPLEMENTATION-MANIFEST.json"),
      implementationManifestSha256,
    ),
    requireHash(rgPath, rgSha256),
    requireHash(path.join(outputRoot, "H1-ANSWER.json"), h1AnswerSha256),
    readFile(path.join(outputRoot, "PHASE-H1-COMPLETE.json")),
  ]);
  const marker = {
    h1AnswerSha256,
    phase: "H2",
    queryIds: phases.H2.map((query) => query.queryId),
    startedAt: new Date().toISOString(),
    status: "started",
  };
  await writeFile(
    path.join(outputRoot, "PHASE-H2-START.json"),
    canonicalJson(marker),
    { flag: "wx" },
  );
  const result = await executeQueries("H2");
  await writeFile(
    path.join(outputRoot, "SEARCH-H2.json"),
    canonicalJson(result),
    { flag: "wx" },
  );
  await writeFile(
    path.join(outputRoot, "PHASE-H2-COMPLETE.json"),
    canonicalJson({
      completedAt: result.completedAt,
      queryCount: result.queries.length,
      searchSha256: sha256(canonicalJson(result)),
      status: "h2-search-complete-final-answers-required",
    }),
    { flag: "wx" },
  );
  return {
    queryCount: result.queries.length,
    status: "h2-search-complete-final-answers-required",
  };
}

async function main() {
  const [phase, answerHash] = process.argv.slice(2);
  let result;
  if (phase === "H1" && answerHash === undefined) {
    result = await h1();
  } else if (phase === "H2" && answerHash !== undefined) {
    result = await h2(answerHash);
  } else {
    throw new Error("USAGE_INVALID");
  }
  process.stdout.write(canonicalJson(result));
}

main().catch((error) => {
  process.stderr.write(`${error.message ?? "BASELINE_FAILED"}\n`);
  process.exitCode = 1;
});
