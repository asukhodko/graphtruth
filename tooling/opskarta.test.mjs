import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolingDirectory, "..");
const validator = path.join(toolingDirectory, "opskarta");
const checkedPlan = path.join(repositoryRoot, "docs/planning/graphtruth.plan.yaml");

async function withTemporaryPlan(content, action) {
  const root = await mkdtemp(path.join(os.tmpdir(), "graphtruth-opskarta-test-"));
  const plan = path.join(root, "test.plan.yaml");
  try {
    await writeFile(plan, content);
    return await action(plan);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("checked-in OpsKarta plan passes strict validation", async () => {
  const result = await execFileAsync(validator, ["--strict", checkedPlan]);
  assert.equal(result.stdout, "OK\n");
  assert.equal(result.stderr, "");
});

test("GraphTruth adapter rejects duplicate YAML keys", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: duplicate-key
  title: Duplicate key
nodes:
  root: { title: First }
  root: { title: Second }
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /duplicate key 'root'/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter requires an explicit v3 version", async () => {
  await withTemporaryPlan(
    `meta:
  id: missing-version
  title: Missing version
nodes:
  root:
    title: Root
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /'version' is a required property/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter rejects non-string YAML mapping keys", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: numeric-key
  title: Numeric key
nodes:
  1:
    title: Root
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /mapping keys must be strings, got int/);
          assert.doesNotMatch(error.stderr, /Traceback/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter diagnoses complex YAML keys without a traceback", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: complex-key
  title: Complex key
nodes:
  ? [root]
  :
    title: Root
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /mapping keys must be strings, got list/);
          assert.doesNotMatch(error.stderr, /Traceback/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter rejects cyclic YAML aliases without a traceback", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: cyclic-alias
  title: Cyclic alias
x:
  loop: &loop [*loop]
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /YAML aliases are not allowed/);
          assert.doesNotMatch(error.stderr, /Traceback|RecursionError/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter rejects non-finite YAML numbers", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: non-finite-number
  title: Non-finite number
nodes:
  root:
    title: Root
    effort: .nan
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /non-finite number \(path: nodes\.root\.effort\)/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter rejects fields outside the OpsKarta schema", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: unknown-field
  title: Unknown field
nodes:
  root:
    title: Root
    invented: true
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /Additional properties are not allowed \('invented'/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth adapter rejects broken OpsKarta references", async () => {
  await withTemporaryPlan(
    `version: 3
meta:
  id: broken-reference
  title: Broken reference
nodes:
  root:
    title: Root
    deps: [missing]
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, ["--strict", plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /non-existent node 'missing'/);
          return true;
        },
      );
    },
  );
});

test("GraphTruth profile requires a named merged plan", async () => {
  await withTemporaryPlan(
    `version: 3
meta: {}
nodes:
  root:
    title: Root
`,
    async (plan) => {
      await assert.rejects(
        () => execFileAsync(validator, [plan]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /merged plan must define meta\.id/);
          assert.match(error.stderr, /merged plan must define meta\.title/);
          return true;
        },
      );
    },
  );
});
