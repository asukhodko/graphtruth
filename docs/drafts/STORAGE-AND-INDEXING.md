# Recovered Storage and Indexing Design

> Status: Recovered design context — non-normative
>
> Captured: 2026-07-11
>
> Authority: The file-first constraints in [Architecture](../ARCHITECTURE.md),
> [Principles](../PRINCIPLES.md), [Vision](../VISION.md), and accepted
> [RFC 0000](../../rfcs/0000-project-foundation.md) take precedence. This note
> does not choose a serialization, directory layout, database, identifier, or
> transaction model.
>
> Promotion rule: A storage choice becomes durable only after representative
> corpus experiments, crash/recovery and migration evidence, an RFC where it
> changes canonical meaning, and matching specification, schema, and conformance
> artifacts.

## Purpose and status vocabulary

The accepted direction says where authority lives: durable epistemic meaning is
representable in documented files, while specialized stores are replaceable
projections. It intentionally leaves the physical design open. This note
recovers the candidate vault shape, the reasoning behind it, the index families,
and the experiments needed before selection.

Labels used below:

- **Working hypothesis** — a candidate baseline to build and test.
- **Alternative** — an option retained for comparison.
- **Open question** — insufficient evidence for a choice.
- **Experiment** — a bounded validation task.
- **RFC candidate** — a choice that would affect interoperable meaning.
- **Deferred** — intentionally outside the first vertical slice.
- **Superseded** — a framing replaced by an accepted constraint.

## The recovered vault layout

**Working hypothesis.** A personal v0 can use a vault with an immutable object
area, explicit commits and refs, optional snapshots and publication bundles, and
a physically separate runtime area:

```text
vault/
  blobs/
  objects/
  commits/
  refs/
    HEAD
  snapshots/
  published/
  runtime/
    catalog.sqlite
    lexical/
    vectors/
    graph/
```

This is a design probe, not the GraphTruth protocol. Logical records need not
map one-to-one to physical files, and a conforming implementation need not use
these path names.

### Recovered authority boundary by area

| Area | Candidate role | Loss consequence | Current classification |
| --- | --- | --- | --- |
| `blobs/` | Versioned source payloads and large/binary retained artifacts | Evidence may become unverifiable | Canonical when declared retained; otherwise explicit availability exception |
| `objects/` | Immutable semantic record envelopes and payloads | Epistemic history is lost | Canonical working hypothesis |
| `commits/` | Atomic membership/change manifests over objects and blobs | Recorded order and dataset history may be lost | Canonical working hypothesis if commits define ledger visibility |
| `refs/HEAD` | Pointer to the current committed state | Current state becomes undiscoverable, but commits may permit repair | Small mutable canonical control record in this hypothesis |
| `snapshots/` | Checkpoints, packs, export roots, or precomputed state | Depends on selected role | **Open question**: canonical checkpoint versus rebuildable accelerator |
| `published/` | Deliberately disclosed, self-contained export bundles | Publication history or interoperability artifact is lost | Canonical only when publication itself is intended history |
| `runtime/catalog.sqlite` | Fast ID, type, reference, time, and build metadata lookup | Access slows until rebuild | Disposable projection |
| `runtime/lexical/` | Inverted full-text search | Lexical search unavailable until rebuild | Disposable projection |
| `runtime/vectors/` | Embeddings and approximate nearest-neighbor structures | Semantic recall changes or disappears | Disposable projection unless a historically significant model output is retained separately as analysis |
| `runtime/graph/` | Adjacency, path, and graph-analytic projection | Traversal and graph analyses unavailable until rebuild | Disposable projection |

The word “canonical” here describes retention authority, not truth, acceptance,
or epistemic origin.

### What may live in a closed database

**Superseded.** “Specialized stores may contain literally nothing except search
indexes” is too strict. A runtime may reasonably keep queues, leases, locks,
retry state, ingestion checkpoints, rate limits, UI sessions, telemetry,
candidate work tables, and caches in specialized stores.

The durable boundary is instead:

- no intended epistemic history has its only copy in such a store;
- losing operational state may cause safe rework, not silent loss or mutation of
  committed knowledge;
- a candidate that affects a decision is promoted to an attributable canonical
  record before the runtime claims it as durable;
- index configuration needed to interpret a retained historical analysis is
  retained with that analysis or explicitly reported missing.

## Candidate physical objects

The following names describe possible serialized object roles. They do not
replace the conceptual model in the architecture and must not be treated as
final schema names.

### Recovered naming inventory

