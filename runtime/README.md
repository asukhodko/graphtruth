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

## Experimental S0-S1 replay

The first Zone 3 walking skeleton is intentionally narrower than the eventual
default runtime and implements the executable preparation slice of
[Issue #6](https://github.com/asukhodko/graphtruth/issues/6). On a supported
Darwin host, run the complete public synthetic rehearsal from the repository
root:

```sh
./runtime/replay
```

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
laboratory formats. Passing this synthetic rehearsal does not admit a private
corpus until the owner separately confirms the observed isolation and deletion
closure.
