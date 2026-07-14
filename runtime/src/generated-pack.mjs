import { cp, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { listRegularFiles, prettyJson, randomToken, readJson, sha256 } from "./lib.mjs";

function token(seed, label, length = 12) {
  return sha256(`${seed}\0${label}`).slice(0, length);
}

function replaceAll(text, replacements) {
  let result = text;
  for (const [from, to] of replacements) result = result.split(from).join(to);
  return result;
}

export async function generateSyntheticPack(templateRoot, targetRoot, seed = randomToken()) {
  const generated = {
    seed,
    runId: `generated-run-${token(seed, "run")}`,
    corpusId: `generated-corpus-${token(seed, "corpus")}`,
    taskPackId: `generated-tasks-${token(seed, "tasks")}`,
    oracleId: `generated-oracle-${token(seed, "oracle")}`,
    projectName: `Project Quartz-${token(seed, "project", 6)}`,
    connector: `connector-${token(seed, "connector", 8)}`,
    oldDay: `old-day-${token(seed, "old-day", 6)}`,
    newDay: `new-day-${token(seed, "new-day", 6)}`,
    futureCanary: `future-${token(seed, "future-canary", 24)}`,
  };
  const itemIds = Array.from({ length: 4 }, (_, index) => `item-${token(seed, `item-${index + 1}`, 16)}`);
  const taskIds = Array.from({ length: 4 }, (_, index) => `task-${token(seed, `task-${index + 1}`, 16)}`);
  const anchors = [
    "initial-plan",
    "offline-requirement",
    "connector-decision",
    "decision-scope",
    "copied-handoff",
    "authority-warning",
    "handoff-correction",
    "correction-scope",
  ].map((value) => [value, `anchor-${token(seed, value, 16)}`]);
  const sourcePaths = Array.from(
    { length: 4 },
    (_, index) => `sources/source-${token(seed, `source-path-${index + 1}`, 16)}.md`,
  );
  const canaryPath = `negative-fixtures/future/CANARY-${token(seed, "future-filename", 20)}.md`;
  const replacements = [
    ["replay-preflight-v0", generated.runId],
    ["lantern-public-synthetic-v0", generated.corpusId],
    ["lantern-replay-tasks-v0", generated.taskPackId],
    ["lantern-replay-oracle-v0", generated.oracleId],
    ["lantern-planning", `family-${token(seed, "family-plan", 12)}`],
    ["lantern-handoff", `family-${token(seed, "family-handoff", 12)}`],
    ["LANTERN-001", `DECISION-${token(seed, "decision", 10)}`],
    ["Project Lantern", generated.projectName],
    ["Amber", generated.connector],
    ["amber", generated.connector],
    ["Friday", generated.oldDay],
    ["Monday", generated.newDay],
    ...itemIds.map((value, index) => [`item-000${index + 1}`, value]),
    ...taskIds.map((value, index) => [
      [
        "task-selected-connector",
        "task-current-handoff",
        "task-corrected-handoff",
        "task-production-capacity",
      ][index],
      value,
    ]),
    ...anchors,
    ...sourcePaths.map((value, index) => [`sources/000${index + 1}-${["plan", "decision", "stale-copy", "correction"][index]}.md`, value]),
    ["negative-fixtures/future/CANARY-future-answer-is-monday.md", canaryPath],
  ];

  await cp(templateRoot, targetRoot, { recursive: true, verbatimSymlinks: true });
  const files = await listRegularFiles(targetRoot);
  for (const relative of files) {
    const filename = path.join(targetRoot, relative);
    const content = await readFile(filename, "utf8");
    await writeFile(filename, replaceAll(content, replacements));
  }
  for (let index = 0; index < sourcePaths.length; index += 1) {
    const oldPath = path.join(
      targetRoot,
      "sources",
      `000${index + 1}-${["plan", "decision", "stale-copy", "correction"][index]}.md`,
    );
    const newPath = path.join(targetRoot, sourcePaths[index]);
    await mkdir(path.dirname(newPath), { recursive: true });
    await rename(oldPath, newPath);
    const marker = `Generated source marker ${token(seed, `source-marker-${index + 1}`, 28)}.`;
    await writeFile(newPath, `${await readFile(newPath, "utf8")}\n${marker}\n`);
  }
  const oldCanary = path.join(
    targetRoot,
    "negative-fixtures",
    "future",
    "CANARY-future-answer-is-monday.md",
  );
  const newCanary = path.join(targetRoot, canaryPath);
  await rename(oldCanary, newCanary);
  await writeFile(newCanary, `# Controller-only generated canary\n\n${generated.futureCanary}\n`);

  const manifestPath = path.join(targetRoot, "corpus-manifest.json");
  const manifest = await readJson(manifestPath);
  manifest.corpusId = generated.corpusId;
  for (const [index, item] of manifest.items.entries()) {
    item.id = itemIds[index];
    item.path = sourcePaths[index];
    item.sourceLineage.parents = item.sourceLineage.parents.map((parent) => {
      const parentIndex = itemIds.indexOf(parent);
      return parentIndex === -1 ? parent : itemIds[parentIndex];
    });
  }
  // Text replacement already changed parent IDs. Refresh bytes and digests last.
  for (const item of manifest.items) {
    const content = await readFile(path.join(targetRoot, item.path));
    item.bytes = content.byteLength;
    item.sha256 = sha256(content);
  }
  // Keep the locked array deliberately non-chronological. The controller must
  // use item.order rather than trusting JSON or filesystem enumeration order.
  manifest.items = [manifest.items[2], manifest.items[0], manifest.items[3], manifest.items[1]];
  await writeFile(manifestPath, prettyJson(manifest));

  const sandboxPath = path.join(targetRoot, "sandbox-policy.json");
  const sandbox = await readJson(sandboxPath);
  const canary = sandbox.negativeFixtures.find(({ id }) => id === "future-filename-canary");
  const canaryBytes = await readFile(newCanary);
  canary.path = canaryPath;
  canary.bytes = canaryBytes.byteLength;
  canary.sha256 = sha256(canaryBytes);
  await writeFile(sandboxPath, prettyJson(sandbox));

  const runCardPath = path.join(targetRoot, "run-card.json");
  const runCard = await readJson(runCardPath);
  runCard.runId = generated.runId;
  for (const input of runCard.frozenInputs) {
    input.sha256 = sha256(await readFile(path.join(targetRoot, input.path)));
  }
  await writeFile(runCardPath, prettyJson(runCard));

  const lockPath = path.join(targetRoot, "pack-lock.json");
  const lock = await readJson(lockPath);
  lock.packId = generated.runId;
  lock.runId = generated.runId;
  lock.publicExternalAnchor = "The runtime controller records the generated lock digest before reveal.";
  for (const entry of lock.immutableFiles) {
    const content = await readFile(path.join(targetRoot, entry.path));
    entry.sha256 = sha256(content);
  }
  for (const entry of lock.mutableFiles) {
    const content = await readFile(path.join(targetRoot, entry.path));
    entry.initialBytes = content.byteLength;
    entry.initialSha256 = sha256(content);
  }
  await writeFile(lockPath, prettyJson(lock));

  generated.itemIds = itemIds;
  generated.taskIds = taskIds;
  generated.sourcePaths = sourcePaths;
  generated.sourceMarkers = Array.from(
    { length: 4 },
    (_, index) => token(seed, `source-marker-${index + 1}`, 28),
  );
  generated.canaryPath = canaryPath;
  generated.lockDigest = sha256(await readFile(lockPath));
  return generated;
}
