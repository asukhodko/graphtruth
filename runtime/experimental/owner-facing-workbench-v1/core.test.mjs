import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import {
  abortHorizon,
  addAssertion,
  addQuestion,
  addSource,
  canonicalJson,
  closeHorizon,
  compareUtf8,
  initializeWorkspace,
  limits,
  openHorizon,
  publishDossier,
  rebuildProjections,
  reviseAssertion,
  sha256,
  testing,
  undoDraft,
  verifyWorkspace,
  WorkbenchError,
} from "./core.mjs";

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleRoot, "../../..");
const cliPath = path.join(moduleRoot, "cli.mjs");
const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      rm(root, { force: true, recursive: true }),
    ),
  );
});

async function fixture() {
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "graphtruth-owner-workbench-"),
  );
  temporaryRoots.push(temporaryRoot);
  const h1 = path.join(temporaryRoot, "sources-h1");
  const h2 = path.join(temporaryRoot, "sources-h2");
  await mkdir(path.join(h1, "docs"), { recursive: true });
  await mkdir(path.join(h2, "docs"), { recursive: true });
  await writeFile(path.join(h1, "README.md"), "alpha\nstale route\n", "utf8");
  await writeFile(path.join(h1, "docs", "ROADMAP.md"), "one\ntwo\n", "utf8");
  await writeFile(path.join(h2, "README.md"), "alpha\nselected route\n", "utf8");
  await writeFile(path.join(h2, "docs", "ROADMAP.md"), "one\nthree\n", "utf8");
  return {
    h1,
    h2,
    root: path.join(temporaryRoot, "workbench"),
    temporaryRoot,
  };
}

function deterministicServices() {
  let counter = 0;
  return {
    now() {
      const value = new Date(Date.UTC(2026, 7, 1, 12, 0, counter));
      counter += 1;
      return value.toISOString();
    },
    uuid() {
      const hex = counter.toString(16).padStart(32, "0");
      counter += 1;
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    },
  };
}

async function expectCode(promise, code) {
  await assert.rejects(
    promise,
    (error) => error instanceof WorkbenchError && error.code === code,
  );
}

function runCli(root, args, { json = true } = {}) {
  const result = spawnSync(
    process.execPath,
    [cliPath, "--root", root, ...(json ? ["--json"] : []), ...args],
    { cwd: repositoryRoot, encoding: "utf8" },
  );
  return result;
}

function cliSuccess(root, args) {
  const result = runCli(root, args);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.stderr, "");
  assert.match(result.stdout, /\n$/);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.schema, "owner-facing-workbench-v1-command-result");
  assert.equal(parsed.ok, true);
  return parsed;
}

function cliFailure(root, args, code, status) {
  const result = runCli(root, args);
  assert.equal(result.status, status, result.stderr || result.stdout);
  assert.equal(result.stderr, "");
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(parsed), ["schema", "ok", "command", "error"]);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.error.code, code);
  assert.deepEqual(Object.keys(parsed.error), ["code", "message", "details"]);
  assert.deepEqual(parsed.error.details, {});
  return parsed;
}

async function happyPath(item, serviceOverrides = deterministicServices()) {
  await initializeWorkspace(
    { owner: "owner", root: item.root },
    { services: serviceOverrides },
  );
  await openHorizon(
    { name: "h1", root: item.root, sourceRoot: item.h1 },
    { services: serviceOverrides },
  );
  await addSource(
    { alias: "readme-h1", logicalPath: "README.md", root: item.root },
    { services: serviceOverrides },
  );
  await addSource(
    {
      alias: "roadmap-h1",
      logicalPath: "docs/ROADMAP.md",
      root: item.root,
    },
    { services: serviceOverrides },
  );
  const assertion = await addAssertion(
    {
      alias: "route",
      firstLine: 2,
      lastLine: 2,
      root: item.root,
      scope: "route state",
      sourceAlias: "readme-h1",
      text: "The route is stale.",
      uncertainty: null,
    },
    { services: serviceOverrides },
  );
  const question = await addQuestion(
    {
      alias: "completion",
      root: item.root,
      text: "Can the route be maintained without manual canonical edits?",
    },
    { services: serviceOverrides },
  );
  const h1 = await closeHorizon(
    { root: item.root },
    { services: serviceOverrides },
  );

  await openHorizon(
    {
      coverage: "closed-selection",
      name: "h2",
      root: item.root,
      scope: "the selected route files",
      sourceRoot: item.h2,
    },
    { services: serviceOverrides },
  );
  await addSource(
    { alias: "readme-h2", logicalPath: "README.md", root: item.root },
    { services: serviceOverrides },
  );
  const revision = await reviseAssertion(
    {
      assertionAlias: "route",
      firstLine: 2,
      lastLine: 2,
      reason: "The selected route changed at H2.",
      root: item.root,
      scope: "route state",
      sourceAlias: "readme-h2",
      text: "The owner-facing route is selected.",
      uncertainty: "The owner walkthrough remains pending.",
    },
    { services: serviceOverrides },
  );
  const h2 = await closeHorizon(
    { root: item.root },
    { services: serviceOverrides },
  );
  return { assertion, h1, h2, question, revision };
}

