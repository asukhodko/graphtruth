import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolingDirectory, "..");

export const defaultPackDirectory = path.join(
  repositoryRoot,
  "examples",
  "experiments",
  "preflight",
);

export const evidenceContractTwinDirectory = path.join(
  repositoryRoot,
  "examples",
  "experiments",
  "evidence-contract-twin-v1",
);

const requiredFiles = [
  "README.md",
  "corpus-manifest.json",
  "data-handling.json",
  "exposure-plan.json",
  "incident-response.md",
  "learning-record.md",
  "logs/deviations.jsonl",
  "logs/failure-diary.jsonl",
  "logs/state-transitions.jsonl",
  "negative-fixtures/README.md",
  "oracle.json",
  "pack-lock.json",
  "review-rubric.json",
  "run-card.json",
  "sandbox-policy.json",
  "task-pack.json",
];

const frozenInputPaths = [
  "corpus-manifest.json",
  "task-pack.json",
  "oracle.json",
  "data-handling.json",
  "sandbox-policy.json",
  "review-rubric.json",
  "exposure-plan.json",
  "incident-response.md",
];

const expectedFormats = new Map([
  ["corpus-manifest.json", "graphtruth.experimental.corpus-manifest/0"],
  ["data-handling.json", "graphtruth.experimental.data-handling/0"],
  ["exposure-plan.json", "graphtruth.experimental.exposure-plan/0"],
  ["oracle.json", "graphtruth.experimental.oracle/0"],
  ["pack-lock.json", "graphtruth.experimental.pack-lock/0"],
  ["review-rubric.json", "graphtruth.experimental.review-rubric/0"],
  ["run-card.json", "graphtruth.experimental.run-card/0"],
  ["sandbox-policy.json", "graphtruth.experimental.sandbox-policy/0"],
  ["task-pack.json", "graphtruth.experimental.task-pack/0"],
]);

const requiredTaskClasses = new Set([
  "answerable",
  "not-yet-answerable",
  "permanently-unanswerable",
]);

const requiredNegativeFixtures = new Map([
  ["future-filename-canary", ["stored-controller-only", "hidden-from-sut"]],
  ["symlink", ["generated-at-test-time", "reject"]],
  ["path-traversal", ["generated-at-test-time", "reject"]],
  ["write-outside-workdir", ["generated-at-test-time", "deny"]],
  ["network-egress", ["generated-at-test-time", "deny"]],
  ["telemetry-emission", ["generated-at-test-time", "deny"]],
  ["credential-access", ["generated-at-test-time", "deny"]],
  ["oracle-access", ["generated-at-test-time", "deny"]],
  ["future-manifest-access", ["generated-at-test-time", "deny"]],
  ["invalid-utf8", ["generated-at-test-time", "reject"]],
  ["oversized-input", ["generated-at-test-time", "reject"]],
  ["prompt-injection", ["generated-at-test-time", "treat-as-data"]],
  ["remote-markdown-link", ["generated-at-test-time", "do-not-fetch"]],
  ["secret-canary", ["generated-at-test-time", "do-not-observe-or-log"]],
  ["crash-before-publication", ["generated-at-test-time", "resume-prior-head"]],
  ["crash-after-publication", ["generated-at-test-time", "resume-published-head"]],
]);

const requiredReadableRoots = new Set([
  "current-reveal-bundle",
  "permitted-ledger-horizon",
  "isolated-workdir",
]);

const requiredSevereErrors = new Set([
  "unsupported-assertion",
  "future-leak",
  "missed-required-abstention",
  "source-instruction-execution",
  "implicit-acceptance-or-irreversible-merge",
  "provenance-or-history-loss",
  "projection-only-meaning",
  "non-idempotent-replay",
  "rebuild-or-redaction-residue",
  "data-boundary-breach",
]);

const maxPackFiles = 128;
const maxPackDepth = 8;
const maxFileBytes = 1024 * 1024;
const maxPackBytes = 8 * 1024 * 1024;

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

class DuplicateJsonKeyError extends SyntaxError {
  constructor() {
    super("duplicate JSON object key");
    this.code = "JSON_DUPLICATE_KEY";
  }
}

export function parseStrictJson(text) {
  let index = 0;

  const fail = () => {
    throw new SyntaxError("invalid JSON");
  };
  const skipWhitespace = () => {
    while (index < text.length && /[\x20\x09\x0a\x0d]/.test(text[index])) index += 1;
  };
  const parseString = () => {
    if (text[index] !== '"') fail();
    const start = index;
    index += 1;
    while (index < text.length) {
      const character = text[index];
      index += 1;
      if (character === '"') return JSON.parse(text.slice(start, index));
      if (character === "\\") {
        if (index >= text.length) fail();
        const escape = text[index];
        index += 1;
        if (escape === "u") {
          if (!/^[a-fA-F0-9]{4}$/.test(text.slice(index, index + 4))) fail();
          index += 4;
        } else if (!'"\\/bfnrt'.includes(escape)) {
          fail();
        }
      } else if (character.charCodeAt(0) <= 0x1f) {
        fail();
      }
    }
    fail();
  };
  const parseNumber = () => {
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(index));
    if (!match || !Number.isFinite(Number(match[0]))) fail();
    index += match[0].length;
  };
  const parseValue = (depth = 0) => {
    if (depth > 256) fail();
    skipWhitespace();
    if (text[index] === "{") {
      index += 1;
      skipWhitespace();
      const keys = new Set();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        const key = parseString();
        if (keys.has(key)) throw new DuplicateJsonKeyError();
        keys.add(key);
        skipWhitespace();
        if (text[index] !== ":") fail();
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") fail();
        index += 1;
        skipWhitespace();
      }
      fail();
    }
    if (text[index] === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") fail();
        index += 1;
      }
      fail();
    }
    if (text[index] === '"') {
      parseString();
      return;
    }
    for (const literal of ["true", "false", "null"]) {
      if (text.startsWith(literal, index)) {
        index += literal.length;
        return;
      }
    }
    parseNumber();
  };

  parseValue();
  skipWhitespace();
  if (index !== text.length) fail();
  return JSON.parse(text);
}

function normalizeUtcRfc3339Timestamp(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?Z$/.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = ""] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const valid =
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1] &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59;
  return valid
    ? `${yearText}${monthText}${dayText}${hourText}${minuteText}${secondText}${fraction.padEnd(9, "0")}`
    : null;
}

function isUtcRfc3339Timestamp(value) {
  return normalizeUtcRfc3339Timestamp(value) !== null;
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isSafeRelativePath(value) {
  if (!isNonEmptyString(value) || value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) {
    return false;
  }
  if (path.posix.isAbsolute(value) || path.posix.normalize(value) !== value) {
    return false;
  }
  return !value.split("/").some((part) => part === "" || part === "." || part === "..");
}

function decodeUtf8(content, relative, add) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(content);
  } catch {
    add("UTF8", relative, "file must contain valid UTF-8");
    return null;
  }
}

function sameMembers(values, expected) {
  return (
    Array.isArray(values) &&
    values.length === expected.size &&
    new Set(values).size === values.length &&
    values.every((value) => expected.has(value))
  );
}

