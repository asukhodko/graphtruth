# Record-and-bundle golden journey v1

This public-synthetic Zone 3 experiment tests one narrow GraphTruth question:
can a small append-only record set preserve evidence, challenge, acceptance,
revocation, and correction well enough to be rebuilt from a portable directory
bundle?

It is not a protocol, normative schema, compatibility promise, personal
runtime, or product-utility result.

## Frozen identity

- Identity: `record-and-bundle-golden-journey-v1`
- Owning issue: [#42](https://github.com/asukhodko/graphtruth/issues/42)
- Base commit: `eec5e6a6342c33b8ddb1bca790fbe822f6557524`
- [Journey contract](JOURNEY-CONTRACT.json) SHA-256:
  `5365c408abf4a21d6be0523b7e1bd7dea39382241e316384c8b06c042603bf96`
- [Bundle manifest](bundle/manifest.json) SHA-256:
  `fd51f34038fac5ae40888d10007f7a27789e047515295a98e2bc661e5d49f243`
- Semantic digest:
  `7d849996a20e243e2df930d594eb86ec64a71551819dc8de96c81b43459d01b7`

The contract and three exact source files were committed and their contract
hash was anchored in Issue #42 before implementation began. Changing the
scenario, expected views, policy rules, mutations, or decision thresholds
requires a new identity.

## Journey

| Horizon | New record | `document-authority-v0` | `observed-state-v0` |
| --- | --- | --- | --- |
| H1 | Runbook v1 says `retry-limit = 3`; the document decision owner accepts it | `3` | abstain |
| H2 | An observation says `5`; an Assessment challenges the document claim | `3`, with challenge | `5` |
| H3 | Runbook v2 corrects the value to `5`; the old acceptance is revoked and the new revision accepted | `5` | `5` |

The H3 document correction has the H1 valid-time but the H3 recorded-time.
Reconstructing H1 or H2 after H3 must therefore retain the earlier answers.
An Assessment annotates a selected assertion; it never accepts or revokes one.

## Files

- [`JOURNEY-CONTRACT.json`](JOURNEY-CONTRACT.json) freezes sources, actors,
  events, policies, six logical views, the 18-cell denominator, 16 mutation
  classes, budgets, severe failures, and decision rules.
- [`sources/`](sources/) contains the three exact Markdown inputs.
- [`bundle/`](bundle/) contains only the canonical profile, source bytes,
  records, and closed manifest.
- [`detached_reader.py`](detached_reader.py) is a Python standard-library
  reader. It imports no GraphTruth or Node.js code.
- [`projections/`](projections/) contains disposable JSON and Markdown views.
- [`RUN-REPORT.md`](RUN-REPORT.md) records expected, observed, and learned
  evidence after the exact reference run.

Expected answers, the contract, and derived projections are deliberately absent
from the bundle. A detached reader receives only its own code, the bundle, and
the externally anchored manifest hash.

## Verify

From the repository root:

```sh
node runtime/experimental/record-bundle-v1/cli.mjs verify \
  --bundle-root examples/experiments/record-and-bundle-golden-journey-v1/bundle \
  --manifest-sha256 fd51f34038fac5ae40888d10007f7a27789e047515295a98e2bc661e5d49f243
```

Run the independent implementation:

```sh
python3 examples/experiments/record-and-bundle-golden-journey-v1/detached_reader.py \
  --bundle-root examples/experiments/record-and-bundle-golden-journey-v1/bundle \
  --manifest-sha256 fd51f34038fac5ae40888d10007f7a27789e047515295a98e2bc661e5d49f243
```

Both commands emit the same canonical semantic JSON. Run the complete
denominator, mutation matrix, rebuild, and hardcoding guard with:

```sh
node --test runtime/experimental/record-bundle-v1/core.test.mjs
```

## Authority boundary

The profile, exact sources, and chained records are canonical within this
experimental identity. `views.json`, `dossier.md`, and
`semantic-digest.txt` are rebuildable projections. Deleting them does not
remove knowledge needed by either reader.

The reader independence demonstrated here is structural: the Python reader
uses only the standard library and no implementation code from the Node.js
path. The same project session authored both implementations, so this is not a
blind or independent-human review.