async function readJournal(root) {
  return (await readFile(path.join(root, "canonical", "JOURNAL.jsonl"), "utf8"))
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line));
}

async function fileMap(root) {
  const result = new Map();
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareUtf8(left.name, right.name));
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(filename, relative);
      else if (entry.isFile()) result.set(relative, await readFile(filename));
    }
  }
  await visit(root, "");
  return result;
}

function assertFileMapsEqual(left, right) {
  assert.deepEqual([...left.keys()], [...right.keys()]);
  for (const key of left.keys()) assert.deepEqual(left.get(key), right.get(key));
}

test("runs the complete two-horizon owner loop additively", async () => {
  const item = await fixture();
  const result = await happyPath(item);
  assert.equal(result.revision.assertionId, result.assertion.assertionId);
  assert.equal(
    result.revision.predecessorRevisionId,
    result.assertion.revisionId,
  );
  assert.equal(result.question.evidenceSpanId, null);

  const verification = await verifyWorkspace({ root: item.root });
  assert.equal(verification.headSha256, result.h2.headSha256);
  assert.equal(verification.projectionStatus, "current");
  assert.ok(verification.canonicalRecordCount <= limits.canonicalRecords);

  const dossier = await publishDossier({ horizonName: "h1", root: item.root });
  assert.equal(dossier.horizonId, result.h1.horizonId);
  const h1View = JSON.parse(
    await readFile(path.join(item.root, dossier.viewPath), "utf8"),
  );
  const currentView = JSON.parse(
    await readFile(path.join(item.root, "derived/current/VIEW.json"), "utf8"),
  );
  assert.equal(h1View.assertions[0].text, "The route is stale.");
  assert.equal(currentView.assertions[0].text, "The owner-facing route is selected.");
  assert.equal(h1View.assertions[0].reason, null);
  assert.equal(currentView.assertions[0].reason, "The selected route changed at H2.");
  assert.equal(h1View.questions[0].status, "open");
  assert.equal(currentView.questions[0].status, "open");
  assert.equal(h1View.horizons.length, 1);
  assert.equal(currentView.horizons.length, 2);
});

