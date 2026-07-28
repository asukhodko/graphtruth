# M10 incremental-capture run report

Experiment:
`incremental-capture-second-public-correction-v1`.

Issue:
[#48](https://github.com/asukhodko/graphtruth/issues/48).

## Frozen identities

- selection contract:
  `2033f9c3bb575472f9a8c63e9a73aae84f6195574caf48bf16d147609feffc22`;
- selection result:
  `b5c4d70279eccfaad7d45a9722d0f55f89a6d41aab95f090abbdf2f671340113`;
- source manifest:
  `fc374ebf427cb94f500781d1d5c6d4e066e1ae98ee1a09cfcdf7a1ab50f38ba9`;
- contract package:
  `f612a2f664a4e02f49b0e8d1be90868bf278f1606efdc419c34b2956f48fb1d3`;
- implementation:
  `75fd60a377044bc96a59af5534c828b21c26748d601114cc9246fb94594af004`;
- baseline runner:
  `50f15f7fb17fd5c889423ed1b751b43ef3333371aecbdccdba3107213d830e81`;
- baseline result:
  `85b9f159b7b011f42551eeca05a920a206bf35be4a5f1b2c86a9566902fa064b`.

The selected episode is the public MIT-licensed
`asukhodko/dify-markdown-chunker` transition from
`4540fff19eb6ebe6a4a632d8d2bfc90fa6cb4c63` to
`3257ee6763ea8b89c8e61d542d05b4f9ddc10b9f`.

## Outcome

The one baseline attempt completed. It succeeded on three of four tasks and
correctly abstained on the residual-limits task because the six fixed searches
did not expose enough of the import and closed-inventory boundary.

The one GraphTruth run failed closed during the first H1 source-addition
command:

```text
SOURCE_INVENTORY_MISMATCH
```

The implementation compared two equal file sets after sorting them with
different comparators:

- expected with JavaScript's default sort:
  `CHANGELOG.md`, `adapter.py`, `requirements.txt`;
- observed with `localeCompare`:
  `adapter.py`, `CHANGELOG.md`, `requirements.txt`.

The source identities and bytes were correct. The implementation treated an
ordering difference as an inventory difference. It stopped before reading
source-file bytes, writing snapshots, spans, assertions, questions, or a
projection. Only `CorpusOpened` was retained.

The run was not retried, resumed, repaired, or rescored.

## Frozen denominator

| Cell | Valid | Success | Result |
|---|---:|---:|---|
| baseline / pre-fix bounds | yes | yes | Complete H1-only answer |
| baseline / post-fix change | yes | yes | Exact correction separated from broad narrative |
| baseline / residual limits | yes | no | Correct but incomplete abstention |
| baseline / historical reconstruction | yes | yes | H1 and adverse evidence preserved |
| GraphTruth / pre-fix bounds | no | no | No H1 answer after terminal acquisition failure |
| GraphTruth / post-fix change | no | no | H2 never ingested |
| GraphTruth / residual limits | no | no | H2 never ingested |
| GraphTruth / historical reconstruction | no | no | No two-horizon history |

Branch result:

- baseline:
  3/4;
- GraphTruth:
  0/4.

No cell was dropped or rescored. The four missing GraphTruth outputs remain
invalid adverse cells in the eight-cell denominator.

## Capability result

The run did not establish any transfer prefix:

1. exact snapshots and spans:
   failed before the first snapshot;
2. additive revisions and separate horizons:
   not reached;
3. open question:
   not reached.

The initial control and hash-chain entry worked, and the inventory guard failed
closed. Those are useful implementation observations, but they do not satisfy
prefix 1.

## Cost and budgets

- active repository dates used by this goal:
  1/3;
- external model calls:
  0;
- baseline attempts:
  1/1;
- GraphTruth runs:
  1/1;
- baseline queries:
  6/12;
- baseline search time:
  63.654 ms;
- baseline answer time:
  57.223 s;
- baseline end-to-end H1-search start to final-answer completion:
  94.723 s;
- lower-bound contract-to-implementation-freeze wall time:
  775 s;
- GraphTruth canonical records:
  1/64;
- GraphTruth store files:
  2/96;
- GraphTruth store bytes:
  1,173/2,097,152;
- manual canonical edits:
  0;
- generated projections:
  0.

Recurring capture, review, and correction cost was not measurable because the
run stopped before H1 acquisition. The 360-second keep condition therefore
cannot pass. The 900-second runtime stop was not the cause.

## Decision

`keep` is unavailable: GraphTruth did not succeed on four tasks, reconstruct
H1, build a projection, or demonstrate the five capabilities.

`shrink` is unavailable: the first fixed prefix, exact snapshots plus exact
spans, failed.

`stop` is required by two frozen rules:

- GraphTruth is worse than baseline by successful-task count;
- shrink prefix 1 fails.

No severe error occurred. The false-positive inventory rejection happened
before source bytes or future-horizon evidence entered the store, and the
adverse result remains intact.

The result now waits for the owner's explicit `stop` decision. No
implementation repair or new experiment identity is authorized inside this
run.
