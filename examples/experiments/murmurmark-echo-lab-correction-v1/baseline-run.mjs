#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  constants,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  canonicalJson,
  sha256,
} from "../../../runtime/experimental/public-dogfood-v1/core.mjs";

const journeyRoot = path.dirname(fileURLToPath(import.meta.url));
const planPath = path.join(journeyRoot, "BASELINE-PLAN.json");
const sourceManifestPath = path.join(journeyRoot, "SOURCE-MANIFEST.json");
const sourceManifestSha256 =
  "3ab4aaaf26dc983434f5ff7fe034df7f64573af823a87e5876dc905460650b38";
const expectedIdentity = "murmurmark-echo-lab-correction-v1";

class BaselineError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function reject(code) {
  throw new BaselineError(code);
}

async function readRegular(filename, maximumBytes = 1024 * 1024) {
  let handle;
  try {
    handle = await open(
      filename,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW === undefined ? 0 : constants.O_NOFOLLOW),
    );
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > maximumBytes) reject("INPUT_INVALID");
    const bytes = await handle.readFile();
    if (bytes.length !== stat.size) reject("INPUT_INVALID");
    return bytes;
  } finally {
    await handle?.close();
  }
}

function validatePlan(plan) {
  if (
    plan?.format !== "graphtruth.experimental.files-rg-baseline-plan.v1" ||
    plan.identity !== expectedIdentity ||
    plan.branch !== "files-rg" ||
    plan.attempt !== 1 ||
    plan.queryLimit !== 8 ||
    plan.timeoutSeconds !== 1200 ||
    plan.tool?.name !== "ripgrep" ||
    plan.tool.version !== "15.1.0" ||
    plan.tool.executableSha256 !==
      "2fb61b6e5b3e2d89b115fe6c18fd8805670fdf4bdfde85954d40855a76830e5f" ||
    !Array.isArray(plan.queries) ||
    plan.queries.length !== 8 ||
    new Set(plan.queries.map((query) => query.queryId)).size !== 8
  ) {
    reject("PLAN_INVALID");
  }
  for (const query of plan.queries) {
    if (
      !["H1", "H2"].includes(query.horizonId) ||
      typeof query.fixedStrings !== "boolean" ||
      typeof query.pattern !== "string" ||
      query.pattern.length === 0 ||
      typeof query.target !== "string" ||
      query.target.length === 0 ||
      path.posix.normalize(query.target) !== query.target ||
      query.target.startsWith("/") ||
      query.target.split("/").includes("..")
    ) {
      reject("PLAN_INVALID");
    }
    if (
      query.horizonId === "H1" &&
      !query.target.startsWith("upstream/H1/")
    ) {
      reject("PLAN_INVALID");
    }
    if (
      query.horizonId === "H2" &&
      !(
        query.target === "SOURCE-MANIFEST.json" ||
        query.target === "upstream" ||
        query.target === "upstream/H1" ||
        query.target === "upstream/H2" ||
        query.target.startsWith("upstream/H1/") ||
        query.target.startsWith("upstream/H2/")
      )
    ) {
      reject("PLAN_INVALID");
    }
  }
}

async function locateRg(plan) {
  const lookup = spawnSync("/usr/bin/which", ["rg"], { encoding: "utf8" });
  if (lookup.status !== 0) reject("RG_NOT_FOUND");
  const executable = await realpath(lookup.stdout.trim());
  const bytes = await readRegular(executable, 64 * 1024 * 1024);
  const version = spawnSync(executable, ["--version"], {
    encoding: "utf8",
  });
  if (
    version.status !== 0 ||
    version.stdout.split("\n")[0] !== `ripgrep ${plan.tool.version}` ||
    sha256(bytes) !== plan.tool.executableSha256
  ) {
    reject("RG_IDENTITY_MISMATCH");
  }
  return executable;
}

async function loadInputs(expectedPlanSha256) {
  if (!/^[a-f0-9]{64}$/.test(expectedPlanSha256)) reject("PLAN_HASH_INVALID");
  const [planBytes, sourceManifestBytes] = await Promise.all([
    readRegular(planPath),
    readRegular(sourceManifestPath),
  ]);
  if (
    sha256(planBytes) !== expectedPlanSha256 ||
    sha256(sourceManifestBytes) !== sourceManifestSha256
  ) {
    reject("INPUT_IDENTITY_MISMATCH");
  }
  const plan = JSON.parse(planBytes);
  const sourceManifest = JSON.parse(sourceManifestBytes);
  validatePlan(plan);
  if (
    sourceManifest.identity !== expectedIdentity ||
    sourceManifest.artifacts?.length !== 8
  ) {
    reject("SOURCE_MANIFEST_INVALID");
  }
  for (const artifact of sourceManifest.artifacts) {
    const bytes = await readRegular(path.join(journeyRoot, artifact.retainedPath));
    if (bytes.length !== artifact.size || sha256(bytes) !== artifact.sha256) {
      reject("SOURCE_IDENTITY_MISMATCH");
    }
  }
  for (const query of plan.queries) {
    const target = path.resolve(journeyRoot, query.target);
    const targetPath = await realpath(target);
    const journeyPath = await realpath(journeyRoot);
    if (
      targetPath !== journeyPath &&
      !targetPath.startsWith(`${journeyPath}${path.sep}`)
    ) {
      reject("TARGET_OUTSIDE_JOURNEY");
    }
  }
  return {
    plan,
    planSha256: expectedPlanSha256,
    rg: await locateRg(plan),
  };
}

