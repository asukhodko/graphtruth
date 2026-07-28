# MurmurMark echo-lab correction run report

> **Status:** retained run complete; owner disposition pending.

The first real-public GraphTruth dogfood produced a valid canonical bundle and
rebuildable H1/H2 dossier. GraphTruth passed all three task cells. The
files-plus-`rg` baseline passed two: its fixed search output did not expose the
body of `materialize_looped_stimulus`, so it correctly left four H2 safeguards
unestablished.

The complete denominator is therefore 5/6, with no dropped cell and no severe
error.

## Practical answer

The selected H1 files bound intended output duration with `ffmpeg -t` and
validate exact frames, channel count, rate, finite samples, and peak. They do
not establish a timeout for the selected generation subprocess or exclusion
of concurrent preparation.

H2 moves loop materialization into a helper that computes the required frame
count, resamples when needed, tiles and truncates to exactly that count,
rejects clipping, and publishes by replacing the destination from a temporary
file. The launcher also adds a non-blocking same-root prepare lock and a
120-second timeout for `say`; checker source requires 120,000 frames for
2.5 seconds at 48 kHz.

Those facts support a qualified account of local safeguards. They do not prove
that the checker ran, that an incident occurred, its cause or impact,
production safety, power-loss behavior, cross-host exclusion, or complete
resource bounds. The runbook's roughly 7 minute 40 second stop applies to
capture, not preparation.

The generated
[`dossier.md`](projections/dossier.md)
contains the exact source spans and boundaries behind that answer.

## Retained identities

- implementation manifest SHA-256:
  `f97e9d747545c92ae024ad30d6863574feff95494897a819931a2765fea62baf`;
- implementation commit:
  `6d9721c36159f5a8f218f0c49343a03e73313b1c`;
- bundle manifest SHA-256:
  `c86a4e275e3f51c40589dbbf52b72671b26c606e72323565af55f1c7b072be82`;
- record head SHA-256:
  `08e3d61dfab97507cc8d01dd1bccf31c0347feaa4d68804f65ac0cf65e0d2258`;
- baseline transcript SHA-256:
  `008f23eab5effb8671feeff792f560b9ed3c51edc8239e221d10fbd2a5628e99`.

The bundle contains 27 records and 40 files and occupies 260,447 bytes. It
stays below every frozen record, file, and byte limit. It has no
`AcceptanceDecision`.

The final full repository check passed: 369 tests passed, four platform or
opt-in checks were skipped, and none failed. The exact source manifest,
bundle, projections, link graph, OpsKarta plan, and unchanged M8 tests were
included.

## Historical reconstruction and rebuild

H1 resolves `assertion.prepare-bounds` to
`revision.prepare-bounds.01`; H2 resolves it to the additive
`revision.prepare-bounds.02`. The H1 record-head SHA-256 remains
`7d52efa0e637490029196d58fc0e6d06f3a72769960435887213336754004674`
after H2 is present.

The initial three projections were deleted with exact file-level `unlink` and
the empty directory with `rmdir`. A clean projection from the verified bundle
reproduced all three hashes:

| Projection | SHA-256 |
| --- | --- |
| `dossier.md` | `891b47952803328f26d76f858562d83597409e1fb2d84d3e06865c73bf4e7842` |
| `semantic-digest.txt` | `b8216af1a134d06757fd6fbb7cfe2646c286ccc6c670b67ba219d71c95029159` |
| `views.json` | `c6d33f12149447cf58035c7e1dfc5799c9aca2a821dda48fcff3b989ddf3d45d` |

## Comparison

| Task | Files + `rg` | GraphTruth dossier |
| --- | --- | --- |
| Pre-fix bounds | pass | pass |
| Post-fix safeguards | fail | pass |
| Residual unknowns | pass | pass |

The baseline search itself took 54.630292 ms, excluding preparation and
answering. GraphTruth build, verification, initial projection, deletion, and
rebuild completed within eight wall-clock seconds; individual processes took
about 0.39 seconds in total. These numbers are descriptive: the same familiar
operator curated and interpreted both branches.

GraphTruth adds three maintained structures that the baseline report had to
recreate in prose:

1. an independently stable H1 view after H2 is appended;
2. a support graph from claims to exact hashed spans;
3. an open incident question tied to the declared eight-file closure.

## Cost

One-time adapter work took about 9 minutes 18 seconds from creation of
`core.mjs` to the implementation-freeze commit. A conservative upper bound for
recurring capture, review, and correction is 9 minutes 55 seconds. It combines
the entire `CAPTURE.json` lifecycle with final dossier review and therefore
also counts some interleaved adapter work.

This is well below the 60-minute keep ceiling. The main cost is not runtime;
it is hand-authoring and reviewing a 27-event capture declaration. A practical
successor needs an incremental capture interface before repeated personal use.

Five development and integration findings are retained in
[`RUN-RESULT.json`](RUN-RESULT.json): one marker diagnostic, one inventory-sort
bug, one pre-attempt directory bug, one omitted projection link, and one
Markdown-style mismatch in the immutable generated dossier. The last file was
excluded only from hand-editable style lint; exact bundle verification, link
checks, and rebuild tests still cover it. The single retained GraphTruth run
itself completed without retry.

## Decision gate

The evidence is favorable to the kept GraphTruth concepts, but literal
`keep` is unavailable under the frozen contract: `keep` requires all six cells
to pass, while the baseline is 2/3. This exposes a contract-design error—the
case where GraphTruth succeeds on a task that the baseline misses was not
classified.

No result is being silently reinterpreted. The owner must now choose:

- `shrink`: retain the predeclared useful subset—source snapshots, exact
  spans, revisions, horizons, and the open question—and treat the richer
  assessment machinery and this decision rule as research findings;
- `stop`: close this identity as a successful diagnostic but an invalid basis
  for product admission, then create a corrected successor contract;
- a new explicit identity that fixes the decision rule. That cannot convert
  this terminal denominator into a 6/6 result or retroactively authorize
  `keep`.

The repository remains at the pre-disposition gate until that decision.