async function inspectTree(root, add) {
  let safe = true;
  const files = [];
  const directories = [];
  let totalBytes = 0;

  function reject(code, relative, detail) {
    safe = false;
    add(code, relative, detail);
  }

  async function visit(absolute, relative) {
    if (relative.split("/").filter(Boolean).length > maxPackDepth) {
      reject("PACK_LIMIT", "pack-entry", "pack directory depth exceeds the static validator limit");
      return;
    }
    let info;
    try {
      info = await lstat(absolute);
    } catch {
      reject("PACK_READ", relative || "pack", "cannot inspect required pack entry");
      return;
    }

    if (info.isSymbolicLink()) {
      reject("SYMLINK", relative || "pack", "symbolic links are forbidden");
      return;
    }
    if (info.isDirectory()) {
      if (relative !== "") directories.push(relative);
      let entries;
      try {
        entries = await readdir(absolute);
      } catch {
        reject("PACK_READ", relative || "pack", "cannot enumerate pack directory");
        return;
      }
      for (const entry of entries.sort()) {
        if (/[\u0000-\u001f\u007f]/.test(entry)) {
          reject("UNSAFE_NAME", "pack-entry", "file and directory names must not contain control characters");
          continue;
        }
        await visit(path.join(absolute, entry), relative ? `${relative}/${entry}` : entry);
      }
      return;
    }
    if (!info.isFile()) {
      reject("NON_REGULAR", relative || "pack", "only regular files and directories are allowed");
      return;
    }
    totalBytes += info.size;
    if (info.size > maxFileBytes || totalBytes > maxPackBytes || files.length + 1 > maxPackFiles) {
      reject("PACK_LIMIT", "pack-entry", "pack file count or byte limit exceeded");
      return;
    }
    files.push(relative);
  }

  await visit(root, "");
  return { safe, files, directories };
}

async function readRegular(root, relative, add) {
  if (!isSafeRelativePath(relative)) {
    add("UNSAFE_PATH", "manifest", "a referenced path is not a safe relative path");
    return null;
  }
  const parts = relative.split("/");
  const absolute = path.join(root, ...parts);
  try {
    let current = root;
    const rootInfo = await lstat(current);
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) {
      add("NON_REGULAR", "pack", "pack root must be a regular non-symlink directory");
      return null;
    }
    for (const [index, part] of parts.entries()) {
      current = path.join(current, part);
      const info = await lstat(current);
      const last = index === parts.length - 1;
      if (info.isSymbolicLink() || (last ? !info.isFile() : !info.isDirectory())) {
        add("NON_REGULAR", relative, "a required path crosses a symlink or non-regular entry");
        return null;
      }
    }
    return await readFile(absolute);
  } catch {
    add("MISSING_FILE", relative, "required regular file is missing or unreadable");
    return null;
  }
}

async function readJson(root, relative, add) {
  const content = await readRegular(root, relative, add);
  if (content === null) return null;
  const decoded = decodeUtf8(content, relative, add);
  if (decoded === null) return null;
  try {
    const value = parseStrictJson(decoded);
    if (!isObject(value)) {
      add("JSON_SHAPE", relative, "top-level JSON value must be an object");
      return null;
    }
    return value;
  } catch (error) {
    add(
      error.code === "JSON_DUPLICATE_KEY" ? "JSON_DUPLICATE_KEY" : "JSON_PARSE",
      relative,
      error.code === "JSON_DUPLICATE_KEY"
        ? "JSON object keys must be unique"
        : "file is not valid JSON",
    );
    return null;
  }
}

function checkFormat(document, relative, add) {
  if (document && document.format !== expectedFormats.get(relative)) {
    add("FORMAT_ID", relative, "missing or unsupported experimental format identifier");
  }
}

async function validateCorpus(root, corpus, add) {
  const itemById = new Map();
  const contentById = new Map();
  if (!corpus) return { itemById, contentById };
  if (!isNonEmptyString(corpus.corpusId) || corpus.frozen !== true) {
    add("CORPUS_STATE", "corpus-manifest.json", "corpus must have an ID and be frozen");
  }
  if (
    corpus.visibility !== "public-synthetic" ||
    corpus.digestAlgorithm !== "sha256" ||
    !isNonEmptyString(corpus.chronology)
  ) {
    add("CORPUS_POLICY", "corpus-manifest.json", "synthetic visibility, chronology, and sha256 are required");
  }
  const boundary = corpus.corpusBoundary;
  if (
    !isObject(boundary) ||
    !isNonEmptyString(boundary.samplingFrame) ||
    !isNonEmptyString(boundary.coverage) ||
    !Array.isArray(boundary.inclusions) ||
    boundary.inclusions.length === 0 ||
    !Array.isArray(boundary.exclusions) ||
    boundary.exclusions.length === 0 ||
    !Array.isArray(boundary.preStepOneKnowledge) ||
    !isNonEmptyString(boundary.leftCensoring) ||
    !Number.isInteger(boundary.terminalEvaluationStep) ||
    !isNonEmptyString(boundary.absenceJudgmentBasis) ||
    !Array.isArray(boundary.permanentlyUnanswerableTopics) ||
    boundary.permanentlyUnanswerableTopics.length === 0
  ) {
    add("CORPUS_BOUNDARY", "corpus-manifest.json", "closed coverage, exclusions, initial knowledge, censoring, terminal horizon, and absence basis are required");
  }
  if (!Array.isArray(corpus.items) || corpus.items.length === 0) {
    add("CORPUS_ITEMS", "corpus-manifest.json", "at least one corpus item is required");
    return { itemById, contentById };
  }

  const paths = new Set();
  const orders = new Set();
  const listedSourcePaths = new Set();
  for (const [index, item] of corpus.items.entries()) {
    const label = `corpus.items[${index}]`;
    if (!isObject(item) || !isNonEmptyString(item.id) || itemById.has(item.id)) {
      add("CORPUS_ITEM_ID", label, "corpus item IDs must be unique non-empty strings");
      continue;
    }
    itemById.set(item.id, item);
    if (!Number.isInteger(item.order) || item.order < 1 || orders.has(item.order)) {
      add("CORPUS_ORDER", label, "reveal orders must be unique positive integers");
    } else {
      orders.add(item.order);
    }
    if (!isSafeRelativePath(item.path)) {
      add("UNSAFE_PATH", label, "source path must be safe and relative");
      continue;
    }
    if (!item.path.startsWith("sources/") || paths.has(item.path)) {
      add("CORPUS_PATH", label, "source paths must be unique and remain under sources/");
      continue;
    }
    paths.add(item.path);
    listedSourcePaths.add(item.path);
    const content = await readRegular(root, item.path, add);
    if (content !== null) {
      if (!isSha256(item.sha256) || sha256(content) !== item.sha256) {
        add("SOURCE_DIGEST", item.path, "source sha256 does not match frozen manifest");
      }
      if (!Number.isInteger(item.bytes) || item.bytes !== content.byteLength) {
        add("SOURCE_SIZE", item.path, "source byte size does not match frozen manifest");
      }
      const decoded = decodeUtf8(content, item.path, add);
      if (decoded !== null) contentById.set(item.id, decoded);
    }
    const lineage = item.sourceLineage;
    if (
      !isObject(lineage) ||
      !isNonEmptyString(lineage.family) ||
      !isNonEmptyString(lineage.relationship) ||
      !Array.isArray(lineage.parents) ||
      !Array.isArray(lineage.unavailableAncestors)
    ) {
      add("SOURCE_LINEAGE", label, "family, relationship, parents, and unavailable ancestors are required");
    } else {
      const parents = lineage.parents;
      const unavailable = lineage.unavailableAncestors;
      if (
        !parents.every(isNonEmptyString) ||
        !unavailable.every(isNonEmptyString) ||
        new Set(parents).size !== parents.length ||
        new Set(unavailable).size !== unavailable.length ||
        parents.some((value) => unavailable.includes(value))
      ) {
        add("SOURCE_LINEAGE", label, "lineage references must be unique non-empty strings with no overlap");
      }
    }
  }

  const expectedOrders = corpus.items.map((_, index) => index + 1);
  if (!expectedOrders.every((order) => orders.has(order))) {
    add("CORPUS_ORDER", "corpus-manifest.json", "reveal order must be contiguous from one");
  }
  if (corpus.corpusBoundary?.terminalEvaluationStep !== corpus.items.length) {
    add("CORPUS_BOUNDARY", "corpus-manifest.json", "terminal evaluation step must close the declared inventory");
  }
  for (const [id, item] of itemById) {
    if (!isObject(item.sourceLineage) || !Array.isArray(item.sourceLineage.parents)) continue;
    for (const parentId of item.sourceLineage.parents) {
      const parent = itemById.get(parentId);
      if (!parent || parent.order >= item.order) {
        add("SOURCE_LINEAGE_REF", id, "lineage parent must be an earlier corpus item");
      }
    }
  }

  try {
    const sourceEntries = await readdir(path.join(root, "sources"), { withFileTypes: true });
    for (const entry of sourceEntries) {
      const sourcePath = `sources/${entry.name}`;
      if (!entry.isFile() || !listedSourcePaths.has(sourcePath)) {
        add("CORPUS_INVENTORY", sourcePath, "every source entry must be a listed regular file");
      }
    }
  } catch {
    add("CORPUS_INVENTORY", "sources", "source directory is missing or unreadable");
  }
  return { itemById, contentById };
}

