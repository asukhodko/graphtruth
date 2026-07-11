# Recovered Design Evolution

> Status: Recovered design context — non-normative
>
> Captured: 2026-07-11
>
> Authority: [Vision](../VISION.md), [Architecture](../ARCHITECTURE.md),
> [Principles](../PRINCIPLES.md), and accepted
> [RFC 0000](../../rfcs/0000-project-foundation.md) take precedence over this
> reconstruction.
>
> Promotion rule: Nothing in this note becomes a project decision through
> repetition or implementation. A durable semantic choice needs concrete
> examples, evidence from use, and the RFC/specification/conformance path
> required by the development process.

## Purpose

The authoritative documents describe GraphTruth as it is currently understood.
They intentionally do not preserve every intermediate framing that led there.
This note recovers that design path because discarded framings, unresolved
tensions, and the reasons for conceptual turns are useful when later work makes
an old idea look attractive again.

This is a reconstruction of design context, not a transcript and not a claim
that every step was ever a committed architecture.

## Status vocabulary

- **Working hypothesis** — a useful direction that still needs an experiment.
- **Alternative** — an option worth retaining for comparison.
- **Open question** — a decision whose evidence is not yet sufficient.
- **Experiment** — a bounded way to obtain that evidence.
- **RFC candidate** — a question likely to affect durable semantics or
  interoperability if adopted.
- **Deferred** — deliberately postponed, not rejected.
- **Superseded** — an earlier framing replaced by a later accepted direction;
  it remains here to preserve rationale.

## The sequence of conceptual turns

### 1. From incoming fragments to a connected memory

**Working hypothesis.** The starting problem was broader than note taking. A
system would receive events, documents, observations, conversations, and other
fragments that each revealed only part of a situation. It would retain their
connections so later work could find relevant knowledge, expose conflicting
claims, and notice what was absent.

The important early loop was already active rather than archival:

```text
event or fragment
  -> candidate structure
  -> connected knowledge
  -> contradiction or dark region
  -> question or acquisition task
  -> new event
```

**Superseded.** “Build a knowledge graph application” is too narrow a statement
of this idea. It encourages the current graph projection, database, or UI to
become the identity of the project. The graph is a logical relation among
durable records; a graph database is only one possible access structure.

### 2. From stored facts to epistemic history

The name GraphTruth could suggest a store of globally correct propositions.
The discussion instead exposed several things that must remain distinct:

- what a source contained;
- what an observer reported;
- what an actor asserted;
- what an algorithm inferred;
- how another actor assessed that claim;
- what a named policy accepted for a stated purpose;
- what later evidence corrected or challenged;
- what was visible at a particular recorded time.

**Superseded.** A single mutable “fact” node with one confidence or accepted
status cannot preserve these distinctions. Accepted RFC 0000 now defines the
epistemic-ledger direction and the separation of assertion lifecycle from
policy-scoped acceptance.

**Working hypothesis.** Append-oriented epistemic records provide a better
substrate for both human judgment and machine assistance than a periodically
rewritten best-answer graph.

### 3. From search results to knowledge in context

Finding an isolated matching fragment is not equivalent to recovering usable
knowledge. The desired result evolved toward a query-specific dossier that can
bring together evidence, provenance, temporal applicability, competing claims,
open questions, and relevant experience.

**Superseded.** Treating a generated chunk or summary as the durable unit loses
the path back to exact evidence and makes later disagreement difficult to
recover. Chunks remain useful derived inputs; the canonical ledger remains the
support boundary.

**Open question.** Which elements of a dossier are sufficiently universal to
belong in a portable optional profile, and which should remain runtime policy?

### 4. The EoL question changed the center of gravity

The decisive storage question was whether the important knowledge could live in
human- and machine-readable files while specialized databases held only access
structures and operational state. The motivation was not aesthetic simplicity:
it was preservation of value after the original software, database, model, or
vendor disappeared.

That question produced two independent distinctions:

1. canonical record versus disposable materialization;
2. direct/source-derived material versus inferred analysis.

A derived result can be worth retaining canonically for audit or future use. A
canonical record is not thereby true. Conversely, an index can be highly
valuable while remaining disposable.

**Working hypothesis.** A small set of immutable or append-oriented files,
versioned source artifacts, explicit manifests, and rebuildable projections can
preserve the useful epistemic state without making the live runtime inefficient.
Candidate physical shapes are retained in
[Storage and Indexing](STORAGE-AND-INDEXING.md).

**Alternative.** A database may remain the primary operational write path if
every committed epistemic change is atomically exported to a documented
canonical representation. This is harder to reason about than files being the
commit boundary and risks hidden authority, but it should be rejected or
accepted through recovery evidence rather than taste alone.

### 5. From designing a system to designing a protocol

