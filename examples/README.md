# Examples and Conformance Fixtures

This directory will contain small, reviewable corpora demonstrating valid and invalid protocol behavior, migrations, and complete workflows.

Examples should cover provenance, revisions, temporal context, uncertainty, contradiction, questions, and declared rebuild behavior—not only happy paths. Conformance fixtures must declare the relevant protocol version and expected result. Before a versioned specification exists, examples are illustrative rather than evidence of conformance.

Use synthetic or explicitly redistributable material only. Never copy private dogfood data or secrets here.

## Synthetic experiment preflight

The repository's first executable synthetic example is the
[experiment preflight pack](experiments/preflight/). It is a non-normative Zone
3 laboratory pack for rehearsing the corpus-replay experiment boundary before
real or private data is admitted. It deliberately tests experimental manifests,
digests, reveal-order declarations, withheld-material policy, task closure, and
rejected invalid packs. The later
[isolated runtime-boundary rehearsal](../runtime/rehearsal/observed.md) exercised
the declared process-failure, exact-redelivery, rebuild, and
controlled-deletion paths. The full synthetic dress rehearsal, deliberate
budget exhaustion, real private utility, operating-system or power-loss
durability remain untested. Issue #6 stopped before the changed private lane was
admitted; any future private successor requires a new identity and authority.
None of these shapes is a canonical example or conformance fixture yet.

The separate [G1 evidence-contract twin](experiments/evidence-contract-twin-v1/)
freezes four fictional sources and eight tasks across early answer, required
abstention, correction with counterevidence, and terminal closed-corpus
abstention. It was created without private episode access and binds no runtime,
rehearsal result, or usefulness claim. Run `./tooling/preflight --twin` to check
its sealed public inventory; the repository quality gate also checks its G1
shape.

The
[public-synthetic author-call qualification](experiments/author-call-qualification-v1/)
isolates one separately authorized Codex transport and lifecycle call from every corpus,
projection, terminal state, and evaluation contract. Its checked-in tooling
manifest is the complete unit of owner acceptance; repository tests use only
fake runners and never contact a model provider. Its separately authorized sole
live call reached a valid zero-tool JSONL trace but ended terminally at
`result-schema`; the linked safe result records one consumed call and no corpus,
freeze, or evaluated work.

Its first exploratory-learning reader stopped before a protected read when the
owner-visible locator was missing. The publication-safe [v2 boundary and
execution pack](experiments/author-call-qualification-v1/exploratory-learning-v2/)
then bound the declared metadata-only recovery to a fresh identity. One
separately authorized read produced the accepted terminal
[safe result](experiments/author-call-qualification-v1/exploratory-learning-v2/SAFE-RESULT.md):
the first localized failure was `payload-json-byte-mismatch`. The result is
exploratory procedure evidence only; it contains no locator, retained trace,
corpus material, evaluation contract, or GraphTruth utility claim. A later
metadata-only retention procedure removed the exact local raw streams and
bounded work root without changing the terminal result; the diagnostic root and
non-local copies remain outside that claim. Issue #24 then stopped procedurally
before implementation or an evaluated run.

The
[record-and-bundle golden journey](experiments/record-and-bundle-golden-journey-v1/)
is a separate public-synthetic Zone 3 experiment. It freezes a three-source
correction history before implementation, stores exact evidence and
append-only assertion, assessment, acceptance, and revocation records, and
exports a closed directory bundle. A Node.js reducer and a detached Python
standard-library reader must derive the same six logical views across three
horizons and two fixed policies. The checked-in projections are disposable;
the bundle contains neither expected answers nor reader-specific state. This
is portable semantic evidence for one exact journey, not a conformance fixture
or utility result.

The
[MurmurMark echo-lab correction dogfood](experiments/murmurmark-echo-lab-correction-v1/)
freezes eight MIT-licensed public source blobs across two adjacent commits. It
is the first real/public pressure test of the kept record-and-bundle mechanics.
GraphTruth passed 3/3 fixed tasks and the files-plus-`rg` branch passed 2/3;
all six cells remain visible. The owner chose `shrink`, retaining exact
snapshots, spans, revisions, horizons, and the open question while declining to
promote the adapter, richer assessment shape, decision rule, or format.

The
[incremental-capture second public correction](experiments/incremental-capture-second-public-correction-v1/)
freezes a different MIT-licensed correction, four tasks, eight comparison
cells, and a minimal append-only interface. Baseline completed 3/4 tasks. The
sole GraphTruth run failed closed before source capture because two comparators
ordered equal mixed-case inventories differently; GraphTruth completed 0/4.
The owner selected `stop`. The retained failure admits no capability or format
but supplies regression evidence for a separately identified successor.

If repeated experiments demonstrate stable portable semantics, a separately
reviewed minimal example may later be promoted into this directory under an
applicable specification version. Copying the laboratory files here does not
perform that promotion.
