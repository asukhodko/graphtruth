# M10 result frozen

Result identity:
`incremental-capture-second-public-correction-v1-result-v1`.

- result manifest SHA-256:
  `a8038484cb6a488b61a6f7327b57afd2e7246f9e4e30fa5756c0921febbeeb7d`;
- terminal GraphTruth result SHA-256:
  `404e6bc929119838d5d9daab0387d81532186a6f339079079751365b13a1a75a`;
- scores SHA-256:
  `8f6f21034e3dd737d82d1a86e84ac5ad3fcbad06380e16d9adc1d5ea0f2509d3`;
- baseline:
  3/4;
- GraphTruth:
  0/4;
- denominator:
  8/8 retained, including four invalid GraphTruth cells;
- severe errors:
  none;
- retries, resume, repair, cell removal, or rescore:
  none.

The one GraphTruth run failed closed at H1 acquisition with
`SOURCE_INVENTORY_MISMATCH`. The source set was correct; default sort and
`localeCompare` produced different mixed-case path orders. The runtime read no
source-file bytes and wrote no snapshots, spans, assertions, questions, or
projection.

Frozen decision status:

- `keep` unavailable;
- `shrink` unavailable because prefix 1 failed;
- `stop` required because GraphTruth is worse than baseline and prefix 1
  failed.

The result is immutable and now waits for the owner's explicit `stop`.