Once files, meanings, compatibility rules, migrations, and independent rebuilds
became the durable product, GraphTruth ceased to be adequately described as one
application architecture. Its long-lived center became a protocol: shared
semantic roles, invariants, lifecycle rules, versioning, extension behavior,
and observable conformance.

**Superseded.** “The default implementation defines GraphTruth” was replaced by
“the implementation tests and demonstrates GraphTruth.” Runtime behavior is
evidence, not protocol authority.

This turn also changed the meaning of success. A useful first runtime remains
essential, but the corpus should still be intelligible and recoverable when that
runtime is gone.

### 6. Three zones separated authority from usefulness

The protocol realization led to three zones:

- the durable protocol and specification;
- conservative core tooling that makes the protocol executable;
- a replaceable default runtime that supplies immediate utility.

Accepted boundaries are recorded elsewhere. The recovered insight is why the
zones exist: they classify semantic authority and replacement cost, not
importance, process, directory, or deployment topology.

**Superseded.** Putting every important algorithm in the specification would
freeze current heuristics. Putting every algorithm in the runtime would leave
independent readers unable to agree about time, revisions, canonical bytes, or
compatibility. The same capability can have a semantic contract in Zone 1, a
reference implementation in Zone 2, and an optimized strategy in Zone 3.

Ambiguous cases are retained in
[Zone Boundary Cases](ZONE-BOUNDARY-CASES.md).

### 7. Algorithms became a question of authority

The end-to-end path requires many algorithm classes: capture and deduplication,
extraction, identity proposals, temporal normalization, contradiction and gap
discovery, hybrid retrieval, dossier assembly, question ranking, causal
analysis, mechanism matching, migrations, and recovery.

The durable insight was not a favored algorithm. It was a placement test:

> Independent implementations need only agree where disagreement would change
> protocol meaning or conformance. Heuristic quality belongs to a replaceable
> runtime and must remain attributable.

**Working hypothesis.** Most intelligence should remain in Zone 3 and emit
reviewable candidates or analysis artifacts. Zone 1 should specify the smallest
deterministic semantic surface needed for interoperable records and views.

**Open question.** Some apparently heuristic operations may reveal portable
structural subtypes after dogfooding—for example, a contradiction caused purely
by disjoint lifecycle states. Those subtypes should be promoted only when exact
inputs, outputs, and failure behavior can be specified.

### 8. Connected knowledge was not enough: preserve experience and causality

The discussion then introduced a harder problem. Knowledge acquired through
one's own action and feedback can be recognized and reused in a new context in a
way that passively read conclusions often cannot. The missing material was not
more edges alone, but the generative path around an episode:

- situation and goal;
- forces and constraints, ledger-visible records, and separately evidenced
  decision-maker information with explicit completeness limits;
- alternatives, hypothesis, and prior prediction;
- decision and intervention;
- observation, outcome, surprise, and later interpretation;
- proposed mechanism and its applicability conditions;
- counterexamples and transfer attempts.

This extended GraphTruth from a memory of connected claims toward a memory of
testable experience and transferable mechanisms.

**Superseded.** A simple `causes` edge cannot carry comparison, assumptions,
scope, alternative explanations, or uncertainty. A temporal sequence is not a
causal claim, and a causal claim is not proof of a reusable mechanism.

**Working hypothesis.** Prediction before outcome, safe micro-experiments,
explicit transfer attempts, and retained failures can help turn externally
acquired information into tested capability. GraphTruth cannot serialize tacit
or embodied knowledge completely, but it can preserve more of the path by which
knowledge becomes operational.

**RFC candidate.** Experience, causality, mechanism, and transfer should be
separate optional profiles unless repeated corpora show that a smaller subset is
universal enough for the core.

### 9. Personal dogfood and the monorepo became epistemic tools

The first complete implementation is intentionally personal and narrow. This is
not merely a product-scope shortcut. Real use is expected to reveal which
semantic distinctions matter, which ontology choices are accidental, and where
the file/protocol boundary fails.

The monorepo serves the same purpose: protocol prose, schemas, fixtures, tooling,
migrations, and runtime can change atomically while their interfaces are still
being discovered.

**Deferred.** Multi-user federation, ecosystem governance, independent release
cadences, and repository extraction remain possible, but they do not yet have
evidence sufficient to justify their coordination costs.

## Recovered alternatives and their present status

