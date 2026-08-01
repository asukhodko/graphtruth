#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  ReleaseCandidateError,
  verifyReleaseCandidate,
} from "./verify-release-candidate.mjs";

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleRoot, "../../..");

function summaryValue(tap, name) {
  const matches = [
    ...tap.matchAll(new RegExp(`^# ${name} (\\d+)$`, "gm")),
  ];
  if (matches.length === 0) throw new Error("QUALIFICATION_SUMMARY_MISSING");
  return Number(matches.at(-1)[1]);
}

async function main() {
  try {
    const verified = await verifyReleaseCandidate();
    if (process.versions.node !== verified.nodeVersion) {
      throw new Error("QUALIFICATION_NODE_VERSION_MISMATCH");
    }
    const manifest = JSON.parse(
      await readFile(path.join(moduleRoot, "RELEASE-CANDIDATE.json"), "utf8"),
    );
    const execution = spawnSync(
      process.execPath,
      ["--test", "--test-reporter=tap", ...manifest.qualification.testFiles],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    process.stdout.write(execution.stdout ?? "");
    process.stderr.write(execution.stderr ?? "");
    if (execution.error !== undefined || execution.status !== 0) {
      throw new Error("QUALIFICATION_TEST_FAILURE");
    }
    const observed = {
      cancelled: summaryValue(execution.stdout, "cancelled"),
      fail: summaryValue(execution.stdout, "fail"),
      pass: summaryValue(execution.stdout, "pass"),
      skipped: summaryValue(execution.stdout, "skipped"),
      tests: summaryValue(execution.stdout, "tests"),
      todo: summaryValue(execution.stdout, "todo"),
    };
    if (JSON.stringify(observed) !== JSON.stringify(verified.qualification)) {
      throw new Error("QUALIFICATION_DENOMINATOR_MISMATCH");
    }
    process.stdout.write(
      `# qualified ${verified.identity} (${observed.pass}/${observed.tests})\n`,
    );
  } catch (error) {
    const code =
      error instanceof ReleaseCandidateError
        ? error.code
        : typeof error?.message === "string" &&
            /^QUALIFICATION_[A-Z_]+$/.test(error.message)
          ? error.message
          : "QUALIFICATION_INTERNAL";
    process.stderr.write(`${code}\n`);
    process.exitCode = 1;
  }
}

await main();
