# Python annotation-semantics corpus v1

> **Status:** frozen public corpus identity; exploratory procedure-development
> lane. It is not a confirmatory GraphTruth result and authorizes no processing
> or run.

This four-PEP corpus retains the synthetic order `3107 → 563 → 649 → 749`, with
PEP 484 as an external dark zone. The selection, source identities, and
byte-identical RST projection are fixed by:

- [corpus selection and rights](CORPUS-SELECTION.md);
- [source manifest](SOURCE-MANIFEST.json);
- [projection contract](PROJECTION-CONTRACT.md);
- [projection manifest](PROJECTION-MANIFEST.json) and [owner acceptance](PROJECTION-ACCEPTANCE.json).

The only evaluation-freeze v1 attempt ended in terminal audit rejection. Its
[terminal status](EVALUATION-FREEZE-TERMINAL.json) is immutable. A later
one-time deterministic diagnostic exposed two safe protocol codes, recorded in
[the diagnostic receipt](EVALUATION-FREEZE-DIAGNOSTIC.json): result classes were
not fully defined, and GraphTruth capture tax lacked an operational rule. The
v1 identity cannot be repaired, retried, resumed, or reused.

The separate public `evaluation-freeze v2` controller addresses those gaps and
has passed synthetic tests only. Its preparation grants no authority to read
the projection, create tasks or an oracle, contact a model, freeze a contract,
implement GraphTruth, run the baseline, rehearse, score, or execute an
experiment. The next decisions are to accept the exact v2 tooling identity and,
separately, decide whether to authorize one new freeze.

Any later result on this corpus remains exploratory because its diagnostic
context has been disclosed during procedure development. The first
confirmatory GraphTruth experiment must use a fresh corpus and identity. No
Python-specific disclosure from this lane may be copied into that corpus's
tasks or oracle.
