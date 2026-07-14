import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import {
  accessPolicy,
  assertAllowedDarwinMetadataEntry,
  assertPackEntryOwner,
  assertDarwinXattrState,
  createPackLock,
  lockFormat,
  platformMetadataPolicy,
  rolesFilename,
  rolesFormat,
  samePackEntryStat,
  verifyPackLock,
} from "./private-pack-lock.mjs";

const execFileAsync = promisify(execFile);
const toolingDirectory = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(toolingDirectory, "private-pack-lock");

function rolesDocument(artifacts) {
  return `${JSON.stringify({ format: rolesFormat, artifacts }, null, 2)}\n`;
}

async function makePack() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "graphtruth-private-lock-"));
  const pack = path.join(temporaryRoot, "PACK");
  await mkdir(path.join(pack, "sources"), { recursive: true, mode: 0o700 });
  await writeFile(path.join(pack, "contract.md"), "final-for-seal\n", { mode: 0o600 });
  await writeFile(path.join(pack, "sources", "0001.md"), "immutable source\n", { mode: 0o600 });
  await writeFile(
    path.join(pack, rolesFilename),
    rolesDocument([
      { path: rolesFilename, role: "artifact-role-map" },
      { path: "contract.md", role: "g1-contract" },
      { path: "sources/0001.md", role: "source-snapshot" },
    ]),
    { mode: 0o600 },
  );
  if (process.platform === "darwin") {
    await execFileAsync("/usr/bin/xattr", ["-crs", pack], {
      env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
    });
  }
  return {
    temporaryRoot,
    pack,
    lock: path.join(pack, "pack-lock.json"),
  };
}

async function withPack(action) {
  const fixture = await makePack();
  try {
    return await action(fixture);
  } finally {
    await rm(fixture.temporaryRoot, { recursive: true, force: true });
  }
}

async function expectCode(action, code) {
  await assert.rejects(action, (error) => {
    assert.equal(error.code, code);
    assert.doesNotMatch(String(error), /graphtruth-private-lock|sources|contract\.md/);
    return true;
  });
}

test("create writes one deterministic self-excluding lock and verify is read-only", async () => {
  await withPack(async ({ pack, lock }) => {
    assert.deepEqual(await createPackLock(pack, lock, "contract-001"), { ok: true });
    const before = {
      lock: await readFile(lock),
      lockStat: await stat(lock),
      source: await readFile(path.join(pack, "sources", "0001.md")),
      sourceStat: await stat(path.join(pack, "sources", "0001.md")),
    };
    assert.deepEqual(await verifyPackLock(pack, lock, "contract-001"), {
      ok: true,
      contractId: "contract-001",
    });
    const after = {
      lock: await readFile(lock),
      lockStat: await stat(lock),
      source: await readFile(path.join(pack, "sources", "0001.md")),
      sourceStat: await stat(path.join(pack, "sources", "0001.md")),
    };
    assert.deepEqual(after.lock, before.lock);
    assert.deepEqual(after.source, before.source);
    assert.equal(after.lockStat.mtimeMs, before.lockStat.mtimeMs);
    assert.equal(after.sourceStat.mtimeMs, before.sourceStat.mtimeMs);

    const parsed = JSON.parse(before.lock);
    assert.equal(parsed.format, lockFormat);
    assert.equal(parsed.contractId, "contract-001");
    assert.equal(parsed.rolesPath, rolesFilename);
    assert.equal(parsed.digestAlgorithm, "sha256");
    assert.equal(parsed.accessPolicy, accessPolicy);
    assert.equal(parsed.platformMetadataPolicy, platformMetadataPolicy);
    assert.deepEqual(
      parsed.artifacts.map(({ path: relative }) => relative),
      [rolesFilename, "contract.md", "sources/0001.md"],
    );
    assert.equal(parsed.artifacts.some(({ path: relative }) => relative === "pack-lock.json"), false);
  });
});