test("exercises every frozen CLI command and exact success result keys", async () => {
  const item = await fixture();
  assert.deepEqual(
    Object.keys(cliSuccess(item.root, ["init", "--owner", "owner"]).result),
    ["workspaceId", "owner"],
  );
  assert.deepEqual(
    Object.keys(
      cliSuccess(item.root, [
        "horizon",
        "open",
        "--source-root",
        item.h1,
        "--name",
        "h1",
      ]).result,
    ),
    ["horizonId", "name", "coverage", "scope"],
  );
  assert.deepEqual(
    Object.keys(
      cliSuccess(item.root, [
        "source",
        "add",
        "--path",
        "README.md",
        "--alias",
        "readme-h1",
      ]).result,
    ),
    ["sourceId", "logicalPath", "sha256", "size"],
  );
  assert.deepEqual(
    Object.keys(
      cliSuccess(item.root, [
        "assertion",
        "add",
        "--source",
        "readme-h1",
        "--text",
        "The route is stale.",
        "--lines",
        "2",
        "--alias",
        "route",
      ]).result,
    ),
    ["assertionId", "revisionId", "evidenceSpanId"],
  );
  assert.deepEqual(
    Object.keys(
      cliSuccess(item.root, [
        "question",
        "add",
        "--alias",
        "completion",
        "--text",
        "Is the route complete?",
        "--source",
        "readme-h1",
        "--lines",
        "1:2",
      ]).result,
    ),
    ["questionId", "evidenceSpanId"],
  );
  assert.deepEqual(
    Object.keys(cliSuccess(item.root, ["draft", "undo"]).result),
    ["undoneKind", "undoneAlias"],
  );
  cliSuccess(item.root, [
    "question",
    "add",
    "--alias",
    "completion",
    "--text",
    "Is the route complete?",
  ]);
  assert.deepEqual(
    Object.keys(cliSuccess(item.root, ["horizon", "close"]).result),
    ["horizonId", "headSha256", "recordCount", "snapshotCount"],
  );
  assert.deepEqual(Object.keys(cliSuccess(item.root, ["verify"]).result), [
    "headSha256",
    "canonicalRecordCount",
    "projectionStatus",
  ]);
  assert.deepEqual(
    Object.keys(cliSuccess(item.root, ["dossier", "--as-of", "h1"]).result),
    ["horizonId", "viewPath", "dossierPath"],
  );
  assert.deepEqual(Object.keys(cliSuccess(item.root, ["rebuild"]).result), [
    "headSha256",
    "rebuiltFiles",
  ]);

  cliSuccess(item.root, [
    "horizon",
    "open",
    "--name",
    "h2",
    "--source-root",
    item.h2,
  ]);
  cliSuccess(item.root, [
    "source",
    "add",
    "--alias",
    "readme-h2",
    "--path",
    "README.md",
  ]);
  assert.deepEqual(
    Object.keys(
      cliSuccess(item.root, [
        "assertion",
        "revise",
        "--assertion",
        "route",
        "--text",
        "The route is selected.",
        "--source",
        "readme-h2",
        "--lines",
        "2",
        "--reason",
        "H2 changed the route.",
      ]).result,
    ),
    ["assertionId", "revisionId", "predecessorRevisionId", "evidenceSpanId"],
  );
  assert.deepEqual(
    Object.keys(cliSuccess(item.root, ["horizon", "abort"]).result),
    ["horizonId", "name"],
  );
});

test("uses exact JSON failure envelopes and frozen exit statuses", async () => {
  const item = await fixture();
  const missing = cliFailure(item.root, ["verify"], "NOT_INITIALIZED", 4);
  assert.equal(missing.command, "verify");
  const usage = cliFailure(item.root, ["unknown"], "USAGE", 2);
  assert.equal(usage.command, "init");
  cliSuccess(item.root, ["init", "--owner", "owner"]);
  cliFailure(item.root, ["init", "--owner", "owner"], "ALREADY_INITIALIZED", 4);
  cliFailure(
    item.root,
    ["horizon", "open", "--name", "H1", "--source-root", item.h1],
    "INVALID_ALIAS",
    3,
  );
  cliFailure(item.root, ["horizon", "close"], "NO_OPEN_HORIZON", 4);
  cliFailure(item.root, ["dossier", "--as-of", "h1"], "HORIZON_NOT_FOUND", 4);
});

test("CLI uses frozen integrity and resource-limit exit statuses", async () => {
  const item = await fixture();
  await writeFile(
    path.join(item.h1, "large.txt"),
    Buffer.alloc(limits.retainedBytes, 0x61),
  );
  cliSuccess(item.root, ["init", "--owner", "owner"]);
  cliSuccess(item.root, [
    "horizon",
    "open",
    "--name",
    "h1",
    "--source-root",
    item.h1,
  ]);
  cliFailure(
    item.root,
    ["source", "add", "--alias", "large", "--path", "large.txt"],
    "LIMIT_EXCEEDED",
    6,
  );
  cliSuccess(item.root, [
    "source",
    "add",
    "--alias",
    "readme",
    "--path",
    "README.md",
  ]);
  await writeFile(path.join(item.h1, "README.md"), "changed\n");
  cliFailure(item.root, ["horizon", "close"], "SOURCE_CHANGED", 5);
});

test("human mode keeps stdout and stderr separated and prints no host path after close", async () => {
  const item = await fixture();
  let result = runCli(item.root, ["init", "--owner", "owner"], { json: false });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /^OK init:/);
  assert.equal(result.stderr, "");
  result = runCli(item.root, ["horizon", "close"], { json: false });
  assert.equal(result.status, 4);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /^NO_OPEN_HORIZON:/);

  cliSuccess(item.root, [
    "horizon",
    "open",
    "--name",
    "h1",
    "--source-root",
    item.h1,
  ]);
  cliSuccess(item.root, [
    "source",
    "add",
    "--alias",
    "readme-h1",
    "--path",
    "README.md",
  ]);
  result = runCli(item.root, ["horizon", "close"], { json: false });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stdout, new RegExp(item.temporaryRoot.replaceAll("/", "\\/")));
  const published = Buffer.concat([
    await readFile(path.join(item.root, "canonical/JOURNAL.jsonl")),
    await readFile(path.join(item.root, "canonical/HEAD.json")),
    await readFile(path.join(item.root, "derived/current/VIEW.json")),
    await readFile(path.join(item.root, "derived/current/DOSSIER.md")),
  ]).toString("utf8");
  assert.equal(published.includes(item.temporaryRoot), false);
});