An earlier storage discussion used the following exact candidate names:

```text
SourceSnapshot
EvidenceSpan
ExtractionRun
Mention
EntityRevision
ResolutionDecision
Proposition
AssertionOccurrence
AssertionRevision
ReviewDecision
AcceptanceDecision
Question
Derivation
PredicateDefinition
AccessPolicy
```

**Recovered context, not a schema.** This list is retained because it captures
several distinctions that a smaller conceptual summary can accidentally lose:
the source version versus its evidence selection, extraction process versus
output mention, proposition versus occurrence versus revision, identity state
versus a resolution decision, and a derivation versus its inputs.

Some names have already evolved. The current architecture uses broader roles
such as `Event`, `Assessment`, policy definition, and analysis artifact;
`ReviewDecision` must not be allowed to blur evidence assessment with the
separate policy-scoped `AcceptanceDecision`. The eventual core may omit, rename,
or place several recovered names in optional profiles.

### Ledger and artifact objects

- **Source artifact descriptor** — media type, encoding, version identity,
  integrity information, retention/availability class, and reference to a blob
  or external location.
- **Event** — receipt, observation, action, import, or external change with actor
  and temporal metadata.
- **Evidence selection** — an exact span or selector over one artifact version,
  including the selector representation and verification state.
- **Entity record** — durable identity, aliases, and links to separately
  attributable merge/split decisions.
- **Assertion revision** — an attributed claim version with context, temporal
  applicability, provenance, and evidence.
- **Assessment** — attributed support, challenge, confidence dimensions, or
  methodological criticism.
- **Acceptance decision** — policy-, purpose-, actor-, target-revision-, and
  decision-time-specific acceptance, rejection, or revocation.
- **Question** — a known unknown, its importance, dependencies, expected
  evidence, and lifecycle.
- **Identity decision** — an auditable merge, split, alias, or rejection of a
  candidate match.
- **Redaction or evidence-unavailability record** — what is no longer available,
  under which authority/reason, and which verification is affected.
- **Policy definition** — a versioned policy needed to interpret retained
  decisions or views.
- **Analysis artifact** — a retained output with input snapshot, method/model,
  version, configuration, assumptions, uncertainty, and reproducibility limits.
- **Profile objects, if enabled** — experience episode, causal claim, mechanism
  pattern, and transfer attempt.

### Repository-control objects

- **Commit manifest** — parent commit(s), added or removed object membership,
  referenced blobs, protocol/profile support, writer identity, recorded order,
  and integrity root.
- **Ref** — a named pointer to a commit.
- **Snapshot manifest** — a full reachable-set inventory or compacted checkpoint
  with a source commit.
- **Publication manifest** — a disclosure-scoped export inventory, applicable
  specifications, retained artifacts, omissions, and integrity results.
- **Migration report** — source and target versions, transformer identity,
  per-object mappings, warnings, and declared loss.

**Open question.** Some of these control objects may belong only to one runtime,
while the protocol may need merely observable ordering and archival inventory.
Selecting the vault does not automatically standardize its repository model.

## Candidate record envelope

**Working hypothesis.** Every semantic object can expose enough information for
a generic reader to identify and preserve it before understanding its profile
payload. Candidate envelope fields include:

```text
record identifier
record role/type identifier
protocol version
required and optional profile/extension identifiers
actor/producer identity
recorded-order metadata
valid-time metadata where meaningful
provenance/input references
payload media/schema identifier
integrity/canonicalization algorithm identifiers where applicable
retention, sensitivity, and redaction metadata where permitted
payload
```

This is not a schema proposal. In particular, time, provenance, lifecycle, and
policy relationships may need separate records rather than universal envelope
fields.

**RFC candidate.** Define the minimal envelope only after examples demonstrate
which fields every independent reader must inspect and which it must merely
round-trip.

## Atomic commit protocol

The recovered layout assumes immutable content plus one small mutable ref. The
goal is that a crash exposes either the previous complete state or the new
complete state, never a partially committed ledger.

### Candidate single-writer sequence

**Working hypothesis.** A first implementation can use this sequence:

1. Read `refs/HEAD` and retain the expected parent commit identifier.
2. Acquire a local single-writer lease or lock. The lock is operational state,
   not epistemic authority.
3. Construct new blobs, objects, and the prospective commit in a staging area on
   the same filesystem as their destinations where atomic rename is assumed.
4. Validate record structure, semantic preconditions that are currently
   implemented, referenced-object reachability, blob digests, and protocol/profile
   support before publication.
