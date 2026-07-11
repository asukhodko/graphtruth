# RFC 0000: Project Foundation

- Decision status: Accepted
- Implementation status: Not realized
- Created: 2026-07-11
- Supersedes: none
- Superseded by: none

## Summary

GraphTruth will be developed as a file-first protocol for durable epistemic memory, accompanied by core tooling and a replaceable default implementation. It will begin as a personal, fully working system in a monorepository. The protocol preserves claims, evidence, provenance, uncertainty, disagreement, questions, and change over time without delegating truth to a database, language model, or search index.

This RFC records the project's foundational decisions. It intentionally leaves serialization details, exact schemas, and implementation technologies open.

## Motivation

Knowledge tools commonly collapse several different things:

- what a source said;
- what was extracted or inferred from it;
- what a person or system currently accepts;
- what was true in the represented world;
- what a search engine happened to retrieve.

This makes corrections destructive, provenance incomplete, contradictions invisible, and accumulated knowledge hostage to a particular application or database. It also makes apparently intelligent answers difficult to inspect or carry forward after the software reaches end of life.

GraphTruth needs a more durable substrate. It should retain the evidential and historical structure from which current views are computed, while letting indexing, inference, retrieval, and user interfaces improve or be replaced.

## Foundation decisions

### 1. GraphTruth is a protocol before it is a product

The long-lived center of the project is a set of documented concepts, invariants, file formats, versioning rules, and extension mechanisms. Software exists to validate, transform, access, and demonstrate that protocol.

The default implementation is important—it must be genuinely useful—but its behavior is not normative merely because it ships first.

### 2. Canonical records are file-first

The authoritative corpus will be representable as documented, human-inspectable and machine-readable files. Specialized stores may provide indexes, caches, graph traversal, full-text search, vector retrieval, and materialized views, but they are disposable projections.

A conforming corpus must retain its essential meaning when those projections and the original application are gone. An implementation must be able to rebuild every projection it claims to support from the retained canonical corpus and explicitly declared retained artifacts. This is an end-of-life and recovery property, but it is conditional on those artifacts remaining available.

Derived does not always mean disposable. A valuable summary, inferred link, causal model, or other analysis may be preserved as a canonical analysis record when its inputs, method, version, assumptions, uncertainty, and status are explicit. The cache or index used to find that record remains a projection. Retaining such a record supports audit and reuse; it does not promise byte-identical regeneration when the original model, provider, environment, or nondeterministic execution is unavailable.

“File-first” does not require that every source byte be embedded in a text file. Large or binary evidence may be content-addressed and referenced, provided its identity, provenance, integrity, availability, and representation are explicit.

### 3. The project has three zones

1. **Protocol and specification** — normative semantics, invariants, compatibility, versioning, extension profiles, the policy envelope, and the semantics of applying a declared policy.
2. **Core tooling** — validators, canonicalizers, migrations, deterministic transforms, and reference conformance utilities.
3. **Default implementation** — replaceable ingestion, inference, indexes, retrieval, local policy selection and configuration, user experience, and operations.

An algorithm may appear in all three zones in different forms: a required outcome or procedure in the specification, an executable reference in core tooling, and an optimized strategy in the default implementation.

### 4. The protocol is an epistemic ledger, not an oracle

GraphTruth records what was observed, supplied, asserted, derived, disputed, revised, or withdrawn, together with evidence and responsibility for the transition. It separately records attributable `AcceptanceDecision`s made for a declared purpose under a named policy. It does not claim to store unqualified truth.

At minimum, the model must preserve distinctions among:

- source material and exact evidence spans;
- events and observations;
- assertions and their revisions;
- entities referred to by assertions and candidate classifications or relations;
- questions and known unknowns;
- provenance and transformation history;
- recorded time and represented-world valid time;
- conflicting or competing interpretations;
- lifecycle state for records;
- `AcceptanceDecision`s and computed views produced under an explicit policy.

