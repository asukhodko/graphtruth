import assert from "node:assert/strict";
import test from "node:test";

import {
  assertSafeRelativePath,
  extractAnchoredCandidates,
  maxAnchors,
  sha256,
} from "./src/lib.mjs";

test("runtime rejects invalid UTF-8 and unsafe relative paths", () => {
  assert.throws(
    () => extractAnchoredCandidates(Buffer.from([0xff]), "digest", "reveal-invalid"),
    /not valid UTF-8/,
  );
  for (const unsafe of ["../oracle.json", "/absolute", "future\\oracle.json", "a/../../b"]) {
    assert.throws(() => assertSafeRelativePath(unsafe), /safe relative path/);
  }
});

test("gt-anchor locators preserve UTF-8 byte and CRLF line boundaries", () => {
  const source = Buffer.from(
    "﻿# 🐉\r\n" +
      "<!-- gt-anchor: alpha -->\r\n\r\n" +
      "Привет 🚀\r\nвторая\n" +
      "<!-- gt-anchor: beta -->\n" +
      "ASCII passage\n",
    "utf8",
  );
  const candidates = extractAnchoredCandidates(source, sha256(source), "reveal-test");

  assert.equal(candidates.length, 2);
  const expected = [
    { anchor: "alpha", text: "Привет 🚀\r\nвторая", lineStart: 4, lineEnd: 5 },
    { anchor: "beta", text: "ASCII passage", lineStart: 7, lineEnd: 7 },
  ];
  for (const [index, candidate] of candidates.entries()) {
    const passage = expected[index];
    const passageBytes = Buffer.from(passage.text, "utf8");
    const byteStart = source.indexOf(passageBytes);
    assert.notEqual(byteStart, -1);
    assert.equal(candidate.payload.text, passage.text);
    assert.deepEqual(candidate.evidence[0], {
      snapshotSha256: sha256(source),
      anchor: passage.anchor,
      byteStart,
      byteEnd: byteStart + passageBytes.byteLength,
      lineStart: passage.lineStart,
      lineEnd: passage.lineEnd,
      spanSha256: sha256(passageBytes),
    });
  }
});

test("gt-anchor accepts exactly the configured maximum", () => {
  const source = Buffer.from(
    Array.from(
      { length: maxAnchors },
      (_, index) => `<!-- gt-anchor: anchor-${index} -->\npassage-${index}\n`,
    ).join(""),
  );

  const candidates = extractAnchoredCandidates(source, sha256(source), "reveal-limit");
  assert.equal(candidates.length, maxAnchors);
  assert.equal(candidates.at(-1).payload.text, `passage-${maxAnchors - 1}`);
});

test("gt-anchor rejects the first marker above the configured maximum", () => {
  const source = Buffer.from(
    Array.from(
      { length: maxAnchors + 1 },
      (_, index) => `<!-- gt-anchor: anchor-${index} -->\npassage-${index}\n`,
    ).join(""),
  );

  assert.throws(
    () => extractAnchoredCandidates(source, sha256(source), "reveal-over-limit"),
    new RegExp(`more than ${maxAnchors} gt-anchor markers`),
  );
});