| Earlier or competing framing | Preserved rationale | Present status |
| --- | --- | --- |
| A graph database is the source of truth | Convenient traversal and updates | **Superseded** by file-first authority in RFC 0000; still valid as a derived projection |
| The corpus is a current set of facts | Simple query model | **Superseded** by assertions, revisions, assessments, acceptance decisions, and time-scoped views |
| Generated summaries are the durable unit | Compact and immediately useful | **Superseded** as the canonical base; may be retained as attributed analysis artifacts |
| A universal ontology should be designed first | Apparent consistency across domains | **Superseded** by a small core plus profiles learned through dogfood |
| The application is the project | Fast path to a useful product | **Superseded** by protocol-first architecture; the runtime remains essential but replaceable |
| Every output must be reproducible byte for byte | Strong audit story | **Superseded** for stochastic or external models; retained outputs and reproducibility limits are explicit |
| All canonical material must be plain text | Maximum immediate readability | **Superseded** by human-inspectable records that may reference binary, encrypted, or externally constrained artifacts |
| Separate repositories enforce architecture | Strong physical boundaries | **Deferred** until measurable split criteria are met |
| Git is the runtime database | Familiar history and diff workflow | **Alternative**, not a consequence of file-first; operational and privacy constraints require evidence |
| The protocol standardizes retrieval ranking | Cross-tool identical answers | **Deferred** and likely undesirable; portable dossier semantics may be smaller than ranking behavior |

## Tensions deliberately left alive

These are not inconsistencies to paper over. They are productive design
tensions that implementation must test.

### Readability versus write and scan efficiency

One-record-per-file is inspectable but can perform poorly at scale. Packed
segments are efficient but make ordinary review harder. Human rendering can be
separate from canonical bytes, but then the renderer becomes preservation
infrastructure.

**Experiment.** Exercise several physical layouts on the same representative
corpus, including corruption, partial writes, diffs, migration, and independent
reading—not just ingestion throughput.

### Append-only history versus legal or privacy deletion

Auditability favors retention. Privacy, law, and secret rotation can require
payload removal. A tombstone can preserve an allowed trace but cannot verify
content that no longer exists.

**RFC candidate.** Define redaction and evidence-unavailability semantics
without implying that a retained digest is permission to retain or reveal
sensitive material.

### Small core versus useful interoperability

A very small envelope can survive, yet independent implementations may agree on
too little to exchange useful dossiers or causal records. A rich core may freeze
an immature personal ontology.

**Experiment.** Build the same narrow workflow with only the candidate minimal
roles, then record every implementation-local convention needed to complete it.
Recurring conventions are profile candidates, not automatically core concepts.

### Determinism versus better heuristic results

Deterministic algorithms simplify conformance and recovery. Modern extraction,
ranking, and causal discovery are often stochastic or provider-dependent.

**Working hypothesis.** Preserve deterministic protocol boundaries around
attributable heuristic proposals rather than demanding deterministic
intelligence.

### Complete archives versus external reality

Some evidence is licensed, remote, too large, deleted, encrypted with expired
keys, or processed by unavailable services. “The archive survives EoL” must
therefore always name a scope and exceptions.

**Superseded.** Absolute archive completeness is not a credible promise.
Conditional, testable archival completeness is the current direction.

## Evidence still needed

1. **Experiment.** Complete one private end-to-end corpus slice and derive the
   smallest synthetic equivalent that exercises every durable boundary.
2. **Experiment.** Rebuild all claimed projections after deleting runtime state.
3. **Experiment.** Give only the archive and frozen documentation to a reader
   implementation that has not imported runtime code.
4. **Experiment.** Correct a mistaken extraction, identity match, temporal
   interpretation, and policy acceptance without rewriting history.
5. **Experiment.** Capture an episode before its outcome, then attempt to reuse
   the proposed mechanism in a materially different context.
6. **Open question.** Which information had to be present at capture time because
   it could not be inferred honestly later?
7. **Open question.** Which default-runtime conventions repeatedly leak into
   schemas or fixtures?

## Candidate decision sequence

The following sequence preserves dependencies without pre-accepting outcomes:

1. representative end-to-end examples;
2. minimal record envelope and source/evidence boundary;
3. identifier and artifact-integrity model;
4. physical serialization and commit behavior;
5. revision, time, assessment, and acceptance semantics;
6. extensions, profiles, version negotiation, and migration;
7. archival completeness and recovery claims;
8. portable dossier boundary, if evidence supports one;
9. experience, causality, mechanism, and transfer profiles.

Every step after the examples is an **RFC candidate**, not a decision embedded
in this ordering.

## What this reconstruction must not do

- It must not turn remembered alternatives into accepted requirements.
- It must not imply that a candidate vault layout is the protocol.
- It must not treat current object names as frozen serialization types.
- It must not promote model output because it was useful in one episode.
- It must not promise exact replay when dependencies or nondeterminism prevent
  it.
- It must not erase a rejected or failed path merely because the final framing
  is cleaner.

The value of this note is historical pressure: future proposals should be able
to explain whether they advance the final idea, test an open tension, or revive
an earlier framing whose failure mode is already known.