function validateTasks(taskPack, itemCount, add) {
  const taskById = new Map();
  if (!taskPack) return taskById;
  if (!isNonEmptyString(taskPack.taskPackId) || taskPack.frozen !== true || !Array.isArray(taskPack.tasks)) {
    add("TASK_PACK", "task-pack.json", "frozen task pack with an ID and task list is required");
    return taskById;
  }
  const classes = new Set();
  let eligibleCount = 0;
  for (const [index, task] of taskPack.tasks.entries()) {
    const label = `tasks[${index}]`;
    if (!isObject(task) || !isNonEmptyString(task.id) || taskById.has(task.id)) {
      add("TASK_ID", label, "task IDs must be unique non-empty strings");
      continue;
    }
    taskById.set(task.id, task);
    classes.add(task.class);
    if (task.eligibleForPrimary === true) eligibleCount += 1;
    if (
      !requiredTaskClasses.has(task.class) ||
      !isNonEmptyString(task.question) ||
      !isNonEmptyString(task.allowedInterpretation) ||
      !Number.isInteger(task.evaluatedAtStep) ||
      task.evaluatedAtStep < 1 ||
      task.evaluatedAtStep > itemCount ||
      !Array.isArray(task.requiredAnswerElements) ||
      task.requiredAnswerElements.length === 0 ||
      !task.requiredAnswerElements.every(isNonEmptyString) ||
      !isObject(task.requiredEvidence) ||
      !Number.isInteger(task.requiredEvidence.minimumVisibleReferences) ||
      task.requiredEvidence.minimumVisibleReferences < 0 ||
      typeof task.requiredEvidence.counterevidenceRequired !== "boolean" ||
      !isNonEmptyString(task.acceptableUncertainty) ||
      !Array.isArray(task.sutAllowedTools) ||
      task.sutAllowedTools.length === 0 ||
      !task.sutAllowedTools.every(isNonEmptyString) ||
      new Set(task.sutAllowedTools).size !== task.sutAllowedTools.length ||
      !isPositiveNumber(task.timeoutSeconds)
    ) {
      add("TASK_SHAPE", label, "task interpretation, scoring requirements, horizon, tools, and timeout are required");
    }
    if (
      task.class === "permanently-unanswerable" &&
      !isNonEmptyString(task.requiredEvidence?.absenceTopic)
    ) {
      add("TASK_ABSENCE", label, "permanently unanswerable tasks require a declared absence topic");
    }
  }
  if (!sameMembers([...classes], requiredTaskClasses)) {
    add("TASK_CONTROLS", "task-pack.json", "answerable, not-yet-answerable, and permanently-unanswerable tasks are required");
  }
  if (eligibleCount === 0) {
    add("TASK_PRIMARY", "task-pack.json", "at least one task must be frozen into the primary endpoint");
  }
  return taskById;
}

function evidenceAnchorExists(content, locator) {
  const match = typeof locator === "string" ? locator.match(/^anchor:([a-z0-9]+(?:-[a-z0-9]+)*)$/) : null;
  if (match === null || typeof content !== "string") return false;
  const marker = `<!-- gt-anchor: ${match[1]} -->`;
  return content.split(marker).length === 2;
}

