import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  defaultPackDirectory,
  formatHumanResult,
  parseStrictJson,
  validatePack,
} from "./preflight.mjs";

async function withPack(mutate, expectedCode) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-preflight-"));
  const pack = path.join(temporaryRoot, "pack");
  try {
    await cp(defaultPackDirectory, pack, { recursive: true, verbatimSymlinks: true });
    await mutate(pack);
    const result = await validatePack(pack);
    assert.equal(result.ok, false);
    assert.ok(
      result.diagnostics.some((diagnostic) => diagnostic.code === expectedCode),
      `expected ${expectedCode}, received ${result.diagnostics.map(({ code }) => code).join(", ")}`,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function updateJson(pack, relative, update) {
  const filename = path.join(pack, relative);
  const value = JSON.parse(await readFile(filename, "utf8"));
  update(value);
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`);
}

test("the frozen public synthetic pack passes preflight", async () => {
  const result = await validatePack();
  assert.deepEqual(result, { ok: true, diagnostics: [] });
});

test("strict JSON parsing rejects decoded duplicate keys at any depth", () => {
  assert.throws(
    () => parseStrictJson('{"outer":{"alpha":1,"\\u0061lpha":2}}'),
    (error) => error.code === "JSON_DUPLICATE_KEY",
  );
  assert.throws(() => parseStrictJson('{"overflow":1e400}'), /invalid JSON/);
});

test("a pack JSON document with duplicate keys is rejected", async () => {
  await withPack(async (pack) => {
    const filename = path.join(pack, "corpus-manifest.json");
    const content = await readFile(filename, "utf8");
    await writeFile(filename, content.replace(
      '  "corpusId": "lantern-public-synthetic-v0",',
      '  "corpusId": "lantern-public-synthetic-v0",\n  "corpusId": "duplicate",',
    ));
  }, "JSON_DUPLICATE_KEY");
});

test("run history timestamps must be valid UTC RFC3339 values", async () => {
  await withPack(
    (pack) => updateJson(pack, "run-card.json", (value) => {
      value.stateHistory[0].at = "2026-07-12T03:00:00+03:00";
    }),
    "RUN_HISTORY",
  );
  await withPack(
    (pack) => updateJson(pack, "run-card.json", (value) => {
      value.stateHistory[0].at = "2026-02-30T00:00:00Z";
    }),
    "RUN_HISTORY",
  );
  await withPack(
    (pack) => updateJson(pack, "run-card.json", (value) => {
      value.stateHistory[0].at = "2026-07-12T00:00:00.000000002Z";
      value.stateHistory[1].at = "2026-07-12T00:00:00.000000001Z";
    }),
    "RUN_HISTORY",
  );
});

test("a changed source fails its frozen digest", async () => {
  await withPack(async (pack) => {
    const source = path.join(pack, "sources", "0001-plan.md");
    await writeFile(source, `${await readFile(source, "utf8")}changed\n`);
  }, "SOURCE_DIGEST");
});

test("an unsafe corpus path is rejected without reading it", async () => {
  await withPack(
    (pack) => updateJson(pack, "corpus-manifest.json", (value) => {
      value.items[0].path = "../outside.md";
    }),
    "UNSAFE_PATH",
  );
});

test("an oracle reference to an unknown task is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "oracle.json", (value) => {
      value.judgments[0].taskId = "task-not-declared";
    }),
    "ORACLE_TASK_REF",
  );
});

test("a zero resource budget is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "run-card.json", (value) => {
      value.budgets.maxWallClockSeconds = 0;
    }),
    "RUN_BUDGET",
  );
});

test("network enablement is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "sandbox-policy.json", (value) => {
      value.network.default = "allow";
      value.network.egressAllowed = true;
    }),
    "SANDBOX_NETWORK",
  );
});

test("a symlinked source tree is rejected without enumerating external names", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-preflight-"));
  const pack = path.join(temporaryRoot, "pack");
  const outside = path.join(temporaryRoot, "outside");
  const privateLookingName = "PRIVATE-CUSTOMER-NAME.md";
  try {
    await cp(defaultPackDirectory, pack, { recursive: true, verbatimSymlinks: true });
    await rm(path.join(pack, "sources"), { recursive: true });
    await cp(path.join(defaultPackDirectory, "sources"), outside, { recursive: true });
    await writeFile(path.join(outside, privateLookingName), "must not be enumerated\n");
    await symlink(outside, path.join(pack, "sources"), "dir");
    const result = await validatePack(pack);
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some(({ code }) => code === "SYMLINK"));
    assert.equal(JSON.stringify(result).includes(privateLookingName), false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("a malformed lineage returns diagnostics instead of throwing", async () => {
  await withPack(
    (pack) => updateJson(pack, "corpus-manifest.json", (value) => {
      value.items[0].sourceLineage.parents = 42;
    }),
    "SOURCE_LINEAGE",
  );
});

test("a malformed logging declaration returns diagnostics instead of throwing", async () => {
  await withPack(
    (pack) => updateJson(pack, "sandbox-policy.json", (value) => {
      value.logging.forbidden = 42;
    }),
    "SANDBOX_LOGGING",
  );
});

test("an undeclared file fails the closed pack inventory", async () => {
  await withPack(
    (pack) => writeFile(path.join(pack, "unreviewed-notes.md"), "synthetic stray file\n"),
    "PACK_LOCK_INVENTORY",
  );
});

test("an oracle outcome inconsistent with its task class is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "oracle.json", (value) => {
      value.judgments[0].expected.status = "abstain";
    }),
    "ORACLE_OUTCOME",
  );
});

test("oracle answer elements must close the frozen task requirements", async () => {
  await withPack(
    (pack) => updateJson(pack, "oracle.json", (value) => {
      value.judgments[0].expected.elements = ["unrelated element"];
    }),
    "ORACLE_OUTCOME",
  );
});

test("a changed negative-fixture outcome is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "sandbox-policy.json", (value) => {
      value.negativeFixtures.find(({ id }) => id === "network-egress").expected = "allow";
    }),
    "NEGATIVE_FIXTURE_CONTRACT",
  );
});

test("an empty SUT readable-root declaration is rejected", async () => {
  await withPack(
    (pack) => updateJson(pack, "run-card.json", (value) => {
      value.inferenceBoundary.sutReadableRoots = [];
    }),
    "RUN_BOUNDARY",
  );
});

test("the exposure plan cannot grant the SUT oracle visibility", async () => {
  await withPack(
    (pack) => updateJson(pack, "exposure-plan.json", (value) => {
      value.roleAssignments.find(({ role }) => role === "sutOperator").inputsVisible.push("oracle");
    }),
    "EXPOSURE_ROLE",
  );
});

test("invalid UTF-8 in a source is rejected", async () => {
  await withPack(
    (pack) => writeFile(path.join(pack, "sources", "0001-plan.md"), Buffer.from([0xff, 0xfe])),
    "UTF8",
  );
});

test("a malformed appended log record is rejected", async () => {
  await withPack(async (pack) => {
    const log = path.join(pack, "logs", "deviations.jsonl");
    await writeFile(log, `${await readFile(log, "utf8")}not-json\n`);
  }, "LOG_RECORD");
});

test("an appended JSONL record with duplicate keys is rejected", async () => {
  await withPack(async (pack) => {
    const log = path.join(pack, "logs", "deviations.jsonl");
    const duplicate = '{"recordType":"deviation","runId":"replay-preflight-v0","sequence":1,"sequence":2}';
    await writeFile(log, `${await readFile(log, "utf8")}${duplicate}\n`);
  }, "LOG_DUPLICATE_KEY");
});

test("JSONL timestamps must use valid UTC RFC3339 values", async () => {
  await withPack(async (pack) => {
    const log = path.join(pack, "logs", "deviations.jsonl");
    const record = {
      recordType: "deviation",
      runId: "replay-preflight-v0",
      sequence: 1,
      at: "2026-07-12T03:02:00+03:00",
      state: "frozen",
      stepRef: "step-0001",
      departureClass: "none",
      causeClass: "synthetic-self-test",
      validityImpact: "none",
      decision: "continue",
      actorRole: "controller",
    };
    await writeFile(log, `${await readFile(log, "utf8")}${JSON.stringify(record)}\n`);
  }, "LOG_METADATA");
});

test("a schema-valid append preserves the initial pack lock", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-preflight-"));
  const pack = path.join(temporaryRoot, "pack");
  try {
    await cp(defaultPackDirectory, pack, { recursive: true, verbatimSymlinks: true });
    const log = path.join(pack, "logs", "deviations.jsonl");
    const record = {
      recordType: "deviation",
      runId: "replay-preflight-v0",
      sequence: 1,
      at: "2026-07-12T00:02:00Z",
      state: "frozen",
      stepRef: "step-0001",
      departureClass: "none",
      causeClass: "synthetic-self-test",
      validityImpact: "none",
      decision: "continue",
      actorRole: "controller",
    };
    await writeFile(log, `${await readFile(log, "utf8")}${JSON.stringify(record)}\n`);
    assert.deepEqual(await validatePack(pack), { ok: true, diagnostics: [] });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("human diagnostics reveal neither absolute pack paths nor source content", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-preflight-"));
  const pack = path.join(temporaryRoot, "private-looking-pack");
  const marker = "synthetic-content-must-not-appear-in-diagnostics";
  try {
    await cp(defaultPackDirectory, pack, { recursive: true, verbatimSymlinks: true });
    const source = path.join(pack, "sources", "0001-plan.md");
    await writeFile(source, `${await readFile(source, "utf8")}\n${marker}\n`);
    const output = formatHumanResult(await validatePack(pack));
    assert.match(output, /SOURCE_DIGEST/);
    assert.equal(output.includes(temporaryRoot), false);
    assert.equal(output.includes(marker), false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
