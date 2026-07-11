# GraphTruth Glossary

> Status: initial terminology. These definitions establish conceptual boundaries;
> they do not imply a particular schema, file layout, or programming model.

GraphTruth uses ordinary words such as *fact*, *event*, and *evidence* in precise
ways. Consistent terminology is essential because many design errors come from
collapsing observations, claims, acceptance, and causality into one generic graph
edge.

## Terms

### Acceptance

The policy- and purpose-specific result expressed by an `AcceptanceDecision` for
one assertion revision. Acceptance is contextual, attributable, and revocable. It
is not a lifecycle status on the assertion and not a declaration of universal
truth.

### AcceptanceDecision

A durable record that a named actor or explicitly authorized policy execution
accepted, rejected, or revoked acceptance of a specific assertion revision under
a named policy, for a declared purpose, at a decision time. It is independent of
the claimant's revision history and of other actors' assessments.

### Algorithm

A procedure that transforms or analyzes GraphTruth material. A normative
algorithm belongs to the protocol when independent implementations must agree on
its observable result. Mechanical reference algorithms belong to core tooling;
heuristic, statistical, and product-specific algorithms belong to the runtime.

### Analysis artifact

A preserved output of an analysis together with its input ledger snapshot,
method/model and version, parameters, assumptions, creation metadata, and relevant
environment information. An analysis artifact can be interpreted, compared,
audited, and rerun when its dependencies remain available. Reproducibility does
not necessarily mean byte-identical output from a nondeterministic model or a
changed toolchain. It is not authoritative merely because an algorithm generated
it.

### Archival completeness

A scoped, testable claim that an export contains the canonical records, source
artifacts or explicit evidence exceptions, protocol and required extension
semantics, policy definitions, integrity and encoding metadata, and identifier
history needed for its declared end-of-life uses. Completeness is conditional: it
must report external, redacted, licensed, missing, or no-longer-reproducible
dependencies rather than implying they were preserved.

### Assertion

A proposition attributed to a source or actor. It can have revisions, evidence,
attributed assessments, and separate acceptance decisions. GraphTruth preserves
assertions without assigning them one global accepted or disputed status and
without assuming they are true.

### AssertionRevision

One attributed version in an assertion's claim lifecycle. A revision may correct,
qualify, supersede, or record claimant withdrawal without erasing earlier state.
Another actor's support or dispute is an `Assessment`; policy acceptance is an
`AcceptanceDecision`, not a revision status.

### Assessment

An attributed evaluation of an assertion revision or its evidence, such as
support, challenge, dispute, confidence, or a methodological criticism. Multiple
assessments can coexist. An assessment does not mutate the assertion and is not
an acceptance decision.

### Association

An observed or computed relationship such as co-occurrence, similarity,
correlation, or statistical dependence. Association is not evidence of causation
unless a separate causal argument and its assumptions justify that conclusion.

### Bitemporality

The use of both valid time and recorded time. It distinguishes claimed
applicability in the represented domain from visibility in this ledger. It does
not by itself prove when a condition was true, when a person knew it, or that
timestamps and append order are trustworthy.

### Candidate

A proposed entity, assertion, relation, question, causal claim, or other record
awaiting a relevant workflow decision. A candidate may itself be retained
canonically for audit. Algorithms normally produce candidates, not
`AcceptanceDecision` records. *Proposal* is used synonymously when emphasizing
the workflow.

### Canonicalization

A specified deterministic transformation to a representation used for stable
comparison, digests, signatures, or interchange. Canonicalization preserves the
defined meaning and unknown extension material; it does not normalize away
disagreement, repair unsupported semantics, assess evidence, or decide truth.

### Canonical ledger

The portable, file-first collection of records intentionally retained as durable
GraphTruth history and references to source artifacts. It is the authority for
the dataset representation from which new indexes and views can be constructed.
A canonical record may be directly observed, source-derived, computed, or an
attributed decision. *Canonical* describes persistence and representation, not
epistemic origin, acceptance, or truth.

