import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import {
  codexSandboxPreflightEvidencePins,
  validateCodexSandboxPreflightReportContent,
} from "./codex-sandbox-qualification.mjs";
import { parseStrictJson } from "./private-pack-lock.mjs";
export {
  codexSandboxPreflightEvidencePins,
  validateCodexSandboxPreflightReportContent,
} from "./codex-sandbox-qualification.mjs";

const execFileAsync = promisify(execFile);
const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolingDirectory, "..");
const publicG1ReceiptTemplatePath = "experiments/templates/PUBLIC-G1-RECEIPT.json";
const publicG1ReceiptPath = "experiments/receipts/g1-evidence-contract-v2.json";
const codexSandboxPreflightReportPath = "tooling/rehearsal/observed.json";
const pythonCorpusRoot = "experiments/corpora/python-annotations-semantics-v1";
const pythonSourceManifestPath = `${pythonCorpusRoot}/SOURCE-MANIFEST.json`;
const pythonProjectionManifestPath = `${pythonCorpusRoot}/PROJECTION-MANIFEST.json`;
const pythonProjectionAcceptancePath = `${pythonCorpusRoot}/PROJECTION-ACCEPTANCE.json`;
const pythonEvaluationFreezeTerminalPath = `${pythonCorpusRoot}/EVALUATION-FREEZE-TERMINAL.json`;
export const pythonProjectionEvidencePins = Object.freeze({
  projectionAcceptanceSha256: "4b15e68f9fca0d83f2cd87c3b9a072ae363eb0d9d4234cf2e3cb1437f9f1d435",
  projectionManifestSha256: "5aba6ebea40066ec1a12e6aa54913b5d39638d3b9a9e8807c1436a6b8e40cb6a",
  sourceManifestSha256: "c030ca505e7e43799daf1f065291598cd964b520a4d93f68aa52e60ba1cb384b",
  sourceManifestAnchorCommit: "e32b2b257374f4ec7570fd6df2bd630e8d0e7921",
  sourcePreAcceptanceSha256: "ad63ca3cad51ec67b6e5d8fd2c62dcdfc3ed6a291f47a6809a819eadfa29ff99",
  builderGitCommit: "957ea8aa1621bb776b0adb30c70435374e2854df",
  builderSha256: "810080806bc932a41837b5f549b158a0adfc0d75c8d25b0e0118ea18ba5954fd",
  contractSha256: "fefe4a940ffd64432cbefe32837556b75b85d8b17907c6ea1d35b0d0e3fd2c3d",
  testsSha256: "f9a67b3e60ea2c5627d60ff144d672b1ca96d04fcc800e03fb78564c6e6165cb",
  strictJsonSha256: "603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b",
  ownerRecord: "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5031512080",
  projectionAcceptanceRecord:
    "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5032376897",
});
export const pythonEvaluationFreezeEvidencePins = Object.freeze({
  terminalFileSha256: "410a91aaca18d121a7bafbaf0e117b1f0a4cee04008fb5f717a5fa648705a7bd",
  controllerWrapperSha256: "6e1df78fd222bf287ad03b3cef236271baf668d37bc51471bf2c87d28cba8b19",
  controllerModuleSha256: "53f951ddb3ebe82c0d1f3dd6e7fb2dd116e168e20efd9628306912a74fd5a513",
  controllerTestSha256: "4a5756ea4cf042dc75582eb8a98c60b45ca16c9abb38e6df06bd421aea45ad05",
  terminalSha256: "993241bce6b183468339c5f5f21515cd13eb82c253975a0ba32ed3d261dd52f1",
  coreManifestSha256: "45ccc83c2514a136d8f69db993a65414ea16ad5731f01aeb908158f89f9def2e",
  authorPackageSha256: "2b302bd4bd0f4a099c5538df764fd2dac2475287efbc49e347c61894a5f24f70",
  auditManifestSha256: "b70ee8635997c3709fe7a78a1a7510a60cedd324cd9f67b54b6d1f0d6af41f1a",
  auditResultSha256: "872758e111dab28c3cf62245a2c8d222b5a7f17873552ac056a0b6f5a1a1c0cf",
  executionIdentitySha256: "ce4139672bef37acaa5c55380ec19d798e797833e250871bbabdb5bfb864c216",
  sandboxPreflightModuleSha256:
    "28a821f843d71489974bfa65ed931de8a304eea3dff5ab570ea02f5a1d596025",
  privatePackLockModuleSha256:
    "603553be7d0ca32cb11ccce7eadfb711277dc6ae9c55d2d68f08abafd9e5750b",
  ownerAuthorizationRecord:
    "https://github.com/asukhodko/graphtruth/issues/24#issuecomment-5033460564",
});
export const pythonEvaluationFreezeV2ToolingPins = Object.freeze({
  controllerWrapperSha256: "8ed374fd19c2b2f3fde5663627aa50f0388918c95d5450d9fa465d2bed40d263",
  controllerModuleSha256: "6707723916f93c679112785260cfa8b472f407a4d62bc1ce51e971c5a59bc385",
  controllerTestSha256: "825044d3ceb3ab168c89e46320a60c2a22594d29b0ca8fda2f01914124da5deb",
});
const publicG1AttestationKeys = [
  "eligibleEpisodeSelected",
  "sourceSetWithinApprovedBound",
  "allSourcesImmutableMarkdown",
  "knowledgeBoundaryAndRevealOrderFrozen",
  "taskDenominatorClosedAndMeetsMinimum",
  "oracleWithheld",
  "baselineExposureEvaluationAndDecisionFrozen",
  "dataHandlingAndIncidentRulesApproved",
  "publicationSafeSyntheticTwinReviewed",
  "privatePackInventoryVerified",
  "nonCircularPrivateSealAnchoredOutsidePack",
  "runSpecificPostSealIdentityAndConfigPreflightPassed",
  "externalOpenAIProcessingSpecificallyAuthorized",
  "freshIsolatedCodexReviewAccepted",
  "privateReviewCompletedWithoutToolCalls",
  "ownerFinalAcceptanceBoundToSealedPack",
  "independentHumanReview",
  "noEvaluatedRunPerformed",
  "noContractPrivateMaterialPublished",
];
const publicG1AttestedValues = Object.freeze(
  Object.fromEntries(
    publicG1AttestationKeys.map((key) => [key, key !== "independentHumanReview"]),
  ),
);
const publicG1ClaimBoundary = [
  "Attests only that the G1 evidence-contract controls were completed.",
  "Does not identify, quote, hash, or commit to private material publicly.",
  "Records authorized OpenAI processing and does not claim local-only processing or provider-side deletion.",
  "Records an accepted model-assisted review and does not claim independent human review.",
  "Does not admit a runtime to private data.",
  "Does not report an experiment result or establish GraphTruth usefulness.",
];

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
  ["THIRD_PARTY_NOTICES.md", "file"],
  ["docs", "directory"],
  ["docs/DEVELOPMENT.md", "file"],
  ["docs/INVARIANTS.md", "file"],
  ["docs/planning", "directory"],
  ["docs/planning/README.md", "file"],
  ["docs/planning/graphtruth.plan.yaml", "file"],
  ["examples", "directory"],
  ["examples/experiments/author-call-qualification-v1", "directory"],
  ["examples/experiments/author-call-qualification-v1/QUALIFICATION-RESULT.schema.json", "file"],
  ["examples/experiments/author-call-qualification-v1/README.md", "file"],
  ["examples/experiments/author-call-qualification-v1/SYNTHETIC-MANIFEST.json", "file"],
  ["examples/experiments/author-call-qualification-v1/TOOLING-MANIFEST.json", "file"],
  ["examples/experiments/evidence-contract-twin-v1", "directory"],
  ["examples/experiments/preflight", "directory"],
  ["experiments", "directory"],
  ["experiments/corpora/python-annotations-semantics-v1", "directory"],
  ["experiments/corpora/python-annotations-semantics-v1/CANDIDATE-INVENTORY.json", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/CORPUS-SELECTION.md", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/PROJECTION-ACCEPTANCE.json", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/PROJECTION-CONTRACT.md", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/EVALUATION-FREEZE-TERMINAL.json", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/PROJECTION-MANIFEST.json", "file"],
  ["experiments/corpora/python-annotations-semantics-v1/SOURCE-MANIFEST.json", "file"],
  ["experiments/README.md", "file"],
  ["experiments/templates", "directory"],
  ["experiments/templates/CORPUS-SELECTION.md", "file"],
  ["experiments/templates/DATA-HANDLING.md", "file"],
  ["experiments/templates/EVIDENCE-CONTRACT.md", "file"],
  ["experiments/templates/FAILURE-DIARY.md", "file"],
  ["experiments/templates/G1-EVIDENCE-CONTRACT.md", "file"],
  ["experiments/templates/g1-review-control.json", "file"],
  ["experiments/templates/g1-review-prompt.md", "file"],
  ["experiments/templates/g1-review-result.schema.json", "file"],
  ["experiments/templates/INCIDENT-RUNBOOK.md", "file"],
  ["experiments/templates/REVIEW-RUBRIC.md", "file"],
  ["experiments/templates/RUN-CARD.md", "file"],
  ["experiments/templates/PUBLIC-G1-RECEIPT.json", "file"],
  ["rfcs", "directory"],
  ["runtime", "directory"],
  ["schemas", "directory"],
  ["spec", "directory"],
  ["tooling", "directory"],
  ["tooling/README.md", "file"],
  ["tooling/check", "file"],
  ["tooling/check.mjs", "file"],
  ["tooling/check.test.mjs", "file"],
  ["tooling/codex-author-call-qualification-v1", "file"],
  ["tooling/codex-author-call-qualification-v1.mjs", "file"],
  ["tooling/codex-author-call-qualification-v1.test.mjs", "file"],
  ["tooling/codex-g1-review", "file"],
  ["tooling/codex-g1-review.mjs", "file"],
  ["tooling/codex-g1-review.test.mjs", "file"],
  ["tooling/codex-evaluation-freeze", "file"],
  ["tooling/codex-evaluation-freeze.mjs", "file"],
  ["tooling/codex-evaluation-freeze.test.mjs", "file"],
  ["tooling/codex-evaluation-freeze-v2", "file"],
  ["tooling/codex-evaluation-freeze-v2.mjs", "file"],
  ["tooling/codex-evaluation-freeze-v2.test.mjs", "file"],
  ["tooling/codex-sandbox-preflight", "file"],
  ["tooling/codex-sandbox-preflight.mjs", "file"],
  ["tooling/codex-sandbox-qualification.mjs", "file"],
  ["tooling/codex-sandbox-preflight.test.mjs", "file"],
  ["tooling/rehearsal", "directory"],
  ["tooling/rehearsal/observed.json", "file"],
  ["tooling/rehearsal/observed.md", "file"],
  ["tooling/opskarta", "file"],
  ["tooling/opskarta-requirements.in", "file"],
  ["tooling/opskarta_validate.py", "file"],
  ["tooling/opskarta-requirements.txt", "file"],
  ["tooling/opskarta.test.mjs", "file"],
  ["tooling/private-pack-lock", "file"],
  ["tooling/private-pack-lock.mjs", "file"],
  ["tooling/private-pack-lock.test.mjs", "file"],
  ["tooling/project-verbatim-rst.mjs", "file"],
  ["tooling/project-verbatim-rst.test.mjs", "file"],
  ["tooling/preflight", "file"],
  ["tooling/preflight.mjs", "file"],
  ["tooling/preflight.test.mjs", "file"],
  ["tooling/vendor/opskarta/UPSTREAM.md", "file"],
  ["tooling/vendor/opskarta/UPSTREAM.sha256", "file"],
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
const unchangedVendorFilesWithTrailingWhitespace = new Set([
  "tooling/vendor/opskarta/specs/v3/tools/loader.py",
  "tooling/vendor/opskarta/specs/v3/tools/models.py",
  "tooling/vendor/opskarta/specs/v3/tools/validator.py",
]);
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

async function inspectRepositoryPath(absolutePath) {
  const normalized = path.resolve(absolutePath);
  const relative = path.relative(repositoryRoot, normalized);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return { safe: false, pathStat: null };
  }

  let current = repositoryRoot;
  const rootStat = await lstat(current);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    return { safe: false, pathStat: rootStat };
  }
  if (relative === "") return { safe: true, pathStat: rootStat };

  const parts = relative.split(path.sep);
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    const pathStat = await lstat(current);
    if (pathStat.isSymbolicLink()) return { safe: false, pathStat };
    if (index < parts.length - 1 && !pathStat.isDirectory()) {
      return { safe: false, pathStat };
    }
    if (index === parts.length - 1) return { safe: true, pathStat };
  }
  return { safe: false, pathStat: null };
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
      const { safe, pathStat } = await inspectRepositoryPath(absolutePath);
      if (!safe) {
        report(`${repositoryPath}: symbolic links and non-directory path crossings are not allowed in the public file set`);
      } else if (pathStat?.isFile()) {
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
      const { safe, pathStat } = await inspectRepositoryPath(absolutePath);
      const matches =
        safe &&
        pathStat !== null &&
        (expectedType === "file" ? pathStat.isFile() : pathStat.isDirectory());
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

function allowsVendoredTrailingWhitespace(filePath) {
  return unchangedVendorFilesWithTrailingWhitespace.has(relativePath(filePath));
}

function checkTextHygiene(filePath, content) {
  const displayPath = relativePath(filePath);
  const lines = content.split("\n");
  const conflictMarker = /^(?:<{7}(?: .*)?|\|{7}(?: .*)?|={7}|>{7}(?: .*)?)$/;
  const allowTrailingWhitespace = allowsVendoredTrailingWhitespace(filePath);

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

    if (!allowTrailingWhitespace && /[\t ]+$/.test(line)) {
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
      const { safe } = await inspectRepositoryPath(targetPath);
      if (!safe) {
        report(
          `${displayPath}:${lineNumberAt(searchable, index)}: local link target crosses a symbolic link or leaves the repository: ${target}`,
        );
        continue;
      }
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

function hasExactKeys(value, expectedKeys) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    actualKeys.length === sortedExpectedKeys.length &&
    actualKeys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

function sha256Bytes(value) {
  return createHash("sha256").update(value).digest("hex");
}

const pythonProjectionDependencyPaths = Object.freeze({
  builder: "tooling/project-verbatim-rst.mjs",
  contract: `${pythonCorpusRoot}/PROJECTION-CONTRACT.md`,
  tests: "tooling/project-verbatim-rst.test.mjs",
  strictJson: "tooling/private-pack-lock.mjs",
});

export function validatePythonProjectionManifestEvidence(evidence) {
  const requiredEvidenceKeys = [
    "sourceBytes",
    "projectionBytes",
    "builderBytes",
    "contractBytes",
    "testBytes",
    "strictJsonBytes",
  ];
  if (
    evidence === null ||
    typeof evidence !== "object" ||
    requiredEvidenceKeys.some((key) => !Buffer.isBuffer(evidence[key]))
  ) {
    return ["missing-evidence"];
  }

  const { sourceBytes, projectionBytes, builderBytes, contractBytes, testBytes, strictJsonBytes } =
    evidence;
  let source;
  let projection;
  try {
    source = parseStrictJson(sourceBytes.toString("utf8"));
    projection = parseStrictJson(projectionBytes.toString("utf8"));
  } catch {
    return ["strict-json"];
  }

  const validationErrors = [];
  const addError = (code) => {
    if (!validationErrors.includes(code)) validationErrors.push(code);
  };
  if (sha256Bytes(projectionBytes) !== pythonProjectionEvidencePins.projectionManifestSha256) {
    addError("projection-manifest-digest");
  }
  if (
    sha256Bytes(sourceBytes) !== pythonProjectionEvidencePins.sourceManifestSha256 ||
    source?.ownerAcceptance?.acceptedPreAcceptanceManifestSha256 !==
      pythonProjectionEvidencePins.sourcePreAcceptanceSha256
  ) {
    addError("source-manifest-anchor");
  }

  const digestBindings = [
    [projection?.sourceManifest?.path, "SOURCE-MANIFEST.json", "source manifest path"],
    [projection?.sourceManifest?.sha256, pythonProjectionEvidencePins.sourceManifestSha256, "source manifest digest"],
    [projection?.builder?.path, pythonProjectionDependencyPaths.builder, "builder path"],
    [projection?.builder?.sha256, pythonProjectionEvidencePins.builderSha256, "builder digest"],
    [projection?.builder?.contract?.path, pythonProjectionDependencyPaths.contract, "contract path"],
    [projection?.builder?.contract?.sha256, pythonProjectionEvidencePins.contractSha256, "contract digest"],
    [projection?.builder?.syntheticTests?.path, pythonProjectionDependencyPaths.tests, "test path"],
    [projection?.builder?.syntheticTests?.sha256, pythonProjectionEvidencePins.testsSha256, "test digest"],
    [
      projection?.builder?.strictJsonDependency?.path,
      pythonProjectionDependencyPaths.strictJson,
      "strict JSON dependency path",
    ],
    [
      projection?.builder?.strictJsonDependency?.sha256,
      pythonProjectionEvidencePins.strictJsonSha256,
      "strict JSON dependency digest",
    ],
  ];
  if (
    digestBindings.some(([actual, expected]) => actual !== expected) ||
    sha256Bytes(builderBytes) !== pythonProjectionEvidencePins.builderSha256 ||
    sha256Bytes(contractBytes) !== pythonProjectionEvidencePins.contractSha256 ||
    sha256Bytes(testBytes) !== pythonProjectionEvidencePins.testsSha256 ||
    sha256Bytes(strictJsonBytes) !== pythonProjectionEvidencePins.strictJsonSha256
  ) {
    addError("dependency-bindings");
  }

  const projectionPolicy = projection?.projection;
  const fixedStructureValid =
    hasExactKeys(projection, [
      "schemaVersion",
      "projectionIdentity",
      "selectionIdentity",
      "sourceManifest",
      "projection",
      "builder",
      "materialization",
      "totalProjectionByteSize",
      "items",
      "authorization",
      "publication",
    ]) &&
    hasExactKeys(projection?.sourceManifest, ["path", "sha256", "graphtruthAnchorCommit"]) &&
    hasExactKeys(projectionPolicy, [
      "kind",
      "payloadGuarantee",
      "outputMediaType",
      "outputNaming",
      "normalizations",
      "insertedBytes",
      "removedBytes",
      "declaredLosses",
      "rstParsedOrRendered",
      "directivesOrIncludesExpanded",
      "currentRuntimeCompatible",
      "futureRuntimeRequirement",
    ]) &&
    hasExactKeys(projection?.builder, [
      "path",
      "gitCommit",
      "sha256",
      "strictJsonDependency",
      "contract",
      "syntheticTests",
      "runtime",
    ]) &&
    hasExactKeys(projection?.builder?.strictJsonDependency, ["path", "sha256"]) &&
    hasExactKeys(projection?.builder?.contract, ["path", "sha256"]) &&
    hasExactKeys(projection?.builder?.syntheticTests, ["path", "sha256", "passed", "failed"]) &&
    hasExactKeys(projection?.builder?.runtime, [
      "name",
      "version",
      "environmentCleared",
      "pathValue",
      "homeWasNonexistent",
    ]) &&
    hasExactKeys(projection?.materialization, [
      "completedAtUtc",
      "actor",
      "evidenceBasis",
      "storageBoundary",
      "cleanBuilds",
      "successfulVerifyPasses",
      "temporaryRebuildRemoved",
      "persistentProjectionRetained",
      "sourceInventoryChanged",
      "projectionInventoryMatched",
      "allProjectionBytesEqualSourceBytes",
      "allProjectionSha256EqualSourceSha256",
      "allProjectionSizesEqualSourceSizes",
      "strictUtf8Verified",
      "networkOperationPerformed",
      "subprocessSpawnPerformedByBuilder",
      "modelProcessingOfSourceOrProjectionBytes",
      "sourceOrProjectionExcerptProduced",
      "taskOrOracleCreated",
      "sutOrBaselineWorkPerformed",
      "experimentalRunPerformed",
    ]) &&
    hasExactKeys(projection?.materialization?.storageBoundary, [
      "class",
      "outsideRepositoryCheckout",
      "outsideGitWorktrees",
      "localPathPublished",
      "builderVerifiedOwnerUidAndModes",
      "directoryMode",
      "fileMode",
      "aclAbsenceVerifiedByBuilder",
      "synchronizationAndMountBoundaryVerifiedByBuilder",
      "ownerAcceptanceRequired",
    ]) &&
    Array.isArray(projection?.items) &&
    projection.items.every((item) =>
      hasExactKeys(item, [
        "id",
        "revealOrder",
        "projectionName",
        "sourceGitBlobOid",
        "sourceSha256",
        "sourceByteSize",
        "projectionSha256",
        "projectionByteSize",
        "byteIdentical",
      ]),
    ) &&
    hasExactKeys(projection?.authorization, [
      "ownerRecord",
      "authorizedGate",
      "ownerAcceptanceRequiredToCloseGate",
      "nextGateAuthorized",
      "notAuthorized",
    ]) &&
    hasExactKeys(projection?.publication, [
      "containsSourceBytes",
      "containsProjectionBytes",
      "containsPrivateMaterialPaths",
      "containsSourceExcerpts",
      "allowedUse",
    ]);
  if (!fixedStructureValid) addError("fixed-structure");

  if (
    projection?.schemaVersion !== 1 ||
    projection?.projectionIdentity !== "python-annotations-semantics-v1-verbatim-rst-v1" ||
    projection?.selectionIdentity !== source?.selectionIdentity ||
    projection?.sourceManifest?.graphtruthAnchorCommit !==
      pythonProjectionEvidencePins.sourceManifestAnchorCommit ||
    projectionPolicy?.kind !== "verbatim-rst-text/1" ||
    projectionPolicy?.payloadGuarantee !== "byte-identical" ||
    projectionPolicy?.outputMediaType !== "text/x-rst; charset=utf-8" ||
    projectionPolicy?.outputNaming !== "item-%04d.rst by reveal order" ||
    !Array.isArray(projectionPolicy?.normalizations) ||
    projectionPolicy.normalizations.length !== 0 ||
    !Array.isArray(projectionPolicy?.declaredLosses) ||
    projectionPolicy.declaredLosses.length !== 0 ||
    projectionPolicy?.insertedBytes !== 0 ||
    projectionPolicy?.removedBytes !== 0 ||
    projectionPolicy?.rstParsedOrRendered !== false ||
    projectionPolicy?.directivesOrIncludesExpanded !== false ||
    projectionPolicy?.currentRuntimeCompatible !== false ||
    projectionPolicy?.futureRuntimeRequirement !==
      "a separately authorized whole-document candidate adapter that preserves payload bytes, byte offsets, and RST media type"
  ) {
    addError("projection-policy");
  }

  const builder = projection?.builder;
  if (
    builder?.gitCommit !== pythonProjectionEvidencePins.builderGitCommit ||
    builder?.syntheticTests?.passed !== 15 ||
    builder?.syntheticTests?.failed !== 0 ||
    builder?.runtime?.name !== "Node.js" ||
    builder?.runtime?.version !== "v24.4.1" ||
    builder?.runtime?.environmentCleared !== true ||
    builder?.runtime?.pathValue !== "/usr/bin:/bin" ||
    builder?.runtime?.homeWasNonexistent !== true
  ) {
    addError("builder-attestation");
  }

  const sourceItems = Array.isArray(source?.items) ? source.items : [];
  const projectionItems = Array.isArray(projection?.items) ? projection.items : [];
  if (sourceItems.length === 0 || projectionItems.length !== sourceItems.length) {
    addError("item-bindings");
  } else {
    for (const [index, sourceItem] of sourceItems.entries()) {
      const item = projectionItems[index];
      if (
        item?.id !== sourceItem.id ||
        item?.revealOrder !== sourceItem.revealOrder ||
        item?.projectionName !== `item-${String(sourceItem.revealOrder).padStart(4, "0")}.rst` ||
        item?.sourceGitBlobOid !== sourceItem.gitBlobOid ||
        item?.sourceSha256 !== sourceItem.sha256 ||
        item?.sourceByteSize !== sourceItem.byteSize ||
        item?.projectionSha256 !== sourceItem.sha256 ||
        item?.projectionByteSize !== sourceItem.byteSize ||
        item?.byteIdentical !== true
      ) {
        addError("item-bindings");
      }
    }
  }
  if (projection?.totalProjectionByteSize !== source?.totalByteSize) {
    addError("item-bindings");
  }

  const materialization = projection?.materialization;
  if (
    materialization?.completedAtUtc !== "2026-07-21T08:29:18Z" ||
    materialization?.actor !==
      "GraphTruth Codex session launching the pinned local deterministic builder" ||
    materialization?.evidenceBasis !==
      "session attestation over generic builder statuses and publication-safe metadata" ||
    materialization?.cleanBuilds !== 2 ||
    materialization?.successfulVerifyPasses !== 2 ||
    materialization?.temporaryRebuildRemoved !== true ||
    materialization?.persistentProjectionRetained !== true ||
    materialization?.sourceInventoryChanged !== false ||
    materialization?.projectionInventoryMatched !== true ||
    materialization?.allProjectionBytesEqualSourceBytes !== true ||
    materialization?.allProjectionSha256EqualSourceSha256 !== true ||
    materialization?.allProjectionSizesEqualSourceSizes !== true ||
    materialization?.strictUtf8Verified !== true ||
    materialization?.networkOperationPerformed !== false ||
    materialization?.subprocessSpawnPerformedByBuilder !== false ||
    materialization?.modelProcessingOfSourceOrProjectionBytes !== false ||
    materialization?.sourceOrProjectionExcerptProduced !== false ||
    materialization?.taskOrOracleCreated !== false ||
    materialization?.sutOrBaselineWorkPerformed !== false ||
    materialization?.experimentalRunPerformed !== false
  ) {
    addError("materialization-attestation");
  }
  const boundary = materialization?.storageBoundary;
  if (
    boundary?.class !== "owner-only local experiment root" ||
    boundary?.outsideRepositoryCheckout !== true ||
    boundary?.outsideGitWorktrees !== true ||
    boundary?.localPathPublished !== false ||
    boundary?.builderVerifiedOwnerUidAndModes !== true ||
    boundary?.directoryMode !== "0700" ||
    boundary?.fileMode !== "0600" ||
    boundary?.aclAbsenceVerifiedByBuilder !== false ||
    boundary?.synchronizationAndMountBoundaryVerifiedByBuilder !== false ||
    boundary?.ownerAcceptanceRequired !== true
  ) {
    addError("storage-boundary");
  }

  const authorization = projection?.authorization;
  const expectedNotAuthorized = [
    "task construction",
    "oracle construction",
    "model processing of acquired or projected bytes",
    "SUT work",
    "baseline work",
    "runtime adaptation",
    "experimental run",
  ];
  if (
    authorization?.ownerRecord !== pythonProjectionEvidencePins.ownerRecord ||
    authorization?.authorizedGate !== "m6-freeze-projection" ||
    authorization?.ownerAcceptanceRequiredToCloseGate !== true ||
    authorization?.nextGateAuthorized !== false ||
    !Array.isArray(authorization?.notAuthorized) ||
    authorization.notAuthorized.length !== expectedNotAuthorized.length ||
    authorization.notAuthorized.some((value, index) => value !== expectedNotAuthorized[index])
  ) {
    addError("authorization");
  }
  if (
    projection?.publication?.containsSourceBytes !== false ||
    projection?.publication?.containsProjectionBytes !== false ||
    projection?.publication?.containsPrivateMaterialPaths !== false ||
    projection?.publication?.containsSourceExcerpts !== false ||
    projection?.publication?.allowedUse !==
      "publication-safe projection identity, materialization evidence, and owner review only"
  ) {
    addError("publication-boundary");
  }

  return validationErrors;
}

export function validatePythonProjectionAcceptanceEvidence(evidence) {
  if (
    evidence === null ||
    typeof evidence !== "object" ||
    !Buffer.isBuffer(evidence.projectionBytes) ||
    !Buffer.isBuffer(evidence.receiptBytes)
  ) {
    return ["missing-evidence"];
  }

  const { projectionBytes, receiptBytes } = evidence;
  let projection;
  let receipt;
  try {
    projection = parseStrictJson(projectionBytes.toString("utf8"));
    receipt = parseStrictJson(receiptBytes.toString("utf8"));
  } catch {
    return ["strict-json"];
  }

  const validationErrors = [];
  const addError = (code) => {
    if (!validationErrors.includes(code)) validationErrors.push(code);
  };
  if (sha256Bytes(receiptBytes) !== pythonProjectionEvidencePins.projectionAcceptanceSha256) {
    addError("receipt-digest");
  }

  const acceptedManifest = receipt?.acceptedManifest;
  if (
    sha256Bytes(projectionBytes) !== pythonProjectionEvidencePins.projectionManifestSha256 ||
    receipt?.selectionIdentity !== projection?.selectionIdentity ||
    receipt?.projectionIdentity !== projection?.projectionIdentity ||
    acceptedManifest?.path !== "PROJECTION-MANIFEST.json" ||
    acceptedManifest?.sha256 !== pythonProjectionEvidencePins.projectionManifestSha256 ||
    acceptedManifest?.candidateGitCommit !== "53695d6641fab1a1245668ab4e85f579f4c0fe31"
  ) {
    addError("manifest-binding");
  }

  const ownerDecision = receipt?.ownerDecision;
  if (
    !hasExactKeys(receipt, [
      "documentKind",
      "selectionIdentity",
      "projectionIdentity",
      "acceptedManifest",
      "ownerDecision",
    ]) ||
    !hasExactKeys(acceptedManifest, ["path", "sha256", "candidateGitCommit"]) ||
    !hasExactKeys(ownerDecision, [
      "actor",
      "decision",
      "acceptedAtUtc",
      "record",
      "actualOwnerOnlyStorageBoundaryAccepted",
      "acceptedStorageBoundaryReference",
      "closedGate",
      "nextGateAuthorized",
      "notAuthorized",
    ]) ||
    receipt?.documentKind !== "graphtruth.projection-acceptance-receipt/1"
  ) {
    addError("fixed-structure");
  }

  const expectedNotAuthorized = [
    "m6-freeze-evaluation",
    "task construction",
    "oracle construction",
    "model processing of acquired or projected bytes",
    "SUT work",
    "baseline work",
    "runtime adaptation",
    "experimental run",
  ];
  if (
    ownerDecision?.actor !== "asukhodko" ||
    ownerDecision?.decision !== "accept" ||
    ownerDecision?.acceptedAtUtc !== "2026-07-21T09:33:32Z" ||
    ownerDecision?.record !== pythonProjectionEvidencePins.projectionAcceptanceRecord ||
    ownerDecision?.actualOwnerOnlyStorageBoundaryAccepted !== true ||
    ownerDecision?.acceptedStorageBoundaryReference !== "projection-v1" ||
    ownerDecision?.closedGate !== "m6-freeze-projection" ||
    ownerDecision?.nextGateAuthorized !== false ||
    !Array.isArray(ownerDecision?.notAuthorized) ||
    ownerDecision.notAuthorized.length !== expectedNotAuthorized.length ||
    ownerDecision.notAuthorized.some((value, index) => value !== expectedNotAuthorized[index])
  ) {
    addError("owner-decision");
  }

  return validationErrors;
}

function containsUnsafeEvaluationFreezePublicContent(value, keyPath = []) {
  if (Array.isArray(value)) {
    return value.some((item, index) =>
      containsUnsafeEvaluationFreezePublicContent(item, [...keyPath, String(index)]),
    );
  }
  if (value !== null && typeof value === "object") {
    const allowedSensitiveKeys = new Set([
      "authorAndAuditorExcludedFromAnswersAndScoring",
      "counts.oracleJudgments",
      "counts.tasks",
      "modelCalls.resumedSessions",
      "toolchain.privatePackLockModuleSha256",
    ]);
    return Object.entries(value).some(([key, child]) => {
      const childPath = [...keyPath, key];
      const dottedPath = childPath.join(".");
      const sensitiveKey =
        /(answer|auditwork|content|counterevidence|evidence|excerpt|localpath|oracle|ownerroot|path|private|projectionbytes|prompt|question|rubric|session|sourcebytes|stateroot|task|thread|trace|transcript|workingneed|workroot)/i.test(
          key,
        );
      return (
        (sensitiveKey && !allowedSensitiveKeys.has(dottedPath)) ||
        containsUnsafeEvaluationFreezePublicContent(child, childPath)
      );
    });
  }
  if (typeof value !== "string") return false;
  const dottedPath = keyPath.join(".");
  if (
    value.startsWith("/") &&
    !(dottedPath === "toolchain.rg.argv0" && value === "/opt/homebrew/bin/rg")
  ) {
    return true;
  }
  return (
    value.includes("/Users/") ||
    value.includes("/private/") ||
    value.includes("/var/folders/") ||
    value.includes("/.graphtruth") ||
    value.includes(".graphtruth-recovery") ||
    value.startsWith("file://")
  );
}

export function validatePythonEvaluationFreezeTerminalEvidence(evidence) {
  const requiredEvidenceKeys = [
    "terminalBytes",
    "controllerWrapperBytes",
    "controllerModuleBytes",
    "controllerTestBytes",
  ];
  if (
    evidence === null ||
    typeof evidence !== "object" ||
    requiredEvidenceKeys.some((key) => !Buffer.isBuffer(evidence[key])) ||
    !Number.isInteger(evidence.controllerWrapperMode)
  ) {
    return ["missing-evidence"];
  }

  const { terminalBytes, controllerWrapperBytes, controllerModuleBytes, controllerTestBytes } =
    evidence;
  let terminal;
  try {
    terminal = parseStrictJson(terminalBytes.toString("utf8"));
  } catch {
    return ["strict-json"];
  }

  const validationErrors = [];
  const addError = (code) => {
    if (!validationErrors.includes(code)) validationErrors.push(code);
  };
  if (sha256Bytes(terminalBytes) !== pythonEvaluationFreezeEvidencePins.terminalFileSha256) {
    addError("terminal-file-digest");
  }
  if (
    sha256Bytes(controllerWrapperBytes) !==
      pythonEvaluationFreezeEvidencePins.controllerWrapperSha256 ||
    sha256Bytes(controllerModuleBytes) !==
      pythonEvaluationFreezeEvidencePins.controllerModuleSha256 ||
    sha256Bytes(controllerTestBytes) !== pythonEvaluationFreezeEvidencePins.controllerTestSha256
  ) {
    addError("controller-digests");
  }
  if (evidence.controllerWrapperMode !== 0o755) {
    addError("controller-mode");
  }

  const fixedStructureValid =
    hasExactKeys(terminal, [
      "auditDecision",
      "auditManifestSha256",
      "auditResultSha256",
      "authorAndAuditorExcludedFromAnswersAndScoring",
      "authorPackageSha256",
      "completedAtUtc",
      "coreManifestSha256",
      "counts",
      "documentKind",
      "evaluatedRunAuthorized",
      "evaluationIdentity",
      "executionIdentitySha256",
      "experimentId",
      "externalProcessing",
      "implementationAuthorized",
      "independentHumanReview",
      "independentReadOnlyAudit",
      "localOnlyProcessing",
      "model",
      "modelCalls",
      "nextGate",
      "nextGateAuthorized",
      "ownerAcceptance",
      "ownerAuthorizationRecord",
      "projectionId",
      "projectionManifestSha256",
      "projectionReceiptSha256",
      "provider",
      "providerSideDeletionVerified",
      "rehearsalAuthorized",
      "releaseSha256",
      "status",
      "terminalSha256",
      "toolchain",
    ]) &&
    hasExactKeys(terminal?.counts, [
      "arms",
      "cells",
      "coreArtifacts",
      "horizons",
      "oracleJudgments",
      "severeErrorClasses",
      "tasks",
    ]) &&
    hasExactKeys(terminal?.modelCalls, ["maximum", "resumedSessions", "retries", "used"]) &&
    hasExactKeys(terminal?.toolchain, [
      "codex",
      "controllerModuleSha256",
      "nodeVersion",
      "privatePackLockModuleSha256",
      "rg",
      "sandboxPreflightModuleSha256",
    ]) &&
    hasExactKeys(terminal?.toolchain?.codex, [
      "binarySha256",
      "model",
      "normalizedCommandShapeSha256",
      "permissionProfileName",
      "permissionProfileSha256",
      "provider",
      "version",
    ]) &&
    hasExactKeys(terminal?.toolchain?.rg, [
      "argv0",
      "sha256",
      "verifiedWithoutCorpusAccess",
      "version",
    ]);
  if (!fixedStructureValid) addError("fixed-structure");
  if (containsUnsafeEvaluationFreezePublicContent(terminal)) {
    addError("unsafe-public-content");
  }

  if (
    terminal?.documentKind !== "graphtruth.evaluation-freeze-public-status/1" ||
    terminal?.status !== "rejected" ||
    terminal?.auditDecision !== "reject" ||
    terminal?.releaseSha256 !== null ||
    terminal?.terminalSha256 !== pythonEvaluationFreezeEvidencePins.terminalSha256
  ) {
    addError("terminal-state");
  }
  if (
    terminal?.experimentId !== "python-annotations-semantics-v1" ||
    terminal?.projectionId !== "python-annotations-semantics-v1-verbatim-rst-v1" ||
    terminal?.projectionManifestSha256 !==
      pythonProjectionEvidencePins.projectionManifestSha256 ||
    terminal?.projectionReceiptSha256 !==
      pythonProjectionEvidencePins.projectionAcceptanceSha256 ||
    terminal?.evaluationIdentity !==
      `python-annotations-semantics-v1-evaluation-sha256-${pythonEvaluationFreezeEvidencePins.coreManifestSha256}` ||
    terminal?.coreManifestSha256 !== pythonEvaluationFreezeEvidencePins.coreManifestSha256 ||
    terminal?.authorPackageSha256 !== pythonEvaluationFreezeEvidencePins.authorPackageSha256 ||
    terminal?.auditManifestSha256 !== pythonEvaluationFreezeEvidencePins.auditManifestSha256 ||
    terminal?.auditResultSha256 !== pythonEvaluationFreezeEvidencePins.auditResultSha256 ||
    terminal?.executionIdentitySha256 !==
      pythonEvaluationFreezeEvidencePins.executionIdentitySha256 ||
    terminal?.completedAtUtc !== "2026-07-21T12:31:32.657Z"
  ) {
    addError("identity-bindings");
  }

  const counts = terminal?.counts;
  if (
    counts?.tasks !== 8 ||
    counts?.cells !== 64 ||
    counts?.horizons !== 4 ||
    counts?.arms !== 2 ||
    counts?.oracleJudgments !== 32 ||
    counts?.coreArtifacts !== 7 ||
    counts?.severeErrorClasses !== 10 ||
    counts?.cells !== counts?.tasks * counts?.horizons * counts?.arms ||
    counts?.oracleJudgments !== counts?.tasks * counts?.horizons
  ) {
    addError("counts");
  }
  const modelCalls = terminal?.modelCalls;
  if (
    modelCalls?.used !== 2 ||
    modelCalls?.maximum !== 2 ||
    modelCalls?.retries !== 0 ||
    modelCalls?.resumedSessions !== 0
  ) {
    addError("model-calls");
  }
  if (
    terminal?.externalProcessing !== true ||
    terminal?.localOnlyProcessing !== false ||
    terminal?.providerSideDeletionVerified !== false ||
    terminal?.independentReadOnlyAudit !== true ||
    terminal?.independentHumanReview !== false ||
    terminal?.authorAndAuditorExcludedFromAnswersAndScoring !== true ||
    terminal?.provider !== "openai" ||
    terminal?.model !== "gpt-5.6-sol"
  ) {
    addError("processing-boundary");
  }
  if (
    terminal?.ownerAcceptance !== false ||
    terminal?.nextGate !== "g6-evaluation-contract-accepted" ||
    terminal?.nextGateAuthorized !== false ||
    terminal?.implementationAuthorized !== false ||
    terminal?.rehearsalAuthorized !== false ||
    terminal?.evaluatedRunAuthorized !== false ||
    terminal?.ownerAuthorizationRecord !==
      pythonEvaluationFreezeEvidencePins.ownerAuthorizationRecord
  ) {
    addError("authorization-boundary");
  }

  const toolchain = terminal?.toolchain;
  const codex = toolchain?.codex;
  const rg = toolchain?.rg;
  if (
    toolchain?.controllerModuleSha256 !==
      pythonEvaluationFreezeEvidencePins.controllerModuleSha256 ||
    toolchain?.nodeVersion !== "v24.4.1" ||
    toolchain?.privatePackLockModuleSha256 !==
      pythonEvaluationFreezeEvidencePins.privatePackLockModuleSha256 ||
    toolchain?.sandboxPreflightModuleSha256 !==
      pythonEvaluationFreezeEvidencePins.sandboxPreflightModuleSha256 ||
    codex?.binarySha256 !==
      "3302acbda5f53de1a71ebdb0c0f2aae0d47f9324aa9fb6b4e78a47014fd51c7d" ||
    codex?.model !== "gpt-5.6-sol" ||
    codex?.normalizedCommandShapeSha256 !==
      "33f658eb4af9b4ece4e141d37b2a9e7877ff9614d265e26f7acdd9a589bc35a7" ||
    codex?.permissionProfileName !== "graphtruth-zero-tools" ||
    codex?.permissionProfileSha256 !==
      "067bec78216284a13bb6dd9f4bd4b6a70a0a2f4d9a792f0d38a42daa8901ccf1" ||
    codex?.provider !== "openai" ||
    codex?.version !== "0.144.4" ||
    rg?.argv0 !== "/opt/homebrew/bin/rg" ||
    rg?.sha256 !== "2fb61b6e5b3e2d89b115fe6c18fd8805670fdf4bdfde85954d40855a76830e5f" ||
    rg?.verifiedWithoutCorpusAccess !== true ||
    rg?.version !== "15.1.0"
  ) {
    addError("toolchain");
  }

  return validationErrors;
}

export function validatePythonEvaluationFreezeV2ToolingEvidence(evidence) {
  const requiredEvidenceKeys = [
    "controllerWrapperBytes",
    "controllerModuleBytes",
    "controllerTestBytes",
  ];
  if (
    evidence === null ||
    typeof evidence !== "object" ||
    requiredEvidenceKeys.some((key) => !Buffer.isBuffer(evidence[key])) ||
    !Number.isInteger(evidence.controllerWrapperMode)
  ) {
    return ["missing-evidence"];
  }

  const errors = [];
  if (
    sha256Bytes(evidence.controllerWrapperBytes) !==
      pythonEvaluationFreezeV2ToolingPins.controllerWrapperSha256 ||
    sha256Bytes(evidence.controllerModuleBytes) !==
      pythonEvaluationFreezeV2ToolingPins.controllerModuleSha256 ||
    sha256Bytes(evidence.controllerTestBytes) !==
      pythonEvaluationFreezeV2ToolingPins.controllerTestSha256
  ) {
    errors.push("controller-digests");
  }
  if (evidence.controllerWrapperMode !== 0o755) {
    errors.push("controller-mode");
  }
  return errors;
}

async function checkPythonProjectionManifest() {
  const absolute = (relative) => path.join(repositoryRoot, relative);
  let evidence;
  try {
    const [sourceBytes, projectionBytes, builderBytes, contractBytes, testBytes, strictJsonBytes] =
      await Promise.all([
        readFile(absolute(pythonSourceManifestPath)),
        readFile(absolute(pythonProjectionManifestPath)),
        readFile(absolute(pythonProjectionDependencyPaths.builder)),
        readFile(absolute(pythonProjectionDependencyPaths.contract)),
        readFile(absolute(pythonProjectionDependencyPaths.tests)),
        readFile(absolute(pythonProjectionDependencyPaths.strictJson)),
      ]);
    evidence = { sourceBytes, projectionBytes, builderBytes, contractBytes, testBytes, strictJsonBytes };
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "unknown error";
    report(`${pythonProjectionManifestPath}: projection evidence cannot be read (${code})`);
    return;
  }

  const messages = {
    "missing-evidence": "projection evidence is incomplete",
    "strict-json": "source and projection manifests must be strict JSON",
    "projection-manifest-digest": "projection manifest bytes changed from the reviewed candidate",
    "source-manifest-anchor": "source manifest no longer matches the owner-accepted acquisition",
    "dependency-bindings": "builder or dependency identity does not match the reviewed bytes",
    "fixed-structure": "projection manifest keys differ from the closed publication-safe structure",
    "projection-policy": "projection identity or byte-preservation policy changed",
    "builder-attestation": "builder commit, tests, or cleared runtime identity changed",
    "item-bindings": "projection inventory is not bound verbatim to the source manifest",
    "materialization-attestation": "technical session attestation is incomplete or broadened",
    "storage-boundary": "storage-boundary evidence overclaims or omits the owner gate",
    authorization: "projection authorization exceeds the current owner decision",
    "publication-boundary": "publication boundary is incomplete",
  };
  for (const validationError of validatePythonProjectionManifestEvidence(evidence)) {
    report(`${pythonProjectionManifestPath}: ${messages[validationError]}`);
  }
}

async function checkPythonProjectionAcceptance() {
  let evidence;
  try {
    const [projectionBytes, receiptBytes] = await Promise.all([
      readFile(path.join(repositoryRoot, pythonProjectionManifestPath)),
      readFile(path.join(repositoryRoot, pythonProjectionAcceptancePath)),
    ]);
    evidence = { projectionBytes, receiptBytes };
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "unknown error";
    report(`${pythonProjectionAcceptancePath}: acceptance evidence cannot be read (${code})`);
    return;
  }

  const messages = {
    "missing-evidence": "projection acceptance evidence is incomplete",
    "strict-json": "projection manifest and acceptance receipt must be strict JSON",
    "receipt-digest": "acceptance receipt bytes changed from the owner decision record",
    "manifest-binding": "acceptance receipt is not bound to the reviewed projection candidate",
    "fixed-structure": "acceptance receipt keys differ from the closed structure",
    "owner-decision": "acceptance receipt changes the owner decision or authorization boundary",
  };
  for (const validationError of validatePythonProjectionAcceptanceEvidence(evidence)) {
    report(`${pythonProjectionAcceptancePath}: ${messages[validationError]}`);
  }
}

async function checkPythonEvaluationFreezeTerminal() {
  const absolute = (relative) => path.join(repositoryRoot, relative);
  let evidence;
  try {
    const [
      terminalBytes,
      controllerWrapperBytes,
      controllerModuleBytes,
      controllerTestBytes,
      controllerWrapperStat,
    ] =
      await Promise.all([
        readFile(absolute(pythonEvaluationFreezeTerminalPath)),
        readFile(absolute("tooling/codex-evaluation-freeze")),
        readFile(absolute("tooling/codex-evaluation-freeze.mjs")),
        readFile(absolute("tooling/codex-evaluation-freeze.test.mjs")),
        lstat(absolute("tooling/codex-evaluation-freeze")),
      ]);
    evidence = {
      terminalBytes,
      controllerWrapperBytes,
      controllerModuleBytes,
      controllerTestBytes,
      controllerWrapperMode: controllerWrapperStat.mode & 0o777,
    };
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "unknown error";
    report(`${pythonEvaluationFreezeTerminalPath}: terminal evidence cannot be read (${code})`);
    return;
  }

  const messages = {
    "missing-evidence": "evaluation-freeze terminal evidence is incomplete",
    "strict-json": "evaluation-freeze terminal status must be strict JSON",
    "terminal-file-digest": "public terminal bytes changed from the recorded outcome",
    "controller-digests": "evaluation-freeze controller or synthetic test bytes changed",
    "controller-mode": "evaluation-freeze wrapper must retain mode 0755",
    "fixed-structure": "public terminal keys differ from the closed safe structure",
    "unsafe-public-content": "public terminal exposes a task, oracle, answer, or private path field",
    "terminal-state": "terminal rejection, audit decision, release, or terminal anchor changed",
    "identity-bindings": "evaluation, projection, audit, or execution identity changed",
    counts: "frozen task, cell, horizon, arm, oracle, artifact, or severe-error count changed",
    "model-calls": "the two-call, zero-retry, zero-resume budget changed",
    "processing-boundary": "external-processing, review, provider, or exclusion claims changed",
    "authorization-boundary": "owner acceptance or a later-stage authorization was broadened",
    toolchain: "recorded controller, Codex, rg, Node, or supporting-tool identity changed",
  };
  for (const validationError of validatePythonEvaluationFreezeTerminalEvidence(evidence)) {
    report(`${pythonEvaluationFreezeTerminalPath}: ${messages[validationError]}`);
  }
}

async function checkPythonEvaluationFreezeV2Tooling() {
  const absolute = (relative) => path.join(repositoryRoot, relative);
  let evidence;
  try {
    const [
      controllerWrapperBytes,
      controllerModuleBytes,
      controllerTestBytes,
      controllerWrapperStat,
    ] = await Promise.all([
      readFile(absolute("tooling/codex-evaluation-freeze-v2")),
      readFile(absolute("tooling/codex-evaluation-freeze-v2.mjs")),
      readFile(absolute("tooling/codex-evaluation-freeze-v2.test.mjs")),
      lstat(absolute("tooling/codex-evaluation-freeze-v2")),
    ]);
    evidence = {
      controllerWrapperBytes,
      controllerModuleBytes,
      controllerTestBytes,
      controllerWrapperMode: controllerWrapperStat.mode & 0o777,
    };
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "unknown error";
    report(`evaluation-freeze v2 tooling cannot be read (${code})`);
    return;
  }

  const messages = {
    "missing-evidence": "evaluation-freeze v2 tooling evidence is incomplete",
    "controller-digests": "accepted evaluation-freeze v2 tooling bytes changed",
    "controller-mode": "evaluation-freeze v2 wrapper must retain mode 0755",
  };
  for (const validationError of validatePythonEvaluationFreezeV2ToolingEvidence(evidence)) {
    report(`evaluation-freeze v2 tooling: ${messages[validationError]}`);
  }
}

async function checkCodexSandboxPreflightReport(filePath, content) {
  const displayPath = relativePath(filePath);
  const messages = {
    "evidence-digest": "report bytes do not match the retained rehearsal evidence",
    "strict-json": "report must be strict JSON without duplicate keys",
    "fixed-claims": "report scope, status, time, platform, and host must match the observed run",
    "tool-identities": "report Codex or controller identity is not admitted",
    "permission-profile": "report permission-profile identity or boundary changed",
    "command-boundary": "report command or workspace boundary changed",
    "adversarial-probe": "report zero-tool synthetic probe result or identity changed",
  };
  for (const validationError of validateCodexSandboxPreflightReportContent(content)) {
    report(`${displayPath}: ${messages[validationError]}`);
  }

  let reportValue;
  try {
    reportValue = parseStrictJson(content);
  } catch {
    return;
  }
  const [wrapperBytes, moduleBytes] = await Promise.all([
    readFile(path.join(repositoryRoot, "tooling/codex-sandbox-preflight")),
    readFile(path.join(repositoryRoot, "tooling/codex-sandbox-preflight.mjs")),
  ]);
  if (
    reportValue?.tooling?.wrapperSha256 !== sha256Bytes(wrapperBytes) ||
    reportValue?.tooling?.moduleSha256 !== sha256Bytes(moduleBytes)
  ) {
    report(`${displayPath}: retained report no longer matches the checked-in controller bytes`);
  }
}

export function validatePublicG1ReceiptContent(content, isTemplate) {
  let receipt;
  try {
    receipt = parseStrictJson(content);
  } catch {
    return ["strict-json"];
  }

  if (
    !hasExactKeys(receipt, [
      "documentKind",
      "gate",
      "status",
      "attestedOn",
      "trustBasis",
      "publicBounds",
      "attestations",
      "claimBoundary",
    ]) ||
    receipt.documentKind !== "graphtruth.public-g1-receipt/2" ||
    receipt.gate !== "G1" ||
    receipt.trustBasis !== "owner-and-fresh-isolated-codex-review" ||
    !hasExactKeys(receipt.publicBounds, ["sources", "tasks"]) ||
    receipt.publicBounds.sources !== "three-to-five-confirmed" ||
    receipt.publicBounds.tasks !== "closed-T-at-least-eight-confirmed" ||
    !hasExactKeys(receipt.attestations, publicG1AttestationKeys) ||
    !Array.isArray(receipt.claimBoundary) ||
    receipt.claimBoundary.length !== publicG1ClaimBoundary.length ||
    receipt.claimBoundary.some((value, index) => value !== publicG1ClaimBoundary[index])
  ) {
    return ["fixed-claims"];
  }

  const validationErrors = [];
  if (
    publicG1AttestationKeys.some(
      (key) =>
        typeof receipt.attestations[key] !== "boolean" ||
        receipt.attestations[key] !==
          (isTemplate ? false : publicG1AttestedValues[key]),
    )
  ) {
    validationErrors.push("attestations");
  }

  if (isTemplate) {
    if (receipt.status !== "template-only-not-attested" || receipt.attestedOn !== null) {
      validationErrors.push("template-state");
    }
  } else if (receipt.status !== "attested" || !validIsoDate(receipt.attestedOn)) {
    validationErrors.push("attested-state");
  }
  return validationErrors;
}

function checkPublicG1Receipt(filePath, content, isTemplate) {
  const displayPath = relativePath(filePath);
  const messages = {
    "strict-json": "receipt must be strict JSON without duplicate keys",
    "fixed-claims": "receipt keys and fixed public claims must match the v2 allowlist",
    attestations: "receipt attestations must match the exact template or attested v2 state",
    "template-state": "the public template must remain explicitly unattested",
    "attested-state": "an attested receipt requires status 'attested' and a valid date",
  };
  for (const validationError of validatePublicG1ReceiptContent(content, isTemplate)) {
    report(`${displayPath}: ${messages[validationError]}`);
  }
}

export function classifyPublicG1ReceiptPath(displayPath, isText) {
  if (displayPath === publicG1ReceiptTemplatePath) {
    return isText ? "template" : "registered-non-text";
  }
  if (displayPath === publicG1ReceiptPath) {
    return isText ? "attested" : "registered-non-text";
  }
  if (displayPath.startsWith("experiments/receipts/")) {
    return "unregistered";
  }
  return null;
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

async function main() {
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
  await checkPythonProjectionManifest();
  await checkPythonProjectionAcceptance();
  await checkPythonEvaluationFreezeTerminal();
  await checkPythonEvaluationFreezeV2Tooling();

  const publicRelativePaths = new Set(files.map((filePath) => relativePath(filePath)));
  for (const filePath of files) {
    const buffer = await readFile(filePath);
    const displayPath = relativePath(filePath);
    const isText = isProbablyText(buffer);
    const receiptDisposition = classifyPublicG1ReceiptPath(displayPath, isText);
    if (!isText) {
      if (receiptDisposition === "registered-non-text") {
        report(`${displayPath}: a registered public G1 receipt must be strict text JSON`);
      } else if (receiptDisposition === "unregistered") {
        report(`${displayPath}: unregistered public experiment receipt path`);
      }
      continue;
    }

    const content = buffer.toString("utf8");
    checkTextHygiene(filePath, content);
    checkHighConfidenceSecrets(filePath, content);

    if (displayPath === codexSandboxPreflightReportPath) {
      await checkCodexSandboxPreflightReport(filePath, content);
    }

    if (path.extname(filePath).toLowerCase() === ".md") {
      await checkMarkdownLinks(filePath, content, publicRelativePaths);
    }

    if (receiptDisposition === "template") {
      checkPublicG1Receipt(filePath, content, true);
    } else if (receiptDisposition === "attested") {
      checkPublicG1Receipt(filePath, content, false);
    } else if (receiptDisposition === "unregistered") {
      report(`${displayPath}: unregistered public experiment receipt path`);
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
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) await main();