5. Write each immutable blob under a verified identity. If it already exists,
   verify it rather than overwrite it.
6. Write each immutable object and verify its declared identity.
7. Write a commit manifest that references only durable blobs and objects and
   names the expected parent.
8. Flush files and containing directories according to the durability claim of
   the platform.
9. Compare `refs/HEAD` with the expected parent and atomically replace it with a
   fully written pointer to the new commit. A mismatch aborts publication and
   requires rebase/reconciliation; it must not overwrite another commit.
10. Flush the ref directory, release the lease, and emit an indexing work item
    derived from the new committed head.
11. Update runtime projections only after the ref transition. Projection failure
    leaves the canonical commit valid and marks indexes stale.

### Recovery properties to test

- A crash before the ref swap leaves the old head valid and may leave unreachable
  immutable objects, which can be inspected and later collected.
- A crash after the atomic ref swap exposes the new commit; missing projection
  updates are detected from the projection watermark.
- Retrying writes is idempotent because immutable identities are verified.
- A corrupt or dangling head fails visibly and can be repaired only from a
  verified commit inventory; the runtime must not guess a “latest” commit from
  timestamps.
- Garbage collection operates only on objects unreachable from all protected
  refs, snapshots, publications, or retention holds.
- Controlled deletion is a semantic workflow, not ordinary garbage collection.

**Experiment.** Inject termination after every durability boundary, including
file writes, renames, directory flushes, and projection updates. Reopen on all
supported filesystems and verify that the visible ledger is old-or-new, never a
hybrid.

**Open question.** Atomic rename, directory durability, file locking, and
filesystem notification behavior differ across platforms and network mounts.
The implementation must declare its tested durability envelope.

### Multi-writer and distributed variants

**Deferred.** Possible future models include optimistic compare-and-swap refs,
a commit DAG with explicit merge decisions, an append service, or a replicated
log. Multi-writer semantics could affect recorded time, acceptance authority,
identity decisions, and conflict handling, so they are not a transparent
storage-engine swap.

**RFC candidate.** Any interoperable commit ordering or merge model requires an
RFC. Personal v0 should not freeze distributed semantics accidentally.

## Serialization and packing alternatives

### Human-readable structured formats

**Alternative: canonical JSON per object.** Broad tooling, strict parsers, and
clear schema support; weak comments, verbose repeated envelopes, and the need to
define number, Unicode, duplicate-key, and canonicalization behavior.

**Alternative: JSON Lines segments.** Streaming and compact append behavior;
line-local recovery and diffs can be useful, but changing one record, preserving
ordering, and content addressing individual records require explicit rules.

**Alternative: YAML.** Pleasant authoring and comments; parser variation,
implicit typing, aliases, duplicate keys, and canonicalization make it risky as
an interchange authority unless a sharply restricted subset is defined.

**Alternative: Markdown with structured front matter.** Excellent narrative
inspection and manual editing; awkward for deeply structured relationships and
lossless machine round trips unless narrative and semantic payload boundaries
are very strict.

**Alternative: JSON-LD, RDF/TriG, or another semantic-web representation.** Rich
identity and graph interoperability; canonicalization, named-graph semantics,
human review, revision objects, and profile ergonomics need experiments rather
than assumption.

### Binary and packed formats

**Alternative: CBOR or another deterministic binary encoding.** Compact and
potentially canonicalizable, but ordinary inspection requires tooling. It may be
appropriate for bundles or transport while text remains the review form.

**Alternative: packfiles or immutable segment archives.** Reduce filesystem
overhead and improve scans. They require a documented index, corruption
localization, independent extraction, and a path to human rendering.

**Alternative: columnar snapshots.** Efficient analytical scans, but poorly
suited as the only append-oriented historical representation. A columnar form is
more naturally a rebuildable projection or export.

**Working hypothesis.** Separate semantic serialization from physical packing:
define lossless record values first, then permit one-object files and immutable
packs that preserve the same values and identities.

**Recovered concrete starting point.** The session named JSON with a JCS-style
canonicalization experiment, JSON Lines for streaming/export, and generated
Markdown, JSON-LD, or Parquet views as an initial combination worth testing.
This was an engineering sketch, not a format decision. Exact standards,
versions, number/Unicode rules, RDF mapping, and whether a columnar export can
preserve all semantics must be revalidated before an RFC.

### Authoring form versus canonical form

**Alternative.** Humans may edit a friendly form that is transformed into a
stricter canonical form. This improves ergonomics but creates two failure
surfaces: silent information loss and disagreement about which representation
is authoritative.

