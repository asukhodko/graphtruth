# Incremental capture on a second public correction: owner disposition

Status: **stopped**

The owner selected `stop` on 2026-07-28 Europe/Moscow for the exact
`incremental-capture-second-public-correction-v1` result.

## Bound evidence

- Result manifest SHA-256:
  `a8038484cb6a488b61a6f7327b57afd2e7246f9e4e30fa5756c0921febbeeb7d`
- Terminal GraphTruth result SHA-256:
  `404e6bc929119838d5d9daab0387d81532186a6f339079079751365b13a1a75a`
- Scores SHA-256:
  `8f6f21034e3dd737d82d1a86e84ac5ad3fcbad06380e16d9adc1d5ea0f2509d3`
- Owner decision:
  [Issue #48 comment 5106255396](https://github.com/asukhodko/graphtruth/issues/48#issuecomment-5106255396)
- Observed denominator:
  GraphTruth 0/4, baseline 3/4, total 3/8, including four retained invalid
  adverse GraphTruth cells.

No cell was dropped or rescored. The run, result, implementation identity, and
terminal state remain immutable.

## Decision

`Keep` was unavailable because GraphTruth did not complete any task or
demonstrate the five intended capabilities. `Shrink` was unavailable because
the first fixed prefix, exact snapshots plus exact evidence spans, was not
reached. Both frozen `stop` triggers fired:

- GraphTruth was worse than baseline by successful-task count;
- shrink prefix 1 failed.

No severe error occurred. The inventory guard rejected equal file sets whose
mixed-case paths had been ordered with two different comparators. It stopped
before reading selected source-file bytes or writing snapshots, spans,
assertions, questions, or projections.

## What this stops

This decision stops only this M10 experiment identity. It admits no product
capability and does not authorize a retry, resume, repair, or reinterpretation
of the result.

The retained diagnostic learning is narrower:

- fail-closed acquisition protected the store;
- the synthetic qualification missed mixed-case and permuted inventories;
- default JavaScript sorting and `localeCompare` cannot jointly define one
  canonical inventory order.

The selected public corpus may serve only as research and regression input.
Confirmation requires a fresh public correction.

## Possible successor

A separately authorized goal may create a new implementation identity with one
canonical inventory comparator, mixed-case and permutation fixtures, regression
against this corpus, and one confirmation run on a fresh public correction.
This disposition does not authorize that work or promote any format into
`spec/`, `schemas/`, or `rfcs/`.
