import { spawn } from "node:child_process";
import { access, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { sha256 } from "./lib.mjs";
import { faultSignal } from "./worker.mjs";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const runtimeDirectory = path.resolve(sourceDirectory, "..");
const sandboxProfile = path.join(runtimeDirectory, "sandbox.sb");
const workerFile = path.join(sourceDirectory, "worker.mjs");
const sandboxExecutable = "/usr/bin/sandbox-exec";
const activeChildGroups = new Map();
const maximumCapturedBytes = 64 * 1024;
const defaultTimeoutMs = 150_000;

export const isolationProfileVersion = "darwin-seatbelt-deny-default-v0";

function killGroup(pid) {
  try {
    process.kill(-pid, "SIGKILL");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

export function activeSandboxChildren() {
  return activeChildGroups.size;
}

export async function terminateSandboxChildren() {
  const waits = [];
  for (const [pid, child] of activeChildGroups) {
    waits.push(new Promise((resolve) => child.once("close", resolve)));
    killGroup(pid);
  }
  await Promise.all(waits);
}

function capture(command, args, options, timeoutMs = defaultTimeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let overflow = false;
    let timedOut = false;
    activeChildGroups.set(child.pid, child);
    const append = (current, chunk) => {
      if (Buffer.byteLength(current) + Buffer.byteLength(chunk) > maximumCapturedBytes) {
        if (!overflow) {
          overflow = true;
          killGroup(child.pid);
        }
        return current;
      }
      return current + chunk;
    };
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = append(stderr, chunk);
    });
    const timer = setTimeout(() => {
      timedOut = true;
      killGroup(child.pid);
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      activeChildGroups.delete(child.pid);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      activeChildGroups.delete(child.pid);
      resolve({ code, signal, stdout, stderr, overflow, timedOut });
    });
  });
}

export async function assertIsolationAvailable() {
  if (process.platform !== "darwin") {
    throw new Error("the recorded rehearsal requires the Darwin sandbox and fails closed elsewhere");
  }
  await access(sandboxExecutable);
  await access(sandboxProfile);
  await access(workerFile);
}

export async function runSandboxedWorker({
  action,
  bundle,
  state,
  runRoot,
  workerRuntime,
  fault,
  timeoutMs = defaultTimeoutMs,
}) {
  await assertIsolationAvailable();
  const isolatedRuntimeDirectory = workerRuntime;
  const isolatedWorkerFile = path.join(isolatedRuntimeDirectory, "worker.mjs");
  const stagedSandboxProfile = path.join(isolatedRuntimeDirectory, "sandbox.sb");
  const [node, runtime, reveal, work, root, parent, profile, worker] = await Promise.all([
    realpath(process.execPath),
    realpath(isolatedRuntimeDirectory),
    realpath(bundle ?? state),
    realpath(state),
    realpath(runRoot),
    realpath(path.dirname(runRoot)),
    realpath(stagedSandboxProfile),
    realpath(isolatedWorkerFile),
  ]);
  const sessionParent = path.dirname(parent);
  const args = [
    "-D",
    `NODE_BIN=${node}`,
    "-D",
    `RUNTIME_DIR=${runtime}`,
    "-D",
    `REVEAL_DIR=${reveal}`,
    "-D",
    `WORK_DIR=${work}`,
    "-D",
    `RUN_PARENT=${parent}`,
    "-D",
    `SESSION_PARENT=${sessionParent}`,
    "-D",
    `RUN_ROOT=${root}`,
    "-f",
    profile,
    node,
    worker,
    "--action",
    action,
    "--state",
    work,
  ];
  if (bundle) args.push("--bundle", reveal);
  if (fault) args.push("--fault", fault);
  const result = await capture(sandboxExecutable, args, {
    cwd: work,
    env: {
      HOME: "/nonexistent",
      PATH: "/usr/bin:/bin",
      LANG: "C",
      OPENSSL_CONF: "/dev/null",
      TMPDIR: work,
    },
  }, timeoutMs);
  if (result.timedOut || result.overflow) {
    throw new Error(result.timedOut ? "sandboxed worker exceeded its time budget" : "sandboxed worker output exceeded its limit");
  }
  if (fault && result.signal === faultSignal) {
    return { ...result, injectedFault: true, value: null };
  }
  if (result.code !== 0) {
    const stderrDigest = sha256(result.stderr);
    const error = new Error(`sandboxed worker failed with exit ${result.code}; stderr digest ${stderrDigest}`);
    error.result = {
      code: result.code,
      signal: result.signal,
      stdoutDigest: sha256(result.stdout),
      stderrDigest,
    };
    throw error;
  }
  const lines = result.stdout.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length !== 1) throw new Error("sandboxed worker returned an invalid response envelope");
  return { ...result, injectedFault: false, value: JSON.parse(lines[0]) };
}