**Open question.** Can a human-friendly form round-trip unknown extensions and
exact evidence selectors without hidden state? If not, it should be a view, not
an authoring authority.

## Identifier alternatives

**Alternative: assigned random identifiers.** Stable across correction and
easy to mint offline; they do not prove content identity and require duplicate
handling.

**Alternative: time-sortable identifiers.** Operationally convenient; embedded
time can leak metadata and must not be mistaken for trusted recorded order.

**Recovered concrete candidate.** UUIDv7 was named as a convenient assigned,
roughly time-sortable record ID and SHA-256 as a content-integrity/addressing
candidate. Neither is selected. The protocol would need explicit algorithm
identifiers, collision and privacy behavior, trusted-time separation, and an
agility/migration story rather than baking either label invisibly into IDs.

**Alternative: content addresses.** Strong identity and deduplication; any
semantic change produces a new identifier, canonicalization becomes critical,
and sensitive-content digests can leak or retain forbidden information by
indirection.

**Alternative: scoped natural identifiers.** Human-friendly within a domain;
fragile under renaming, collision, and federation.

**Working hypothesis: hybrid identity.** Use stable assigned semantic IDs for
evolving concepts and content identities for immutable representations or
artifacts. Record the relation explicitly rather than using one identifier for
both roles.

**RFC candidate.** Identifier categories, collision behavior, algorithm labels,
and reference resolution are interoperable semantics.

## Source artifact retention alternatives

| Alternative | Benefit | Risk or limitation |
| --- | --- | --- |
| Inline small payload | Self-contained object | Repetition, record-size growth, awkward binary handling |
| Content-addressed `blobs/` | Deduplication, stable exact evidence | Hash/canonical-byte rules, privacy leakage, many-file overhead |
| Versioned path reference | Human-operable local storage | Renames and sync can break identity unless digest/version is retained |
| External durable URI | Avoids copying licensed or massive data | Link rot, access loss, authentication, EoL incompleteness |
| Encrypted blob | Local retention with reduced disclosure | Key loss is evidence loss; metadata and digest leakage remain |
| Redacted/tombstoned artifact | Meets deletion obligations | Exact evidence can no longer be verified |

**Working hypothesis.** Every artifact reference should declare availability and
verification state rather than letting a missing blob look like a complete
archive.

**Open question.** Evidence selectors for text, PDFs, images, audio, structured
data, and transformed representations need media-specific profiles or a common
selector abstraction plus adapters.

## Commits, refs, snapshots, and publication

### Commits and recorded time

A commit can supply an unambiguous ledger visibility boundary and support atomic
multi-record changes. It must not imply that its wall-clock timestamp is the time
an actor knew something or the valid time of a claim.

**Alternative.** Each record could carry an independent append sequence without
dataset commits. This simplifies physical storage but makes cross-record atomic
changes and consistent snapshot reconstruction harder.

**Open question.** Does recorded time require a protocol-level commit/order
model, or can implementations expose equivalent visibility through different
repositories?

### Refs and branches

`refs/HEAD` makes the working state explicit. Additional refs could protect
snapshots, imports, experiments, or publication histories.

**Deferred.** User-facing branching and merge semantics. Git-like names do not
imply that epistemic conflicts can be solved by textual merge.

### Snapshots

**Alternative: canonical checkpoint.** A snapshot is a signed or hashed complete
reachable-set declaration and remains part of preservation history.

**Alternative: disposable acceleration.** A snapshot is a compact state cache
that can be rebuilt from commits.

**Working hypothesis.** Separate a small canonical snapshot manifest from any
disposable packed data it indexes. The manifest can support EoL inventory without
making a particular pack encoding authoritative.

### Published bundles

Publication is a disclosure decision, not a copy operation. A bundle should name
its source commit, selection policy, protocol/profiles, omitted dependencies,
redactions, licenses, integrity inventory, and rendering tools or fallbacks.

**RFC candidate.** A portable archive/publication manifest may deserve a
profile once private-to-public redaction and independent reading have been
exercised.

## Index families

The initial `runtime/` layout names four physical families, but several logical
indexes may share one engine.

### `runtime/catalog.sqlite`

Candidate exact or mostly exact projections include:

- record ID to physical object location;
- record role, protocol version, profile, and extension membership;
- forward and reverse references;
- blob reachability and verification state;
- valid-time and recorded-time intervals;
- source artifact to evidence-selection lookup;
- entity aliases and identity-decision history;
- assertion revision, assessment, and acceptance-decision lookup;
- provenance and transformation dependencies;
- question status and dependency edges;
- projection watermarks and build diagnostics;
- sensitivity, retention, and access-filter metadata where authorized.