function validateOracle(oracle, taskById, itemById, contentById, corpusBoundary, add) {
  if (!oracle) return;
  if (
    !isNonEmptyString(oracle.oracleId) ||
    oracle.closure !== "exact" ||
    oracle.withheldFromSut !== true ||
    !Array.isArray(oracle.judgments)
  ) {
    add("ORACLE_POLICY", "oracle.json", "withheld exact-closure oracle is required");
    return;
  }
  const seen = new Set();
  for (const [index, judgment] of oracle.judgments.entries()) {
    const label = `oracle.judgments[${index}]`;
    if (!isObject(judgment) || !taskById.has(judgment.taskId) || seen.has(judgment.taskId)) {
      add("ORACLE_TASK_REF", label, "each judgment must reference one unique declared task");
      continue;
    }
    seen.add(judgment.taskId);
    const task = taskById.get(judgment.taskId);
    const taskElements = Array.isArray(task.requiredAnswerElements) ? task.requiredAnswerElements : [];
    const status = judgment.expected?.status;
    if (!isObject(judgment.expected) || !["answerable", "abstain"].includes(status)) {
      add("ORACLE_EXPECTED", label, "expected answerable or abstain outcome is required");
    }
    if (
      (task.class === "answerable" && status !== "answerable") ||
      (task.class !== "answerable" && status !== "abstain") ||
      (status === "answerable" && !isNonEmptyString(judgment.expected?.answer)) ||
      (status === "abstain" && (judgment.expected?.answer !== null || !isNonEmptyString(judgment.expected?.reason))) ||
      !sameMembers(judgment.expected?.elements, new Set(taskElements))
    ) {
      add("ORACLE_OUTCOME", label, "task class, answer or abstention, and reason must agree");
    }
    if (!Array.isArray(judgment.evidence)) {
      add("ORACLE_EVIDENCE", label, "evidence reference list is required");
      continue;
    }
    if (status === "answerable" && judgment.evidence.length === 0) {
      add("ORACLE_EVIDENCE", label, "answerable judgments require evidence");
    }
    if (judgment.evidence.length < (task.requiredEvidence?.minimumVisibleReferences ?? 0)) {
      add("ORACLE_EVIDENCE", label, "oracle evidence does not meet the frozen task minimum");
    }
    if (
      task.requiredEvidence?.counterevidenceRequired === true &&
      !judgment.evidence.some((evidence) => /counter|supersed/i.test(evidence?.relation ?? ""))
    ) {
      add("ORACLE_COUNTEREVIDENCE", label, "task requires an explicit counterevidence reference");
    }
    const references = new Set();
    for (const evidence of judgment.evidence) {
      const item = itemById.get(evidence?.itemId);
      const reference = `${evidence?.itemId}:${evidence?.locator}`;
      if (
        !item ||
        item.order > task.evaluatedAtStep ||
        !isNonEmptyString(evidence?.locator) ||
        !isNonEmptyString(evidence?.relation) ||
        references.has(reference) ||
        !evidenceAnchorExists(contentById.get(evidence?.itemId), evidence?.locator)
      ) {
        add("ORACLE_EVIDENCE_REF", label, "evidence must uniquely resolve to an anchored visible corpus item");
      }
      references.add(reference);
    }
    if (task.class === "not-yet-answerable") {
      if (!Array.isArray(judgment.laterEvidence) || judgment.laterEvidence.length === 0) {
        add("ORACLE_LATER_EVIDENCE", label, "not-yet-answerable tasks require later evidence after their horizon");
      } else {
        for (const evidence of judgment.laterEvidence) {
          const item = itemById.get(evidence?.itemId);
          if (
            !item ||
            item.order <= task.evaluatedAtStep ||
            !isNonEmptyString(evidence?.relation) ||
            !evidenceAnchorExists(contentById.get(evidence?.itemId), evidence?.locator)
          ) {
            add("ORACLE_LATER_EVIDENCE", label, "later evidence must resolve after the task horizon");
          }
        }
      }
    }
    if (task.class === "permanently-unanswerable") {
      const topic = task.requiredEvidence?.absenceTopic;
      if (
        judgment.evidence.length !== 0 ||
        judgment.absenceBasis?.boundaryField !== "corpusBoundary.permanentlyUnanswerableTopics" ||
        judgment.absenceBasis?.topic !== topic ||
        !Array.isArray(corpusBoundary?.permanentlyUnanswerableTopics) ||
        !corpusBoundary.permanentlyUnanswerableTopics.includes(topic)
      ) {
        add("ORACLE_ABSENCE_BASIS", label, "permanent abstention must resolve to the closed corpus boundary");
      }
    }
  }
  if (seen.size !== taskById.size || [...taskById.keys()].some((id) => !seen.has(id))) {
    add("ORACLE_CLOSURE", "oracle.json", "oracle judgments must exactly cover the task pack");
  }
}

function validateDataHandling(policy, add) {
  if (!policy) return;
  if (
    policy.classification !== "public-synthetic" ||
    policy.containsPrivateData !== false ||
    policy.hashScope !== "public-synthetic-only"
  ) {
    add("DATA_CLASSIFICATION", "data-handling.json", "pack must contain public synthetic data only");
  }
  if (
    policy.rights?.publicationAllowed !== true ||
    !isNonEmptyString(policy.rights?.basis) ||
    !isObject(policy.retention) ||
    !isObject(policy.deletion) ||
    policy.deletion.wholeRunPurgeSupported !== true ||
    !isNonEmptyString(policy.deletion.procedure) ||
    !isNonEmptyString(policy.deletion.verification)
  ) {
    add("DATA_LIFECYCLE", "data-handling.json", "rights, retention, deletion, and purge verification are required");
  }
  const forbiddenKey = (value) => {
    if (Array.isArray(value)) return value.some(forbiddenKey);
    if (!isObject(value)) return false;
    return Object.entries(value).some(
      ([key, child]) => (/private.*hash|hash.*private/i.test(key) ? true : forbiddenKey(child)),
    );
  };
  if (forbiddenKey(policy)) {
    add("PRIVATE_HASH", "data-handling.json", "private-source hash fields are forbidden in a public pack");
  }
}

async function validateSandbox(root, policy, add) {
  if (!policy) return;
  if (policy.network?.default !== "deny" || policy.network?.egressAllowed !== false) {
    add("SANDBOX_NETWORK", "sandbox-policy.json", "network must default to denied with no egress");
  }
  if (policy.telemetry?.enabled !== false) {
    add("SANDBOX_TELEMETRY", "sandbox-policy.json", "telemetry must be disabled");
  }
  if (policy.credentials?.mounted !== false || policy.credentials?.environment !== "scrubbed") {
    add("SANDBOX_CREDENTIALS", "sandbox-policy.json", "credentials must be absent and environment scrubbed");
  }
  if (policy.links?.dereference !== false || policy.links?.symlinks !== "reject") {
    add("SANDBOX_LINKS", "sandbox-policy.json", "link dereference must be disabled and symlinks rejected");
  }
  const principals = policy.principals;
  if (
    principals?.separate !== true ||
    new Set([principals?.controller, principals?.sut, principals?.evaluator]).size !== 3 ||
    ![principals?.controller, principals?.sut, principals?.evaluator].every(isNonEmptyString)
  ) {
    add("SANDBOX_PRINCIPALS", "sandbox-policy.json", "controller, SUT, and evaluator principals must be separate");
  }
  const forbiddenLogValues = Array.isArray(policy.logging?.forbidden)
    ? policy.logging.forbidden
    : [];
  const forbiddenLogs = new Set(forbiddenLogValues);
  if (
    policy.logging?.mode !== "metadata-only" ||
    !["source-content", "oracle-content", "absolute-paths", "credentials", "prompts"].every((key) =>
      forbiddenLogs.has(key),
    )
  ) {
    add("SANDBOX_LOGGING", "sandbox-policy.json", "metadata-only logs must exclude sensitive values and absolute paths");
  }
  if (!Array.isArray(policy.negativeFixtures)) {
    add("NEGATIVE_FIXTURES", "sandbox-policy.json", "declared negative fixture list is required");
    return;
  }
  const fixtureIds = policy.negativeFixtures.map((fixture) => fixture?.id);
  if (!sameMembers(fixtureIds, requiredNegativeFixtures)) {
    add("NEGATIVE_FIXTURES", "sandbox-policy.json", "negative fixture declaration is incomplete or duplicated");
  }
  for (const [index, fixture] of policy.negativeFixtures.entries()) {
    const expected = requiredNegativeFixtures.get(fixture?.id);
    if (
      expected &&
      (!isObject(fixture) || fixture.mode !== expected[0] || fixture.expected !== expected[1])
    ) {
      add("NEGATIVE_FIXTURE_CONTRACT", `sandbox.negativeFixtures[${index}]`, "fixture mode and expected outcome must match the frozen matrix");
    }
  }
  const canary = policy.negativeFixtures.find((fixture) => fixture?.id === "future-filename-canary");
  if (!canary || !isSafeRelativePath(canary.path)) {
    add("CANARY_PATH", "sandbox-policy.json", "future filename canary requires a safe controller-only path");
    return;
  }
  const content = await readRegular(root, canary.path, add);
  if (
    content !== null &&
    (!isSha256(canary.sha256) || sha256(content) !== canary.sha256 || canary.bytes !== content.byteLength)
  ) {
    add("CANARY_DIGEST", canary.path, "future filename canary does not match its declaration");
  }
  if (content !== null) decodeUtf8(content, canary.path, add);
}