async function preflight(planSha256) {
  const inputs = await loadInputs(planSha256);
  return {
    status: "baseline-preflight-valid",
    identity: expectedIdentity,
    planSha256: inputs.planSha256,
    sourceManifestSha256,
    queryCount: inputs.plan.queries.length,
    rgExecutableSha256: inputs.plan.tool.executableSha256,
  };
}

async function run(planSha256, outputRoot) {
  const inputs = await loadInputs(planSha256);
  try {
    await lstat(outputRoot);
    reject("OUTPUT_EXISTS");
  } catch (error) {
    if (error instanceof BaselineError) throw error;
    if (error?.code !== "ENOENT") throw error;
  }
  await mkdir(outputRoot, { recursive: true, mode: 0o755 });
  const startedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const marker = {
    format: "graphtruth.experimental.files-rg-baseline-attempt.v1",
    identity: expectedIdentity,
    attempt: 1,
    planSha256,
    sourceManifestSha256,
    startedAt,
  };
  await writeFile(
    path.join(outputRoot, "ATTEMPT-COMMITTED.json"),
    canonicalJson(marker),
    { flag: "wx", mode: 0o644 },
  );
  const started = process.hrtime.bigint();
  const results = [];
  try {
    for (const query of inputs.plan.queries) {
      const args = ["--line-number", "--context", "5"];
      if (query.fixedStrings) args.push("--fixed-strings");
      args.push(query.pattern, path.join(journeyRoot, query.target));
      const queryStarted = process.hrtime.bigint();
      const result = spawnSync(inputs.rg, args, {
        encoding: "utf8",
        timeout: inputs.plan.timeoutSeconds * 1000,
        maxBuffer: 1024 * 1024,
      });
      const durationMilliseconds =
        Number(process.hrtime.bigint() - queryStarted) / 1_000_000;
      if (result.error || ![0, 1].includes(result.status)) {
        reject("QUERY_FAILED");
      }
      results.push({
        queryId: query.queryId,
        horizonId: query.horizonId,
        argv: [
          "rg",
          "--line-number",
          "--context",
          "5",
          ...(query.fixedStrings ? ["--fixed-strings"] : []),
          query.pattern,
          query.target,
        ],
        exitCode: result.status,
        durationMilliseconds,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }
    const finishedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const transcript = {
      format: "graphtruth.experimental.files-rg-baseline-transcript.v1",
      identity: expectedIdentity,
      branch: "files-rg",
      attempt: 1,
      planSha256,
      sourceManifestSha256,
      tool: inputs.plan.tool,
      startedAt,
      finishedAt,
      durationMilliseconds:
        Number(process.hrtime.bigint() - started) / 1_000_000,
      queryCount: results.length,
      results,
    };
    const bytes = canonicalJson(transcript);
    await writeFile(path.join(outputRoot, "SEARCH-TRANSCRIPT.json"), bytes, {
      flag: "wx",
      mode: 0o644,
    });
    return {
      status: "baseline-run-complete",
      identity: expectedIdentity,
      planSha256,
      transcriptSha256: sha256(bytes),
      queryCount: results.length,
      durationMilliseconds: transcript.durationMilliseconds,
    };
  } catch (error) {
    const failure = {
      format: "graphtruth.experimental.files-rg-baseline-failure.v1",
      identity: expectedIdentity,
      planSha256,
      failedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      code: error?.code ?? "UNEXPECTED_FAILURE",
      completedQueryCount: results.length,
    };
    await writeFile(
      path.join(outputRoot, "TERMINAL-FAILURE.json"),
      canonicalJson(failure),
      { flag: "wx", mode: 0o644 },
    );
    throw error;
  }
}

async function main() {
  const [command, planSha256, outputRoot] = process.argv.slice(2);
  let result;
  if (command === "preflight" && planSha256 && outputRoot === undefined) {
    result = await preflight(planSha256);
  } else if (command === "run" && planSha256 && outputRoot) {
    result = await run(planSha256, outputRoot);
  } else {
    reject("USAGE_INVALID");
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error?.code ?? "UNEXPECTED_FAILURE"}\n`);
  process.exitCode = 1;
});
