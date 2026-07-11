# Session context — 2026-07-11

> **Status:** Recovered design context — non-normative.
> **Captured:** 2026-07-11.
> **Authority:** This is a session map, not a decision record. Current project
> documents and accepted RFCs override every historical or candidate statement.
> **Promotion:** Use a focused issue, experiment, or RFC under
> [the development process](../DEVELOPMENT.md).

## Why this record exists

The design session moved GraphTruth through several conceptual layers in a
short time. The final foundation is preserved in the repository, but the route,
discarded options, detailed algorithm ideas, competitive concerns, and open
work were at risk of surviving only in chat history.

This record maps the session rather than reproducing it verbatim. It is intended
to answer four future questions:

1. What problem was GraphTruth originally trying to solve?
2. Which conceptual turns produced the current mission?
3. Which ideas remain useful but unaccepted?
4. Which details could not be recovered exactly and need rediscovery?

## One-paragraph reconstruction

GraphTruth began as an attempt to turn a heterogeneous stream of notes, code,
messages, questions, and other events into continuously improved,
cross-linked documentation and an emergent ontology. The center then shifted
from generated documents to atomic, provenance-bearing facts in a logical
graph. Stress-testing showed that dynamic knowledge graphs, RAG, and agent
memory are crowded spaces; the more defensible center is an epistemic journal
of evidence, assertions, revisions, acceptance decisions, disagreements, and
questions. An end-of-life thought experiment moved canonical state out of
closed databases into portable files and turned the long-lived product from a
system into a protocol. The protocol, executable core tooling, and replaceable
runtime became three zones. Retrieval became dossier assembly rather than
isolated chunks. Finally, the model expanded beyond connectivity to preserve
experience paths, causal claims, mechanisms, prospective predictions, and
explicit attempts to transfer a mechanism into a new context.

The authoritative formulation is in [Vision](../VISION.md), not in this
paragraph.

## Chronology of the design turns

### 1. Incremental automatic documentation and ontology

**Recovered context.** The precursor problem consumed a stream of heterogeneous
and noisy material from a bounded but initially unknown set of domains. It was
expected to:

- discover domains, subdomains, concepts, names, and descriptions;
- place material in more than one domain without duplicating its meaning;
- keep hub and overview pages current;
- revise an increasingly awkward hierarchy;
- retain unanswered questions as dark zones;
- reveal new cross-domain connections or insights;
- support code and repository artifacts as a demanding special case.

At this stage, the visible product was exhaustive, continuously regenerated
documentation. The risk was that the document tree would become the hidden
source of truth and every restructuring would become a destructive migration.

### 2. Typed graph and facts as first-class objects

**Recovered context.** A symbolic approach was preferred over an
embedding-only/document-only approach: typed entities and relations, facts as
objects with provenance, incremental change sets, and an ontology or concept
lattice derived from accumulated evidence. Documentation became a generated
view over the graph.

Formal Concept Analysis, incremental clustering, ontology induction, OpenIE,
entity linking, truth-discovery methods, and graph algorithms were considered
as technique families. None was accepted as the defining core algorithm.

### 3. A pragmatic concept-centric PoC sketch

**Superseded context.** An earlier minimal implementation sketch proposed:

- events or notes as input;
- an extractor returning concepts, facts, and questions;
- `Note`, `Concept`, and `Question` entities;
- a first-class `Fact` with subject, predicate, object or literal, source event,
  one confidence value, and creation time;
- Postgres tables for events, entities, facts, and links;
- CLI commands for ingest, concept pages, debugging, and dark zones;
- domains as named views rather than mandatory core entities;
- full FCA and embeddings deferred.

Parts of this remain useful for a disposable runtime experiment, especially the
small vertical slice and domain-as-view idea. It is not the current canonical
model: [RFC 0000](../../rfcs/0000-project-foundation.md) makes files canonical,
and [Vision](../VISION.md) separates assertion history from policy-specific
acceptance instead of defining a context-free `Fact` record with one confidence
score.

### 4. Maturity and uniqueness stress test

**Recovered context.** The session concluded that a dynamic or temporal
knowledge graph by itself is not unique. Graphiti/Zep was identified as the
closest moving neighbor in the initial survey. GraphRAG frameworks, agent memory
products, enterprise ontology platforms, personal knowledge tools, provenance
standards, and scientific claim-publishing models cover many other pieces.

The project thesis shifted to the combination of:

- versioned assertion and evidence history;
- explicit separation of assertion lifecycle and acceptance policy;
- questions, dark zones, and active acquisition;
- portable, reconstructible file-first state;
- contextual dossiers containing counterevidence and omissions;
- causal experience, mechanism, and transfer;
- model and index replaceability through the three-zone architecture.