### CausalClaim

A candidate Causality-profile assertion that, under a stated scope, comparator,
model, and set of assumptions, an intervention would change an outcome. A causal
claim includes its evidence basis, uncertainty, alternatives, and applicability
boundaries; it is not represented as an unexplained `causes` edge.

### Causation

A relationship in which an intervention is claimed to change an outcome relative
to a specified alternative. Temporal order, provenance, rationale, association,
and correlation do not by themselves establish causation.

### Chunk / KnowledgeChunk

A bounded, derived unit assembled for indexing, retrieval, or model consumption.
A useful chunk may combine related assertions and local context, but it remains a
rebuildable projection and must retain pointers to canonical records and evidence.
It is not a new source of truth.

### Confidence

Recorded uncertainty or a derived assessment associated with a particular claim,
method, actor, policy, and context. Confidence is multidimensional and should not
be treated as a universal scalar that automatically determines acceptance.

### Context

The conditions under which an assertion, observation, policy, causal effect, or
`MechanismPattern` is intended to apply. Context may include domain, population,
environment, time, modality, assumptions, constraints, and purpose.

### Contradiction

A relationship between claims that cannot simultaneously hold under a sufficiently
shared interpretation, identity, scope, context, modality, and valid time. A
contradiction is normally a discovered and reviewable analysis, not the automatic
deletion of one claim. Mere difference or disagreement is not necessarily a
logical contradiction.

### Counterevidence

Evidence that challenges an assertion, its scope, its interpretation, or its
supporting argument. Counterevidence is preserved alongside supporting evidence.

### Counterfactual

A model-dependent statement about what would have happened under an unrealized
alternative. A counterfactual is inferred under explicit assumptions; it is never
an observation.

### Dark zone

A decision-relevant region of missing, weak, conflicting, or structurally absent
knowledge detected relative to an explicit expectation. Examples include a
high-impact assertion without evidence, a causal chain with an unobserved link,
an episode without an outcome, or a domain whose expected coverage is absent.
Absence from the ledger alone does not prove absence from the world.

### Default runtime

The replaceable Zone 3 product assembled from connectors, orchestration, models,
indexes, APIs, interfaces, and operating policies. It has no normative authority
over the protocol.

### Derivation

A provenance relationship indicating that one record or artifact contributed to
the production of another. Derivation describes the history of information; it
does not by itself describe real-world causation.

### Direct observation

An observation attributed to a person or instrument without an intervening
source-document interpretation. It is still fallible, has provenance and
measurement conditions, and does not become canonical merely because it is
described as direct. Policy acceptance, if needed, requires a separate
`AcceptanceDecision`.

### Derived store

A database, search engine, vector store, cache, or materialized graph built from
canonical records. It exists for access or computation and is disposable in the
sense that deleting it does not delete knowledge intended to be durable. A new
store can preserve required semantics without reproducing historical bytes,
scores, or model outputs exactly.

### Derived view

A result computed from the ledger for a named time, policy, query, and/or analysis
method. Fact views, timelines, conflict sets, rankings, chunks, and dossiers are
derived views. *Derived* describes origin, not retention: an important result may
be retained as a canonical analysis record, while a query result may remain
disposable.

### Dossier

A query-specific assembly of knowledge that restores the context needed to reason
or act: relevant assertions, exact evidence, provenance, counterclaims,
uncertainty, temporal state, open questions, mechanisms, and applicability
boundaries. A dossier is richer than a search hit or isolated chunk and remains
traceable to canonical material.

### Entity

A stable identity used to connect references believed to denote the same thing.
Names and aliases are not identities. Candidate matches, merges, and splits are
auditable decisions; probabilistic similarity alone must not create an
irreversible merge.

### Entity resolution

The process of proposing and deciding whether references denote the same entity.
Heuristics can suggest matches, while authorized identity decisions and their
provenance belong in durable records.