test("enforces closed-selection scope and exact option grammar", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await expectCode(
    openHorizon({
      coverage: "closed-selection",
      name: "h1",
      root: item.root,
      sourceRoot: item.h1,
    }),
    "USAGE",
  );
  cliFailure(
    item.root,
    [
      "horizon",
      "open",
      "--name",
      "h1",
      "--name",
      "h1",
      "--source-root",
      item.h1,
    ],
    "USAGE",
    2,
  );
  cliFailure(
    item.root,
    ["question", "add", "--alias", "q", "--text", "Q?", "--source", "s"],
    "USAGE",
    2,
  );
});

test("rejects invalid, duplicate, symlinked, and overlapping sources", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await expectCode(
    openHorizon({ name: "overlap", root: item.root, sourceRoot: item.root }),
    "UNSAFE_SOURCE",
  );
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await expectCode(
    addSource({ alias: "unsafe", logicalPath: "../README.md", root: item.root }),
    "INVALID_PATH",
  );
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  await expectCode(
    addSource({ alias: "readme-two", logicalPath: "README.md", root: item.root }),
    "DUPLICATE_SOURCE",
  );
  await writeFile(path.join(item.h1, "same.md"), "alpha\nstale route\n", "utf8");
  await expectCode(
    addSource({ alias: "same", logicalPath: "same.md", root: item.root }),
    "DUPLICATE_SOURCE",
  );
  await symlink("README.md", path.join(item.h1, "link.md"));
  await expectCode(
    addSource({ alias: "link", logicalPath: "link.md", root: item.root }),
    "UNSAFE_SOURCE",
  );
  await mkdir(path.join(item.h1, "real"));
  await writeFile(path.join(item.h1, "real", "nested.md"), "nested\n");
  await symlink("real", path.join(item.h1, "linked-directory"));
  await expectCode(
    addSource({
      alias: "nested-link",
      logicalPath: "linked-directory/nested.md",
      root: item.root,
    }),
    "UNSAFE_SOURCE",
  );
});

test("rejects every unsafe logical-path class and a source-root ancestor", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await expectCode(
    openHorizon({
      name: "ancestor",
      root: item.root,
      sourceRoot: item.temporaryRoot,
    }),
    "UNSAFE_SOURCE",
  );
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  for (const logicalPath of [
    "",
    "/README.md",
    "README.md/",
    "docs//README.md",
    ".",
    "..",
    "docs/../README.md",
    "docs/./README.md",
    "docs\\README.md",
    "C:README.md",
    "résumé.md",
    "*.md",
  ]) {
    await expectCode(
      addSource({ alias: "invalid", logicalPath, root: item.root }),
      "INVALID_PATH",
    );
  }
});

test("rejects invalid UTF-8 and implements exact LF/CRLF/final-line spans", async () => {
  const item = await fixture();
  await writeFile(path.join(item.h1, "invalid.txt"), Buffer.from([0xc3, 0x28]));
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await expectCode(
    addSource({ alias: "invalid", logicalPath: "invalid.txt", root: item.root }),
    "INVALID_UTF8",
  );
  const bytes = Buffer.from("a\r\nb\nc", "utf8");
  assert.deepEqual(testing.lineSpan(bytes, 1, 1), {
    byteEnd: 3,
    byteStart: 0,
    sha256: sha256(Buffer.from("a\r\n")),
  });
  assert.deepEqual(testing.lineSpan(bytes, 2, 3), {
    byteEnd: 6,
    byteStart: 3,
    sha256: sha256(Buffer.from("b\nc")),
  });
  assert.throws(
    () => testing.lineSpan(bytes, 4, 4),
    (error) => error.code === "INVALID_LINE_RANGE",
  );
});

