#!/usr/bin/env node

import process from "node:process";

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
  verifyStore,
} from "./core.mjs";

function usage() {
  return [
    "Usage:",
    "  node cli.mjs init --output-root ROOT --identity ID --source-manifest FILE --source-manifest-sha256 SHA256 --contract-sha256 SHA256 --recorded-at TIME",
    "  node cli.mjs add-horizon --output-root ROOT --source-manifest FILE --source-root ROOT --horizon ID --recorded-at TIME",
    "  node cli.mjs add-span --output-root ROOT --id ID --horizon ID --path PATH --line-start N --line-end N --recorded-at TIME",
    "  node cli.mjs add-assertion --output-root ROOT --assertion-id ID --revision-id ID --predecessor-revision-id ID_OR_NONE --horizon ID --text TEXT --evidence IDS --recorded-at TIME",
    "  node cli.mjs add-question --output-root ROOT --question-id ID --horizon ID --text TEXT --evidence IDS --recorded-at TIME",
    "  node cli.mjs close-horizon --output-root ROOT --horizon ID --final true|false --recorded-at TIME",
    "  node cli.mjs verify --output-root ROOT",
    "  node cli.mjs project --output-root ROOT --horizon ID --projection-root ROOT",
    "  node cli.mjs rebuild-exact --output-root ROOT --horizon ID --projection-root ROOT",
  ].join("\n");
}

function parse(argv) {
  const [command, ...rest] = argv;
  if (typeof command !== "string" || rest.length % 2 !== 0) {
    throw new IncrementalCaptureError("USAGE_INVALID");
  }
  const values = new Map();
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key.startsWith("--") || values.has(key) || value === undefined) {
      throw new IncrementalCaptureError("USAGE_INVALID");
    }
    values.set(key, value);
  }
  return { command, values };
}

function requireExact(values, keys) {
  if (
    values.size !== keys.length ||
    keys.some((key) => !values.has(key) || values.get(key) === "")
  ) {
    throw new IncrementalCaptureError("USAGE_INVALID");
  }
}

function positiveInteger(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new IncrementalCaptureError("USAGE_INVALID");
  }
  return Number(value);
}

function evidenceIds(value) {
  const ids = value.split(",");
  if (ids.length === 0 || ids.some((item) => item.length === 0)) {
    throw new IncrementalCaptureError("USAGE_INVALID");
  }
  return ids;
}

async function main() {
  const { command, values } = parse(process.argv.slice(2));
  let result;
  if (command === "init") {
    requireExact(values, [
      "--output-root",
      "--identity",
      "--source-manifest",
      "--source-manifest-sha256",
      "--contract-sha256",
      "--recorded-at",
    ]);
    result = await initializeStore({
      contractSha256: values.get("--contract-sha256"),
      identity: values.get("--identity"),
      outputRoot: values.get("--output-root"),
      recordedAt: values.get("--recorded-at"),
      sourceManifestPath: values.get("--source-manifest"),
      sourceManifestSha256: values.get("--source-manifest-sha256"),
    });
  } else if (command === "add-horizon") {
    requireExact(values, [
      "--output-root",
      "--source-manifest",
      "--source-root",
      "--horizon",
      "--recorded-at",
    ]);
    result = await appendSourceHorizon({
      horizonId: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      recordedAt: values.get("--recorded-at"),
      sourceManifestPath: values.get("--source-manifest"),
      sourceRoot: values.get("--source-root"),
    });
  } else if (command === "add-span") {
    requireExact(values, [
      "--output-root",
      "--id",
      "--horizon",
      "--path",
      "--line-start",
      "--line-end",
      "--recorded-at",
    ]);
    result = await appendEvidenceSpan({
      horizonId: values.get("--horizon"),
      lineEnd: positiveInteger(values.get("--line-end")),
      lineStart: positiveInteger(values.get("--line-start")),
      outputRoot: values.get("--output-root"),
      recordedAt: values.get("--recorded-at"),
      sourcePath: values.get("--path"),
      spanId: values.get("--id"),
    });
  } else if (command === "add-assertion") {
    requireExact(values, [
      "--output-root",
      "--assertion-id",
      "--revision-id",
      "--predecessor-revision-id",
      "--horizon",
      "--text",
      "--evidence",
      "--recorded-at",
    ]);
    result = await appendAssertion({
      assertionId: values.get("--assertion-id"),
      evidenceIds: evidenceIds(values.get("--evidence")),
      horizonId: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      predecessorRevisionId:
        values.get("--predecessor-revision-id") === "none"
          ? null
          : values.get("--predecessor-revision-id"),
      recordedAt: values.get("--recorded-at"),
      revisionId: values.get("--revision-id"),
      text: values.get("--text"),
    });
  } else if (command === "add-question") {
    requireExact(values, [
      "--output-root",
      "--question-id",
      "--horizon",
      "--text",
      "--evidence",
      "--recorded-at",
    ]);
    result = await appendQuestion({
      evidenceIds: evidenceIds(values.get("--evidence")),
      horizonId: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      questionId: values.get("--question-id"),
      recordedAt: values.get("--recorded-at"),
      text: values.get("--text"),
    });
  } else if (command === "close-horizon") {
    requireExact(values, [
      "--output-root",
      "--horizon",
      "--final",
      "--recorded-at",
    ]);
    if (!["true", "false"].includes(values.get("--final"))) {
      throw new IncrementalCaptureError("USAGE_INVALID");
    }
    result = await closeHorizon({
      final: values.get("--final") === "true",
      horizonId: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      recordedAt: values.get("--recorded-at"),
    });
  } else if (command === "verify") {
    requireExact(values, ["--output-root"]);
    const verification = await verifyStore(values.get("--output-root"));
    result = {
      bytes: verification.bytes,
      files: verification.files.length,
      identity: verification.control.identity,
      recordHeadSha256:
        verification.records[verification.records.length - 1].recordSha256,
      records: verification.records.length,
      status: verification.status,
    };
  } else if (command === "project") {
    requireExact(values, [
      "--output-root",
      "--horizon",
      "--projection-root",
    ]);
    result = await buildProjection({
      asOfHorizon: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      projectionRoot: values.get("--projection-root"),
    });
  } else if (command === "rebuild-exact") {
    requireExact(values, [
      "--output-root",
      "--horizon",
      "--projection-root",
    ]);
    result = await rebuildProjectionExact({
      asOfHorizon: values.get("--horizon"),
      outputRoot: values.get("--output-root"),
      projectionRoot: values.get("--projection-root"),
    });
  } else {
    throw new IncrementalCaptureError("USAGE_INVALID");
  }
  process.stdout.write(canonicalJson(result));
}

main().catch((error) => {
  const code =
    error instanceof IncrementalCaptureError
      ? error.code
      : typeof error?.code === "string"
        ? error.code
        : "UNEXPECTED_FAILURE";
  process.stderr.write(`${code}\n`);
  if (code === "USAGE_INVALID") process.stderr.write(`${usage()}\n`);
  process.exitCode = 1;
});