### Event

A record of something received, observed, or performed at a time, with its source
and actor where known. An event is raw epistemic input. It may contain claims or
motivate interpretations, but is not automatically an assertion or covered by an
acceptance decision.

### Evidence

Material offered in support of or opposition to an assertion. Evidence has
provenance, scope, and quality; its existence does not guarantee that the
assertion is correct.

### EvidenceSpan

An exact selector into a particular version or integrity identity of a source
artifact, such as a byte range, text position, media interval, region, record
path, or equivalent locator. It enables verification of what material was used
and must never silently retarget when the source changes. Controlled redaction may
leave an explicit tombstone and make the span unverifiable; that limitation is
part of the record.

### ExperienceEpisode

A candidate Experience-profile record of situated experience: the initial
situation, goal, constraints, information visible in the ledger at the recorded
decision time, hypotheses, predictions, alternatives, decision, intended and
actual intervention, observations, outcome, surprises, and interpretations. An
episode preserves a learning trajectory but does not itself prove causation or
that the captured information was all the decision-maker knew.

### Extension

A namespaced addition to the protocol that introduces optional semantics or data
while obeying compatibility rules. Unknown extensions must be preserved losslessly
and must cause safe refusal when their semantics are required for a decision.

### Fact

A policy- and time-dependent view over assertion revisions, not a privileged
stored object. Informally:

```text
Fact(policy, valid_at, recorded_as_of) =
    assertion revisions visible at recorded_as_of,
    applicable at valid_at,
    and covered by applicable AcceptanceDecisions
    visible at recorded_as_of under that policy
```

Calling something a fact therefore always implies the policy, purpose, valid
time, and recorded-time horizon used to construct the view.

### File-first

The architectural commitment that durable knowledge is representable in
documented, portable, human- and machine-readable files independently of a
specialized database. It does not require one file format, public storage, Git,
or loading all data into memory.

### Index

A rebuildable access structure optimized for retrieval or analysis, such as
full-text, vector, graph, spatial, or temporal lookup. An index may hold locators
and derived features but must not be the sole home of durable knowledge.

### Intervention

An intentional change or assigned exposure whose effect on an outcome is of
interest. An intended action, an action actually performed, and the exposure
actually received are distinct and may all need to be recorded.

### Mechanism

A proposed process or state transformation explaining how an intervention or
condition produces an effect. A mechanism has operating conditions and failure
boundaries; a plausible narrative is not automatically an established causal
mechanism.

### Observation

A recorded measurement or perception, including method, time, observer or
instrument, and uncertainty where relevant. An observation is evidence-bearing
input, not an interpretation guaranteed to be accurate.

### Outcome

An observed or assessed result relative to a goal, baseline, comparator, or
prediction. An outcome following an action does not by temporal order alone prove
that the action caused it.

### MechanismPattern

A candidate Mechanism-profile abstraction of a problem structure and mechanism,
including forces, constraints, intervention, expected transformation,
applicability conditions, examples, counterexamples, and known failure
boundaries. A `MechanismPattern` is more than a textual summary or recipe.

### Policy

A named and versioned set of rules used for acceptance, visibility, ranking, fact
view construction, access, or other decisions. Policy-dependent output records
the policy identity so it can be reproduced and compared.

### Profile

A defined subset or extension of the protocol for a use case, with explicit
conformance requirements. Profiles allow optional capabilities without forcing
every implementation to understand every domain.

### Protocol

The implementation-independent semantics, invariants, lifecycle, versioning,
extension rules, and interoperability requirements of GraphTruth. A serialization
or API can carry the protocol but is not the protocol by itself.

### Provenance

The traceable history of a record: its source material, actors, activities,
transformations, tools, and derivations. Provenance answers "where did this
information come from?" It does not answer "what caused this event in the world?"

### Question

