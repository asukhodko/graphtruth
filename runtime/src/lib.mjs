import { createHash, randomBytes } from "node:crypto";
import {
  constants,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

export const maxSourceBytes = 1024 * 1024;
export const maxAnchors = 128;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(normalize(value));
}

export function prettyJson(value) {
  return `${JSON.stringify(normalize(value), null, 2)}\n`;
}

export function opaqueId(prefix, ...parts) {
  return `${prefix}-${sha256(parts.join("\0")).slice(0, 20)}`;
}

export function randomToken(bytes = 18) {
  return randomBytes(bytes).toString("hex");
}

export function decodeUtf8(content, label = "input") {
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

export function isSafeRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    path.posix.isAbsolute(value) ||
    path.posix.normalize(value) !== value
  ) {
    return false;
  }
  return !value.split("/").some((part) => part === "" || part === "." || part === "..");
}

export function assertSafeRelativePath(value, label = "path") {
  if (!isSafeRelativePath(value)) throw new Error(`${label} is not a safe relative path`);
}

export async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

export async function writeJsonAtomic(filename, value) {
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.tmp-${process.pid}-${randomToken(6)}`;
  try {
    await writeFile(temporary, prettyJson(value), { flag: "wx", mode: 0o600 });
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function writeJsonNew(filename, value) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, prettyJson(value), { flag: "wx", mode: 0o600 });
}

export async function readRegularFile(filename, options = {}) {
  const { maxBytes = maxSourceBytes, label = "input" } = options;
  const handle = await open(filename, constants.O_RDONLY | constants.O_NOFOLLOW);
  let stat;
  let content;
  try {
    stat = await handle.stat();
    if (!stat.isFile()) throw new Error(`${label} is not a regular file`);
    if (stat.size > maxBytes) throw new Error(`${label} exceeds ${maxBytes} bytes`);
    content = await handle.readFile();
    if (content.byteLength !== stat.size) throw new Error(`${label} changed while being read`);
    const finalHandleStat = await handle.stat();
    if (
      finalHandleStat.dev !== stat.dev ||
      finalHandleStat.ino !== stat.ino ||
      finalHandleStat.size !== stat.size ||
      finalHandleStat.mtimeMs !== stat.mtimeMs
    ) {
      throw new Error(`${label} changed while being read`);
    }
  } finally {
    await handle.close();
  }
  const pathStat = await lstat(filename);
  if (
    !pathStat.isFile() ||
    pathStat.isSymbolicLink() ||
    pathStat.dev !== stat.dev ||
    pathStat.ino !== stat.ino ||
    pathStat.size !== stat.size
  ) {
    throw new Error(`${label} path changed while being read`);
  }
  return content;
}

export async function assertNoSymlinks(root) {
  const rootStat = await lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error("root must be a real directory");
  }
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink()) throw new Error("symbolic links are not allowed");
      if (stat.isDirectory()) await visit(filename);
      else if (!stat.isFile()) throw new Error("only regular files and directories are allowed");
    }
  };
  await visit(root);
}

export async function listRegularFiles(root) {
  const files = [];
  const visit = async (directory, relativeDirectory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const relative = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
      const filename = path.join(directory, entry.name);
      const stat = await lstat(filename);
      if (stat.isSymbolicLink()) throw new Error("symbolic links are not allowed");
      if (stat.isDirectory()) await visit(filename, relative);
      else if (stat.isFile()) files.push(relative);
      else throw new Error("only regular files and directories are allowed");
    }
  };
  await visit(root, "");
  return files;
}

function locateUtf8Positions(text, positions) {
  const requested = [...new Set(positions)].sort((left, right) => left - right);
  const located = new Map();
  let requestedIndex = 0;
  let characterIndex = 0;
  let byteOffset = 0;
  let line = 1;

  const recordCurrentPosition = () => {
    while (requested[requestedIndex] === characterIndex) {
      located.set(characterIndex, { byteOffset, line });
      requestedIndex += 1;
    }
  };

  recordCurrentPosition();
  while (characterIndex < text.length && requestedIndex < requested.length) {
    const codePoint = text.codePointAt(characterIndex);
    const characterWidth = codePoint > 0xffff ? 2 : 1;
    const byteWidth =
      codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    characterIndex += characterWidth;
    byteOffset += byteWidth;
    if (codePoint === 0x0a) line += 1;
    if (requested[requestedIndex] < characterIndex) {
      throw new Error("gt-anchor boundary splits a Unicode character");
    }
    recordCurrentPosition();
  }
  if (requestedIndex !== requested.length) {
    throw new Error("gt-anchor boundary is outside the source");
  }
  return located;
}

export function extractAnchoredCandidates(sourceBytes, sourceDigest, revealId) {
  const text = decodeUtf8(sourceBytes, "source");
  const marker = /<!--\s*gt-anchor:\s*([a-z0-9][a-z0-9-]{0,63})\s*-->/g;
  const matches = [];
  for (const match of text.matchAll(marker)) {
    if (matches.length === maxAnchors) {
      throw new Error(`source contains more than ${maxAnchors} gt-anchor markers`);
    }
    matches.push(match);
  }
  if (matches.length === 0) throw new Error("source contains no gt-anchor markers");
  const seen = new Set();
  const passages = [];
  for (const [index, match] of matches.entries()) {
    const anchor = match[1];
    if (seen.has(anchor)) throw new Error("source contains duplicate gt-anchor markers");
    seen.add(anchor);
    const afterMarker = match.index + match[0].length;
    const nextMarker = matches[index + 1]?.index ?? text.length;
    const raw = text.slice(afterMarker, nextMarker);
    const leading = raw.match(/^(?:[ \t]*\r?\n)+/)?.[0].length ?? 0;
    const trailing = raw.match(/(?:\r?\n[ \t]*)+$/)?.[0].length ?? 0;
    const startCharacter = afterMarker + leading;
    const endCharacter = nextMarker - trailing;
    if (endCharacter <= startCharacter) throw new Error("gt-anchor has no following passage");
    passages.push({ anchor, startCharacter, endCharacter });
  }
  const locations = locateUtf8Positions(
    text,
    passages.flatMap(({ startCharacter, endCharacter }) => [startCharacter, endCharacter]),
  );
  return passages.map(({ anchor, startCharacter, endCharacter }) => {
    const spanText = text.slice(startCharacter, endCharacter);
    const { byteOffset: byteStart, line: lineStart } = locations.get(startCharacter);
    const { byteOffset: byteEnd, line: lineEnd } = locations.get(endCharacter);
    const spanBytes = sourceBytes.subarray(byteStart, byteEnd);
    const spanSha256 = sha256(spanBytes);
    const identity = {
      producer: "anchored-passage-v0",
      sourceDigest,
      anchor,
      spanSha256,
    };
    return {
      format: "graphtruth.experimental.runtime-candidate/0",
      candidateId: `candidate-${sha256(canonicalJson(identity))}`,
      role: "anchored-source-passage",
      status: "provisional",
      producer: { kind: "deterministic", id: "anchored-passage-v0" },
      inputs: [{ snapshotSha256: sourceDigest, revealId }],
      evidence: [
        {
          snapshotSha256: sourceDigest,
          anchor,
          byteStart,
          byteEnd,
          lineStart,
          lineEnd,
          spanSha256,
        },
      ],
      payload: { mediaType: "text/markdown", text: spanText },
    };
  });
}

export function tokenize(text) {
  return [...new Set(text.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}][\p{L}\p{N}._-]*/gu) ?? [])].sort();
}