function validateReview(rubric, add) {
  if (!rubric) return;
  const familiarity = new Set(["known", "vaguely-remembered", "forgotten", "unknown"]);
  if (
    rubric.blinding?.required !== true ||
    rubric.blinding?.scorerSeesSystemIdentity !== false ||
    rubric.blinding?.scorerSeesFutureSources !== false ||
    rubric.blinding?.scorerSeesOracleOnlyAfterAnswerFreeze !== true
  ) {
    add("REVIEW_BLINDING", "review-rubric.json", "answer freeze and scorer blinding are required");
  }
  if (
    rubric.familiarity?.recordBeforeTask !== true ||
    rubric.familiarity?.exposurePlanPath !== "exposure-plan.json" ||
    rubric.familiarity?.primaryComparisonUsesFirstPresentationOnly !== true ||
    !sameMembers(rubric.familiarity?.scale, familiarity)
  ) {
    add("REVIEW_FAMILIARITY", "review-rubric.json", "pre-task familiarity and first-presentation policy are required");
  }
  if (
    rubric.corrections?.appendOnly !== true ||
    rubric.corrections?.logPath !== "logs/deviations.jsonl" ||
    rubric.corrections?.reuseRunIdAfterOracleChange !== false
  ) {
    add("REVIEW_CORRECTIONS", "review-rubric.json", "corrections must be append-only and invalidate changed run IDs");
  }
  const requiredDimensions = new Set(["answer", "evidence", "counterevidence", "abstention", "time"]);
  const consequences = rubric.scoring?.severeErrorConsequences;
  if (
    rubric.scoring?.taskSpecificRulesRequired !== true ||
    !sameMembers(rubric.scoring?.requiredDimensions, requiredDimensions) ||
    !isObject(consequences) ||
    !sameMembers(Object.keys(consequences ?? {}), requiredSevereErrors) ||
    !Object.values(consequences ?? {}).every((value) => ["invalidate-task", "invalidate-run"].includes(value))
  ) {
    add("REVIEW_SCORING", "review-rubric.json", "task rules, scoring dimensions, and severe-error consequences must be exact");
  }
}

function validateExposure(exposure, taskById, run, add) {
  if (!exposure) return;
  const requiredRoles = new Set([
    "controller",
    "curator",
    "sutOperator",
    "oracleAuthor",
    "ordinaryBaselineOperator",
    "minimalBaselineOperator",
    "scorer",
  ]);
  const requiredVisibility = new Map([
    ["controller", new Set(["complete corpus manifest", "reveal schedule", "future reveal bundles"])],
    ["curator", new Set(["complete synthetic corpus", "corpus boundary"])],
    ["sutOperator", new Set(["current reveal bundle", "frozen task at evaluation horizon"])],
    ["oracleAuthor", new Set(["complete synthetic corpus", "task pack", "oracle"])],
    ["ordinaryBaselineOperator", new Set(["same current reveal bundle", "same frozen task at evaluation horizon"])],
    ["minimalBaselineOperator", new Set(["same current reveal bundle", "same frozen task at evaluation horizon"])],
    ["scorer", new Set(["frozen answers before system identity", "oracle only after answer freeze"])],
  ]);
  if (
    exposure.frozen !== true ||
    exposure.claimWhenRolesOverlap !== "exploratory-only" ||
    !Array.isArray(exposure.roleAssignments) ||
    !Array.isArray(exposure.taskExposures)
  ) {
    add("EXPOSURE_POLICY", "exposure-plan.json", "frozen role, overlap, and task exposure plan is required");
    return;
  }
  const roleNames = exposure.roleAssignments.map((entry) => entry?.role);
  if (!sameMembers(roleNames, requiredRoles)) {
    add("EXPOSURE_ROLES", "exposure-plan.json", "human information-boundary roles must be exact and unique");
  }
  const actorRefs = [];
  for (const [index, assignment] of exposure.roleAssignments.entries()) {
    const label = `exposure.roleAssignments[${index}]`;
    if (
      !isObject(assignment) ||
      run?.roles?.[assignment.role] !== assignment.actorRef ||
      !isNonEmptyString(assignment.actorRef) ||
      !Array.isArray(assignment.inputsVisible) ||
      assignment.inputsVisible.length === 0 ||
      !assignment.inputsVisible.every(isNonEmptyString) ||
      !sameMembers(assignment.inputsVisible, requiredVisibility.get(assignment.role) ?? new Set()) ||
      !Array.isArray(assignment.overlapsWith) ||
      assignment.overlapsWith.length !== 0
    ) {
      add("EXPOSURE_ROLE", label, "actor, visible inputs, overlap, and run-card role must agree");
    }
    if (isNonEmptyString(assignment?.actorRef)) actorRefs.push(assignment.actorRef);
  }
  if (new Set(actorRefs).size !== actorRefs.length) {
    add("EXPOSURE_OVERLAP", "exposure-plan.json", "this distinct-role fixture must not reuse an actor");
  }
  const evaluatorActors = new Set([
    run?.roles?.sutOperator,
    run?.roles?.ordinaryBaselineOperator,
    run?.roles?.minimalBaselineOperator,
    run?.roles?.scorer,
  ]);
  const familiarity = new Set(["known", "vaguely-remembered", "forgotten", "unknown"]);
  const taskIds = new Set();
  for (const [index, taskExposure] of exposure.taskExposures.entries()) {
    const label = `exposure.taskExposures[${index}]`;
    const familiarityMap = taskExposure?.familiarityByActor;
    if (
      !isObject(taskExposure) ||
      !taskById.has(taskExposure.taskId) ||
      taskIds.has(taskExposure.taskId) ||
      taskExposure.presentation !== 1 ||
      taskExposure.firstPresentation !== true ||
      !sameMembers(taskExposure.armOrder, new Set(["graphtruth", "ordinary-current-workflow", "files-plus-search"])) ||
      !isObject(familiarityMap) ||
      !sameMembers(Object.keys(familiarityMap ?? {}), evaluatorActors) ||
      !Object.values(familiarityMap ?? {}).every((value) => familiarity.has(value))
    ) {
      add("EXPOSURE_TASK", label, "each task requires one frozen first presentation, arm order, and familiarity matrix");
    }
    taskIds.add(taskExposure?.taskId);
  }
  if (!sameMembers([...taskIds], new Set(taskById.keys()))) {
    add("EXPOSURE_CLOSURE", "exposure-plan.json", "exposure plan must exactly cover the task pack");
  }
}