test("identical packs produce byte-identical locks", async () => {
  const left = await makePack();
  const right = await makePack();
  try {
    await createPackLock(left.pack, left.lock, "contract-deterministic");
    await createPackLock(right.pack, right.lock, "contract-deterministic");
    assert.deepEqual(await readFile(left.lock), await readFile(right.lock));
  } finally {
    await rm(left.temporaryRoot, { recursive: true, force: true });
    await rm(right.temporaryRoot, { recursive: true, force: true });
  }
});

test("the CLI accepts path arguments and emits only generic success", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("the private command is intentionally supported only on macOS");
    return;
  }
  await withPack(async ({ pack, lock }) => {
    const created = await execFileAsync(
      cli,
      [process.execPath, "create", pack, lock, "contract-cli"],
    );
    assert.equal(created.stdout, "private-pack-lock: created\n");
    assert.equal(created.stderr, "");
    const verified = await execFileAsync(
      cli,
      [process.execPath, "verify", pack, lock, "contract-cli"],
    );
    assert.equal(verified.stdout, "private-pack-lock: verified\n");
    assert.equal(verified.stderr, "");
  });
});

test("create rejects an existing lock without replacing it", async () => {
  await withPack(async ({ pack, lock }) => {
    await writeFile(lock, "existing private bytes\n");
    const before = await readFile(lock);
    await expectCode(() => createPackLock(pack, lock, "contract-002"), "LOCK_EXISTS");
    assert.deepEqual(await readFile(lock), before);
  });
});

test("the lock must be a direct child of PACK", async () => {
  await withPack(async ({ temporaryRoot, pack }) => {
    await expectCode(
      () => createPackLock(pack, path.join(temporaryRoot, "outside-lock.json"), "contract-003"),
      "LOCK_BOUNDARY",
    );
    await mkdir(path.join(pack, "nested"));
    await expectCode(
      () => createPackLock(pack, path.join(pack, "nested", "lock.json"), "contract-003"),
      "LOCK_BOUNDARY",
    );
  });
});

test("every entry must have the PACK owner and rejection stays generic", () => {
  assert.doesNotThrow(() => assertPackEntryOwner(501n, 501n));
  assert.throws(
    () => assertPackEntryOwner(502n, 501n),
    (error) => {
      assert.equal(error.code, "PACK_ENTRY_OWNER");
      assert.equal(String(error).includes("501"), false);
      assert.equal(String(error).includes("502"), false);
      return true;
    },
  );
});

test("group or other access fails closed", async () => {
  await withPack(async ({ pack, lock }) => {
    await execFileAsync("/bin/chmod", ["0644", path.join(pack, "contract.md")]);
    await expectCode(() => createPackLock(pack, lock, "contract-access"), "PACK_ENTRY_ACCESS");
  });
});

test("Darwin ACLs fail closed", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("macOS ACL semantics are required for this check");
    return;
  }
  await withPack(async ({ pack, lock }) => {
    await execFileAsync(
      "/bin/chmod",
      ["+a", "everyone deny read", path.join(pack, "contract.md")],
    );
    await expectCode(() => createPackLock(pack, lock, "contract-acl"), "PACK_ENTRY_ACCESS");
  });
  await withPack(async ({ pack, lock }) => {
    await execFileAsync(
      "/bin/chmod",
      ["+a", "everyone deny readextattr", path.join(pack, "contract.md")],
    );
    await expectCode(
      () => createPackLock(pack, lock, "contract-acl-before-xattr"),
      "PACK_ENTRY_ACCESS",
    );
  });
});

test("the Darwin xattr policy allows only absent or one 11-byte provenance value", () => {
  assert.doesNotThrow(() => assertDarwinXattrState([], null));
  assert.doesNotThrow(() =>
    assertDarwinXattrState(["com.apple.provenance"], "00".repeat(11)),
  );
  for (const [names, value] of [
    [["com.example.other"], null],
    [["com.apple.ResourceFork"], "00".repeat(11)],
    [["com.apple.provenance", "com.apple.provenance"], "00".repeat(11)],
    [["com.apple.provenance"], "00".repeat(10)],
    [["com.apple.provenance"], "not-hexadecimal-metadata"],
  ]) {
    assert.throws(
      () => assertDarwinXattrState(names, value),
      (error) => error.code === "PACK_EXTENDED_ATTRIBUTES",
    );
  }
});

