#!/usr/bin/env node

import process from "node:process";

import {
  PublicDogfoodError,
  buildJourneyBundle,
  verifyBundle,
  writeProjectionDirectory,
} from "./core.mjs";

function usage() {
  return [
    "Usage:",
    "  node cli.mjs build JOURNEY_ROOT BUNDLE_ROOT",
    "  node cli.mjs verify BUNDLE_ROOT MANIFEST_SHA256",
    "  node cli.mjs project BUNDLE_ROOT MANIFEST_SHA256 PROJECTION_ROOT",
  ].join("\n");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  let result;
  if (command === "build" && args.length === 2) {
    result = await buildJourneyBundle(args[0], args[1]);
  } else if (command === "verify" && args.length === 2) {
    const verification = await verifyBundle(args[0], args[1]);
    result = {
      status: verification.status,
      identity: verification.identity,
      manifestSha256: verification.manifestSha256,
      recordCount: verification.manifest.recordCount,
      fileCount: verification.manifest.fileCount,
      payloadBytes: verification.manifest.payloadBytes,
      recordHeadSha256: verification.manifest.recordHeadSha256,
    };
  } else if (command === "project" && args.length === 3) {
    const verification = await verifyBundle(args[0], args[1]);
    result = await writeProjectionDirectory(args[2], verification);
  } else {
    throw new PublicDogfoodError("USAGE_INVALID", usage());
  }
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

main().catch((error) => {
  const code =
    error instanceof PublicDogfoodError || typeof error?.code === "string"
      ? error.code
      : "UNEXPECTED_FAILURE";
  process.stderr.write(`${code}\n`);
  if (code === "USAGE_INVALID") process.stderr.write(`${usage()}\n`);
  process.exitCode = 1;
});