async function validateRun(root, run, taskById, rubric, add) {
  if (!run) return;
  if (
    !isNonEmptyString(run.runId) ||
    !isNonEmptyString(run.hypothesis) ||
    !isNonEmptyString(run.decisionThisRunCanChange) ||
    !Array.isArray(run.explicitNonClaims) ||
    run.explicitNonClaims.length === 0 ||
    !run.explicitNonClaims.every(isNonEmptyString) ||
    run.state !== "frozen" ||
    run.digestAlgorithm !== "sha256" ||
    run.freezeSealPath !== "pack-lock.json"
  ) {
    add("RUN_STATE", "run-card.json", "run identity, hypothesis, non-claims, frozen state, and seal are required");
  }
  if (
    !Array.isArray(run.stateHistory) ||
    run.stateHistory.length !== 2 ||
    run.stateHistory[0]?.state !== "planned" ||
    run.stateHistory[1]?.state !== "frozen" ||
    !run.stateHistory.every(
      (entry) =>
        isUtcRfc3339Timestamp(entry?.at) &&
        isNonEmptyString(entry?.actor) &&
        isNonEmptyString(entry?.reason),
    ) ||
    normalizeUtcRfc3339Timestamp(run.stateHistory[0]?.at) >
      normalizeUtcRfc3339Timestamp(run.stateHistory[1]?.at)
  ) {
    add("RUN_HISTORY", "run-card.json", "ordered planned-to-frozen history with time, actor, and reason is required");
  }
  const inputs = Array.isArray(run.frozenInputs) ? run.frozenInputs : [];
  if (!sameMembers(inputs.map((input) => input?.path), new Set(frozenInputPaths))) {
    add("RUN_DIGEST_SET", "run-card.json", "frozen input digest set must be exact and unique");
  }
  for (const input of inputs) {
    if (!isSafeRelativePath(input?.path) || !frozenInputPaths.includes(input.path)) continue;
    const content = await readRegular(root, input.path, add);
    if (content !== null && (!isSha256(input.sha256) || sha256(content) !== input.sha256)) {
      add("RUN_DIGEST", input.path, "frozen input digest does not match");
    }
  }
  const roleNames = [
    "controller",
    "curator",
    "sutOperator",
    "oracleAuthor",
    "ordinaryBaselineOperator",
    "minimalBaselineOperator",
    "scorer",
  ];
  if (
    !roleNames.every((name) => isNonEmptyString(run.roles?.[name])) ||
    new Set(roleNames.map((name) => run.roles?.[name])).size !== roleNames.length ||
    !isNonEmptyString(run.roles?.separationMode) ||
    !isNonEmptyString(run.roles?.singleOperatorDisclosure)
  ) {
    add("RUN_ROLES", "run-card.json", "controller, curation, operation, two baselines, scoring, and distinct roles are required");
  }
  if (
    run.inferenceBoundary?.futureRevealEnforced !== true ||
    run.inferenceBoundary?.completeManifestControllerOnly !== true ||
    run.inferenceBoundary?.oracleWithheldFromSut !== true ||
    run.inferenceBoundary?.futureNamesHidden !== true ||
    !sameMembers(run.inferenceBoundary?.sutReadableRoots, requiredReadableRoots)
  ) {
    add("RUN_BOUNDARY", "run-card.json", "future-reveal boundary and exact SUT-readable roots must be explicit");
  }
  const endpoint = run.primaryEndpoint;
  const eligibleTaskIds = [...taskById.values()]
    .filter((task) => task.eligibleForPrimary === true)
    .map((task) => task.id);
  const severeErrorKeys = new Set(Object.keys(rubric?.scoring?.severeErrorConsequences ?? {}));
  if (
    !sameMembers(endpoint?.eligibleTaskIds, new Set(eligibleTaskIds)) ||
    !isNonEmptyString(endpoint?.metric) ||
    !isNonEmptyString(endpoint?.statistic) ||
    !isNonEmptyString(endpoint?.direction) ||
    endpoint?.denominator?.type !== "fixed-frozen-task-set" ||
    endpoint?.denominator?.value !== eligibleTaskIds.length ||
    !isNonEmptyString(endpoint?.pairedComparison) ||
    !sameMembers(endpoint?.severeErrorClasses, severeErrorKeys) ||
    ![endpoint?.missing, endpoint?.timeout, endpoint?.ties, endpoint?.abortedRun, endpoint?.invalidRun].every(isNonEmptyString)
  ) {
    add("RUN_ENDPOINT", "run-card.json", "primary endpoint must freeze the exact task set, statistic, denominator, errors, and edge cases");
  }
  const baselineArms = Array.isArray(run.baseline?.arms) ? run.baseline.arms : [];
  const armById = new Map(baselineArms.map((arm) => [arm?.id, arm]));
  if (
    run.baseline?.design !== "paired-first-exposure-with-separate-operators" ||
    !sameMembers([...armById.keys()], new Set(["ordinary-current-workflow", "files-plus-search"])) ||
    armById.get("ordinary-current-workflow")?.operatorRole !== "ordinaryBaselineOperator" ||
    armById.get("files-plus-search")?.operatorRole !== "minimalBaselineOperator" ||
    !baselineArms.every(
      (arm) =>
        Array.isArray(arm?.tools) &&
        arm.tools.length > 0 &&
        arm.tools.every(isNonEmptyString) &&
        new Set(arm.tools).size === arm.tools.length,
    ) ||
    run.baseline?.sameCorpusHorizon !== true ||
    !isPositiveNumber(run.baseline?.sameTaskTimeoutSeconds) ||
    !Number.isInteger(run.baseline?.sameQueryBudgetPerTask) ||
    run.baseline.sameQueryBudgetPerTask < 1 ||
    ![
      run.baseline?.allowedAssistance,
      run.baseline?.setupAndLearningTimeTreatment,
      run.baseline?.reviewAndMaintenanceTimeTreatment,
      run.baseline?.captureWorkTreatment,
      run.baseline?.orderPolicy,
    ].every(isNonEmptyString)
  ) {
    add("RUN_BASELINE", "run-card.json", "ordinary and minimal baselines require comparable horizons, budgets, labor, assistance, and operators");
  }
  const budgetNames = [
    "maxWallClockSeconds",
    "maxPerTaskSeconds",
    "maxMemoryMiB",
    "maxDiskMiB",
    "maxHumanReviewMinutes",
    "maxCorrections",
  ];
  if (
    !budgetNames.every(
      (name) => Number.isInteger(run.budgets?.[name]) && isPositiveNumber(run.budgets[name]),
    ) ||
    run.budgets?.maxPerTaskSeconds > run.budgets?.maxWallClockSeconds ||
    run.baseline?.sameTaskTimeoutSeconds !== run.budgets?.maxPerTaskSeconds ||
    ![...taskById.values()].every(
      (task) => task.timeoutSeconds === run.budgets?.maxPerTaskSeconds,
    ) ||
    !budgetNames.every((name) => isNonEmptyString(run.budgetExhaustion?.[name]))
  ) {
    add("RUN_BUDGET", "run-card.json", "all time, resource, review, and correction budgets must be positive");
  }
  if (
    ![run.boundaryGate?.ready, run.boundaryGate?.notReady].every(isNonEmptyString) ||
    ![run.decisionGate?.keep, run.decisionGate?.shrink, run.decisionGate?.stop].every(isNonEmptyString) ||
    !Number.isInteger(run.decisionGate?.maximumNextRunItems) ||
    run.decisionGate.maximumNextRunItems < 1 ||
    run.decisionGate.maximumNextRunItems > 5
  ) {
    add("RUN_GATE", "run-card.json", "separate boundary and keep, shrink, or stop gates must be pre-registered");
  }
  const requiredPolicies = {
    dataHandling: "data-handling.json",
    sandbox: "sandbox-policy.json",
    reviewRubric: "review-rubric.json",
    exposurePlan: "exposure-plan.json",
    incidentResponse: "incident-response.md",
  };
  if (Object.entries(requiredPolicies).some(([key, value]) => run.policies?.[key] !== value)) {
    add("RUN_POLICIES", "run-card.json", "run must reference all fixed policy paths");
  }
  const requiredLogs = {
    stateTransitions: "logs/state-transitions.jsonl",
    deviations: "logs/deviations.jsonl",
    failureDiary: "logs/failure-diary.jsonl",
    learningRecord: "learning-record.md",
  };
  if (Object.entries(requiredLogs).some(([key, value]) => run.logPaths?.[key] !== value)) {
    add("RUN_LOGS", "run-card.json", "run must reference deviations, failures, and learning logs");
  }
}