test("an xattr mutation changes the monitored file fingerprint", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("macOS xattr semantics are required for this fingerprint check");
    return;
  }
  await withPack(async ({ pack }) => {
    const target = path.join(pack, "contract.md");
    const before = await lstat(target, { bigint: true });
    await execFileAsync(
      "/usr/bin/xattr",
      ["-w", "com.graphtruth.private-test", "opaque", target],
      { env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" } },
    );
    const after = await lstat(target, { bigint: true });
    assert.equal(samePackEntryStat(before, after), false);
  });
});

test("a replaced parent directory has a different monitored fingerprint", async () => {
  await withPack(async ({ pack }) => {
    const parent = path.join(pack, "sources");
    const before = await lstat(parent, { bigint: true });
    await rename(parent, path.join(pack, "sources-before-replacement"));
    await mkdir(parent);
    const after = await lstat(parent, { bigint: true });
    assert.equal(samePackEntryStat(before, after), false);
  });
});

test("roles JSON is strict and must close the regular-file inventory", async () => {
  await withPack(async ({ pack, lock }) => {
    await writeFile(
      path.join(pack, rolesFilename),
      '{"format":"graphtruth.private-g1-artifact-roles/1","format":"duplicate","artifacts":[]}\n',
    );
    await expectCode(() => createPackLock(pack, lock, "contract-004"), "ROLES_JSON");
  });
  await withPack(async ({ pack, lock }) => {
    await writeFile(path.join(pack, "undeclared.md"), "private stray bytes\n", {
      mode: 0o600,
    });
    await expectCode(() => createPackLock(pack, lock, "contract-004"), "ROLES_INVENTORY");
  });
  await withPack(async ({ pack, lock }) => {
    const roles = JSON.parse(await readFile(path.join(pack, rolesFilename), "utf8"));
    roles.artifacts.push({ path: "missing.md", role: "missing-artifact" });
    await writeFile(path.join(pack, rolesFilename), `${JSON.stringify(roles, null, 2)}\n`);
    await expectCode(() => createPackLock(pack, lock, "contract-004"), "ROLES_INVENTORY");
  });
});

test("roles must include their own file and must not include the lock", async () => {
  await withPack(async ({ pack, lock }) => {
    const roles = JSON.parse(await readFile(path.join(pack, rolesFilename), "utf8"));
    roles.artifacts = roles.artifacts.filter(({ path: relative }) => relative !== rolesFilename);
    await writeFile(path.join(pack, rolesFilename), `${JSON.stringify(roles, null, 2)}\n`);
    await expectCode(() => createPackLock(pack, lock, "contract-005"), "ROLES_FORMAT");
  });
  await withPack(async ({ pack, lock }) => {
    const roles = JSON.parse(await readFile(path.join(pack, rolesFilename), "utf8"));
    roles.artifacts.push({ path: "pack-lock.json", role: "pack-lock" });
    await writeFile(path.join(pack, rolesFilename), `${JSON.stringify(roles, null, 2)}\n`);
    await expectCode(() => createPackLock(pack, lock, "contract-005"), "ROLES_INVENTORY");
  });
});

test("verify rejects changed content, extra files, and changed roles", async () => {
  await withPack(async ({ pack, lock }) => {
    await createPackLock(pack, lock, "contract-006");
    await writeFile(path.join(pack, "sources", "0001.md"), "changed private source\n");
    await expectCode(() => verifyPackLock(pack, lock), "LOCK_CONTENT");
  });
  await withPack(async ({ pack, lock }) => {
    await createPackLock(pack, lock, "contract-006");
    await writeFile(path.join(pack, "extra.md"), "private extra bytes\n", {
      mode: 0o600,
    });
    await expectCode(() => verifyPackLock(pack, lock), "ROLES_INVENTORY");
  });
  await withPack(async ({ pack, lock }) => {
    await createPackLock(pack, lock, "contract-006");
    const roles = JSON.parse(await readFile(path.join(pack, rolesFilename), "utf8"));
    roles.artifacts.find(({ path: relative }) => relative === "contract.md").role = "other-role";
    await writeFile(path.join(pack, rolesFilename), `${JSON.stringify(roles, null, 2)}\n`);
    await expectCode(() => verifyPackLock(pack, lock), "LOCK_INVENTORY");
  });
});

