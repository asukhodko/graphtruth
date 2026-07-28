# MurmurMark echo-lab correction dogfood v1

> **Status:** retained run complete; owner disposition pending.

This Zone 3 experiment pressures the kept synthetic record-and-bundle slice
with one real public correction. It asks:

> Can the public evidence establish that `echo-lab prepare` is bounded and
> safely repeatable, which safeguards the correction adds, and what remains
> unproved?

The episode consists of the exact selected files at two adjacent MurmurMark
commits:

- H1 — `e256363a2cf98c1ea1a2ef3eb30628039b46e246`, which introduced the
  controlled echo supervision lab;
- H2 — `9b7ef91363f698113042b20f3e540d21cf30bb6e`, whose subject is
  `fix: prevent runaway echo lab stimulus generation`.

The source is public and MIT-licensed. The episode is retrospective and
targeted, owner familiarity is high, and the current GraphTruth session has
already inspected the corrective diff. There is no separate retained incident
report. The experiment therefore makes no blind, representative, causal,
production-safety, generality, compatibility, protocol, or search-superiority
claim.

## Frozen inputs

- [`SOURCE-MANIFEST.json`](SOURCE-MANIFEST.json) closes the eight-file source
  inventory and distinguishes Git, availability, event, and GraphTruth record
  time.
- [`DOGFOOD-CONTRACT.json`](DOGFOOD-CONTRACT.json) freezes the questions,
  six-cell denominator, baseline, required answers and abstentions, budgets,
  severe errors, and decision thresholds.
- [`DOGFOOD-CONTRACT.sha256`](DOGFOOD-CONTRACT.sha256) anchors the exact
  contract bytes.
- [`UPSTREAM.md`](UPSTREAM.md) records the controlled vendoring and license.
- [Issue #45](https://github.com/asukhodko/graphtruth/issues/45) owns the
  experiment and external freeze anchor.

The contract must not change after its external anchor. A substantive change
creates a new identity.

Verify the closed source inventory, Git blob identities, hashes, denominator,
and contract binding from the repository root:

```sh
node examples/experiments/murmurmark-echo-lab-correction-v1/verify-inputs.mjs
```

## Retained result

- [`IMPLEMENTATION-MANIFEST.json`](IMPLEMENTATION-MANIFEST.json) freezes the
  exact Zone 3 adapter used by the retained run.
- [`baseline/REPORT.md`](baseline/REPORT.md) preserves the single
  files-plus-`rg` result.
- [`bundle/manifest.json`](bundle/manifest.json) anchors the 27-record,
  40-file canonical bundle.
- [`projections/dossier.md`](projections/dossier.md) is the generated H1/H2
  evidence dossier.
- [`RUN-REPORT.md`](RUN-REPORT.md) compares all six cells, reports cost, and
  explains the pending decision.
- [`DESIGN-PRESSURE.md`](DESIGN-PRESSURE.md) records what the episode
  supported, changed, or left premature.

The retained run passed all three GraphTruth cells and two of three baseline
cells, with no severe error. The frozen `keep` rule nevertheless requires all
six cells to pass. The experiment is therefore paused for an explicit owner
disposition; no `keep`, `shrink`, or `stop` has been recorded.