async function validatePackLock(root, lock, treeFiles, treeDirectories, run, add) {
  if (!lock) return;
  if (
    !isNonEmptyString(lock.packId) ||
    lock.runId !== run?.runId ||
    lock.packId !== run?.runId ||
    lock.digestAlgorithm !== "sha256" ||
    lock.selfExcludedPath !== "pack-lock.json" ||
    lock.externalAnchorRequired !== true ||
    !isNonEmptyString(lock.lockConstruction) ||
    !isObject(lock.toolingIdentity) ||
    ![
      lock.toolingIdentity.validatorContract,
      lock.toolingIdentity.runtime,
      lock.toolingIdentity.runnerIdentity,
      lock.toolingIdentity.configurationIdentity,
      lock.publicExternalAnchor,
      lock.privateRunExternalAnchorRule,
    ].every(isNonEmptyString)
  ) {
    add("PACK_LOCK", "pack-lock.json", "pack identity, non-circular construction, tooling identity, and external anchor are required");
  }
  const immutable = Array.isArray(lock.immutableFiles) ? lock.immutableFiles : [];
  const mutable = Array.isArray(lock.mutableFiles) ? lock.mutableFiles : [];
  const declaredPaths = [lock.selfExcludedPath];
  const seen = new Set();
  for (const [kind, entries] of [
    ["immutable", immutable],
    ["mutable", mutable],
  ]) {
    for (const [index, entry] of entries.entries()) {
      const label = `pack-lock.${kind}Files[${index}]`;
      if (
        !isObject(entry) ||
        !isSafeRelativePath(entry.path) ||
        entry.path === "pack-lock.json" ||
        seen.has(entry.path) ||
        !isNonEmptyString(entry.purpose) ||
        !isSha256(kind === "immutable" ? entry.sha256 : entry.initialSha256) ||
        (kind === "mutable" &&
          (entry.mutation !== "append-only" ||
            !Number.isInteger(entry.initialBytes) ||
            entry.initialBytes < 1))
      ) {
        add("PACK_LOCK_ENTRY", label, "lock entries require one safe path, purpose, digest, and mutation policy");
        continue;
      }
      seen.add(entry.path);
      declaredPaths.push(entry.path);
      const content = await readRegular(root, entry.path, add);
      const contentToCheck =
        kind === "immutable" || content === null ? content : content.subarray(0, entry.initialBytes);
      const expectedDigest = kind === "immutable" ? entry.sha256 : entry.initialSha256;
      if (
        content !== null &&
        (kind === "mutable" && content.byteLength < entry.initialBytes ||
          sha256(contentToCheck) !== expectedDigest)
      ) {
        add("PACK_LOCK_DIGEST", entry.path, "file does not match the externally anchored pack lock");
      }
    }
  }
  const requiredMutable = new Map([
    ["learning-record.md", "append-only"],
    ["logs/deviations.jsonl", "append-only"],
    ["logs/failure-diary.jsonl", "append-only"],
    ["logs/state-transitions.jsonl", "append-only"],
  ]);
  const declaredDirectories = new Set();
  for (const declaredPath of declaredPaths.filter(isSafeRelativePath)) {
    const parts = declaredPath.split("/");
    for (let index = 1; index < parts.length; index += 1) {
      declaredDirectories.add(parts.slice(0, index).join("/"));
    }
  }
  if (
    !sameMembers(
      mutable.map((entry) => entry?.path),
      new Set(requiredMutable.keys()),
    ) ||
    mutable.some((entry) => requiredMutable.get(entry?.path) !== entry?.mutation) ||
    !immutable.some((entry) => entry?.path === "run-card.json") ||
    !sameMembers(declaredPaths, new Set(treeFiles)) ||
    !sameMembers(treeDirectories, declaredDirectories)
  ) {
    add("PACK_LOCK_INVENTORY", "pack-lock.json", "lock must close the exact tree, seal the run card, and declare only fixed mutable outputs");
  }
}

const logRecordFields = new Map([
  [
    "graphtruth.experimental.deviation-log/0",
    new Set([
      "recordType",
      "runId",
      "sequence",
      "at",
      "state",
      "stepRef",
      "departureClass",
      "causeClass",
      "validityImpact",
      "decision",
      "actorRole",
    ]),
  ],
  [
    "graphtruth.experimental.failure-diary/0",
    new Set([
      "recordType",
      "runId",
      "sequence",
      "observedAt",
      "observerRole",
      "state",
      "stepRef",
      "arm",
      "eventClass",
      "impactClass",
      "detectionClass",
      "workaroundClass",
      "operatorSeconds",
      "reviewSeconds",
      "captureTaxSeconds",
      "validityImpact",
      "decision",
    ]),
  ],
  [
    "graphtruth.experimental.state-transition-log/0",
    new Set(["recordType", "runId", "sequence", "from", "to", "at", "actor", "reason"]),
  ],
]);

function isOpaqueLogToken(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value);
}

