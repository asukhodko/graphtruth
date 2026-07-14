import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";
import test from "node:test";

import {
  classifyPublicG1ReceiptPath,
  validatePublicG1ReceiptContent,
} from "./check.mjs";

async function attestedReceipt() {
  const template = JSON.parse(
    await readFile(
      new URL("../experiments/templates/PUBLIC-G1-RECEIPT.json", import.meta.url),
      "utf8",
    ),
  );
  template.status = "attested";
  template.attestedOn = "2026-07-14";
  for (const key of Object.keys(template.attestations)) template.attestations[key] = true;
  return template;
}

test("a binary canonical G1 receipt is classified for rejection", () => {
  assert.equal(
    classifyPublicG1ReceiptPath(
      "experiments/receipts/g1-evidence-contract-v1.json",
      false,
    ),
    "registered-non-text",
  );
});

test("a binary file at an extra receipt path is classified for rejection", () => {
  assert.equal(
    classifyPublicG1ReceiptPath("experiments/receipts/extra.bin", false),
    "unregistered",
  );
});

test("only the template and one attested receipt path are registered", () => {
  assert.equal(
    classifyPublicG1ReceiptPath("experiments/templates/PUBLIC-G1-RECEIPT.json", true),
    "template",
  );
  assert.equal(
    classifyPublicG1ReceiptPath(
      "experiments/receipts/g1-evidence-contract-v1.json",
      true,
    ),
    "attested",
  );
  assert.equal(classifyPublicG1ReceiptPath("experiments/other.json", true), null);
});

test("the exact attested public G1 receipt is accepted", async () => {
  assert.deepEqual(
    validatePublicG1ReceiptContent(`${JSON.stringify(await attestedReceipt(), null, 2)}\n`, false),
    [],
  );
});

test("attested public G1 receipts fail closed on unsafe mutations", async () => {
  const falseAttestation = await attestedReceipt();
  falseAttestation.attestations.ownerReviewCompleted = false;
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(falseAttestation), false),
    ["attestations"],
  );

  const changedClaim = await attestedReceipt();
  changedClaim.trustBasis = "self-attestation";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(changedClaim), false),
    ["fixed-claims"],
  );

  const extraKey = await attestedReceipt();
  extraKey.privateCorrelation = "forbidden";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(extraKey), false),
    ["fixed-claims"],
  );

  const invalidDate = await attestedReceipt();
  invalidDate.attestedOn = "2026-02-30";
  assert.deepEqual(
    validatePublicG1ReceiptContent(JSON.stringify(invalidDate), false),
    ["attested-state"],
  );

  const duplicateKey = `${JSON.stringify(await attestedReceipt()).replace(
    '"status":"attested"',
    '"status":"attested","status":"attested"',
  )}\n`;
  assert.deepEqual(validatePublicG1ReceiptContent(duplicateKey, false), ["strict-json"]);
});

test("private freeze shell fragments parse and cleanup preserves failure", async (context) => {
  if (process.platform !== "darwin") {
    context.skip("the private freeze procedure is intentionally macOS-only");
    return;
  }

  const guide = await readFile(
    new URL("../experiments/templates/EVIDENCE-CONTRACT.md", import.meta.url),
    "utf8",
  );
  const shellBlocks = [...guide.matchAll(/```sh\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  assert.notEqual(shellBlocks.length, 0);
  for (const shellBlock of shellBlocks) {
    const parsed = spawnSync("/bin/zsh", ["-n"], {
      encoding: "utf8",
      env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
      input: shellBlock,
    });
    assert.equal(parsed.status, 0, parsed.stderr);
    assert.equal(parsed.stderr, "");
  }

  const cleanup = guide.match(/^(cleanup_private_mount\(\) \{\n[\s\S]*?^\})$/m);
  assert.notEqual(cleanup, null);
  const exercised = spawnSync("/bin/zsh", ["-f"], {
    encoding: "utf8",
    env: { LC_ALL: "C", PATH: "/usr/bin:/bin:/usr/sbin:/sbin" },
    input: [
      "set -u",
      "typeset -g PUBLIC_RECEIPT_PENDING=''",
      "typeset -gi PUBLIC_RECEIPT_DIR_CREATED=0",
      "typeset -gi attach_started=0",
      "MOUNT=/tmp/graphtruth-private-freeze-cleanup-test-does-not-exist",
      cleanup[1],
      "return_seven() { return 7; }",
      "return_seven || cleanup_private_mount",
    ].join("\n"),
  });
  assert.equal(exercised.status, 7, exercised.stderr);
  assert.equal(exercised.stdout, "");
  assert.equal(exercised.stderr, "");
});
