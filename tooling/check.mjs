import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolingDirectory, "..");

const fallbackIgnoredDirectories = new Set([
  ".cache",
  ".direnv",
  ".git",
  ".graphtruth",
  ".idea",
  ".vscode",
  "corpus",
  "dogfood",
  "node_modules",
  "private",
]);
const fallbackIgnoredFiles = new Set([".DS_Store", "Desktop.ini", "Thumbs.db"]);
const requiredRepositoryPaths = new Map([
  ["README.md", "file"],
  [".gitignore", "file"],
  [".markdownlint-cli2.yaml", "file"],
  ["package.json", "file"],
  ["package-lock.json", "file"],
  ["docs", "directory"],
  ["docs/DEVELOPMENT.md", "file"],
  ["examples", "directory"],
  ["rfcs", "directory"],
  ["runtime", "directory"],
  ["schemas", "directory"],
  ["spec", "directory"],
  ["tooling", "directory"],
  ["tooling/README.md", "file"],
  ["tooling/check", "file"],
  ["tooling/check.mjs", "file"],
  [".github/PULL_REQUEST_TEMPLATE.md", "file"],
  [".github/ISSUE_TEMPLATE/config.yml", "file"],
  [".github/ISSUE_TEMPLATE/observation.md", "file"],
  [".github/ISSUE_TEMPLATE/bug.md", "file"],
  [".github/ISSUE_TEMPLATE/experiment.md", "file"],
  [".github/ISSUE_TEMPLATE/design-question.md", "file"],
  [".github/workflows/quality.yml", "file"],
]);
const decisionStatuses = new Set([
  "Draft",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Superseded",
]);
const requiredRfcMetadata = [
  "Decision status",
  "Implementation status",
  "Created",
  "Supersedes",
  "Superseded by",
];
const secretAllowMarker = "graphtruth-secret-scan: allow";
const highConfidenceSecretPatterns = [
  {
    name: "PEM private key",
    expression: /-----BEGIN (?:(?:RSA|EC|OPENSSH|DSA|ENCRYPTED) )?PRIVATE KEY-----/,
  },
  {
    name: "GitHub access token",
    expression: /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{82,255})\b/,
  },
  { name: "AWS access key ID", expression: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  {
    name: "OpenAI API key",
    expression: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/,
  },
  { name: "Slack token", expression: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "npm access token", expression: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: "GitLab access token", expression: /\bglpat-[A-Za-z0-9_-]{20,}\b/ },
  { name: "Google API key", expression: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "Stripe live secret key", expression: /\bsk_live_[0-9A-Za-z]{16,}\b/ },
  { name: "age secret key", expression: /\bAGE-SECRET-KEY-1[0-9A-Z]{20,}\b/ },
];

const errors = [];

function report(message) {
  errors.push(message);
}

function relativePath(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
}

function fallbackFileIsIgnored(name) {
  if (name === ".env.example") {
    return false;
  }

  return (
    fallbackIgnoredFiles.has(name) ||
    name === ".env" ||
    name.startsWith(".env.") ||
    name.endsWith(".swp") ||
    name.endsWith(".swo") ||
    name.endsWith("~")
  );
}

async function collectFallbackFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && fallbackIgnoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFallbackFiles(entryPath)));
    } else if (entry.isFile() && !fallbackFileIsIgnored(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function gitRepositoryRoot() {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["-C", repositoryRoot, "rev-parse", "--show-toplevel"],
      { encoding: "utf8" },
    );
    return path.resolve(stdout.trim());
  } catch {
    return null;
  }
}