SQLite is a runtime candidate, not a protocol dependency. Equivalent relational,
embedded, or in-memory implementations should remain possible.

### `runtime/lexical/`

Candidate projections include full-text terms, fields, language-specific
analysis, phrase/position data, source spans, and filters over record type, time,
context, and policy-visible scope.

**Open question.** Tokenization and stemming change recall and ranking. Exact
historical lexical results should not be promised unless the analyzer and index
snapshot are retained as an analysis dependency.

### `runtime/vectors/`

Candidate material includes embeddings for source fragments, assertions,
questions, episodes, mechanisms, and query-time dossiers, plus ANN structures.

Embeddings are not evidence, identity, or semantic authority. Every result must
return canonical IDs and the evidence path used in the presented dossier.

**Working hypothesis.** Retain model/version/configuration and source snapshot in
the projection manifest. Rebuilding with a different model creates a new
projection generation rather than pretending continuity of scores.

### `runtime/graph/`

Candidate projections include typed adjacency, provenance closure, assertion and
assessment topology, temporal edges, question dependencies, episode structure,
and mechanism/transfer mappings.

Contestable inferred relations remain attributed candidates or analysis records;
placing them in a graph projection does not make them canonical or accepted.

### Additional logical projections

- contradiction and counterevidence candidate sets;
- dark-zone and coverage frontier;
- stale or missing-outcome queues;
- spatial indexes where a domain requires them;
- policy-specific fact views;
- migration dependency and compatibility indexes;
- dossier and chunk caches;
- operational retry/dead-letter queues.

The physical placement of these projections is a Zone 3 decision.

## Projection contract

**Working hypothesis.** Every projection the runtime claims to support should
expose a machine-readable build manifest containing:

```text
projection identity and kind
source commit/snapshot/watermark
input inventory digest or equivalent complete boundary
supported protocol versions and profiles
builder implementation and version
model/provider identity where applicable
configuration and policy identity
projection schema/format version
privacy and access scope
creation time, freshness, and completeness state
rebuild procedure identifier
validation summary and known exceptions
```

The manifest itself may be disposable for a disposable projection. If it is
needed to interpret a retained historical decision or analysis, the relevant
parts must be retained with that analysis.

### Exact versus heuristic rebuild claims

**Working hypothesis.** Rebuild guarantees should be typed:

- **Semantic exactness** — ID lookup, reference closure, lifecycle state, and
  deterministic protocol views yield the same specified result.
- **Set equivalence under declared rules** — a projection contains the same
  eligible records even if its internal bytes differ.
- **Quality-bounded regeneration** — heuristic retrieval or clustering meets a
  declared evaluation threshold but need not reproduce ranks or scores.
- **Retained-output availability** — a historical stochastic result remains
  inspectable because its output was retained, although rerunning may differ.
- **Unreproducible dependency** — explicitly reported when a provider, model,
  key, source, or environment is unavailable.

**Superseded.** “Rebuildable” does not mean byte-identical for every index. It
means the implementation states and tests the appropriate class of guarantee.

## Incremental indexing protocol

**Working hypothesis.** Indexers consume committed transitions rather than
watching partially written object files:

1. read the projection watermark;
2. find commits between that watermark and current head;
3. verify their reachability and supported semantics;
4. apply additions, supersessions, redactions, and invalidations transactionally
   within the projection;
5. validate affected invariants;
6. advance the watermark only after the projection transaction commits.

If a migration or builder-version change invalidates incremental assumptions,
the indexer discards and fully rebuilds the affected projection.

**Experiment.** Compare every incremental result with a clean rebuild over the
same head. Randomize commit batches, interruptions, duplicate delivery, and
redaction ordering.

## Retrieval and dossier assembly

Indexing exists to support contextual access, not isolated nearest-neighbor
fragments. A candidate runtime pipeline is:

1. parse the query, purpose, policy, valid time, and recorded-as-of boundary;
2. resolve candidate entities, predicates, mechanisms, and time expressions;
3. generate lexical, vector, graph, temporal, and structural candidates;
4. filter by version/profile support, access policy, lifecycle, and explicit
   query scope;
5. fuse and deduplicate candidates without erasing materially different claims;
6. expand provenance, exact evidence, revisions, assessments, acceptance
   decisions, counterclaims, questions, and applicable episode context;