A record's lifecycle status and an `AcceptanceDecision` are distinct. Acceptance for a purpose does not silently mutate an assertion's lifecycle, and neither constitutes universal truth. A “fact” is therefore a policy- and time-dependent view over assertion revisions and, where the policy uses them, applicable acceptance decisions—not a privileged record type that erases its origin. Zone 1 defines the envelope and application semantics needed for interoperable policy-driven views; Zone 3 chooses and configures the local policies to apply.

### 5. History is append-oriented and correction is non-destructive

Corrections create auditable revisions or superseding records. They do not rewrite evidence or silently replace prior claims. Entity resolution and duplicate detection may propose merges, but uncertain merges must be reversible and preserve original identifiers.

The exact event and revision model remains to be specified, but the ability to reconstruct what the system knew and why at a past recorded time is foundational.

### 6. Uncertainty, disagreement, and questions are first-class

Missing information is not represented as fabricated certainty. Confidence must remain attributable to its dimensions and producer; a single opaque score is insufficient as canonical semantics. Contradictions are retained and contextualized rather than automatically “resolved.” Questions may be linked to the evidence or decisions that would answer them and prioritized by replaceable policy.

### 7. Provenance, sequence, association, and causation are different relations

The fact that one record derives from another, one event precedes another, or two variables covary does not establish world causation. Causal assertions must identify their scope, comparison, evidence basis, assumptions, uncertainty, and model where applicable.

GraphTruth reserves first-class semantic space for experience and causality:
situations, goals, decisions, interventions, observations, outcomes, mechanisms,
counterfactuals, and transfer attempts. Their exact boundary between the minimal
core and optional profiles remains open. From the beginning, the core must
preserve enough evidence and temporal structure for those semantics to be added
without inventing lost history.

### 8. Machine inference proposes; acceptance remains explicit and policy-scoped

Language models, embeddings, entity resolvers, causal discovery, and other probabilistic algorithms operate outside the truth layer. Their outputs are versioned analysis artifacts with inputs, provenance, and uncertainty. Materially valuable outputs may be retained as canonical analysis records, while ephemeral outputs may remain disposable. They may propose claims, links, questions, or patterns, but may not silently create an `AcceptanceDecision` or make themselves accepted. Applying a locally selected policy may compute an accepted view under Zone 1 semantics; any persisted `AcceptanceDecision` remains explicit and attributable.

No model provider or inference method is part of the durable protocol. Reproducibility means preserving enough inputs, identity, configuration, and output to audit a retained result where possible; it is not a promise that a nondeterministic or unavailable model can reproduce identical bytes.

### 9. Access returns context, not isolated hits

Retrieval should ultimately produce a query-specific knowledge dossier: relevant claims together with evidence, provenance, temporal context, disagreement, related questions, and material differences that affect applicability. Full-text, graph, vector, temporal, and structural retrieval are complementary replaceable access mechanisms.

This is a product objective rather than a single normative ranking algorithm. The protocol's responsibility is to make the necessary context addressable and portable.

### 10. Extensions are explicit and the core remains small

Domain vocabularies and advanced capabilities belong in versioned profiles or namespaced extensions unless they are required for interoperability across nearly all GraphTruth corpora. Unknown extensions must be detectable; their required or optional status must be declared; they must not silently weaken core invariants.

### 11. Development is personal dogfood-first

The first success criterion is a complete, dependable system for its owner, exercised against real work. Breadth, scale, multi-user collaboration, hosting, and ecosystem concerns are subordinate to a reversible end-to-end loop and durable data.

The repository is publicly visible during incubation, but it has no open-source license yet and does not currently invite external contributions. Licensing and governance will be decided before an open-source release.

### 12. The project remains a monorepository by default

Specification, schemas, conformance cases, core tooling, and the default implementation remain together so formative changes can be atomic. Logical dependency boundaries are mandatory from the beginning. A split requires demonstrated independent consumers, stable interfaces, sustained operational benefit, and an accepted RFC; size or aesthetic preference alone is insufficient.