async function collectGitPublicFiles() {
  const detectedRoot = await gitRepositoryRoot();
  if (detectedRoot !== repositoryRoot) {
    return null;
  }

  const { stdout } = await execFileAsync(
    "git",
    ["-C", repositoryRoot, "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 },
  );
  const repositoryPaths = stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
  const files = [];

  for (const repositoryPath of repositoryPaths) {
    const absolutePath = path.join(repositoryRoot, repositoryPath);
    try {
      const pathStat = await stat(absolutePath);
      if (pathStat.isFile()) {
        files.push(absolutePath);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return files;
}

async function collectPublicFiles() {
  const gitFiles = await collectGitPublicFiles();
  const files = gitFiles ?? (await collectFallbackFiles(repositoryRoot));
  return [...new Set(files.map((filePath) => path.resolve(filePath)))].sort((left, right) =>
    relativePath(left).localeCompare(relativePath(right)),
  );
}

async function checkRequiredPaths() {
  for (const [repositoryPath, expectedType] of requiredRepositoryPaths) {
    const absolutePath = path.join(repositoryRoot, repositoryPath);

    try {
      const pathStat = await stat(absolutePath);
      const matches = expectedType === "file" ? pathStat.isFile() : pathStat.isDirectory();
      if (!matches) {
        report(`${repositoryPath}: expected a ${expectedType}`);
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        report(`${repositoryPath}: required ${expectedType} is missing`);
      } else {
        throw error;
      }
    }
  }
}

function isProbablyText(buffer) {
  return !buffer.includes(0);
}

function checkTextHygiene(filePath, content) {
  const displayPath = relativePath(filePath);
  const lines = content.split("\n");
  const conflictMarker = /^(?:<{7}(?: .*)?|\|{7}(?: .*)?|={7}|>{7}(?: .*)?)$/;

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

    if (/[\t ]+$/.test(line)) {
      report(`${displayPath}:${index + 1}: trailing whitespace`);
    }
    if (conflictMarker.test(line)) {
      report(`${displayPath}:${index + 1}: unresolved merge conflict marker`);
    }
  }
}

function checkHighConfidenceSecrets(filePath, content) {
  const displayPath = relativePath(filePath);
  const lines = content.split("\n");

  for (const [index, line] of lines.entries()) {
    if (line.includes(secretAllowMarker)) {
      continue;
    }

    for (const pattern of highConfidenceSecretPatterns) {
      if (pattern.expression.test(line)) {
        report(
          `${displayPath}:${index + 1}: possible ${pattern.name}; remove it or add '${secretAllowMarker}' to a deliberately synthetic fixture line`,
        );
      }
    }
  }
}

function withoutFencedCode(markdown) {
  const lines = markdown.split("\n");
  let fence = null;

  return lines
    .map((line) => {
      const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (opening) {
        const marker = opening[1];
        if (fence === null) {
          fence = marker[0];
        } else if (marker[0] === fence) {
          fence = null;
        }
        return "";
      }
      return fence === null ? line : "";
    })
    .join("\n");
}

function lineNumberAt(content, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) {
    if (content[position] === "\n") {
      line += 1;
    }
  }
  return line;
}

function localLinkPath(target) {
  const trimmed = target.trim();
  if (
    trimmed === "" ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  ) {
    return null;
  }

  const withoutFragment = trimmed.split("#", 1)[0].split("?", 1)[0];
  if (withoutFragment === "") {
    return null;
  }

  try {
    return decodeURIComponent(withoutFragment);
  } catch {
    return withoutFragment;
  }
}

function targetIsPublic(targetPath, publicRelativePaths) {
  const targetRelativePath = relativePath(targetPath);
  if (
    targetRelativePath === "" ||
    targetRelativePath === ".." ||
    targetRelativePath.startsWith("../")
  ) {
    return false;
  }

  if (publicRelativePaths.has(targetRelativePath)) {
    return true;
  }

  const directoryPrefix = `${targetRelativePath.replace(/\/$/, "")}/`;
  return [...publicRelativePaths].some((repositoryPath) => repositoryPath.startsWith(directoryPrefix));
}

async function checkMarkdownLinks(filePath, markdown, publicRelativePaths) {
  const displayPath = relativePath(filePath);
  const searchable = withoutFencedCode(markdown).replace(/`[^`\n]*`/g, "");
  const targets = [];
  const inlineLink = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;
  const referenceLink = /^ {0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/gm;

  for (const expression of [inlineLink, referenceLink]) {
    for (const match of searchable.matchAll(expression)) {
      targets.push({ target: match[1] ?? match[2], index: match.index });
    }
  }

  for (const { target, index } of targets) {
    const decodedPath = localLinkPath(target);
    if (decodedPath === null) {
      continue;
    }

    const targetPath = decodedPath.startsWith("/")
      ? path.join(repositoryRoot, decodedPath.slice(1))
      : path.resolve(path.dirname(filePath), decodedPath);

    try {
      await stat(targetPath);
      if (!targetIsPublic(targetPath, publicRelativePaths)) {
        report(
          `${displayPath}:${lineNumberAt(searchable, index)}: local link target is outside the public repository file set: ${target}`,
        );
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        report(
          `${displayPath}:${lineNumberAt(searchable, index)}: local link target does not exist: ${target}`,
        );
      } else {
        throw error;
      }
    }
  }
}

function metadataValues(markdown, displayPath) {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const values = new Map();
  let index = 1;

  while (index < lines.length && lines[index].trim() === "") {
    index += 1;
  }

  while (index < lines.length) {
    const match = lines[index].match(/^- ([^:\n]+):\s*(.*?)\s*$/);
    if (match === null) {
      break;
    }

    const [, field, value] = match;
    if (requiredRfcMetadata.includes(field)) {
      if (values.has(field)) {
        report(`${displayPath}:${index + 1}: RFC metadata field is repeated: ${field}`);
      }
      values.set(field, value);
    }
    index += 1;
  }

  return values;
}

function validIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function checkRfc(filePath, markdown) {
  const displayPath = relativePath(filePath);
  const filename = path.basename(filePath);
  const filenameMatch = filename.match(/^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/);

  if (filenameMatch === null) {
    report(`${displayPath}: RFC filename must match NNNN-lowercase-kebab-case.md`);
    return;
  }

  const rfcNumber = filenameMatch[1];
  const firstLine = markdown.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
  const heading = firstLine.match(/^# RFC (\d{4}):\s+\S.*$/);
  if (heading === null) {
    report(`${displayPath}: first line must be '# RFC ${rfcNumber}: Title'`);
  } else if (heading[1] !== rfcNumber) {
    report(`${displayPath}: heading RFC number ${heading[1]} does not match filename ${rfcNumber}`);
  }

  const metadata = metadataValues(markdown, displayPath);
  for (const field of requiredRfcMetadata) {
    if (!metadata.has(field) || metadata.get(field) === "") {
      report(`${displayPath}: required RFC preamble metadata is missing or empty: ${field}`);
    }
  }

  const decisionStatus = metadata.get("Decision status");
  if (decisionStatus !== undefined && !decisionStatuses.has(decisionStatus)) {
    report(
      `${displayPath}: invalid Decision status '${decisionStatus}'; expected one of ${[
        ...decisionStatuses,
      ].join(", ")}`,
    );
  }

  const created = metadata.get("Created");
  if (created !== undefined && !validIsoDate(created)) {
    report(`${displayPath}: Created must be a valid YYYY-MM-DD date`);
  }
}

const command = process.argv[2] ?? "check";
if (!new Set(["check", "--list-markdown"]).has(command) || process.argv.length > 3) {
  console.error("Usage: node tooling/check.mjs [--list-markdown]");
  process.exit(2);
}

const files = await collectPublicFiles();
if (command === "--list-markdown") {
  const markdownPaths = files
    .filter((filePath) => path.extname(filePath).toLowerCase() === ".md")
    .map((filePath) => `./${relativePath(filePath)}`);
  if (markdownPaths.length > 0) {
    process.stdout.write(`${markdownPaths.join("\0")}\0`);
  }
  process.exit(0);
}

await checkRequiredPaths();

const publicRelativePaths = new Set(files.map((filePath) => relativePath(filePath)));
for (const filePath of files) {
  const buffer = await readFile(filePath);
  if (!isProbablyText(buffer)) {
    continue;
  }

  const content = buffer.toString("utf8");
  checkTextHygiene(filePath, content);
  checkHighConfidenceSecrets(filePath, content);

  if (path.extname(filePath).toLowerCase() === ".md") {
    await checkMarkdownLinks(filePath, content, publicRelativePaths);
  }

  if (
    path.dirname(filePath) === path.join(repositoryRoot, "rfcs") &&
    path.basename(filePath) !== "README.md" &&
    path.extname(filePath).toLowerCase() === ".md"
  ) {
    checkRfc(filePath, content);
  }
}

if (errors.length > 0) {
  console.error(`Repository quality checks failed with ${errors.length} error(s):`);
  for (const error of errors.sort()) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Repository quality checks passed (${files.length} public files inspected).`);
}