7. diversify and rerank for relevance, support, disagreement, and applicability;
8. allocate the presentation/context budget without detaching claims from their
   support boundary;
9. render a dossier that identifies its query, policy, time, projections, and
   canonical inputs.

**Open question.** A portable dossier profile might specify a minimal envelope
and support closure without standardizing candidate generation or ranking.

**Alternative.** Dossiers may remain wholly runtime-specific views. This
preserves innovation but makes citation, exchange, and historical audit less
portable unless selected dossiers are retained as analysis artifacts.

## Data layout and scale options

### One object per file

Strong inspectability and simple immutable writes; possible directory, inode,
backup, and scan overhead at large object counts.

### Partitioned append segments

Efficient sequential I/O and transfer; requires record-level addressing,
corruption isolation, compaction rules, and a way to review individual changes.

### Content-addressed packfiles

Efficient deduplication and distribution; requires a durable pack index or
independent scan format and algorithm agility.

### Database-backed live state with file export

Operational transactions may be convenient; authority and atomicity between DB
and export are difficult. A successful recovery drill must prove that no
semantic state exists only in the database.

### Git-managed files

Convenient diffs, review, and history for small non-sensitive corpora. Git is not
required by file-first, can expose deleted secrets in history, and may perform
poorly with private binaries or high-frequency writes.

**Experiment.** Evaluate layouts on representative small, medium, and projected
three-year corpora. Measure ordinary inspection, commit latency, full scan,
incremental indexing, clean rebuild, backup, restore, migration, partial
corruption, and storage amplification.

## Privacy and security storage questions

- Digest and path names can leak equality or content guesses.
- Vector stores can leak source semantics even when raw text is absent.
- Full-text and graph projections can become broader uncontrolled copies of the
  corpus.
- Encryption at rest does not solve disclosure to a remote model or indexer.
- Deleting a blob may leave replicas, backups, indexes, embeddings, logs, and
  published bundles.
- A signature proves origin/integrity under its trust assumptions, not truth.
- A retained redaction marker must avoid restating the forbidden payload.

**Working hypothesis.** Projection builders operate with least privilege and
publish their disclosure scope. Redaction produces explicit invalidation work
for every projection generation and backup policy.

**RFC candidate.** Portable retention, redaction, evidence-unavailability,
encryption metadata, and signature semantics require dedicated threat modeling.

## Decision experiments

### Serialization bake-off

**Experiment.** Encode the same synthetic corpus in candidate formats and test:

- human review and meaningful diffs;
- strict parsing and schema diagnostics;
- unknown-extension round trips;
- exact evidence selectors;
- streaming and partial-corruption recovery;
- canonicalization and content identity;
- migration and preservation of comments or narrative;
- availability of independent implementations.

### Vault durability test

**Experiment.** Apply the candidate atomic protocol under injected crashes,
concurrent writers, full disks, permission failures, torn/truncated files,
unexpected process restarts, and stale locks.

### Projection replacement test

**Experiment.** Build the same exact projection with two implementations and
compare semantic output. Rebuild heuristic retrieval with a different model and
verify that changed rankings remain attributable rather than presented as the
same analysis.

### EoL bootstrap test

**Experiment.** Give a frozen archive to a clean environment without the current
runtime, follow only included documentation, validate records, locate evidence,
and reconstruct representative dossiers. The full procedure is retained in
[EoL Recovery Drill](EOL-RECOVERY-DRILL.md).

## Open decision register

1. **RFC candidate:** minimal record envelope and extension preservation.
2. **RFC candidate:** semantic identifiers, representation identities, and
   digest/canonicalization algorithms.
3. **RFC candidate:** source artifact and evidence-selector model.
4. **RFC candidate:** recorded-order/commit semantics if interoperability needs
   them.
5. **RFC candidate:** portable archive and publication manifests.
6. **Open question:** exact canonical serialization versus multiple equivalent
   serializations.
7. **Open question:** one-object files, append segments, or adaptive packing.
8. **Open question:** which snapshot metadata is canonical.
9. **Open question:** the smallest projection contract that should be portable.
10. **Open question:** whether a dossier support envelope belongs in a profile.
11. **Deferred:** multi-writer commit and merge semantics.
12. **Deferred:** federation and cross-vault identity.
13. **Deferred:** global extension or profile registries.

The recovered layout is valuable precisely because it is concrete enough to
break in experiments. It should be replaced freely when evidence finds a safer
or simpler boundary, while the accepted file-first and rebuildability principles
remain intact.
