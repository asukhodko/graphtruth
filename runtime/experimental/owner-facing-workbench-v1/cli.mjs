#!/usr/bin/env node

import process from "node:process";

import {
  abortHorizon,
  addAssertion,
  addQuestion,
  addSource,
  closeHorizon,
  commandResultSchema,
  exitStatusFor,
  initializeWorkspace,
  openHorizon,
  publishDossier,
  rebuildProjections,
  reviseAssertion,
  stableMessageFor,
  undoDraft,
  verifyWorkspace,
  WorkbenchError,
} from "./core.mjs";

const commandNames = new Set([
  "init",
  "horizon.open",
  "source.add",
  "assertion.add",
  "assertion.revise",
  "question.add",
  "draft.undo",
  "horizon.abort",
  "horizon.close",
  "verify",
  "dossier",
  "rebuild",
]);

function usageError() {
  throw new WorkbenchError("USAGE");
}

function commandHint(argv) {
  const rootIndex = argv.indexOf("--root");
  let index = rootIndex === 0 ? 2 : 0;
  if (argv[index] === "--json") index += 1;
  const first = argv[index];
  const second = argv[index + 1];
  if (first === "horizon") {
    if (second === "abort") return "horizon.abort";
    if (second === "close") return "horizon.close";
    return "horizon.open";
  }
  if (first === "source") return "source.add";
  if (first === "assertion") {
    return second === "revise" ? "assertion.revise" : "assertion.add";
  }
  if (first === "question") return "question.add";
  if (first === "draft") return "draft.undo";
  if (commandNames.has(first)) return first;
  return "init";
}

function parseOptions(tokens, required, optional = []) {
  if (tokens.length % 2 !== 0) usageError();
  const allowed = new Set([...required, ...optional]);
  const values = new Map();
  for (let index = 0; index < tokens.length; index += 2) {
    const key = tokens[index];
    const value = tokens[index + 1];
    if (
      !allowed.has(key) ||
      values.has(key) ||
      typeof value !== "string" ||
      value.length === 0
    ) {
      usageError();
    }
    values.set(key, value);
  }
  if (required.some((key) => !values.has(key))) usageError();
  return values;
}

function parseLines(value) {
  const match = value.match(/^([1-9]\d*)(?::([1-9]\d*))?$/);
  if (match === null) throw new WorkbenchError("INVALID_LINE_RANGE");
  const firstLine = Number(match[1]);
  const lastLine = Number(match[2] ?? match[1]);
  if (
    !Number.isSafeInteger(firstLine) ||
    !Number.isSafeInteger(lastLine) ||
    lastLine < firstLine
  ) {
    throw new WorkbenchError("INVALID_LINE_RANGE");
  }
  return { firstLine, lastLine };
}

function parse(argv) {
  const jsonOccurrences = argv.filter((token) => token === "--json").length;
  const json = jsonOccurrences > 0;
  if (
    argv[0] !== "--root" ||
    typeof argv[1] !== "string" ||
    argv[1].length === 0 ||
    jsonOccurrences > 1
  ) {
    usageError();
  }
  const root = argv[1];
  let index = 2;
  if (argv[index] === "--json") index += 1;
  if (argv.slice(index).includes("--json")) usageError();
  const first = argv[index];
  const second = argv[index + 1];
  let command;
  let consumed;
  if (first === "init") {
    command = "init";
    consumed = 1;
  } else if (first === "horizon" && new Set(["open", "abort", "close"]).has(second)) {
    command = `horizon.${second}`;
    consumed = 2;
  } else if (first === "source" && second === "add") {
    command = "source.add";
    consumed = 2;
  } else if (first === "assertion" && new Set(["add", "revise"]).has(second)) {
    command = `assertion.${second}`;
    consumed = 2;
  } else if (first === "question" && second === "add") {
    command = "question.add";
    consumed = 2;
  } else if (first === "draft" && second === "undo") {
    command = "draft.undo";
    consumed = 2;
  } else if (new Set(["verify", "dossier", "rebuild"]).has(first)) {
    command = first;
    consumed = 1;
  } else {
    usageError();
  }
  return { command, json, options: argv.slice(index + consumed), root };
}