test("draft undo removes only the latest unpublished action and abort removes the draft", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  await addQuestion({ alias: "q", root: item.root, text: "Question?" });
  assert.deepEqual(await undoDraft({ root: item.root }), {
    undoneKind: "question",
    undoneAlias: "q",
  });
  assert.deepEqual(await undoDraft({ root: item.root }), {
    undoneKind: "source",
    undoneAlias: "readme",
  });
  await expectCode(undoDraft({ root: item.root }), "REFERENCE_NOT_FOUND");
  const aborted = await abortHorizon({ root: item.root });
  assert.equal(aborted.name, "h1");
  await expectCode(abortHorizon({ root: item.root }), "NO_OPEN_HORIZON");
});

test("source drift fails close without changing published canonical or derived bytes", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  const canonicalBefore = await fileMap(path.join(item.root, "canonical"));
  const derivedBefore = await fileMap(path.join(item.root, "derived"));
  await writeFile(path.join(item.h1, "README.md"), "changed\n", "utf8");
  await expectCode(closeHorizon({ root: item.root }), "SOURCE_CHANGED");
  assertFileMapsEqual(canonicalBefore, await fileMap(path.join(item.root, "canonical")));
  assertFileMapsEqual(derivedBefore, await fileMap(path.join(item.root, "derived")));
  assert.ok(await readFile(path.join(item.root, "draft/STATE.json")));
});

test("a pre-commit publication fault leaves canonical, derived, and draft byte-identical", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  const before = {
    canonical: await fileMap(path.join(item.root, "canonical")),
    derived: await fileMap(path.join(item.root, "derived")),
    draft: await fileMap(path.join(item.root, "draft")),
  };
  await expectCode(
    closeHorizon(
      { root: item.root },
      { hooks: { beforeCommit: () => Promise.reject(new Error("synthetic")) } },
    ),
    "ATOMIC_PUBLICATION",
  );
  assertFileMapsEqual(before.canonical, await fileMap(path.join(item.root, "canonical")));
  assertFileMapsEqual(before.derived, await fileMap(path.join(item.root, "derived")));
  assertFileMapsEqual(before.draft, await fileMap(path.join(item.root, "draft")));
  assert.equal((await readdir(path.join(item.root, ".states"))).length, 1);
});

test("journal bytes remain an exact prefix and source inventory uses byte order", async () => {
  const item = await fixture();
  await happyPath(item);
  const records = await readJournal(item.root);
  const h1CloseIndex = records.findIndex(
    (record) => record.kind === "HorizonClosed" && record.body.name === "h1",
  );
  const h1Prefix = Buffer.concat(
    records.slice(0, h1CloseIndex + 1).map((record) => canonicalJson(record)),
  );
  const journal = await readFile(path.join(item.root, "canonical/JOURNAL.jsonl"));
  assert.deepEqual(journal.subarray(0, h1Prefix.length), h1Prefix);
  const h1Sources = records
    .filter((record) => record.kind === "SourceSnapshot" && record.horizonId === records[1].id)
    .map((record) => record.body.logicalPath);
  assert.deepEqual(h1Sources, ["README.md", "docs/ROADMAP.md"]);
});

test("uses one bytewise comparator for mixed case, permutations, and exact M10 paths", async () => {
  const m10 = ["CHANGELOG.md", "adapter.py", "requirements.txt"];
  assert.deepEqual([...m10].sort(compareUtf8), m10);
  assert.notDeepEqual(
    [...m10].sort((left, right) => left.localeCompare(right)),
    m10,
  );
  const names = ["a.md", "B.md", "aa.md"];
  const expected = ["B.md", "a.md", "aa.md"];
  const permutations = [
    [names[0], names[1], names[2]],
    [names[0], names[2], names[1]],
    [names[1], names[0], names[2]],
    [names[1], names[2], names[0]],
    [names[2], names[0], names[1]],
    [names[2], names[1], names[0]],
  ];
  for (const permutation of permutations) {
    assert.deepEqual([...permutation].sort(compareUtf8), expected);
  }
});

test("deleting supported projections permits byte-exact rebuild", async () => {
  const item = await fixture();
  await happyPath(item);
  await publishDossier({ horizonName: "h1", root: item.root });
  const expected = await fileMap(path.join(item.root, "derived"));
  await rm(path.join(item.root, "derived", "current"), { force: true, recursive: true });
  await rm(path.join(item.root, "derived", "as-of"), { force: true, recursive: true });
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "absent");
  const rebuilt = await rebuildProjections({ root: item.root });
  assert.deepEqual(rebuilt.rebuiltFiles, [
    "derived/as-of/h1/DOSSIER.md",
    "derived/as-of/h1/VIEW.json",
    "derived/current/DOSSIER.md",
    "derived/current/VIEW.json",
  ]);
  assertFileMapsEqual(expected, await fileMap(path.join(item.root, "derived")));
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "current");
});

