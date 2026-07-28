# MurmurMark echo-lab correction dogfood: owner disposition

Status: **shrunk**

The owner selected `shrink` on 2026-07-28 Europe/Moscow for the exact
`murmurmark-echo-lab-correction-v1` result.

## Bound evidence

- Result manifest SHA-256:
  `8e9d309f6295203d061e9f39bbf8f5d471505dfe35187aa664d56792c4592190`
- Result commit:
  `edcae4ccacfd73478de153d66682ca2da0bce12d`
- Owner decision:
  [Issue #45 comment 5102364604](https://github.com/asukhodko/graphtruth/issues/45#issuecomment-5102364604)
- Observed denominator: GraphTruth 3/3, files plus `rg` 2/3, total 5/6,
  with no dropped cells or severe errors.

The frozen `keep` rule required all six cells to pass and therefore could not
classify the observed case in which GraphTruth passed the cell missed by the
baseline. The owner did not change that rule or rescore the result.

## Admitted subset

This episode supports:

- byte-exact source snapshots and a closed source inventory;
- exact evidence spans;
- additive assertion revisions;
- distinct source and record horizons;
- an explicit open question.

The complete bundle and reports remain immutable evidence. `Shrink` changes
only the capability scope admitted from them.

## Outside the decision

This episode does not admit:

- the richer `Assessment` shape as reusable product machinery;
- the flawed 6/6 decision rule;
- the episode-specific adapter as a generic or default runtime;
- a normative schema or RFC;
- claims of blindness, representativeness, causality, production safety, or
  superiority over ordinary search.

A successor is not authorized here. The recommended next route is a separate
goal that freezes a small incremental capture interface for the admitted
subset and exercises it on a second fresh public correction before any
candidate-format extraction.
