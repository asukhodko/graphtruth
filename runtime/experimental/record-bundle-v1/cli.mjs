#!/usr/bin/env node

import process from "node:process";

import {
  buildFrozenJourneyBundle,
  canonicalJson,
  RecordBundleError,
  verifyBundle,
  writeProjectionDirectory,
} from "./core.mjs";

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node cli.mjs build --journey-root ROOT --output-root ROOT",
      "  node cli.mjs verify --bundle-root ROOT --manifest-sha256 SHA256",
      "  node cli.mjs rebuild --bundle-root ROOT --manifest-sha256 SHA256 --output-root ROOT",
      "",
    ].join("\n"),
  );
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  if (!["build", "verify", "rebuild"].includes(command) || rest.length % 2 !== 0) {
    usage();
    process.exit(2);
  }
  const values = new Map();
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    if (!key.startsWith("--") || values.has(key)) {
      usage();
      process.exit(2);
    }
    values.set(key, rest[index + 1]);
  }
  return { command, values };
}

function requireArguments(values, names) {
  if (
    values.size !== names.length ||
    names.some((name) => typeof values.get(name) !== "string" || values.get(name) === "")
  ) {
    usage();
    process.exit(2);
  }
}

async function main() {
  const { command, values } = parseArguments(process.argv.slice(2));
  if (command === "build") {
    requireArguments(values, ["--journey-root", "--output-root"]);
    const result = await buildFrozenJourneyBundle(
      values.get("--journey-root"),
      values.get("--output-root"),
    );
    process.stdout.write(
      canonicalJson({
        status: "bundle-built",
        manifestSha256: result.manifestSha256,
        semanticDigest: result.semanticDigest,
        files: result.fileCount,
        records: result.records.length,
      }),
    );
    return;
  }
  if (command === "verify") {
    requireArguments(values, ["--bundle-root", "--manifest-sha256"]);
    const result = await verifyBundle(
      values.get("--bundle-root"),
      values.get("--manifest-sha256"),
    );
    process.stdout.write(result.semanticBytes);
    return;
  }
  requireArguments(values, ["--bundle-root", "--manifest-sha256", "--output-root"]);
  const result = await verifyBundle(
    values.get("--bundle-root"),
    values.get("--manifest-sha256"),
  );
  await writeProjectionDirectory(values.get("--output-root"), result);
  process.stdout.write(
    canonicalJson({
      status: "projections-rebuilt",
      manifestSha256: result.manifestSha256,
      semanticDigest: result.semanticDigest,
    }),
  );
}

main().catch((error) => {
  if (error instanceof RecordBundleError) {
    process.stderr.write(`${error.code}\n`);
  } else {
    process.stderr.write("UNEXPECTED_FAILURE\n");
  }
  process.exitCode = 1;
});
