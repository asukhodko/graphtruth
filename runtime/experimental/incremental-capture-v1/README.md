# Incremental capture v1

This Zone 3 interface exists only for
`incremental-capture-second-public-correction-v1`. It tests the five
capabilities retained by the M9 `shrink`:

- exact source snapshots and a closed corpus;
- exact evidence spans;
- additive assertion revisions;
- separate source and record horizons;
- explicit open questions.

It is an experimental command interface, not a GraphTruth protocol, storage
format, schema, RFC, or default runtime. It deliberately has no assessment or
acceptance-decision record.

## Storage behavior

`init` creates a new output root and an immutable control record. Later
commands append canonical records to a hash-chained JSONL log; they never
replace an earlier record. Source horizons must arrive as H1 then H2. A closed
horizon cannot receive more sources, spans, assertions, or questions.

Evidence spans are resolved from inclusive line ranges to exact half-open byte
ranges and hashes in the retained snapshot. Assertion updates require the
current predecessor revision. Questions can only be opened; this interface has
no close operation.

H1 and H2 dossiers are disposable projections. The sole destructive operation
is `rebuild-exact`: it accepts only a generated projection below the store's
`projections` directory, removes those three known files, rebuilds them from
the verified canonical log and snapshots, and rejects any byte difference.

## Commands

Run `node runtime/experimental/incremental-capture-v1/cli.mjs` without
arguments for the exact command forms. The lifecycle is:

1. `init`;
2. `add-horizon`;
3. any number of `add-span`, `add-assertion`, and `add-question` calls;
4. `close-horizon`;
5. repeat steps 2–4 for H2, with `--final true`;
6. `verify`, `project`, and `rebuild-exact`.

All commands fail closed on unexpected identity, order, hash, path, reference,
revision, horizon, budget, or existing-output state. Inputs use Node.js
built-ins only. The limits for this identity are 64 records, 96 output files,
and 2 MiB.