See [`docs/MONOREPO.md`](../docs/MONOREPO.md) for the detailed criteria.

## Consequences

### Benefits

- The canonical corpus can retain its declared durable meaning beyond a particular database, model, application, or vendor, subject to the continued availability of referenced retained artifacts.
- Every accepted view can remain traceable to evidence and policy.
- Corrections, contradictions, and improved interpretations enrich history instead of destroying it.
- Independent implementations can eventually share a corpus and conformance rules.
- Implementation experiments remain cheap because derived infrastructure is replaceable.

### Costs and constraints

- Canonical records will be more verbose than a table of current “facts.”
- Every transformation needs identity, provenance, and reproducibility discipline.
- File evolution and migrations become core engineering work.
- Human readability, deterministic behavior, and auditability can constrain convenient implementation shortcuts.
- Some answers remain explicitly unresolved when evidence does not justify a conclusion.
- A useful personal implementation must be built without allowing its accidental choices to harden into the protocol.

## Alternatives rejected at foundation

### Make a graph database the source of truth

Rejected because the corpus would inherit vendor- and engine-specific semantics, migrations, and end-of-life risk. A graph database may still be an excellent derived index.

### Make generated summaries the primary canonical record type

Rejected because summaries lose exact evidence, disagreement, historical states, and reproducibility. Summaries may be derived views.

### Define one universal ontology before implementation

Rejected because it would optimize for hypothetical domains and delay evidence from dogfooding. The core will remain small and gain profiles from demonstrated use.

### Start with separate repositories

Rejected because protocol, schema, conformance, and implementation boundaries are not stable enough to justify cross-repository coordination.

### Treat model confidence as truth

Rejected because confidence is method-, producer-, context-, and calibration-dependent. Model output remains attributable evidence or analysis.

## Open questions

The following require later RFCs or specification work:

1. What is the smallest interoperable core vocabulary and record envelope?
2. Which serialization format best balances readability, canonicalization, streaming, diffs, and broad tooling support?
3. Which objects use stable assigned identifiers, content addresses, or both?
4. What exact canonicalization and hashing rules allow reproducible identity across implementations?
5. How are event order, recorded time, valid time, uncertain intervals, and clock provenance represented?
6. What revision model supports supersession, branching interpretation, tombstones, and compaction without losing auditability?
7. How are evidence spans addressed robustly as source representations change?
8. How are confidence, belief, trust, lifecycle status, `AcceptanceDecision`, and policy application represented without implying false precision or conflating their roles?
9. Which contradiction types can be recognized structurally, and which remain implementation analysis?
10. How do mandatory and optional profiles declare dependencies, negotiate versions, and survive unknown extensions?
11. What guarantees distinguish a conforming reader, writer, validator, and full implementation?
12. Which migrations must be lossless, and how are lossy migrations represented and approved?
13. How are private data, redaction, deletion obligations, encryption, signatures, and access-controlled evidence reconciled with durable provenance?
14. What belongs in a portable dossier versus a query-engine-specific result?
15. Which parts of experience, decision, causal, and transfer modeling belong in optional protocol profiles?
16. What quantitative corpus and recovery tests define “fully working” personal v0?
17. What package and release versioning scheme should be adopted when consumable artifacts exist?
18. Which license and governance model should be used for the eventual open-source project?

## Acceptance criteria

This foundation is realized when:

- the initial specification expresses these distinctions normatively;
- schemas and examples make the distinctions observable;
- the default runtime can complete the personal v0 loop without making derived indexes authoritative;
- deleting all derived stores leaves the canonical corpus intact, and every projection the implementation claims to support can be rebuilt from retained canonical records and declared retained artifacts;
- protocol-significant changes are recorded through RFCs and compatibility artifacts;
- departures from these decisions are made explicitly by a superseding RFC.