This is a design thesis, not a novelty claim. See
[Landscape and validation](LANDSCAPE-AND-VALIDATION.md).

### 5. End-of-life as a first-class requirement

The decisive storage question was whether GraphTruth could retain its value if
the original software and databases disappeared. This produced the invariant
that durable meaning must live in documented, human-inspectable and
machine-readable files. Graph, relational, lexical, vector, and cache systems
may remain operationally essential while running, but they are projections and
must not contain the only surviving copy of epistemic meaning.

The session explored an immutable object vault, a journal of atomic commits,
manifest and `HEAD` publication, content-addressed artifacts, assigned record
identifiers, snapshots, and rebuildable indexes. These remain design candidates
and are preserved in [Storage and indexing](STORAGE-AND-INDEXING.md).

### 6. From system design to protocol design

The file-first requirement exposed that GraphTruth's durable center was no
longer an application architecture. It was a protocol defining identities,
record semantics, evidence and revision links, time, acceptance and contest
workflows, extensions, migrations, archival completeness, and conformance.

The application still matters because a protocol not exercised by a useful
system will encode imagined requirements. Its role is to earn and challenge
the protocol through personal dogfood.

### 7. Three zones

The project was divided into:

1. protocol and specification;
2. core validators, migrations, transforms, and reference tooling;
3. a replaceable runtime containing ingestion, models, indexes, ranking, and UI.

Algorithms were then classified by authority rather than by technology:
normative algorithms belong in Zone 1 only when independent implementations
must produce the same observable result; Zone 2 demonstrates or checks those
semantics; Zone 3 may use replaceable heuristics and models that only propose
attributable candidates.

### 8. Making Zone 1 survive

The discussion identified independent version axes, profiles and extensions,
unknown-field preservation, explicit required semantics, canonicalization,
algorithm agility, compatibility matrices, migrations, stable diagnostics,
conformance fixtures, offline release bundles, governance, deprecation, and a
second independent reader as anti-legacy mechanisms.

These are not all accepted details. The complete backlog is preserved in
[Protocol longevity](PROTOCOL-LONGEVITY.md).

### 9. Full algorithm journey

The requested algorithm inventory covered the entire path:

```text
source/event
  → stable source version and EvidenceSpan
  → mentions, propositions, observations, questions, and episodes
  → identity and predicate candidates
  → assertion revisions and assessments
  → support, conflict, staleness, and expectation-relative gaps
  → ranked acquisition question, source, observation, or safe experiment
  → hybrid retrieval and graph/provenance expansion
  → a contextual Dossier
  → feedback, correction, recalibration, and rebuild
```

The detailed reconstruction is split among [the capability
map](ALGORITHM-CAPABILITY-MAP.md), [contradictions and
acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md), and [retrieval and
dossiers](RETRIEVAL-AND-DOSSIERS.md).

### 10. Experience, causality, and invention

The session observed that reading another person's conclusion rarely produces
the same reusable competence as acting, predicting, failing, and adapting. A
connected graph therefore was not enough.

The proposed ladder was:

- `ExperienceEpisode`: situation, goal, constraints, ledger-visible records and
  separately evidenced decision-maker information with explicit completeness
  limits, hypotheses, predictions, alternatives, rationale, intended and
  executed action, observation, outcome, surprise, and later interpretation;
- `CausalClaim`: intervention, exposure, comparator, effect, scope, mechanism,
  evidence, assumptions, confounders, uncertainty, and alternatives;
- `MechanismPattern`: relational problem shape, forces, transformation,
  operating conditions, side effects, and failure boundaries;
- `TransferAttempt`: source-to-target mapping, mismatches, adaptation,
  prospective prediction, action, observed result, and learned boundary.

The product hypothesis of `experience replay` asks for a prediction and choice
before revealing the recorded outcome, then compares the result and offers a
safe transfer case. It cannot serialize tacit experience, but it can make
passive knowledge more testable. See
[Experience, causality, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md).

### 11. Repository materialization

The name `graphtruth` was chosen because it is short, memorable, and keeps the
central tension visible. The repository was created at
`github.com/asukhodko/graphtruth`, publicly visible but intentionally without a
license while the first complete personal version is developed.

The project remains a monorepo until observed constraints justify extraction.
Foundation documentation was merged in PR #1. The evidence-driven development
process and executable quality gate were introduced through Issue #2 and PR #3.
Issue #2 intentionally remains open until the process is used on the first
executable vertical slice.

### 12. Context-preservation pass

Issue #4 created this archive. Its goal is not to inflate Stage 0 with apparent
decisions. It preserves options and makes omission visible so future focused
issues can start from stronger context.