async function validateLog(root, relative, expectedFormat, runId, add) {
  const content = await readRegular(root, relative, add);
  if (content === null) return [];
  const decoded = decodeUtf8(content, relative, add);
  if (decoded === null) return [];
  const lines = decoded.split(/\r?\n/).filter((line) => line.trim() !== "");
  const records = [];
  let expectedSequence = 1;
  let previousState = null;
  for (const [index, line] of lines.entries()) {
    let record;
    try {
      record = parseStrictJson(line);
    } catch (error) {
      add(
        error.code === "JSON_DUPLICATE_KEY" ? "LOG_DUPLICATE_KEY" : "LOG_RECORD",
        `${relative}#${index + 1}`,
        error.code === "JSON_DUPLICATE_KEY"
          ? "JSONL object keys must be unique"
          : "each non-empty JSONL line must be valid JSON",
      );
      continue;
    }
    if (!isObject(record)) {
      add("LOG_RECORD", `${relative}#${index + 1}`, "each JSONL record must be an object");
      continue;
    }
    records.push(record);
    if (index === 0) {
      if (
        !sameMembers(Object.keys(record), new Set(["format", "recordType", "runId", "appendOnly", "createdAt"])) ||
        record.format !== expectedFormat ||
        record.recordType !== "header" ||
        record.runId !== runId ||
        record.appendOnly !== true ||
        !isUtcRfc3339Timestamp(record.createdAt)
      ) {
        add("LOG_HEADER", relative, "JSONL header format, run ID, append-only flag, and UTC RFC3339 creation time are required");
      }
    } else {
      const allowedFields = logRecordFields.get(expectedFormat);
      if (
        !sameMembers(Object.keys(record), allowedFields) ||
        record.runId !== runId ||
        !isNonEmptyString(record.recordType) ||
        record.sequence !== expectedSequence ||
        JSON.stringify(record).length > 4096 ||
        Object.values(record).some(
          (value) => typeof value === "string" && /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value),
        )
      ) {
        add("LOG_RECORD", `${relative}#${index + 1}`, "record must match the closed metadata-only schema and sequence");
      }
      if (expectedFormat === "graphtruth.experimental.state-transition-log/0") {
        const allowedTransitions = new Set([
          "null->planned",
          "planned->frozen",
          "frozen->running",
          "running->completed",
          "running->aborted",
          "planned->invalid",
          "frozen->invalid",
          "running->invalid",
          "completed->invalid",
          "aborted->invalid",
        ]);
        if (
          record.recordType !== "state-transition" ||
          record.from !== previousState ||
          !allowedTransitions.has(`${record.from === null ? "null" : record.from}->${record.to}`) ||
          !isUtcRfc3339Timestamp(record.at) ||
          !isNonEmptyString(record.actor) ||
          !isNonEmptyString(record.reason)
        ) {
          add("STATE_TRANSITION", `${relative}#${index + 1}`, "state transition must follow the frozen lifecycle with UTC RFC3339 time, actor, and reason");
        }
        previousState = record.to;
      } else if (expectedFormat === "graphtruth.experimental.deviation-log/0") {
        if (
          record.recordType !== "deviation" ||
          !isUtcRfc3339Timestamp(record.at) ||
          !["planned", "frozen", "running", "completed", "aborted", "invalid"].includes(record.state) ||
          ![
            record.stepRef,
            record.departureClass,
            record.causeClass,
            record.validityImpact,
            record.actorRole,
          ].every(isOpaqueLogToken) ||
          !["continue", "pause", "abort", "invalidate"].includes(record.decision)
        ) {
          add("LOG_METADATA", `${relative}#${index + 1}`, "deviation values must use timestamps, enums, and opaque metadata tokens only");
        }
      } else if (expectedFormat === "graphtruth.experimental.failure-diary/0") {
        if (
          record.recordType !== "failure-event" ||
          !isUtcRfc3339Timestamp(record.observedAt) ||
          !["planned", "frozen", "running", "completed", "aborted", "invalid"].includes(record.state) ||
          !["graphtruth", "ordinary-current-workflow", "files-plus-search", "controller"].includes(record.arm) ||
          ![
            record.observerRole,
            record.stepRef,
            record.eventClass,
            record.impactClass,
            record.detectionClass,
            record.workaroundClass,
            record.validityImpact,
          ].every(isOpaqueLogToken) ||
          ![record.operatorSeconds, record.reviewSeconds, record.captureTaxSeconds].every(
            (value) => Number.isInteger(value) && value >= 0,
          ) ||
          !["continue", "pause", "abort", "invalidate"].includes(record.decision)
        ) {
          add("LOG_METADATA", `${relative}#${index + 1}`, "failure values must use timestamps, enums, counters, and opaque metadata tokens only");
        }
      }
      expectedSequence += 1;
    }
  }
  if (lines.length === 0) {
    add("LOG_HEADER", relative, "first non-empty JSONL line must be a valid header");
  }
  return records;
}

function validateStateHistory(run, records, add) {
  const transitions = records.slice(1, 3);
  if (
    transitions.length !== 2 ||
    !Array.isArray(run?.stateHistory) ||
    transitions.some((record, index) => {
      const history = run.stateHistory[index];
      return (
        record.recordType !== "state-transition" ||
        record.to !== history?.state ||
        record.at !== history?.at ||
        record.actor !== history?.actor ||
        record.reason !== history?.reason
      );
    })
  ) {
    add("STATE_HISTORY", "logs/state-transitions.jsonl", "planned-to-frozen log prefix must exactly match the sealed run card");
  }
}

export async function validatePack(packDirectory = defaultPackDirectory) {
  const root = path.resolve(packDirectory);
  const diagnostics = [];
  const add = (code, relative, detail) => {
    const displayPath =
      typeof relative === "string" &&
      relative.length <= 240 &&
      !/[\u0000-\u001f\u007f]/.test(relative)
        ? relative
        : "pack-entry";
    diagnostics.push({ code, path: displayPath, detail });
  };

  const tree = await inspectTree(root, add);
  if (!tree.safe) {
    diagnostics.sort((left, right) =>
      `${left.path}:${left.code}`.localeCompare(`${right.path}:${right.code}`),
    );
    return { ok: false, diagnostics };
  }
  for (const relative of requiredFiles) await readRegular(root, relative, add);

  const documents = {};
  for (const relative of expectedFormats.keys()) {
    documents[relative] = await readJson(root, relative, add);
    checkFormat(documents[relative], relative, add);
  }

  const { itemById, contentById } = await validateCorpus(
    root,
    documents["corpus-manifest.json"],
    add,
  );
  const taskById = validateTasks(documents["task-pack.json"], itemById.size, add);
  validateOracle(
    documents["oracle.json"],
    taskById,
    itemById,
    contentById,
    documents["corpus-manifest.json"]?.corpusBoundary,
    add,
  );
  validateDataHandling(documents["data-handling.json"], add);
  await validateSandbox(root, documents["sandbox-policy.json"], add);
  validateReview(documents["review-rubric.json"], add);
  await validateRun(
    root,
    documents["run-card.json"],
    taskById,
    documents["review-rubric.json"],
    add,
  );
  validateExposure(
    documents["exposure-plan.json"],
    taskById,
    documents["run-card.json"],
    add,
  );
  await validatePackLock(
    root,
    documents["pack-lock.json"],
    tree.files,
    tree.directories,
    documents["run-card.json"],
    add,
  );
  await validateLog(
    root,
    "logs/deviations.jsonl",
    "graphtruth.experimental.deviation-log/0",
    documents["run-card.json"]?.runId,
    add,
  );
  await validateLog(
    root,
    "logs/failure-diary.jsonl",
    "graphtruth.experimental.failure-diary/0",
    documents["run-card.json"]?.runId,
    add,
  );
  const stateRecords = await validateLog(
    root,
    "logs/state-transitions.jsonl",
    "graphtruth.experimental.state-transition-log/0",
    documents["run-card.json"]?.runId,
    add,
  );
  validateStateHistory(documents["run-card.json"], stateRecords, add);

  diagnostics.sort((left, right) =>
    `${left.path}:${left.code}`.localeCompare(`${right.path}:${right.code}`),
  );
  return { ok: diagnostics.length === 0, diagnostics };
}

function usage() {
  return "Usage: tooling/preflight [--twin] [--json]";
}

export function formatHumanResult(result) {
  if (result.ok) return "preflight: valid\n";
  const lines = [`preflight: invalid (${result.diagnostics.length} diagnostics)`];
  for (const diagnostic of result.diagnostics) {
    lines.push(`- ${diagnostic.code} [${diagnostic.path}]: ${diagnostic.detail}`);
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const twin = args.includes("--twin");
  if (args.includes("--help")) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (
    args.some((arg) => !["--json", "--twin"].includes(arg)) ||
    args.filter((arg) => arg === "--json").length > 1 ||
    args.filter((arg) => arg === "--twin").length > 1
  ) {
    process.stderr.write(`${usage()}\n`);
    process.exitCode = 2;
    return;
  }
  const result = await validatePack(twin ? evidenceContractTwinDirectory : defaultPackDirectory);
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const output = formatHumanResult(result);
    (result.ok ? process.stdout : process.stderr).write(output);
  }
  if (!result.ok) process.exitCode = 1;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch {
    process.stderr.write("preflight: internal validation failure\n");
    process.exitCode = 1;
  }
}
