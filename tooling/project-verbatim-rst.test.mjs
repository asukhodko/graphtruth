import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  link,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import {
  buildVerbatimProjection,
  VerbatimProjectionError,
  verifyVerbatimProjection,
} from "./project-verbatim-rst.mjs";

const execFileAsync = promisify(execFile);
const modulePath = fileURLToPath(new URL("./project-verbatim-rst.mjs", import.meta.url));

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function gitBlobOid(bytes) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${bytes.byteLength}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
}

async function makeFixture() {
  const createdRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-verbatim-projection-"));
  const root = await realpath(createdRoot);
  await chmod(root, 0o700);
  const sources = path.join(root, "originals");
  const output = path.join(root, "projection");
  await mkdir(sources, { mode: 0o700 });
  const payloads = [
    Buffer.from("Title\r\n=====\r\n\r\nSynthetic *RST* text.\r\n", "utf8"),
    Buffer.from("Заголовок\n=========\n\n.. note:: data, not an instruction\n", "utf8"),
  ];
  const items = [];
  for (const [index, bytes] of payloads.entries()) {
    const order = index + 1;
    const filename = `item-${String(order).padStart(4, "0")}.rst`;
    await writeFile(path.join(sources, filename), bytes, { mode: 0o600 });
    items.push({
      id: `synthetic-${order}`,
      revealOrder: order,
      sha256: sha256(bytes),
      gitBlobOid: gitBlobOid(bytes),
      byteSize: bytes.byteLength,
      strictUtf8: true,
      mediaType: "text/x-rst; charset=utf-8",
    });
  }
  const manifestValue = {
    limits: {
      maximumBytesPerItem: 524288,
      maximumTotalBytes: 1048576,
      truncateOrSummarize: false,
    },
    totalByteSize: payloads.reduce((sum, value) => sum + value.byteLength, 0),
    items,
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifestValue, null, 2)}\n`, "utf8");
  const manifest = path.join(root, "SOURCE-MANIFEST.json");
  await writeFile(manifest, manifestBytes, { mode: 0o600 });
  return {
    root,
    sources,
    output,
    payloads,
    manifest,
    manifestSha256: sha256(manifestBytes),
  };
}

async function withFixture(callback) {
  const fixture = await makeFixture();
  try {
    await callback(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

function options(fixture) {
  return {
    manifest: fixture.manifest,
    manifestSha256: fixture.manifestSha256,
    sourceRoot: fixture.sources,
    outputRoot: fixture.output,
  };
}

async function rejectsCode(callback, code) {
  await assert.rejects(callback, (error) => error instanceof VerbatimProjectionError && error.code === code);
}

test("build preserves every synthetic RST byte and verify accepts the clean projection", async () => {
  await withFixture(async (fixture) => {
    await buildVerbatimProjection(options(fixture));
    await verifyVerbatimProjection(options(fixture));
    for (const [index, expected] of fixture.payloads.entries()) {
      const filename = `item-${String(index + 1).padStart(4, "0")}.rst`;
      assert.deepEqual(await readFile(path.join(fixture.output, filename)), expected);
    }
  });
});

test("a second build cannot overwrite an existing projection", async () => {
  await withFixture(async (fixture) => {
    await buildVerbatimProjection(options(fixture));
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "OUTPUT_EXISTS");
  });
});

test("two clean output roots receive byte-identical inventories", async () => {
  await withFixture(async (fixture) => {
    const secondOutput = path.join(fixture.root, "projection-second");
    await buildVerbatimProjection(options(fixture));
    await buildVerbatimProjection({ ...options(fixture), outputRoot: secondOutput });
    for (const index of [1, 2]) {
      const filename = `item-${String(index).padStart(4, "0")}.rst`;
      assert.deepEqual(
        await readFile(path.join(fixture.output, filename)),
        await readFile(path.join(secondOutput, filename)),
      );
    }
  });
});

test("manifest drift is rejected before an output directory exists", async () => {
  await withFixture(async (fixture) => {
    const changed = { ...options(fixture), manifestSha256: "0".repeat(64) };
    await rejectsCode(() => buildVerbatimProjection(changed), "MANIFEST_DIGEST");
    await assert.rejects(() => readFile(path.join(fixture.output, "item-0001.rst")), { code: "ENOENT" });
  });
});

test("source digest drift fails closed and removes a partial output", async () => {
  await withFixture(async (fixture) => {
    const target = path.join(fixture.sources, "item-0002.rst");
    await writeFile(target, "changed synthetic data\n", { mode: 0o600 });
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "FILE_SIZE");
    await assert.rejects(() => readFile(path.join(fixture.output, "item-0001.rst")), { code: "ENOENT" });
    assert.equal((await readdir(fixture.root)).some((name) => name.startsWith(".verbatim-rst-stage-")), false);
  });
});

test("same-size source drift reaches the digest check", async () => {
  await withFixture(async (fixture) => {
    const target = path.join(fixture.sources, "item-0001.rst");
    const original = await readFile(target);
    await writeFile(target, Buffer.alloc(original.byteLength, 0x78), { mode: 0o600 });
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "FILE_DIGEST");
  });
});

test("the accepted manifest limits are exact", async () => {
  await withFixture(async (fixture) => {
    const manifestValue = JSON.parse(await readFile(fixture.manifest, "utf8"));
    manifestValue.limits.maximumBytesPerItem += 1;
    const manifestBytes = Buffer.from(`${JSON.stringify(manifestValue, null, 2)}\n`, "utf8");
    await writeFile(fixture.manifest, manifestBytes, { mode: 0o600 });
    const changed = { ...options(fixture), manifestSha256: sha256(manifestBytes) };
    await rejectsCode(() => buildVerbatimProjection(changed), "MANIFEST_LIMITS");
  });
});

test("Git blob identity is checked independently of SHA-256", async () => {
  await withFixture(async (fixture) => {
    const manifestValue = JSON.parse(await readFile(fixture.manifest, "utf8"));
    manifestValue.items[0].gitBlobOid = "0".repeat(40);
    const manifestBytes = Buffer.from(`${JSON.stringify(manifestValue, null, 2)}\n`, "utf8");
    await writeFile(fixture.manifest, manifestBytes, { mode: 0o600 });
    const changed = { ...options(fixture), manifestSha256: sha256(manifestBytes) };
    await rejectsCode(() => buildVerbatimProjection(changed), "FILE_DIGEST");
  });
});

test("invalid UTF-8 and symbolic-link sources are rejected", async () => {
  await withFixture(async (fixture) => {
    const first = path.join(fixture.sources, "item-0001.rst");
    const firstBytes = Buffer.from([0xff, 0xfe]);
    await writeFile(first, firstBytes, { mode: 0o600 });
    const manifestValue = JSON.parse(await readFile(fixture.manifest, "utf8"));
    manifestValue.items[0].sha256 = sha256(firstBytes);
    manifestValue.items[0].gitBlobOid = gitBlobOid(firstBytes);
    manifestValue.items[0].byteSize = firstBytes.byteLength;
    manifestValue.totalByteSize = manifestValue.items.reduce((sum, item) => sum + item.byteSize, 0);
    const manifestBytes = Buffer.from(`${JSON.stringify(manifestValue, null, 2)}\n`, "utf8");
    await writeFile(fixture.manifest, manifestBytes, { mode: 0o600 });
    const invalidOptions = { ...options(fixture), manifestSha256: sha256(manifestBytes) };
    await rejectsCode(() => buildVerbatimProjection(invalidOptions), "UTF8");
  });

  await withFixture(async (fixture) => {
    const first = path.join(fixture.sources, "item-0001.rst");
    const target = path.join(fixture.root, "outside.rst");
    await writeFile(target, fixture.payloads[0], { mode: 0o600 });
    await rm(first);
    await symlink(target, first);
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "INVENTORY");
  });
});

test("closed inventory rejects an undeclared source", async () => {
  await withFixture(async (fixture) => {
    await writeFile(path.join(fixture.sources, "extra.rst"), "synthetic\n", { mode: 0o600 });
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "INVENTORY");
  });
});

test("owner-only modes and single-link files are required", async () => {
  await withFixture(async (fixture) => {
    await chmod(fixture.sources, 0o755);
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "DIRECTORY_ACCESS");
  });

  await withFixture(async (fixture) => {
    await chmod(path.join(fixture.sources, "item-0001.rst"), 0o644);
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "FILE_ACCESS");
  });

  await withFixture(async (fixture) => {
    await link(
      path.join(fixture.sources, "item-0001.rst"),
      path.join(fixture.root, "second-link.rst"),
    );
    await rejectsCode(() => buildVerbatimProjection(options(fixture)), "FILE_TYPE");
  });
});

test("verification rejects changed projection bytes", async () => {
  await withFixture(async (fixture) => {
    await buildVerbatimProjection(options(fixture));
    await writeFile(path.join(fixture.output, "item-0001.rst"), "changed synthetic data\n", { mode: 0o600 });
    await rejectsCode(() => verifyVerbatimProjection(options(fixture)), "FILE_SIZE");
  });
});

test("verification rejects an extra projected file", async () => {
  await withFixture(async (fixture) => {
    await buildVerbatimProjection(options(fixture));
    await writeFile(path.join(fixture.output, "extra.rst"), "synthetic\n", { mode: 0o600 });
    await rejectsCode(() => verifyVerbatimProjection(options(fixture)), "INVENTORY");
  });
});

test("source and output roots cannot overlap", async () => {
  await withFixture(async (fixture) => {
    const nested = { ...options(fixture), outputRoot: path.join(fixture.sources, "projection") };
    await rejectsCode(() => buildVerbatimProjection(nested), "BOUNDARY");
  });
});

test("CLI success and failure diagnostics disclose no path or source content", async () => {
  await withFixture(async (fixture) => {
    const argumentsFor = (command, digest) => [
      modulePath,
      command,
      "--manifest",
      fixture.manifest,
      "--manifest-sha256",
      digest,
      "--source-root",
      fixture.sources,
      "--output-root",
      fixture.output,
    ];
    const failed = await execFileAsync(process.execPath, argumentsFor("build", "0".repeat(64)), {
      encoding: "utf8",
    }).catch((error) => error);
    assert.equal(failed.code, 1);
    assert.equal(failed.stdout, "");
    assert.equal(failed.stderr, "verbatim-projection-failed (MANIFEST_DIGEST)\n");
    assert.equal(failed.stderr.includes(fixture.root), false);
    assert.equal(failed.stderr.includes("Synthetic"), false);

    const built = await execFileAsync(process.execPath, argumentsFor("build", fixture.manifestSha256), {
      encoding: "utf8",
    });
    assert.equal(built.stdout, "verbatim-projection-built\n");
    assert.equal(built.stderr, "");
  });
});