## Coverage map

| Discussion thread | Established destination | Additional retained detail |
| --- | --- | --- |
| Mission and final idea | [Vision](../VISION.md) and [RFC 0000](../../rfcs/0000-project-foundation.md) | This chronology and [Design evolution](DESIGN-EVOLUTION.md) |
| Emergent ontology and automatic documentation | Small-core principle and roadmap | [Ontology and document views](ONTOLOGY-AND-DOCUMENT-VIEWS.md) |
| Uniqueness and maturity | No normative destination | [Landscape and validation](LANDSCAPE-AND-VALIDATION.md) |
| File-first storage | Principles and Architecture | [Storage and indexing](STORAGE-AND-INDEXING.md) |
| Protocol transition | RFC 0000 | [Protocol longevity](PROTOCOL-LONGEVITY.md) |
| Three zones | Architecture and Monorepo strategy | [Zone boundary cases](ZONE-BOUNDARY-CASES.md) |
| Algorithm placement | Architecture | [Algorithm capability map](ALGORITHM-CAPABILITY-MAP.md) |
| Contradictions and dark zones | Vision and Architecture | [Contradictions, gaps, and acquisition](CONTRADICTIONS-GAPS-ACQUISITION.md) |
| Contextual access | Vision and Architecture | [Retrieval and dossiers](RETRIEVAL-AND-DOSSIERS.md) |
| Experience and causality | Vision and Principles | [Experience, causality, and transfer](EXPERIENCE-CAUSALITY-TRANSFER.md) |
| Code and repository artifacts | Roadmap mentions adapters | [Technical artifacts](TECHNICAL-ARTIFACTS.md) |
| Six-month build and three-year life | Roadmap is capability-based | [Landscape and validation](LANDSCAPE-AND-VALIDATION.md) and [EOL drill](EOL-RECOVERY-DRILL.md) |
| Unresolved work | RFC 0000 open questions | [Design backlog](DESIGN-BACKLOG.md) |
| Development process | [Development process](../DEVELOPMENT.md) | Issue #4 learning record |

## Superseded or constrained ideas retained for history

| Earlier sketch | Current constraint |
| --- | --- |
| Documentation hierarchy is the product and organizing truth. | Documents and ontologies are views over retained epistemic records. |
| A graph database is the single source of truth. | The logical graph is reconstructed from portable canonical files. |
| A `Fact` object with one confidence value is the primitive. | Assertion revisions, assessments, acceptance decisions, policy, and time remain separate. |
| Postgres stores canonical events, entities, and facts. | Postgres may be a runtime projection; it cannot be the only durable meaning. |
| Domain is necessarily a core entity. | Domain may be a named view or later profile concept; evidence must decide. |
| Full FCA or a universal ontology should be built first. | Start with a small core and earn profiles through dogfood. |
| Generated documentation can feed itself without qualification. | Generated material remains attributed and lower-authority; circular support must be detected. |
| An LLM or confidence threshold can resolve truth automatically. | Models propose; acceptance is explicit and policy-scoped. |
| One implementation's algorithm defines the protocol. | Only RFC-backed observable semantics and conformance artifacts can become normative. |

## Recovered external precursor patterns

Earlier related discussions contributed optional patterns, not project
commitments:

- a Context7-like parse, enrich, vectorize, rerank, and cache access pipeline,
  plus fragment-quality scoring and MCP delivery;
- code intelligence from AST, call graph, CPG, symbol index, schema, config,
  and repository history adapters;
- a guarded code → facts → generated annotations → reindex → higher-level
  documentation loop;
- a local runtime gateway, typed commands, idempotency, job scheduling, skills,
  pairing and allowlists, sandboxing, explicit elevation, workspace isolation,
  and model failover.

These are preserved in [Technical artifacts](TECHNICAL-ARTIFACTS.md) and must be
revalidated before adoption.

## Known reconstruction gaps

The following could not be recovered verbatim:

- the exact full table and wording of the first competitive survey;
- the exact technique list in every row of the original algorithm catalog;
- the complete definition of an earlier alternative to the symbolic approach;
- every field proposed for the initial immutable record envelopes;
- precise estimates attached to every six-month milestone and kill gate.

The drafts reconstruct the design space and explicitly mark inferred or newly
organized material. Future evidence should correct them rather than treating
their apparent completeness as historical certainty.

## How to use this archive next

The archive has done its job when it reduces rediscovery without increasing
decision debt. The next concrete issue should cite only the relevant sections,
select the smallest reversible experiment, and state which parts remain outside
scope. If a draft is never used, that is acceptable; preservation does not
create an obligation to implement it.