test("verify rejects duplicate-key and non-canonical lock JSON", async () => {
  await withPack(async ({ pack, lock }) => {
    await createPackLock(pack, lock, "contract-007");
    const content = await readFile(lock, "utf8");
    await writeFile(lock, content.replace(
      '  "format": "graphtruth.private-g1-pack-lock/1",',
      '  "format": "graphtruth.private-g1-pack-lock/1",\n  "format": "duplicate",',
    ));
    await expectCode(() => verifyPackLock(pack, lock), "LOCK_JSON");
  });
  await withPack(async ({ pack, lock }) => {
    await createPackLock(pack, lock, "contract-007");
    const parsed = JSON.parse(await readFile(lock, "utf8"));
    await writeFile(lock, JSON.stringify(parsed));
    await expectCode(() => verifyPackLock(pack, lock), "LOCK_CANONICAL");
  });
});

test("symlinks, hard links, and special files fail closed", async () => {
  await withPack(async ({ temporaryRoot, pack, lock }) => {
    await symlink(path.join(temporaryRoot, "outside"), path.join(pack, "escape"));
    await expectCode(() => createPackLock(pack, lock, "contract-008"), "PACK_ENTRY_TYPE");
  });
  await withPack(async ({ temporaryRoot, pack, lock }) => {
    const outsideParent = path.join(temporaryRoot, "outside-sources");
    await mkdir(outsideParent);
    await writeFile(path.join(outsideParent, "0001.md"), "outside private bytes\n");
    await rm(path.join(pack, "sources"), { recursive: true });
    await symlink(outsideParent, path.join(pack, "sources"));
    await expectCode(() => createPackLock(pack, lock, "contract-008"), "PACK_ENTRY_TYPE");
  });
  await withPack(async ({ pack, lock }) => {
    await link(path.join(pack, "contract.md"), path.join(pack, "contract-copy.md"));
    await expectCode(() => createPackLock(pack, lock, "contract-008"), "PACK_ENTRY_LINK");
  });
  await withPack(async ({ pack, lock }) => {
    const fifo = path.join(pack, "special.pipe");
    await execFileAsync("mkfifo", [fifo]);
    await expectCode(() => createPackLock(pack, lock, "contract-008"), "PACK_ENTRY_TYPE");
  });
});

test("neutral paths and contract identities are mandatory", async () => {
  await withPack(async ({ pack, lock }) => {
    const privateLookingName = "PRIVATE CUSTOMER NAME.md";
    await writeFile(path.join(pack, privateLookingName), "sensitive bytes\n");
    await assert.rejects(
      () => createPackLock(pack, lock, "contract-009"),
      (error) => {
        assert.equal(error.code, "PACK_PATH");
        assert.equal(String(error).includes(privateLookingName), false);
        assert.equal(String(error).includes("sensitive bytes"), false);
        return true;
      },
    );
  });
  await withPack(async ({ pack, lock }) => {
    await expectCode(() => createPackLock(pack, lock, "private contract"), "CONTRACT_ID");
  });
});

