# M10 design pressure

The terminal run found a small defect with a large experimental consequence.
The source corpus was valid, but the interface treated order as identity while
constructing that order in two different ways.

## What survived

- The selection procedure produced a useful correction materially different
  from M9.
- Exact source and contract identities remained stable.
- The runtime created only its declared output root.
- The first canonical record was hash-chained.
- The inventory check failed before source-file bytes, snapshots, evidence, or
  later-horizon material entered the store.
- The no-retry rule preserved the failure as evidence instead of optimizing it
  away.

## What failed

The closed-inventory check compared arrays rather than canonicalized sets:

- directory traversal used `localeCompare`;
- manifest filtering used default JavaScript `.sort()`;
- mixed upper- and lower-case names therefore produced different orders.

The synthetic fixture used only lower-case names. Its happy path and
closed-inventory negative test could not expose this portability boundary.

## Consequences

- The exact `incremental-capture-v1-implementation-v1` identity is rejected for
  real use.
- None of the five M9-admitted capabilities transferred in the retained run.
- The selected public episode remains useful as a regression corpus, but this
  run cannot be retried or silently repaired.
- Ordering rules are part of deterministic capture behavior even when the
  storage shape remains Zone 3 and non-normative.

## Candidate successor

A new identity should remain narrow:

1. use one canonical path comparator, or compare normalized sets without
   coupling identity to traversal order;
2. add mixed-case and permuted-inventory synthetic fixtures;
3. prove that equivalent inventories are accepted and changed inventories are
   rejected;
4. keep the current terminal run byte-identical as a regression;
5. use a fresh public correction for the next confirmatory run;
6. treat this revealed corpus as research-only input, not a fresh confirmation;
7. retain the same four-layer comparison and eight-cell denominator unless a
   separately frozen goal justifies a change.

The next goal should first qualify the corrected interface synthetically, then
freeze a new candidate-selection identity. It must not resume this run.