A first-class record of a concrete unknown or uncertainty, why it matters, what
would count as an answer, and its state over time. Questions may arise from people,
contradictions, dark zones, failed transfers, or algorithms.

### Rationale

The reasons recorded for an actor's decision given the information available at
that time. Rationale explains the decision process; it is not necessarily the
cause of an observed outcome and may differ from a later interpretation.

### Recorded time

The time from which a record is represented as visible in this ledger, according
to ledger ordering and timestamp metadata. Also known in bitemporal systems as
transaction time or system time. It is not necessarily when a person first knew
the information, and it does not prove timestamp integrity. GraphTruth prefers
*recorded time* because a file-based ledger need not be a transactional database.

### Reference algorithm

An executable Zone 2 implementation of specified protocol behavior, intended to
clarify semantics and support conformance testing. It does not own the protocol
and may be replaced by any conforming algorithm. This is distinct from the Zone 3
default runtime, which is an end-to-end product assembly.

### Runtime

The replaceable product layer that ingests events, runs models and heuristics,
builds indexes, serves APIs and interfaces, and orchestrates workflows over the
protocol and core tooling.

### Source artifact

Original or transformation-derived material against which evidence can be
located, such as a document, message, dataset, audio recording, image, log, or
snapshot. A particular version or integrity identity allows evidence spans to be
verified even when storage location changes. Controlled redaction or legal
removal is recorded explicitly and may make prior spans unverifiable.

### Status

A role-specific point in a record's own lifecycle. Examples include a candidate
being submitted, an assertion revision being superseded or withdrawn by its
claimant, and a question being answered or reopened. Support and dispute are
attributed `Assessment` records; acceptance and revocation are
`AcceptanceDecision` records. They are not global statuses on an assertion. The
exact lifecycle is specified by the applicable protocol profile and is not
inferred solely from file location.

### TransferAttempt

A candidate Transfer-profile record of an attempt to apply a
`MechanismPattern` from a source context to a different target context. It
includes the mapping between roles, similarities and material differences,
adaptation, prediction made beforehand, action, outcome, and what was learned
about portability.

### Valid time

The time for which an assertion claims applicability in the represented world or
domain. It does not establish that the claim was true then. Valid time can differ
from recorded time and may be uncertain, interval-valued, or coarse-grained.

### Validator

A Zone 2 tool that checks conformance to protocol structure and semantic
invariants. Successful validation means "well-formed according to the applicable
rules," not "true" or "covered by an acceptance decision."

### Zone 1: protocol and specification

The long-lived layer that defines meaning, invariants, compatibility, extension
mechanisms, conformance, and normative algorithms required for interoperability.

### Zone 2: core tooling

Portable tooling that parses, validates, canonicalizes, migrates, reduces,
transforms, and renders conforming records, including protocol reference
algorithms and conformance tests.

### Zone 3: default runtime

The replaceable default implementation: connectors, orchestration, models,
heuristic algorithms, databases and indexes, APIs, UI, and operational policy
choices. It has no normative authority over the protocol.

## Relations that are easy to confuse

| If the intended statement is... | Use... | Do not substitute... |
| --- | --- | --- |
| "This record was produced from that source" | Provenance / derivation | Causation |
| "A occurred before B" | Temporal relation | `A caused B` |
| "A and B vary or appear together" | Association | Intervention effect |
| "The actor chose A because of reason R" | Rationale | Cause of the eventual outcome |
| "Changing A relative to A' changes B under assumptions S" | CausalClaim | A bare graph edge |
| "B would have occurred if A had differed" | Counterfactual under a named model | Observation |
| "Revision R is usable for purpose U under policy P" | AcceptanceDecision | A global assertion status or universal truth |
| "This representation passes structural checks" | Validation | AcceptanceDecision or truth |
| "These names may denote one thing" | Entity-match candidate | Irreversible entity merge |
| "This mechanism pattern might apply here" | Transfer proposal or TransferAttempt | Proof of applicability |
