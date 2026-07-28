# MurmurMark echo-lab correction dogfood v1

> **Status:** contract frozen before adaptation; no run result yet.

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

## Expected later artifacts

After adaptation, this directory may add only the contract-declared public
bundle, projections, baseline report, run report, and design-pressure table.
Until those artifacts exist, no GraphTruth utility result is available.