test("projection corruption is diagnostic, rebuildable, and unexpected files fail closed", async () => {
  const item = await fixture();
  await happyPath(item);
  const viewPath = path.join(item.root, "derived/current/VIEW.json");
  await writeFile(viewPath, "{}\n", "utf8");
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "invalid");
  await rebuildProjections({ root: item.root });
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "current");
  await writeFile(path.join(item.root, "derived", "unexpected.txt"), "x\n", "utf8");
  await expectCode(rebuildProjections({ root: item.root }), "PROJECTION_INTEGRITY");
});

test("verify distinguishes stale, invalid, absent, and current projections", async () => {
  const item = await fixture();
  await happyPath(item);
  await publishDossier({ horizonName: "h1", root: item.root });
  for (const name of ["VIEW.json", "DOSSIER.md"]) {
    await writeFile(
      path.join(item.root, "derived/current", name),
      await readFile(path.join(item.root, "derived/as-of/h1", name)),
    );
  }
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "stale");
  await rebuildProjections({ root: item.root });
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "current");
  await chmod(path.join(item.root, "derived/current/VIEW.json"), 0o644);
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "invalid");
  await rebuildProjections({ root: item.root });
  await mkdir(path.join(item.root, "derived", "unexpected-empty"), {
    recursive: true,
  });
  await expectCode(rebuildProjections({ root: item.root }), "PROJECTION_INTEGRITY");
});

test("canonical and snapshot tampering fail closed and are never repaired", async () => {
  const item = await fixture();
  await happyPath(item);
  const journalPath = path.join(item.root, "canonical/JOURNAL.jsonl");
  const journal = await readFile(journalPath);
  await writeFile(journalPath, Buffer.concat([journal, Buffer.from("{}\n")]));
  await expectCode(verifyWorkspace({ root: item.root }), "CANONICAL_INTEGRITY");
  assert.deepEqual(await readFile(journalPath), Buffer.concat([journal, Buffer.from("{}\n")]));

  const second = await fixture();
  await happyPath(second);
  const snapshots = await readdir(path.join(second.root, "canonical/snapshots"));
  await writeFile(
    path.join(second.root, "canonical/snapshots", snapshots[0]),
    "tampered\n",
  );
  await expectCode(verifyWorkspace({ root: second.root }), "SNAPSHOT_INTEGRITY");

  const third = await fixture();
  await happyPath(third);
  await mkdir(path.join(third.root, "canonical", "unexpected-empty"));
  await expectCode(verifyWorkspace({ root: third.root }), "CANONICAL_INTEGRITY");
});

test("writer lock rejects a concurrent mutation", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await writeFile(path.join(item.root, ".writer.lock"), "synthetic\n", {
    mode: 0o600,
  });
  await expectCode(
    openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 }),
    "CONCURRENT_WRITER",
  );
  await expectCode(verifyWorkspace({ root: item.root }), "CONCURRENT_WRITER");
  await rm(path.join(item.root, ".writer.lock"));
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
});

test("all illegal lifecycle transitions fail without publishing state", async () => {
  const item = await fixture();
  await expectCode(addSource({ alias: "s", logicalPath: "README.md", root: item.root }), "NOT_INITIALIZED");
  await expectCode(
    addAssertion({
      alias: "a",
      firstLine: 1,
      lastLine: 1,
      root: item.root,
      sourceAlias: "s",
      text: "A",
    }),
    "NOT_INITIALIZED",
  );
  await initializeWorkspace({ owner: "owner", root: item.root });
  await expectCode(initializeWorkspace({ owner: "owner", root: item.root }), "ALREADY_INITIALIZED");
  for (const operation of [
    () => addSource({ alias: "s", logicalPath: "README.md", root: item.root }),
    () => addQuestion({ alias: "q", root: item.root, text: "Q?" }),
    () => undoDraft({ root: item.root }),
    () => abortHorizon({ root: item.root }),
    () => closeHorizon({ root: item.root }),
  ]) {
    await expectCode(operation(), "NO_OPEN_HORIZON");
  }
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await expectCode(
    openHorizon({ name: "h2", root: item.root, sourceRoot: item.h2 }),
    "HORIZON_ALREADY_OPEN",
  );
  await expectCode(
    reviseAssertion({
      assertionAlias: "missing",
      firstLine: 1,
      lastLine: 1,
      reason: "Missing.",
      root: item.root,
      sourceAlias: "missing",
      text: "Missing.",
    }),
    "REFERENCE_NOT_FOUND",
  );
  await expectCode(
    addQuestion({
      alias: "q",
      firstLine: 1,
      lastLine: 1,
      root: item.root,
      sourceAlias: "missing",
      text: "Q?",
    }),
    "REFERENCE_NOT_FOUND",
  );
  await expectCode(closeHorizon({ root: item.root }), "REFERENCE_NOT_FOUND");
});