async function dispatch(parsed) {
  const { command, options, root } = parsed;
  if (command === "init") {
    const values = parseOptions(options, ["--owner"]);
    return initializeWorkspace({ owner: values.get("--owner"), root });
  }
  if (command === "horizon.open") {
    const values = parseOptions(
      options,
      ["--name", "--source-root"],
      ["--coverage", "--scope"],
    );
    return openHorizon({
      coverage: values.get("--coverage") ?? "partial",
      name: values.get("--name"),
      root,
      scope: values.get("--scope") ?? null,
      sourceRoot: values.get("--source-root"),
    });
  }
  if (command === "source.add") {
    const values = parseOptions(options, ["--alias", "--path"]);
    return addSource({
      alias: values.get("--alias"),
      logicalPath: values.get("--path"),
      root,
    });
  }
  if (command === "assertion.add") {
    const values = parseOptions(
      options,
      ["--alias", "--text", "--source", "--lines"],
      ["--scope", "--uncertainty"],
    );
    return addAssertion({
      alias: values.get("--alias"),
      ...parseLines(values.get("--lines")),
      root,
      scope: values.get("--scope") ?? null,
      sourceAlias: values.get("--source"),
      text: values.get("--text"),
      uncertainty: values.get("--uncertainty") ?? null,
    });
  }
  if (command === "assertion.revise") {
    const values = parseOptions(
      options,
      ["--assertion", "--text", "--source", "--lines", "--reason"],
      ["--scope", "--uncertainty"],
    );
    return reviseAssertion({
      assertionAlias: values.get("--assertion"),
      ...parseLines(values.get("--lines")),
      reason: values.get("--reason"),
      root,
      scope: values.get("--scope") ?? null,
      sourceAlias: values.get("--source"),
      text: values.get("--text"),
      uncertainty: values.get("--uncertainty") ?? null,
    });
  }
  if (command === "question.add") {
    const values = parseOptions(
      options,
      ["--alias", "--text"],
      ["--source", "--lines"],
    );
    const hasSource = values.has("--source");
    if (hasSource !== values.has("--lines")) usageError();
    return addQuestion({
      alias: values.get("--alias"),
      ...(hasSource ? parseLines(values.get("--lines")) : {}),
      root,
      sourceAlias: hasSource ? values.get("--source") : null,
      text: values.get("--text"),
    });
  }
  if (command === "draft.undo") {
    parseOptions(options, []);
    return undoDraft({ root });
  }
  if (command === "horizon.abort") {
    parseOptions(options, []);
    return abortHorizon({ root });
  }
  if (command === "horizon.close") {
    parseOptions(options, []);
    return closeHorizon({ root });
  }
  if (command === "verify") {
    parseOptions(options, []);
    return verifyWorkspace({ root });
  }
  if (command === "dossier") {
    const values = parseOptions(options, ["--as-of"]);
    return publishDossier({ horizonName: values.get("--as-of"), root });
  }
  if (command === "rebuild") {
    parseOptions(options, []);
    return rebuildProjections({ root });
  }
  usageError();
}

function successSummary(command, result) {
  const summaries = {
    init: () => `initialized owner ${result.owner}`,
    "horizon.open": () => `opened horizon ${result.name}`,
    "source.add": () => `staged source ${result.logicalPath}`,
    "assertion.add": () => "staged assertion",
    "assertion.revise": () => "staged additive assertion revision",
    "question.add": () => "staged open question",
    "draft.undo": () => `undid ${result.undoneKind} ${result.undoneAlias}`,
    "horizon.abort": () => `aborted horizon ${result.name}`,
    "horizon.close": () => "closed horizon atomically",
    verify: () => `verified canonical history; projections ${result.projectionStatus}`,
    dossier: () => "published named-horizon dossier",
    rebuild: () => `rebuilt ${result.rebuiltFiles.length} derived files`,
  };
  const next = {
    init: "horizon open",
    "horizon.open": "source add or horizon abort",
    "source.add": "source add, assertion add, question add, draft undo, or horizon close",
    "assertion.add": "assertion revise, question add, draft undo, or horizon close",
    "assertion.revise": "assertion revise, question add, draft undo, or horizon close",
    "question.add": "question add, draft undo, or horizon close",
    "draft.undo": "continue the open horizon or abort it",
    "horizon.abort": "horizon open",
    "horizon.close": "verify, dossier --as-of, rebuild, or horizon open",
    verify: "rebuild if projections are absent or invalid; otherwise continue",
    dossier: "verify, rebuild, or horizon open",
    rebuild: "verify or horizon open",
  };
  return `OK ${command}: ${summaries[command]()}\nNEXT ${next[command]}\n`;
}

async function main() {
  const argv = process.argv.slice(2);
  const hintedCommand = commandHint(argv);
  const jsonRequested = argv.includes("--json");
  let parsed;
  try {
    parsed = parse(argv);
    const result = await dispatch(parsed);
    if (parsed.json) {
      process.stdout.write(
        `${JSON.stringify({
          schema: commandResultSchema,
          ok: true,
          command: parsed.command,
          result,
        })}\n`,
      );
    } else {
      process.stdout.write(successSummary(parsed.command, result));
    }
  } catch (cause) {
    const error =
      cause instanceof WorkbenchError
        ? cause
        : new WorkbenchError("INTERNAL");
    const command = parsed?.command ?? hintedCommand;
    if (jsonRequested) {
      process.stdout.write(
        `${JSON.stringify({
          schema: commandResultSchema,
          ok: false,
          command,
          error: {
            code: error.code,
            message: stableMessageFor(error.code),
            details: {},
          },
        })}\n`,
      );
    } else {
      process.stderr.write(`${error.code}: ${stableMessageFor(error.code)}\n`);
    }
    process.exitCode = exitStatusFor(error.code);
  }
}

await main();