test("CLI rejection diagnostics disclose no paths, content, or digests", async () => {
  await withPack(async ({ pack, lock }) => {
    const privateLookingName = "PRIVATE-CUSTOMER-NAME.md";
    await writeFile(path.join(pack, privateLookingName), "private customer phrase\n");
    await assert.rejects(
      () => execFileAsync(
        cli,
        [process.execPath, "create", pack, lock, "contract-cli-reject"],
      ),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /^private-pack-lock: rejected \([A-Z_]+\)\n$/);
        assert.equal(error.stderr.includes(privateLookingName), false);
        assert.equal(error.stderr.includes(pack), false);
        assert.equal(error.stderr.includes("private customer phrase"), false);
        assert.equal(error.stdout, "");
        return true;
      },
    );
  });
});

test("the wrapper clears shell and Node preload variables", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("the private wrapper is intentionally supported only on macOS");
    return;
  }
  await withPack(async ({ temporaryRoot, pack, lock }) => {
    const bashEnvironment = path.join(temporaryRoot, "unexpected-shell-code");
    await writeFile(bashEnvironment, "exit 97\n", { mode: 0o600 });
    const result = await execFileAsync(
      cli,
      [process.execPath, "create", pack, lock, "contract-clean-env"],
      {
        env: {
          BASH_ENV: bashEnvironment,
          ENV: bashEnvironment,
          SHELLOPTS: "braceexpand:hashall:interactive-comments:xtrace",
          NODE_OPTIONS: "--require=/definitely-not-present/private-preload.cjs",
          PATH: "/definitely-not-present",
        },
      },
    );
    assert.equal(result.stdout, "private-pack-lock: created\n");
    assert.equal(result.stderr, "");
  });
});

test("Darwin extended attributes and resource forks fail closed", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("macOS xattr semantics are required for the private seal");
    return;
  }
  await withPack(async ({ pack, lock }) => {
    await execFileAsync(
      "/usr/bin/xattr",
      ["-w", "com.graphtruth.private-test", "opaque", path.join(pack, "contract.md")],
      { env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" } },
    );
    await expectCode(
      () => createPackLock(pack, lock, "contract-xattr"),
      "PACK_EXTENDED_ATTRIBUTES",
    );
  });
  await withPack(async ({ pack, lock }) => {
    await execFileAsync(
      "/usr/bin/xattr",
      ["-w", "com.apple.ResourceFork", "opaque", path.join(pack, "contract.md")],
      { env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" } },
    );
    await expectCode(
      () => createPackLock(pack, lock, "contract-resource-fork"),
      "PACK_EXTENDED_ATTRIBUTES",
    );
  });
});

test("Darwin metadata readers do not follow a final symlink", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("macOS xattr semantics are required for this check");
    return;
  }
  await withPack(async ({ temporaryRoot, pack }) => {
    const outside = path.join(temporaryRoot, "outside-neutral.md");
    const linkPath = path.join(pack, "outside-link");
    await writeFile(outside, "outside synthetic bytes\n", { mode: 0o600 });
    await execFileAsync(
      "/usr/bin/xattr",
      ["-w", "com.graphtruth.outside-test", "opaque", outside],
      { env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" } },
    );
    await execFileAsync(
      "/bin/chmod",
      ["+a", "everyone allow read", outside],
    );
    await symlink(outside, linkPath);
    await assert.doesNotReject(() => assertAllowedDarwinMetadataEntry(linkPath));
    const listed = await execFileAsync("/usr/bin/xattr", [outside], {
      encoding: "utf8",
      env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
    });
    assert.match(listed.stdout, /^com\.graphtruth\.outside-test$/m);
  });
});

test("the wrapper and module do not request network capability", async () => {
  const source = await readFile(path.join(toolingDirectory, "private-pack-lock.mjs"), "utf8");
  assert.doesNotMatch(source, /node:(?:http|https|http2|net|tls|dns|dgram)|\bfetch\s*\(/);
  const wrapperStat = await lstat(cli);
  assert.equal(wrapperStat.isFile(), true);
  assert.notEqual(wrapperStat.mode & 0o111, 0);
  assert.match(
    await readFile(cli, "utf8"),
    /^#!\/usr\/bin\/env -S -i LC_ALL=C PATH=\/usr\/bin:\/bin:\/usr\/sbin:\/sbin \/bin\/sh\n/,
  );
});