test("aliases and horizon names are unique within their workspace kinds", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "source", logicalPath: "README.md", root: item.root });
  await addAssertion({
    alias: "claim",
    firstLine: 1,
    lastLine: 1,
    root: item.root,
    sourceAlias: "source",
    text: "Claim.",
  });
  await addQuestion({ alias: "question", root: item.root, text: "Question?" });
  await closeHorizon({ root: item.root });
  await expectCode(
    openHorizon({ name: "h1", root: item.root, sourceRoot: item.h2 }),
    "INVALID_ALIAS",
  );
  await openHorizon({ name: "h2", root: item.root, sourceRoot: item.h2 });
  await expectCode(
    addSource({ alias: "source", logicalPath: "README.md", root: item.root }),
    "INVALID_ALIAS",
  );
  await addSource({ alias: "source-two", logicalPath: "README.md", root: item.root });
  await expectCode(
    addAssertion({
      alias: "claim",
      firstLine: 1,
      lastLine: 1,
      root: item.root,
      sourceAlias: "source-two",
      text: "Replacement.",
    }),
    "INVALID_ALIAS",
  );
  await expectCode(
    addQuestion({ alias: "question", root: item.root, text: "Again?" }),
    "INVALID_ALIAS",
  );
});

test("verify and rebuild never read the former host source root", async () => {
  const item = await fixture();
  await happyPath(item);
  await rm(item.h1, { force: true, recursive: true });
  await rm(item.h2, { force: true, recursive: true });
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "current");
  await rm(path.join(item.root, "derived/current"), { force: true, recursive: true });
  await rebuildProjections({ root: item.root });
  assert.equal((await verifyWorkspace({ root: item.root })).projectionStatus, "current");
});

test("same bytes with changed host identity are rejected at close", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "source", logicalPath: "README.md", root: item.root });
  const original = await readFile(path.join(item.h1, "README.md"));
  await rm(path.join(item.h1, "README.md"));
  await writeFile(path.join(item.h1, "README.md"), original);
  await expectCode(closeHorizon({ root: item.root }), "SOURCE_CHANGED");
});

test("the real workbench orders every small inventory permutation identically", async () => {
  const permutations = [
    ["CHANGELOG.md", "adapter.py", "requirements.txt"],
    ["CHANGELOG.md", "requirements.txt", "adapter.py"],
    ["adapter.py", "CHANGELOG.md", "requirements.txt"],
    ["adapter.py", "requirements.txt", "CHANGELOG.md"],
    ["requirements.txt", "CHANGELOG.md", "adapter.py"],
    ["requirements.txt", "adapter.py", "CHANGELOG.md"],
  ];
  for (const [run, permutation] of permutations.entries()) {
    const item = await fixture();
    const sourceRoot = path.join(item.temporaryRoot, `m10-${run}`);
    await mkdir(sourceRoot);
    for (const [index, name] of permutation.entries()) {
      await writeFile(path.join(sourceRoot, name), `${name}:${index}\n`, "utf8");
    }
    await initializeWorkspace({ owner: "owner", root: item.root });
    await openHorizon({ name: "h1", root: item.root, sourceRoot });
    for (const [index, name] of permutation.entries()) {
      await addSource({
        alias: `source-${index}`,
        logicalPath: name,
        root: item.root,
      });
    }
    await closeHorizon({ root: item.root });
    assert.deepEqual(
      (await readJournal(item.root))
        .filter((record) => record.kind === "SourceSnapshot")
        .map((record) => record.body.logicalPath),
      ["CHANGELOG.md", "adapter.py", "requirements.txt"],
    );
  }
});

