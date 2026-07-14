import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

import {
  formatRehearsalMarkdown,
  repositoryRoot,
  runRecordedRehearsal,
} from "./src/controller.mjs";
import { prettyJson, sha256 } from "./src/lib.mjs";
import { terminateSandboxChildren } from "./src/sandbox.mjs";

let terminating = false;
let terminationSignal = null;

async function handleTerminationSignal(signal) {
  if (terminating) return;
  terminating = true;
  terminationSignal = signal;
  await terminateSandboxChildren();
}

process.once("SIGINT", () => void handleTerminationSignal("SIGINT"));
process.once("SIGTERM", () => void handleTerminationSignal("SIGTERM"));

function usage() {
  return `Usage: ./runtime/replay [rehearse] [options]

Options:
  --pack <path>            frozen public synthetic pack
  --report <path>          Markdown report output
  --json-report <path>     machine-readable report output
  --seed <value>           reproduce the generated second pack
  --session-parent <path>  controller-only attempt parent
  --help                   show this help
`;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === "rehearse") argv.shift();
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      pack: { type: "string" },
      report: { type: "string" },
      "json-report": { type: "string" },
      seed: { type: "string" },
      "session-parent": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: true,
    strict: true,
  });
  if (values.help) {
    process.stdout.write(usage());
    return;
  }
  if (positionals.length > 0) throw new Error(`unexpected argument: ${positionals[0]}`);
  const reportPath = path.resolve(values.report ?? path.join(repositoryRoot, "runtime/rehearsal/observed.md"));
  const jsonPath = path.resolve(
    values["json-report"] ?? path.join(repositoryRoot, "runtime/rehearsal/observed.json"),
  );
  const report = await runRecordedRehearsal({
    packRoot: values.pack ? path.resolve(values.pack) : undefined,
    seed: values.seed,
    sessionParent: values["session-parent"] ? path.resolve(values["session-parent"]) : undefined,
    isCancelled: () => terminationSignal !== null,
  });
  if (terminationSignal !== null) throw new Error("rehearsal interrupted by operator signal");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await mkdir(path.dirname(jsonPath), { recursive: true });
  await writeFile(reportPath, formatRehearsalMarkdown(report));
  await writeFile(jsonPath, prettyJson(report));
  process.stdout.write(`Runtime-boundary rehearsal passed.\nReport: ${path.relative(repositoryRoot, reportPath)}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(
    `Runtime-boundary rehearsal failed (${error.name}; error digest ${sha256(String(error.message))}).\n`,
  );
  if (error.preservedAttemptRoot) {
    process.stderr.write(
      `Failed attempt preserved as ${path.basename(error.preservedAttemptRoot)} under the session parent.\n`,
    );
  }
  process.exitCode = terminationSignal === "SIGINT" ? 130 : terminationSignal === "SIGTERM" ? 143 : 1;
}
