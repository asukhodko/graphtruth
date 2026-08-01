# Default Runtime

This directory contains the replaceable GraphTruth runtime experiments and is
the future home of the first personal dogfood system. Its name describes its
operational role; it does not grant the runtime normative or uniquely correct
status.

Its purpose is to test and demonstrate complete workflows: ingestion, canonical
file storage, derived indexing, contextual retrieval, correction, recovery, and
migration. The canonical corpus remains the source of record. Every projection
this runtime claims to support must be rebuildable from retained canonical
records and declared retained artifacts.

Valuable derived outputs may be retained as canonical analysis records with
their provenance, method, version, assumptions, uncertainty, and status. This
supports audit and reuse but does not promise byte-identical regeneration from
an unavailable or nondeterministic model. The default runtime selects and
configures local policies; the protocol defines only the interoperable policy
envelope and application semantics.

Default runtime behavior is not automatically protocol behavior.
Interoperability requirements belong in `spec/`, schemas, and conformance
fixtures.

## Selected owner-facing precursor

The product and command boundary for
[`owner-facing-workbench-v1`](experimental/owner-facing-workbench-v1/) is
frozen under [Issue #52](https://github.com/asukhodko/graphtruth/issues/52).
It is the selected next Zone 3 route: a small local CLI for explicit named-file
capture, exact spans, additive corrections, sequential horizons, open
questions, verification, dossiers, and exact projection rebuild. It embeds one
locale-independent path comparator and the M10 ordering regression.

The exact contract now has one frozen implementation candidate,
`owner-facing-workbench-v1-rc1-sha256-994797211ae516ea2bd7d965991fabe48bbb26f25922fcbbfaaa52e368d44b5a`.
Its [status](experimental/owner-facing-workbench-v1/STATUS.md), private
[format](experimental/owner-facing-workbench-v1/FORMAT.md), and
[manifest](experimental/owner-facing-workbench-v1/RELEASE-CANDIDATE.json) bind
the 35/35 synthetic qualification. The owner walkthrough and disposition are
pending. The candidate remains non-normative and creates no canonical corpus,
protocol format, product-utility claim, or permission to execute the episode.

## Stopped experimental incremental capture

The
[incremental-capture v1 runtime](experimental/incremental-capture-v1/)
implements the five narrow operations selected after the first public dogfood:
closed source snapshots, exact spans, additive revisions, separate horizons,
and an open question. It passed its frozen synthetic qualification before the
second public correction ran.

The sole real run then stopped before H1 acquisition because default JavaScript
sorting and `localeCompare` ordered equal mixed-case file sets differently.
The guard failed closed before reading selected source-file bytes. The owner
selected `stop`; this implementation remains immutable experiment and
regression evidence and is not admitted as reusable or default runtime
machinery. Any repair requires a new implementation identity and fresh
confirmation.

The proposed
[`incremental-capture-portable-inventory-v2-third-public-correction-v1`](../examples/experiments/incremental-capture-portable-inventory-v2-third-public-correction-v1/README.md)
successor stopped before its semantic or selection contract was frozen. No v2
runtime directory or implementation identity exists. That administrative stop
does not qualify the missing portable-inventory behavior.

## Experimental public dogfood

The
[public-dogfood v1 runtime](experimental/public-dogfood-v1/)
is a separate Zone 3 adapter for the first real-public GraphTruth episode,
`murmurmark-echo-lab-correction-v1`. It preserves two source horizons, exact
evidence spans, provisional revision history, scoped limitations, and an open
question; it then derives a dossier and two machine-readable views from the
verified bundle.

The adapter is deliberately tied to this episode. It contains no acceptance
decision, does not change the M8 runtime below, and makes no protocol,
generality, safety, or superiority claim. The terminal owner decision was
`shrink`: the source snapshots, exact spans, additive revisions, distinct
horizons, and open question are retained as useful evidence. The richer
assessment shape and this adapter were not admitted as reusable or default
runtime machinery.

## Experimental record-and-bundle journey

The
[record-bundle v1 runtime](experimental/record-bundle-v1/)
implements one separately identified public-synthetic Zone 3 journey. It adds
the first executable `AssertionRevision`, `Assessment`, policy-scoped
`AcceptanceDecision`, explicit revocation, recorded-as-of reconstruction, and
portable directory-bundle slice. A Python standard-library reader independently
checks the exported bytes and derives the same semantic output without
importing this runtime.

The implementation is deliberately journey-specific. It does not replace the
S0-S1 replay below, populate normative schemas, or establish a default storage
format.

## Experimental S0-S1 replay

This retained Zone 3 walking skeleton is intentionally narrower than the
eventual default runtime. It implements the public synthetic preparation slice
of the stopped [Issue #6](https://github.com/asukhodko/graphtruth/issues/6)
path. It is incompatible with the accepted byte-identical RST projection for
Issue #24 and grants no authority to read or process that corpus. On a supported
Darwin host, the preserved synthetic runtime-boundary rehearsal still runs from
the repository root:

```sh
./runtime/replay
```

This command rehearses the runtime boundary, not the complete synthetic
experiment workflow. It does not run the comparison baselines and scorer or
deliberately exhaust every declared wall-clock, task, memory, disk, review, and
correction budget. Issue #6 stopped before any changed runtime was admitted to
private bytes. A future private or public successor must use a new explicit
authorization and repeat the required exact-runner rehearsal; this command may
continue to use only its checked-in synthetic packs.

The controller captures the frozen public pack before reveal, validates a
private materialization of those exact captured bytes, and checks its closed
inventory and lock digests. It then re-reads the original files and checks
their file identity and bytes so a concurrent change rejects the acquisition.
A pack is rejected if it overlaps a filesystem root that the sandbox must read
for the Node.js runtime. The generated second pack is derived from the captured
bytes rather than the live template tree.

The startup model assumes trusted, stable local code and input roots. A
malicious concurrent process running as the same user could race both input
passes or replace an ESM file between module loading and the first identity
hash; defending against that requires a separate descriptor-based snapshotter
and bootstrap loader, outside this S0-S1 experiment.

The controller derives a runtime identity from the pack lock, every executable
runner and validator file, configuration, and isolation profile. It verifies
that the staged worker bytes match that identity before each reveal. The worker
receives neutral bundle filenames, only the current source and current tasks,
and its previous private state. It does not receive the pack root, corpus
manifest, oracle, future source paths, credentials, or network access.

The worker writes a hash chain of commit directories containing exact source
bytes, provisional deterministic anchored-passage candidates, exact byte and
line evidence locators, and a checkpoint. After each selected head, the
controller writes a digest anchor outside the worker's readable and writable
roots. This makes rewriting an earlier self-consistent chain detectable. The
lexical index, current and as-of dossiers, and step deltas are disposable
projections rebuilt only from the verified chain. The first experiment has no
concurrent projection reader or generation switch: an interrupted rebuild may
leave a partial projection, which remains unavailable until the next rebuild;
the anchored vault is unaffected.

The command exercises real process termination before publication and after a
commit rename but before head selection, exact redelivery, projection deletion
and rebuild, whole-run deletion, a clean rerun, and a second sealed pack with
generated identifiers, filenames, facts, anchors, and canaries. This is a
process-crash test; durability across an operating-system or power failure is
outside this first experiment. It writes the reviewed evidence to
[`rehearsal/observed.md`](rehearsal/observed.md) and the corresponding complete
machine record to [`rehearsal/observed.json`](rehearsal/observed.json).

## Isolation and failure behavior

The current rehearsal uses the checked-in deny-by-default
[`sandbox.sb`](sandbox.sb) profile through `/usr/bin/sandbox-exec`. It first
runs a malicious boundary probe against controller-only files, a live local
network listener, read-only input, an outside-workdir target, and a symlink
escape. Missing or failed isolation stops the run before the first source is
revealed. The command does not silently fall back on an unisolated worker.

Successful attempts remove both primary and clean-rerun roots. Failed attempts
remain in their controller-only temporary root and keep the runtime identity
record written before reveal plus a metadata-only failure record. The supported
session parent is `/tmp` or one of its descendants; the sandbox fails closed on
an unsupported placement. Runtime and projection formats are provisional
laboratory formats. Passing this runtime-boundary rehearsal does not admit a
private corpus, even after the owner confirms the observed isolation and
deletion closure. The exact changed runtime must also pass the full synthetic
dress rehearsal and run-specific review. The generated report retains owner
confirmation as `pending` because it records the state at run time. The
subsequent confirmation is stored separately in
[`rehearsal/owner-signoff.json`](rehearsal/owner-signoff.json), bound to the exact
report bytes, and is a conversation record rather than a cryptographic
signature. Its publication block also records the pull-request ref and squash
merge commit that keep the pre-merge evidence commit attributable after the
feature branch is deleted.