test("command option order is independent for every horizon-open permutation", async () => {
  const options = [
    ["--name", "h1"],
    ["--source-root", null],
    ["--scope", "selected files"],
    ["--coverage", "closed-selection"],
  ];
  const orders = [
    [0, 1, 2, 3],
    [3, 2, 1, 0],
    [1, 3, 0, 2],
    [2, 0, 3, 1],
  ];
  for (const order of orders) {
    const item = await fixture();
    cliSuccess(item.root, ["init", "--owner", "owner"]);
    const flattened = order.flatMap((index) => {
      const [key, value] = options[index];
      return [key, value ?? item.h1];
    });
    const result = cliSuccess(item.root, ["horizon", "open", ...flattened]);
    assert.deepEqual(
      {
        coverage: result.result.coverage,
        name: result.result.name,
        scope: result.result.scope,
      },
      { coverage: "closed-selection", name: "h1", scope: "selected files" },
    );
  }
});

test("the 96-file limit is measured before publication", async () => {
  const item = await fixture();
  const many = path.join(item.temporaryRoot, "many");
  await mkdir(many);
  for (let index = 0; index < 100; index += 1) {
    await writeFile(path.join(many, `f-${index}.txt`), `${index}\n`, "utf8");
  }
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: many });
  let accepted = 0;
  for (let index = 0; index < 100; index += 1) {
    try {
      await addSource({
        alias: `source-${index}`,
        logicalPath: `f-${index}.txt`,
        root: item.root,
      });
      accepted += 1;
    } catch (error) {
      assert.equal(error.code, "LIMIT_EXCEEDED");
      break;
    }
  }
  assert.ok(accepted > 0 && accepted < 100);
  const draft = JSON.parse(await readFile(path.join(item.root, "draft/STATE.json"), "utf8"));
  assert.equal(draft.actions.length, accepted);
  const activeState = await testing.loadWorkspace(item.root);
  const regularFiles = (await fileMap(activeState.stateRoot)).size;
  assert.ok(regularFiles <= limits.regularFiles);
});

test("workspace is owner-only and internal links stay within its active state", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  const stat = await lstat(item.root);
  assert.equal(stat.mode & 0o077, 0);
  assert.equal(await readlink(path.join(item.root, "canonical")), ".active/canonical");
  assert.equal(await readlink(path.join(item.root, "draft")), ".active/draft");
  assert.equal(await readlink(path.join(item.root, "derived")), ".active/derived");
});

test("retained-byte and canonical-record limits refuse before publication", async () => {
  const item = await fixture();
  await writeFile(path.join(item.h1, "large.txt"), Buffer.alloc(limits.retainedBytes, 0x61));
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await expectCode(
    addSource({ alias: "large", logicalPath: "large.txt", root: item.root }),
    "LIMIT_EXCEEDED",
  );
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  for (let index = 0; index < 61; index += 1) {
    await addQuestion({
      alias: `q-${index}`,
      root: item.root,
      text: `Question ${index}?`,
    });
  }
  const before = await readFile(path.join(item.root, "canonical/JOURNAL.jsonl"));
  await expectCode(closeHorizon({ root: item.root }), "LIMIT_EXCEEDED");
  assert.deepEqual(await readFile(path.join(item.root, "canonical/JOURNAL.jsonl")), before);
});

test("partial coverage remains explicit and never creates absence claims", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await openHorizon({ name: "h1", root: item.root, sourceRoot: item.h1 });
  await addSource({ alias: "readme", logicalPath: "README.md", root: item.root });
  await closeHorizon({ root: item.root });
  const view = JSON.parse(
    await readFile(path.join(item.root, "derived/current/VIEW.json"), "utf8"),
  );
  assert.deepEqual(view.coverage, { mode: "partial", scope: null });
  assert.equal(JSON.stringify(view).includes("absence"), false);
  assert.equal(JSON.stringify(view).includes("absent"), false);
});

test("all product imports are Node built-ins or local modules and contain no network client", async () => {
  const source = `${await readFile(path.join(moduleRoot, "core.mjs"), "utf8")}\n${await readFile(
    path.join(moduleRoot, "cli.mjs"),
    "utf8",
  )}`;
  const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  assert.ok(imports.every((specifier) => specifier.startsWith("node:") || specifier.startsWith("./")));
  assert.doesNotMatch(source, /node:(?:http|https|net|tls)|\bfetch\s*\(/);
});

test("root mode tampering is detected rather than normalized", async () => {
  const item = await fixture();
  await initializeWorkspace({ owner: "owner", root: item.root });
  await chmod(item.root, 0o755);
  await expectCode(verifyWorkspace({ root: item.root }), "CANONICAL_INTEGRITY");
  assert.equal((await lstat(item.root)).mode & 0o077, 0o055);
});
